const API_BASE_URL = '/api/v1';
let bpChart = null;

// Check authentication on page load
document.addEventListener('DOMContentLoaded', () => {
  const token = localStorage.getItem('token');
  if (!token) {
    window.location.href = '/index.html';
    return;
  }

  // Set user name
  const userName = localStorage.getItem('userName');
  if (userName) {
    document.getElementById('userName').textContent = `Welcome, ${userName}`;
  }

  // Load readings
  loadReadings();

  // Setup logout button
  document.getElementById('logoutBtn').addEventListener('click', () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userName');
    window.location.href = '/index.html';
  });

  // Setup add reading form
  document
    .getElementById('addReadingForm')
    .addEventListener('submit', async (e) => {
      e.preventDefault();
      await addReading();
    });
});

// Get auth token
function getAuthToken() {
  return localStorage.getItem('token');
}

// Make authenticated API request
async function apiRequest(endpoint, options = {}) {
  const token = getAuthToken();
  if (!token) {
    throw new Error('Not authenticated');
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...options.headers,
    },
  });

  if (response.status === 401) {
    // Token expired or invalid
    localStorage.removeItem('token');
    localStorage.removeItem('userName');
    window.location.href = '/index.html';
    return;
  }

  return response;
}

// Load all readings
async function loadReadings() {
  try {
    const response = await apiRequest('/readings');

    if (!response.ok) {
      throw new Error('Failed to load readings');
    }

    const data = await response.json();
    const readings = data.readings || [];

    displayReadings(readings);
    updateStatistics(readings);
    updateChart(readings);
  } catch (error) {
    console.error('Error loading readings:', error);
    document.getElementById('readingsList').innerHTML =
      '<p class="error">Failed to load readings. Please try again.</p>';
  }
}

async function addReading() {
  const form = document.getElementById('addReadingForm');
  const formData = {
    systolic: parseInt(document.getElementById('systolic').value),
    diastolic: parseInt(document.getElementById('diastolic').value),
  };

  clearReadingMessage();

  try {
    const response = await apiRequest('/readings', {
      method: 'POST',
      body: JSON.stringify(formData),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.msg || 'Failed to add reading');
    }

    showReadingMessage('Reading added successfully!', 'success');
    form.reset();

    loadReadings();
  } catch (error) {
    showReadingMessage(
      error.message || 'Failed to add reading. Please try again.',
      'error'
    );
  }
}

function displayReadings(readings) {
  const readingsList = document.getElementById('readingsList');

  if (readings.length === 0) {
    readingsList.innerHTML = `
            <div class="empty-state">
                <p>No readings yet.</p>
                <p>Add your first blood pressure reading above!</p>
            </div>
        `;
    return;
  }

  readingsList.innerHTML = readings
    .map((reading) => {
      const date = new Date(reading.createdAt);
      const formattedDate = date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });

      const status = getBPStatus(reading.systolic, reading.diastolic);

      return `
            <div class="reading-item">
                <div class="reading-data">
                    <div class="reading-values">
                        <div class="value-item">
                            <label>Systolic</label>
                            <div class="value">${reading.systolic}</div>
                        </div>
                        <div class="value-item">
                            <label>Diastolic</label>
                            <div class="value">${reading.diastolic}</div>
                        </div>
                    </div>
                    <div class="reading-date">${formattedDate}</div>
                </div>
                <span class="bp-status ${status.class}">${status.label}</span>
            </div>
        `;
    })
    .join('');
}

// Get BP status classification
function getBPStatus(systolic, diastolic) {
  if (systolic < 120 && diastolic < 80) {
    return { label: 'Normal', class: 'normal' };
  } else if (systolic < 130 && diastolic < 80) {
    return { label: 'Elevated', class: 'elevated' };
  } else if (systolic < 140 || diastolic < 90) {
    return { label: 'High Stage 1', class: 'high-stage1' };
  } else {
    return { label: 'High Stage 2', class: 'high-stage2' };
  }
}

// Update statistics
function updateStatistics(readings) {
  const totalReadings = readings.length;
  document.getElementById('totalReadings').textContent = totalReadings;

  if (totalReadings === 0) {
    document.getElementById('avgSystolic').textContent = '-';
    document.getElementById('avgDiastolic').textContent = '-';
    document.getElementById('latestReading').textContent = '-';
    return;
  }

  // Calculate averages
  const avgSystolic = Math.round(
    readings.reduce((sum, r) => sum + r.systolic, 0) / totalReadings
  );
  const avgDiastolic = Math.round(
    readings.reduce((sum, r) => sum + r.diastolic, 0) / totalReadings
  );

  document.getElementById('avgSystolic').textContent = avgSystolic;
  document.getElementById('avgDiastolic').textContent = avgDiastolic;

  // Latest reading
  const latest = readings[readings.length - 1];
  document.getElementById(
    'latestReading'
  ).textContent = `${latest.systolic}/${latest.diastolic}`;
}

// Update chart
function updateChart(readings) {
  const ctx = document.getElementById('bpChart').getContext('2d');

  // Destroy existing chart if it exists
  if (bpChart) {
    bpChart.destroy();
  }

  if (readings.length === 0) {
    return;
  }

  // Sort readings by date
  const sortedReadings = [...readings].sort(
    (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
  );

  const labels = sortedReadings.map((r) => {
    const date = new Date(r.createdAt);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  });

  const systolicData = sortedReadings.map((r) => r.systolic);
  const diastolicData = sortedReadings.map((r) => r.diastolic);

  bpChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: labels,
      datasets: [
        {
          label: 'Systolic',
          data: systolicData,
          borderColor: '#e74c3c',
          backgroundColor: 'rgba(231, 76, 60, 0.1)',
          tension: 0.4,
          fill: true,
        },
        {
          label: 'Diastolic',
          data: diastolicData,
          borderColor: '#4a90e2',
          backgroundColor: 'rgba(74, 144, 226, 0.1)',
          tension: 0.4,
          fill: true,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        legend: {
          display: true,
          position: 'top',
        },
        tooltip: {
          mode: 'index',
          intersect: false,
        },
      },
      scales: {
        y: {
          beginAtZero: false,
          min: 50,
          max: 200,
          title: {
            display: true,
            text: 'mmHg',
          },
        },
        x: {
          title: {
            display: true,
            text: 'Date',
          },
        },
      },
    },
  });
}

function showReadingMessage(text, type) {
  const messageEl = document.getElementById('readingMessage');
  messageEl.textContent = text;
  messageEl.className = `message ${type} show`;

  setTimeout(() => {
    clearReadingMessage();
  }, 5000);
}

function clearReadingMessage() {
  const messageEl = document.getElementById('readingMessage');
  messageEl.textContent = '';
  messageEl.className = 'message';
}
