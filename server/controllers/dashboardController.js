const Reservation = require('../models/reservationModel');
const Table = require('../models/tableModel');
const Menu = require('../models/menuModel');

const dashboardStats = async (req, res) => {
  try {
    const today = new Date();

    const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());

    const endOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);

    const [
      totalReservations,

      todayReservations,

      pendingReservations,

      confirmedReservations,

      cancelledReservations,

      totalTables,

      availableTables,

      occupiedTables,

      totalMenuItems,

      availableMenuItems,
    ] = await Promise.all([
      Reservation.countDocuments(),

      Reservation.countDocuments({
        reservationDate: {
          $gte: startOfToday,

          $lt: endOfToday,
        },
      }),

      Reservation.countDocuments({
        status: 'Pending',
      }),

      Reservation.countDocuments({
        status: 'Confirmed',
      }),

      Reservation.countDocuments({
        status: 'Cancelled',
      }),

      Table.countDocuments(),

      Table.countDocuments({
        status: 'Available',
      }),

      Table.countDocuments({
        status: 'Occupied',
      }),

      Menu.countDocuments(),

      Menu.countDocuments({
        availability: 'Available',
      }),
    ]);

    res.json({
      success: true,

      data: {
        totalReservations,

        todayReservations,

        pendingReservations,

        confirmedReservations,

        cancelledReservations,

        totalTables,

        availableTables,

        occupiedTables,

        totalMenuItems,

        availableMenuItems,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,

      message: error.message,
    });
  }
};

module.exports = {
  dashboardStats,
};
