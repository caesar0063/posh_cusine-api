/**
 * Unit Tests: tableService
 */

jest.mock('../../server/models/tableModel', () => ({
  findById: jest.fn(),
  findByIdAndUpdate: jest.fn(),
}));
jest.mock('../../server/models/reservationModel', () => ({
  findOne: jest.fn(),
}));

const Table = require('../../server/models/tableModel');
const Reservation = require('../../server/models/reservationModel');
const tableService = require('../../server/services/tableService');
const {
  validateTableCapacity,
  checkTableAvailability,
  releaseTable,
  occupyTable,
  updateTableStatusByReservation,
} = tableService;
const AppError = require('../../server/utils/AppError');
const { HTTP_STATUS, RESERVATION_STATUS, TABLE_STATUS } = require('../../server/utils/constants');

describe('tableService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('validateTableCapacity', () => {
    test('returns table when capacity is sufficient', async () => {
      const table = { _id: '1', capacity: 4, tableNumber: 'A1' };
      Table.findById.mockResolvedValue(table);

      await expect(validateTableCapacity('1', 2)).resolves.toBe(table);
    });

    test('throws when table does not exist', async () => {
      Table.findById.mockResolvedValue(null);

      await expect(validateTableCapacity('1', 2)).rejects.toThrow(AppError);
    });

    test('throws when guest count exceeds capacity', async () => {
      const table = { _id: '1', capacity: 2, tableNumber: 'A1' };
      Table.findById.mockResolvedValue(table);

      await expect(validateTableCapacity('1', 4)).rejects.toThrow(AppError);
    });
  });

  describe('checkTableAvailability', () => {
    test('returns conflicting reservation when found', async () => {
      const reservation = { _id: 'abc' };
      Reservation.findOne.mockResolvedValue(reservation);

      const result = await checkTableAvailability('table1', '2026-01-01', '18:00', 'xyz');

      expect(Reservation.findOne).toHaveBeenCalledWith({
        _id: { $ne: 'xyz' },
        assignedTable: 'table1',
        reservationDate: '2026-01-01',
        reservationTime: '18:00',
        status: {
          $in: [RESERVATION_STATUS.PENDING, RESERVATION_STATUS.CONFIRMED, RESERVATION_STATUS.SEATED],
        },
      });
      expect(result).toBe(reservation);
    });

    test('returns null when no conflict exists', async () => {
      Reservation.findOne.mockResolvedValue(null);

      await expect(checkTableAvailability('table1', '2026-01-01', '18:00', null)).resolves.toBeNull();
    });
  });

  describe('releaseTable and occupyTable', () => {
    test('releaseTable updates table status to available', async () => {
      const updatedTable = { _id: '1', status: TABLE_STATUS.AVAILABLE };
      Table.findByIdAndUpdate.mockResolvedValue(updatedTable);

      await expect(releaseTable('1')).resolves.toBe(updatedTable);
      expect(Table.findByIdAndUpdate).toHaveBeenCalledWith('1', { status: TABLE_STATUS.AVAILABLE }, { new: true });
    });

    test('occupyTable updates table status to occupied', async () => {
      const updatedTable = { _id: '1', status: TABLE_STATUS.OCCUPIED };
      Table.findByIdAndUpdate.mockResolvedValue(updatedTable);

      await expect(occupyTable('1')).resolves.toBe(updatedTable);
      expect(Table.findByIdAndUpdate).toHaveBeenCalledWith('1', { status: TABLE_STATUS.OCCUPIED }, { new: true });
    });
  });

  describe('updateTableStatusByReservation', () => {
    test('releases table for completed reservations', async () => {
      Table.findByIdAndUpdate.mockResolvedValue({ _id: '1', status: TABLE_STATUS.AVAILABLE });

      await updateTableStatusByReservation('1', RESERVATION_STATUS.COMPLETED);

      expect(Table.findByIdAndUpdate).toHaveBeenCalledWith('1', { status: TABLE_STATUS.AVAILABLE }, { new: true });
    });

    test('occupies table for seated reservations', async () => {
      Table.findByIdAndUpdate.mockResolvedValue({ _id: '1', status: TABLE_STATUS.OCCUPIED });

      await updateTableStatusByReservation('1', RESERVATION_STATUS.SEATED);

      expect(Table.findByIdAndUpdate).toHaveBeenCalledWith('1', { status: TABLE_STATUS.OCCUPIED }, { new: true });
    });

    test('does nothing when table id is missing', async () => {
      await expect(updateTableStatusByReservation(null, RESERVATION_STATUS.CONFIRMED)).resolves.toBeUndefined();
    });
  });
});
