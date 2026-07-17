/**
 * Unit Tests: responseFormatter
 */

const { sendSuccess, sendError, sendPaginated } = require('../../server/utils/responseFormatter');
const { HTTP_STATUS } = require('../../server/utils/constants');

describe('responseFormatter', () => {
  let res;

  beforeEach(() => {
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
  });

  test('sendSuccess sends standardized success response', () => {
    const payload = { id: 1, name: 'Test' };

    sendSuccess(res, payload, 'OK', HTTP_STATUS.OK);

    expect(res.status).toHaveBeenCalledWith(HTTP_STATUS.OK);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      message: 'OK',
      data: payload,
    });
  });

  test('sendError sends standardized error response', () => {
    sendError(res, 'Bad input', HTTP_STATUS.BAD_REQUEST);

    expect(res.status).toHaveBeenCalledWith(HTTP_STATUS.BAD_REQUEST);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: 'Bad input',
    });
  });

  test('sendPaginated sends paginated response with calculated pages', () => {
    const data = [{ id: 1 }, { id: 2 }];

    sendPaginated(res, data, 10, 2, 2, 'Page results');

    expect(res.status).toHaveBeenCalledWith(HTTP_STATUS.OK);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      message: 'Page results',
      count: 2,
      total: 10,
      page: 2,
      pages: 5,
      data,
    });
  });
});
