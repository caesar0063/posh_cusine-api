/**
 * Integration Tests: auth routes
 */

const request = require('supertest');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = require('../../server/app');
const Admin = require('../../server/models/adminModel');

jest.mock('../../server/models/adminModel', () => ({
  findOne: jest.fn(),
  findById: jest.fn(),
}));

beforeEach(() => {
  jest.clearAllMocks();
  process.env.JWT_SECRET = 'test-jwt-secret';
});

describe('Auth integration', () => {
  test('POST /api/v1/auth/login with valid credentials returns token and admin', async () => {
    const hashedPassword = await bcrypt.hash('Password123', 10);
    Admin.findOne.mockResolvedValue({
      _id: '1',
      email: 'admin@test.com',
      name: 'Test Admin',
      password: hashedPassword,
    });

    const response = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'admin@test.com', password: 'Password123' })
      .expect(200);

    expect(response.body.success).toBe(true);
    expect(response.body.data).toHaveProperty('token');
    expect(response.body.data.admin).toMatchObject({ email: 'admin@test.com' });
  });

  test('POST /api/v1/auth/login with invalid credentials returns 401', async () => {
    Admin.findOne.mockResolvedValue(null);

    const response = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'missing@test.com', password: 'Password123' })
      .expect(401);

    expect(response.body.success).toBe(false);
  });

  test('GET /api/v1/auth/preferences requires authorization', async () => {
    await request(app).get('/api/v1/auth/preferences').expect(401);
  });

  test('GET /api/v1/auth/preferences with token returns preferences', async () => {
    const token = jwt.sign({ id: '1' }, process.env.JWT_SECRET, { expiresIn: '7d' });

    Admin.findById.mockReturnValue({
      select: jest.fn().mockResolvedValue({
        emailNotifications: true,
        reservationAlerts: true,
      }),
    });

    const response = await request(app)
      .get('/api/v1/auth/preferences')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(response.body.success).toBe(true);
    expect(response.body.data).toMatchObject({
      emailNotifications: true,
      reservationAlerts: true,
    });
  });
});
