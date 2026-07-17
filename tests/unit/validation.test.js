/**
 * Unit Tests: validation utilities
 */

const {
  validateEmail,
  validatePhone,
  validatePassword,
  validateGuestCount,
  validateRequiredFields,
  validateString,
  validatePositiveNumber,
} = require('../../server/utils/validation');
const AppError = require('../../server/utils/AppError');

describe('validation utilities', () => {
  test('validateEmail accepts valid email', () => {
    expect(() => validateEmail('user@example.com')).not.toThrow();
  });

  test('validateEmail throws on invalid email', () => {
    expect(() => validateEmail('not-an-email')).toThrow(AppError);
  });

  test('validatePhone accepts valid phone', () => {
    expect(() => validatePhone('+12345678901')).not.toThrow();
  });

  test('validatePhone throws on invalid phone', () => {
    expect(() => validatePhone('1234')).toThrow(AppError);
  });

  test('validatePassword accepts strong password', () => {
    expect(() => validatePassword('strongPass')).not.toThrow();
  });

  test('validatePassword throws on short password', () => {
    expect(() => validatePassword('123')).toThrow(AppError);
  });

  test('validateGuestCount accepts valid guest count', () => {
    expect(validateGuestCount(4)).toBe(4);
  });

  test('validateGuestCount throws on invalid guest count', () => {
    expect(() => validateGuestCount(0)).toThrow(AppError);
  });

  test('validateRequiredFields passes when required fields exist', () => {
    expect(() => validateRequiredFields({ name: 'John', email: 'john@example.com' }, ['name', 'email'])).not.toThrow();
  });

  test('validateRequiredFields throws when required field is missing', () => {
    expect(() => validateRequiredFields({ name: 'John' }, ['name', 'email'])).toThrow(AppError);
  });

  test('validateString returns trimmed value', () => {
    expect(validateString('  hello  ', 'Greeting')).toBe('hello');
  });

  test('validateString throws on empty string', () => {
    expect(() => validateString('   ', 'Greeting')).toThrow(AppError);
  });

  test('validatePositiveNumber returns number for valid positive values', () => {
    expect(validatePositiveNumber(5, 'Value')).toBe(5);
  });

  test('validatePositiveNumber throws on non-positive values', () => {
    expect(() => validatePositiveNumber(0, 'Value')).toThrow(AppError);
  });
});
