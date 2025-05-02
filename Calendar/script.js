document.addEventListener('DOMContentLoaded', function() {
    const today = new Date();
    let currentMonth = today.getMonth();
    let currentYear = today.getFullYear();

    const calendarBody = document.getElementById('calendar-body');
    const prevMonthButton = document.getElementById('prev-month');
    const nextMonthButton = document.getElementById('next-month');
    const calendarMonthYear = document.getElementById('calendar-month-year'); // Reference to month-year display
    const currentDateButton = document.getElementById('current-date'); // Reference to the location button

    // Array of month names
    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

    // Function to render the calendar
    function renderCalendar(month, year) {
        calendarBody.innerHTML = ''; // Clear previous month
        calendarMonthYear.innerHTML = `${monthNames[month]}, ${year}`; // Update month-year display

        const firstDay = new Date(year, month).getDay(); // Day of week first day falls on
        const daysInMonth = 32 - new Date(year, month, 32).getDate(); // Total days in month

        let date = 1;
        for (let i = 0; i < 6; i++) { // Calendar has max 6 rows
            const row = document.createElement('tr');

            for (let j = 0; j < 7; j++) {
                const cell = document.createElement('td');
                
                if (i === 0 && j < firstDay) {
                    cell.innerHTML = ''; // Empty cells before first day
                } else if (date > daysInMonth) {
                    break; // No more dates after month ends
                } else {
                    cell.innerHTML = date;

                    // Highlight the current date
                    if (date === today.getDate() && month === today.getMonth() && year === today.getFullYear()) {
                        cell.classList.add('today');
                    }

                    date++;
                }
                row.appendChild(cell);
            }
            calendarBody.appendChild(row);
        }
    }

    // Event listeners for month navigation
    prevMonthButton.addEventListener('click', () => {
        currentMonth--;
        if (currentMonth < 0) {
            currentMonth = 11; // Go to December of previous year
            currentYear--;
        }
        renderCalendar(currentMonth, currentYear);
    });

    nextMonthButton.addEventListener('click', () => {
        currentMonth++;
        if (currentMonth > 11) {
            currentMonth = 0; // Go to January of next year
            currentYear++;
        }
        renderCalendar(currentMonth, currentYear);
    });

    // Event listener for current date button
    currentDateButton.addEventListener('click', () => {
        currentMonth = today.getMonth();
        currentYear = today.getFullYear();
        renderCalendar(currentMonth, currentYear);
    });

    // Initial render for current month and year
    renderCalendar(currentMonth, currentYear);
});
