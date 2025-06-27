// Initialize tasks on page load
window.onload = function () {
    renderTasks();
    updatePercentage();
};

// Toggle Task Window visibility
function toggleTaskWindow() {
    const taskWindow = document.getElementById('taskWindow');
    taskWindow.style.display = taskWindow.style.display === 'block' ? 'none' : 'block';
}

// Add a new task
function addTask() {
    const taskInput = document.getElementById('taskInput');
    const taskList = document.getElementById('taskList');

    if (taskInput.value.trim() !== '') {
        const newTask = {
            text: taskInput.value,
            completed: false
        };

        let tasks = getTasksFromLocalStorage();
        tasks.push(newTask);
        saveTasksToLocalStorage(tasks);

        renderTasks();
        taskInput.value = '';
        updatePercentage();
    }
}

// Delete a task
function deleteTask(button) {
    const taskText = button.parentElement.querySelector('.task-text').textContent;

    let tasks = getTasksFromLocalStorage();
    tasks = tasks.filter(task => task.text !== taskText);
    saveTasksToLocalStorage(tasks);

    renderTasks();
    updatePercentage();
}

// Toggle task completion status
function toggleTaskCompletion(checkbox) {
    const taskText = checkbox.parentElement.querySelector('.task-text').textContent;

    let tasks = getTasksFromLocalStorage();
    const task = tasks.find(task => task.text === taskText);
    if (task) {
        task.completed = checkbox.checked;
        saveTasksToLocalStorage(tasks);
    }

    updatePercentage();
}

// Get tasks from localStorage
function getTasksFromLocalStorage() {
    const tasks = localStorage.getItem('tasks');
    return tasks ? JSON.parse(tasks) : [];
}

// Save tasks to localStorage
function saveTasksToLocalStorage(tasks) {
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

// Render tasks from localStorage
function renderTasks() {
    const taskList = document.getElementById('taskList');
    taskList.innerHTML = '';

    // Set max height for 4 tasks (approximate height per task * 4)
    taskList.style.maxHeight = '160px'; // adjust if needed based on your CSS
    taskList.style.overflowY = 'auto';

    const tasks = getTasksFromLocalStorage();
    tasks.forEach(task => {
        const li = document.createElement('li');

        // Set styles so container stretches with long text
        li.style.display = 'flex';
        li.style.alignItems = 'center';
        li.style.marginBottom = '8px';
        li.style.flexWrap = 'wrap'; // allow wrapping if too long

        li.innerHTML = `
            <input type="checkbox" class="task-checkbox" onclick="toggleTaskCompletion(this)" ${task.completed ? 'checked' : ''} style="flex-shrink:0; margin-right: 8px;">
            <span class="task-text" style="flex-grow:1; word-wrap: break-word; white-space: normal;">${task.text}</span>
            <button onclick="deleteTask(this)" style="margin-left: 8px; flex-shrink:0;">Delete</button>
        `;
        taskList.appendChild(li);
    });
}

// Update the percentage and progress bar
function updatePercentage() {
    const tasks = document.querySelectorAll('.task-checkbox');
    const totalTasks = tasks.length;
    const completedTasks = Array.from(tasks).filter(task => task.checked).length;

    const percentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
    document.querySelector('.progress-text').textContent = `${percentage}%`;

    const progressBar = document.querySelector('.progress-bar');
    progressBar.style.width = `${percentage}%`;
    progressBar.style.backgroundColor = percentage === 100 ? '#4caf50' : '#000000';
}

// Close the task window
function closeTaskWindow() {
    document.getElementById('taskWindow').style.display = 'none';
}

document.querySelector('.close-btn').addEventListener('click', closeTaskWindow);

// YouTube Audio Play/Pause
let isPlaying = false;

function toggleVideoPlay() {
    const video = document.getElementById("youtubeVideo");
    const playButton = document.querySelectorAll('.control-btn')[1];
    const icon = playButton.querySelector('i');

    if (isPlaying) {
        video.contentWindow.postMessage('{"event":"command","func":"pauseVideo","args":""}', '*');
        icon.classList.remove('fa-pause');
        icon.classList.add('fa-play');
    } else {
        video.contentWindow.postMessage('{"event":"command","func":"playVideo","args":""}', '*');
        icon.classList.remove('fa-play');
        icon.classList.add('fa-pause');
    }

    isPlaying = !isPlaying;
}

// Add event listener to the play button (middle button)
document.querySelectorAll('.control-btn')[1].addEventListener('click', toggleVideoPlay);
