/**
 * Unit Tests: asyncHandler
 */

const asyncHandler = require('../../server/utils/asyncHandler');
const AppError = require('../../server/utils/AppError');
const { HTTP_STATUS } = require('../../server/utils/constants');

describe('asyncHandler', () => {
  let mockReq, mockRes, mockNext;

  beforeEach(() => {
    mockReq = { body: {}, params: {} };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    mockNext = jest.fn();
  });

  describe('Successful async operation', () => {
    test('should execute handler and not call next', async () => {
      const handler = asyncHandler(async (req, res) => {
        res.status(200).json({ message: 'Success' });
      });

      await handler(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({ message: 'Success' });
      expect(mockNext).not.toHaveBeenCalled();
    });

    test('should work with synchronous operations', (done) => {
      const handler = asyncHandler((req, res) => {
        res.status(200).json({ data: 'sync' });
        done();
      });

      handler(mockReq, mockRes, mockNext);
    });
  });

  describe('Error handling', () => {
    test('should catch thrown errors and pass to next()', async () => {
      const testError = new AppError('Test error', HTTP_STATUS.BAD_REQUEST);
      const handler = asyncHandler(async (req, res) => {
        throw testError;
      });

      await handler(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(testError);
    });

    test('should catch promise rejections', async () => {
      const handler = asyncHandler(async (req, res) => {
        return Promise.reject(new Error('Promise rejected'));
      });

      await handler(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(mockNext.mock.calls[0][0]).toBeInstanceOf(Error);
    });

    test('should handle generic errors', async () => {
      const handler = asyncHandler(async (req, res) => {
        throw new Error('Generic error');
      });

      await handler(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(mockNext.mock.calls[0][0]).toBeInstanceOf(Error);
    });

    test('should pass AppError with status code through next()', async () => {
      const appError = new AppError('Validation failed', HTTP_STATUS.BAD_REQUEST);
      const handler = asyncHandler(async (req, res) => {
        throw appError;
      });

      await handler(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(appError);
      expect(mockNext.mock.calls[0][0].statusCode).toBe(HTTP_STATUS.BAD_REQUEST);
    });
  });

  describe('Request/Response preservation', () => {
    test('should preserve request object', async () => {
      let receivedReq;
      const handler = asyncHandler(async (req, res) => {
        receivedReq = req;
      });

      await handler(mockReq, mockRes, mockNext);

      expect(receivedReq).toBe(mockReq);
    });

    test('should preserve response object', async () => {
      let receivedRes;
      const handler = asyncHandler(async (req, res) => {
        receivedRes = res;
      });

      await handler(mockReq, mockRes, mockNext);

      expect(receivedRes).toBe(mockRes);
    });

    test('should work with request body and params', async () => {
      mockReq.body = { name: 'John' };
      mockReq.params = { id: '123' };

      const handler = asyncHandler(async (req, res) => {
        expect(req.body.name).toBe('John');
        expect(req.params.id).toBe('123');
        res.status(200).json({ success: true });
      });

      await handler(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(200);
    });
  });

  describe('Multiple calls', () => {
    test('should handle multiple sequential calls', async () => {
      const handler1 = asyncHandler(async (req, res) => {
        res.status(200).json({ call: 1 });
      });

      const handler2 = asyncHandler(async (req, res) => {
        res.status(200).json({ call: 2 });
      });

      await handler1(mockReq, mockRes, mockNext);
      expect(mockRes.json).toHaveBeenCalledWith({ call: 1 });

      await handler2(mockReq, mockRes, mockNext);
      expect(mockRes.json).toHaveBeenCalledWith({ call: 2 });
    });
  });
});
