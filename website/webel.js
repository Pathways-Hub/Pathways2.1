// webel.js

function updateDate() {
  const dateElement = document.getElementById("currentDate");
  const today = new Date();
  const day = today.getDate();
  dateElement.textContent = day;
}

// Run on page load
document.addEventListener("DOMContentLoaded", updateDate);

const dateElement = document.getElementById("currentDate");
const dayElement = document.getElementById("currentDay");

const now = new Date();
const day = now.getDate();
const weekday = now.toLocaleDateString("en-US", { weekday: 'long' });

dateElement.textContent = day;
dayElement.textContent = weekday;
