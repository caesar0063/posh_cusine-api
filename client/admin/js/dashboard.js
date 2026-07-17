// =========================
// Protect Dashboard
// =========================

let reservationChart = null;

if (!token) {
  window.location.href = 'login.html';
}

// =========================
// Display Admin Name
// =========================

const admin = JSON.parse(localStorage.getItem('admin'));

if (admin) {
  const adminName = document.getElementById('adminName');

  if (adminName) {
    adminName.textContent = admin.name;
  }
}

// =========================
// Load Dashboard
// =========================
loadDashboardStats();

loadDashboard();

async function loadDashboard() {
  try {
    const result = await api('/reservations?limit=100');

    const reservations = result.data || [];

    await updateStats();

    loadRecentReservations(reservations);

    loadChart(reservations);

    await loadTodaySchedule();

    loadActivityFeed(reservations);
  } catch (error) {
    console.error('Dashboard error:', error);
  }
}

async function loadDashboardStats() {
  try {
    const result = await api('/dashboard');

    const stats = result.data;

    document.getElementById('totalReservations').textContent = stats.totalReservations;

    document.getElementById('todayReservations').textContent = stats.todayReservations;

    document.getElementById('pendingReservations').textContent = stats.pendingReservations;

    document.getElementById('confirmedReservations').textContent = stats.confirmedReservations;

    document.getElementById('cancelledReservations').textContent = stats.cancelledReservations;

    document.getElementById('totalTables').textContent = stats.totalTables;

    document.getElementById('availableTables').textContent = stats.availableTables;

    document.getElementById('occupiedTables').textContent = stats.occupiedTables;

    document.getElementById('totalMenuItems').textContent = stats.totalMenuItems;

    document.getElementById('availableMenuItems').textContent = stats.availableMenuItems;
  } catch (error) {
    console.error('Dashboard stats error:', error);
  }
}

// =========================
// Today's Schedule
// =========================

async function loadTodaySchedule() {
  try {
    const result = await api('/reservations/today');

    const reservations = result.data || [];

    const container = document.getElementById('todaySchedule');

    if (!container) return;

    if (reservations.length === 0) {
      container.innerHTML = `

                <div class="empty-state">

                    No reservations today.

                </div>

            `;

      return;
    }

    container.innerHTML = '';

    reservations
      .sort((a, b) => {
        return a.reservationTime.localeCompare(b.reservationTime);
      })
      .forEach((r) => {
        let tableInfo = 'Awaiting Table';

        if (r.assignedTable) {
          tableInfo = `Table ${r.assignedTable.tableNumber}`;
        }

        container.innerHTML += `


            <div class="timeline-item">


                <div class="timeline-time">

                    ${r.reservationTime}

                </div>



                <div class="timeline-card">


                    <div class="timeline-header">


                        <strong>

                            ${r.fullName}

                        </strong>



                        <span class="status ${r.status.toLowerCase()}">

                            ${r.status}

                        </span>


                    </div>



                    <p>

                    <i class="fa-solid fa-chair"></i>

                    ${tableInfo}

                    </p>



                    <p>

                    <i class="fa-solid fa-users"></i>

                    ${r.guests} Guests

                    </p>


                </div>


            </div>


            `;
      });
  } catch (error) {
    console.error('Today schedule error:', error);
  }
}

// =========================
// Update Statistics
// =========================

async function updateStats() {
  try {
    const reservationResult = await api('/reservations/stats');

    const stats = reservationResult.data;

    const reservationStats = {
      todayCount: stats.todayReservations,

      weekCount: stats.weekReservations,

      monthCount: stats.monthReservations,

      totalCount: stats.total,

      pendingReservations: stats.pending,

      confirmedReservations: stats.confirmed,
    };

    Object.keys(reservationStats).forEach((id) => {
      const element = document.getElementById(id);

      if (element) {
        element.textContent = reservationStats[id];
      }
    });

    const tableResult = await api('/tables/stats');

    const tables = tableResult.data;

    const tableStats = {
      availableTables: tables.available,

      occupiedTables: tables.occupied,
    };

    Object.keys(tableStats).forEach((id) => {
      const element = document.getElementById(id);

      if (element) {
        element.textContent = tableStats[id];
      }
    });

    updateOccupancy(tables);
  } catch (error) {
    console.error('Stats error:', error);
  }
}

// =========================
// Occupancy
// =========================

function updateOccupancy(tables) {
  const total = tables.total || 0;

  const occupied = tables.occupied || 0;

  let percentage = 0;

  if (total > 0) {
    percentage = Math.round((occupied / total) * 100);
  }

  const percent = document.getElementById('occupancyPercent');

  const bar = document.getElementById('occupancyBar');

  if (percent) {
    percent.textContent = percentage + '%';
  }

  if (bar) {
    bar.style.width = percentage + '%';
  }
}

// =========================
// Recent Reservations
// =========================

function loadRecentReservations(reservations) {
  const table = document.getElementById('reservationTable');

  if (!table) return;

  table.innerHTML = '';

  reservations.slice(0, 8).forEach((r) => {
    table.innerHTML += `


        <tr>


            <td>${r.fullName}</td>


            <td>${r.guests}</td>


            <td>

            ${new Date(r.reservationDate).toLocaleDateString()}

            </td>


            <td>${r.reservationTime}</td>



            <td>

            <span class="status ${r.status.toLowerCase()}">

            ${r.status}

            </span>


            </td>


        </tr>


        `;
  });
}

// =========================
// Reservation Chart
// =========================

function loadChart(reservations) {
  const canvas = document.getElementById('reservationChart');

  if (!canvas) return;

  if (reservationChart) {
    reservationChart.destroy();
  }

  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const counts = [0, 0, 0, 0, 0, 0, 0];

  reservations.forEach((r) => {
    const day = new Date(r.reservationDate).getDay();

    counts[day]++;
  });

  reservationChart = new Chart(canvas, {
    type: 'bar',

    data: {
      labels: days,

      datasets: [
        {
          label: 'Reservations',

          data: counts,

          backgroundColor: '#C89B3C',

          borderRadius: 8,
        },
      ],
    },

    options: {
      responsive: true,

      maintainAspectRatio: false,

      plugins: {
        legend: {
          display: false,
        },
      },

      scales: {
        y: {
          beginAtZero: true,

          ticks: {
            precision: 0,
          },
        },
      },
    },
  });
}

// =========================
// Activity Feed
// =========================

function loadActivityFeed(reservations) {
  const container = document.getElementById('activityFeed');

  if (!container) return;

  container.innerHTML = '';

  reservations.slice(0, 6).forEach((r) => {
    container.innerHTML += `


        <div class="activity-item">


            <strong>

                ${r.fullName}

            </strong>


            created a reservation


            <br>


            <small>

            ${r.guests} guests · ${r.status}

            </small>


        </div>


        `;
  });
}

// =========================
// Auto Refresh
// =========================

setInterval(() => {
  loadDashboard();
}, 30000);
