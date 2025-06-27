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

        // Title wrapper and delete button
        const titleWrapper = document.createElement('div');
        titleWrapper.classList.add('note-title-wrapper');

        const title = document.createElement('div');
        title.classList.add('note-title');
        title.contentEditable = true;
        title.innerText = 'Title';

        const deleteBtn = document.createElement('div');
        deleteBtn.classList.add('note-delete');
        deleteBtn.textContent = '×';
        deleteBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            progressNote.remove();
        });

        titleWrapper.appendChild(title);
        titleWrapper.appendChild(deleteBtn);

        const tasksContainer = document.createElement('div');
        tasksContainer.classList.add('tasks-container');
        tasksContainer.setAttribute('id', `tasks-container-${progressNote.dataset.noteId}`);

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

        tasksContainer.addEventListener('drop', e => {
            e.preventDefault();
            const draggingTask = document.querySelector('.dragging');
            if (draggingTask) {
                draggingTask.classList.remove('dragging');
            }
            adjustSpacing(tasksContainer, title);
        });

        const addTaskButton = document.createElement('div');
        addTaskButton.classList.add('add-task-btn');

        const addTaskBtnLeft = document.createElement('button');
        addTaskBtnLeft.classList.add('add-task-left');
        addTaskBtnLeft.innerText = '+ Add Task';

        const customizeBtnRight = document.createElement('button');
        customizeBtnRight.classList.add('customize-right');

        const customizeIcon = document.createElement('span');
        customizeIcon.classList.add('customize-icon');
        customizeIcon.innerHTML = '&#9881;';
        customizeBtnRight.appendChild(customizeIcon);
        customizeBtnRight.appendChild(document.createTextNode(' Customize'));

        addTaskButton.appendChild(addTaskBtnLeft);
        addTaskButton.appendChild(customizeBtnRight);

        addTaskBtnLeft.addEventListener('click', e => {
            e.stopPropagation();
            const task = createTask();
            tasksContainer.appendChild(task);
            adjustSpacing(tasksContainer, title);
        });

        progressNote.appendChild(titleWrapper);
        progressNote.appendChild(tasksContainer);
        progressNote.appendChild(addTaskButton);
        document.body.appendChild(progressNote);

        customizeBtnRight.addEventListener('click', (e) => {
            e.stopPropagation();
            showColorOptions(progressNote);
        });

        makeDraggable(progressNote);
    }

    function showColorOptions(progressNote) {
        if (!document.querySelector('.color-options')) {
            const colorOptionsContainer = document.createElement('div');
            colorOptionsContainer.classList.add('color-options');

            const colors = [
                '#FFB3BA', '#FFDFBA', '#FFECBA', '#BAFFC9',
                '#BAE1FF', '#D9BAFF', '#FFBAF0', '#B3B3CC',
                '#C4E1C1', '#FFB6C1', '#B6E3FF', '#C9B0FF',
                '#FADADD', '#FEEAC8', '#FFFACD', '#D5F4E6',
                '#CFE8FC', '#E5D0FF', '#FFD6EC', '#DCD6F7',
                '#D0F0C0', '#FFC0CB', '#CDEFFD', '#E6CCFF'
            ];

            colors.forEach(color => {
                const colorBox = document.createElement('div');
                colorBox.classList.add('color-box');
                colorBox.style.backgroundColor = color;

                colorBox.addEventListener('click', () => {
                    progressNote.style.backgroundColor = color;
                    colorOptionsContainer.remove();
                });

                colorOptionsContainer.appendChild(colorBox);
            });

            document.body.appendChild(colorOptionsContainer);
        }
    }

    function adjustSpacing(tasksContainer, title) {
        const addButton = tasksContainer.nextElementSibling;
        if (tasksContainer.children.length === 0) {
            title.style.marginBottom = '10px';
            addButton.style.marginTop = '15px';
        } else {
            title.style.marginBottom = '20px';
            addButton.style.marginTop = '25px';
        }
    }

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

    function makeDraggable(element) {
        let offsetX, offsetY, isDragging = false;

        element.addEventListener('mousedown', e => {
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
            padding: 12px;
            cursor: move;
            z-index: 9999;
            user-select: none;
        }
        .note-title-wrapper {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin: 20px 20px 16px 20px;
            position: relative;
        }
        .note-title {
            flex: 1;
            font-weight: bold;
            font-size: 20px;
            cursor: text;
            user-select: text;
            text-transform: capitalize;
        }
        .note-delete {
            font-size: 20px;
            font-weight: bold;
            margin-left: 10px;
            color: #999;
            cursor: pointer;
            opacity: 0;
            transition: opacity 0.3s ease;
        }
        .progress-note:hover .note-delete {
            opacity: 1;
        }
        .note-delete:hover {
            color: #c00;
        }
        .tasks-container {
            display: flex;
            flex-direction: column;
            gap: 8px;
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
            background-color: rgba(0, 0, 0, 0.1);
            border: 0;
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
            background-color: #fff;
            border: 2px solid rgba(0, 0, 0, 0.05);
            border-radius: 10px;
            padding: 8px 10px;
            margin: 0;
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
