document.addEventListener('DOMContentLoaded', () => {
    const progressButton = document.getElementById('progress');
    let noteIdCounter = 0;

    // Create Progress Note
    function createProgressNote() {
        const progressNote = document.createElement('div');
        progressNote.classList.add('progress-note');
        progressNote.dataset.noteId = `note-${noteIdCounter++}`;

        // Set default position
        progressNote.style.top = `${100 + Math.random() * 200}px`;
        progressNote.style.left = `${100 + Math.random() * 400}px`;

        progressNote.addEventListener('mousedown', e => e.stopPropagation());
        progressNote.addEventListener('click', e => e.stopPropagation());

        const title = document.createElement('div');
        title.classList.add('note-title');
        title.contentEditable = true;
        title.innerText = 'Title';

        const tasksContainer = document.createElement('div');
        tasksContainer.classList.add('tasks-container');
        tasksContainer.setAttribute('id', `tasks-container-${progressNote.dataset.noteId}`);

        // Handle dragover event for reordering tasks
        tasksContainer.addEventListener('dragover', e => {
            e.preventDefault();
            const afterElement = getDragAfterElement(tasksContainer, e.clientY);
            const draggingTask = document.querySelector('.dragging');
            if (afterElement == null) {
                tasksContainer.appendChild(draggingTask);
            } else {
                tasksContainer.insertBefore(draggingTask, afterElement);
            }
        });

        // Handle task drop event
        tasksContainer.addEventListener('drop', e => {
            e.preventDefault();
            const draggingTask = document.querySelector('.dragging');
            if (draggingTask) {
                draggingTask.classList.remove('dragging');
            }
            adjustSpacing(tasksContainer, title);
        });

        // Add buttons for Add Task and Customize
        const addTaskButton = document.createElement('div');
        addTaskButton.classList.add('add-task-btn');

        const addTaskBtnLeft = document.createElement('button');
        addTaskBtnLeft.classList.add('add-task-left');
        addTaskBtnLeft.innerText = '+ Add Task';

        const customizeBtnRight = document.createElement('button');
        customizeBtnRight.classList.add('customize-right');

        // Customize button with icon
        const customizeIcon = document.createElement('span');
        customizeIcon.classList.add('customize-icon');
        customizeIcon.innerHTML = '&#9881;';  // Gear icon (Unicode character for settings)
        
        customizeBtnRight.appendChild(customizeIcon);
        customizeBtnRight.appendChild(document.createTextNode(' Customize'));

        addTaskButton.appendChild(addTaskBtnLeft);
        addTaskButton.appendChild(customizeBtnRight);

        addTaskBtnLeft.addEventListener('click', e => {
            e.stopPropagation();
            const task = createTask();
            tasksContainer.appendChild(task);
            adjustSpacing(tasksContainer, title);  // Adjust spacing when a task is added
        });

        progressNote.appendChild(title);
        progressNote.appendChild(tasksContainer);
        progressNote.appendChild(addTaskButton);
        document.body.appendChild(progressNote);

        // Handle Customize button click (show color boxes)
        customizeBtnRight.addEventListener('click', (e) => {
            e.stopPropagation();  // Prevent event propagation to the progress note
            showColorOptions(progressNote);
        });

        makeDraggable(progressNote);
    }

    // Show color options when Customize button is clicked
    function showColorOptions(progressNote) {
        // Create the color palette container if it doesn't exist
        if (!document.querySelector('.color-options')) {
            const colorOptionsContainer = document.createElement('div');
            colorOptionsContainer.classList.add('color-options');

            // Pastel colors to choose from
            const colors = [
                '#FFB3BA', '#FFDFBA', '#FFECBA', '#BAFFC9',
                '#BAE1FF', '#D9BAFF', '#FFBAF0', '#B3B3CC',
                '#C4E1C1', '#FFB6C1', '#B6E3FF', '#C9B0FF',
                '#FADADD', '#FEEAC8', '#FFFACD', '#D5F4E6',
                '#CFE8FC', '#E5D0FF', '#FFD6EC', '#DCD6F7',
                '#D0F0C0', '#FFC0CB', '#CDEFFD', '#E6CCFF'
            ];

            // Create color boxes
            colors.forEach(color => {
                const colorBox = document.createElement('div');
                colorBox.classList.add('color-box');
                colorBox.style.backgroundColor = color;

                // Change progress note color when clicked
                colorBox.addEventListener('click', () => {
                    progressNote.style.backgroundColor = color;
                    colorOptionsContainer.remove();  // Remove color options after selecting
                });

                colorOptionsContainer.appendChild(colorBox);
            });

            document.body.appendChild(colorOptionsContainer);
        }
    }

    // Adjust spacing between title and button based on task count
    function adjustSpacing(tasksContainer, title) {
        const addButton = tasksContainer.nextElementSibling;
        if (tasksContainer.children.length === 0) {
            title.style.marginBottom = '10px'; // Tight spacing when no tasks
            addButton.style.marginTop = '15px'; // Keep a smaller gap when no tasks
        } else {
            title.style.marginBottom = '20px'; // Regular spacing when tasks are added
            addButton.style.marginTop = '25px'; // Keep a larger gap when tasks are present
        }
    }

    // Create Task
    function createTask() {
        const task = document.createElement('div');
        task.classList.add('task');
        task.draggable = true;
        task.id = `task-${crypto.randomUUID()}`;

        task.addEventListener('dragstart', e => {
            task.classList.add('dragging');
            e.dataTransfer.setData('text/plain', task.id);
        });

        task.addEventListener('dragend', e => {
            task.classList.remove('dragging');
        });

        const taskTitle = document.createElement('div');
        taskTitle.classList.add('task-title');
        taskTitle.contentEditable = true;
        taskTitle.innerText = 'Task Title';

        const taskDescription = document.createElement('div');
        taskDescription.classList.add('task-desc');
        taskDescription.contentEditable = true;
        taskDescription.innerText = 'Task Description';

        const deleteBtn = document.createElement('div');
        deleteBtn.classList.add('delete-task');
        deleteBtn.innerText = '×';
        deleteBtn.addEventListener('click', () => task.remove());

        task.appendChild(taskTitle);
        task.appendChild(taskDescription);
        task.appendChild(deleteBtn);

        return task;
    }

    // Reorder tasks when dropped
    function getDragAfterElement(container, clientY) {
        const draggableElements = [...container.querySelectorAll('.task:not(.dragging)')];
        return draggableElements.reduce((closest, child) => {
            const box = child.getBoundingClientRect();
            const offset = clientY - box.top - box.height / 2;
            if (offset < 0 && offset > closest.offset) {
                return { offset, element: child };
            } else {
                return closest;
            }
        }, { offset: Number.NEGATIVE_INFINITY }).element;
    }

    // Make progress note draggable
    function makeDraggable(element) {
        let offsetX, offsetY, isDragging = false;

        // Only allow dragging the progress note itself, not the tasks inside it
        element.addEventListener('mousedown', e => {
            // If user clicks on a task or an editable content, stop propagation
            const isEditable = e.target.closest('[contenteditable]');
            if (isEditable || e.target.closest('.task')) return;

            isDragging = true;
            offsetX = e.clientX - parseFloat(window.getComputedStyle(element).left);
            offsetY = e.clientY - parseFloat(window.getComputedStyle(element).top);
            element.style.zIndex = 9999;
        });

        document.addEventListener('mousemove', e => {
            if (isDragging) {
                element.style.left = `${e.clientX - offsetX}px`;
                element.style.top = `${e.clientY - offsetY}px`;
            }
        });

        document.addEventListener('mouseup', () => {
            isDragging = false;
        });
    }

    progressButton.addEventListener('click', createProgressNote);

    const style = document.createElement('style');
    style.innerHTML = `
        .progress-note {
            position: absolute;
            width: 300px;
            background-color: #eee;
            border-radius: 20px;
            padding: 20px;
            cursor: move;
            z-index: 9999;
            user-select: none;
        }
        .note-title {
            font-weight: bold;
            font-size: 20px;
            margin-bottom: 20px;
            cursor: text;
            user-select: text;
            text-transform: capitalize;
        }
        .tasks-container {
            display: flex;
            flex-direction: column;
            gap: 12px;
            min-height: 20px;
        }
        .add-task-btn {
            display: flex;
            width: 100%;
            margin-top: 25px;
            gap: 8px;
        }
        .add-task-left,
        .customize-right {
            width: 50%;
            padding: 10px;
            background-color: rgba(0, 0, 0, 0.1); /* transparent and darker */
            border: 0px solid rgba(0, 0, 0, 0.3);
            border-radius: 10px;
            font-size: 16px;
            font-weight: bold;
            color: #333;
            cursor: pointer;
        }
        .add-task-left {
            text-align: left;
        }
        .customize-right {
            text-align: right;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        .customize-icon {
            font-size: 20px;
            margin-right: 8px;
        }
        .task {
            background-color: rgba(0, 0, 0, 0.1); /* transparent and darker */
            border-radius: 10px;
            padding: 10px;
            position: relative;
            cursor: grab;
            user-select: none;
        }
        .task.dragging {
            opacity: 0.5;
            cursor: grabbing;
        }
        .task-title,
        .task-desc {
            outline: none;
            user-select: text;
            cursor: text;
        }
        .task-title {
            font-weight: bold;
            margin-bottom: 5px;
        }
        .task-desc {
            font-size: 14px;
            color: #333;
        }
        .delete-task {
            position: absolute;
            top: 8px;
            right: 10px;
            font-weight: bold;
            cursor: pointer;
            color: #888;
        }
        .delete-task:hover {
            color: #c00;
        }

        /* Color Options */
        .color-options {
            position: absolute;
            top: 0;
            left: 50%;
            transform: translateX(-50%);
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            grid-gap: 10px;
            padding: 10px;
            background-color: white;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
            z-index: 10000;
        }
        .color-box {
            width: 50px;
            height: 50px;
            border-radius: 8px;
            cursor: pointer;
            transition: transform 0.3s;
        }
        .color-box:hover {
            transform: scale(1.1);
        }
    `;
    document.head.appendChild(style);
});
