const moodBtns = document.querySelectorAll(".mood-button");
const dateDisplay = document.querySelector("#date");
const today = new Date().toISOString().split("T")[0];
const moodColors = { Happy: "#f7dc40", Sad: "#ed7143", Excited: "#5aa5ef", Neutral: "#5bec5b" };
let moodChart;

function displayDate() {
  const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  dateDisplay.textContent = new Date().toLocaleDateString('en-US', options);
}


function logMood(mood) {
  let logs = JSON.parse(localStorage.getItem("moodLogs")) || [];

  logs = logs.filter(entry => entry.date !== today);

  mood = mood.charAt(0).toUpperCase() + mood.slice(1).toLowerCase();

  logs.push({ date: today, mood });

  localStorage.setItem("moodLogs", JSON.stringify(logs));

  // Update chart and calendar
  updateChart(document.getElementById("moodFilter").value);
  generateCalendar();
}


function groupMoods(type) {
  return (JSON.parse(localStorage.getItem("moodLogs")) || []).reduce((acc, entry) => {
    const date = new Date(entry.date);
    let key = type === "day" ? entry.date :
              type === "week" ? `${date.getFullYear()}-W${getWeek(date)}` :
              `${date.getFullYear()}-${date.getMonth() + 1}`;
    acc[key] = acc[key] || {};
    acc[key][entry.mood] = (acc[key][entry.mood] || 0) + 1;
    return acc;
  }, {});
}

function getWeek(date) {
  const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
  const diffDays = Math.floor((date - firstDayOfYear) / (1000 * 60 * 60 * 24));
  return Math.ceil((diffDays + firstDayOfYear.getDay() + 1) / 7);
}

function createChart(labels, datasets) {
  const ctx = document.getElementById("moodChart").getContext("2d");
  if (moodChart) moodChart.destroy();
  moodChart = new Chart(ctx, { 
    type: "bar", 
    data: { labels, datasets }, 
    options: { responsive: true, maintainAspectRatio: false, scales: { y: { beginAtZero: true, suggestedMax: 10 } } } });
}

function updateChart(view) {
  const grouped = groupMoods(view);
  const labels = Object.keys(grouped);

  const datasets = Object.keys(moodColors).map(mood => ({
    label: mood,
    data: labels.map(key => grouped[key][mood] || 0),
    backgroundColor: moodColors[mood],
    borderColor: "#333",
    borderWidth: 1,
  }));
  createChart(labels, datasets);
}

function generateCalendar() {
  const cal = document.getElementById("calendar");
  const now = new Date();
  const [year, month] = [now.getFullYear(), now.getMonth()];
  const [firstDay, lastDay] = [new Date(year, month, 1), new Date(year, month + 1, 0)];
  const [daysInMonth, firstDayOfWeek] = [lastDay.getDate(), firstDay.getDay()];

  cal.innerHTML = "";

  for (let i = 0; i < firstDayOfWeek; i++) cal.appendChild(document.createElement("div")).classList.add("calendar-day");
  for (let day = 1; day <= daysInMonth; day++) {
    const dayElement = cal.appendChild(document.createElement("div"));
    dayElement.classList.add("calendar-day");
    dayElement.textContent = day;
    const dateKey = `${year}-${(month + 1).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
    const mood = (JSON.parse(localStorage.getItem("moodLogs")) || []).find(entry => entry.date === dateKey) ?.mood;
    if (mood) dayElement.classList.add(mood.toLowerCase());
  }
}

moodBtns.forEach(btn => btn.addEventListener("click", () => logMood(btn.id.replace("-button", ""))));
document.getElementById("moodFilter").addEventListener("change", (e) => updateChart(e.target.value));
displayDate();
updateChart("day");
generateCalendar();


