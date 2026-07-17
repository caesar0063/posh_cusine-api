/**
 * Unit Tests: AppError
 */

const AppError = require('../../server/utils/AppError');
const { HTTP_STATUS } = require('../../server/utils/constants');

describe('AppError', () => {
  describe('Constructor', () => {
    test('should create error with message and status code', () => {
      const error = new AppError('Test error', HTTP_STATUS.BAD_REQUEST);

      expect(error.message).toBe('Test error');
      expect(error.statusCode).toBe(HTTP_STATUS.BAD_REQUEST);
      expect(error.success).toBe(false);
    });

    test('should default to 500 status code', () => {
      const error = new AppError('Server error');

      expect(error.statusCode).toBe(500);
    });

    test('should be instance of Error', () => {
      const error = new AppError('Test error', HTTP_STATUS.BAD_REQUEST);

      expect(error).toBeInstanceOf(Error);
    });

    test('should capture stack trace', () => {
      const error = new AppError('Test error', HTTP_STATUS.BAD_REQUEST);

      expect(error.stack).toBeDefined();
      expect(error.stack).toContain('AppError');
    });
  });

  describe('Error Properties', () => {
    test('should have success: false', () => {
      const error = new AppError('Test error', HTTP_STATUS.BAD_REQUEST);
      expect(error.success).toBe(false);
    });

    test('should preserve all properties', () => {
      const error = new AppError('Custom message', HTTP_STATUS.CONFLICT);

      expect(error.message).toBe('Custom message');
      expect(error.statusCode).toBe(HTTP_STATUS.CONFLICT);
      expect(error.success).toBe(false);
    });
  });

  describe('HTTP Status Codes', () => {
    test('should handle 400 Bad Request', () => {
      const error = new AppError('Bad request', HTTP_STATUS.BAD_REQUEST);
      expect(error.statusCode).toBe(400);
    });

    test('should handle 401 Unauthorized', () => {
      const error = new AppError('Unauthorized', HTTP_STATUS.UNAUTHORIZED);
      expect(error.statusCode).toBe(401);
    });

    test('should handle 404 Not Found', () => {
      const error = new AppError('Not found', HTTP_STATUS.NOT_FOUND);
      expect(error.statusCode).toBe(404);
    });

    test('should handle 409 Conflict', () => {
      const error = new AppError('Conflict', HTTP_STATUS.CONFLICT);
      expect(error.statusCode).toBe(409);
    });

    test('should handle 500 Internal Server Error', () => {
      const error = new AppError('Server error', HTTP_STATUS.INTERNAL_SERVER_ERROR);
      expect(error.statusCode).toBe(500);
    });
  });
});
