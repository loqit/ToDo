import {getBoard, getTasks, updateTask, saveTask, getTask, updateBoard} from "./database.js";


const trashIcon = "../res/trash-can.svg";
const pencilIcon = "../res/NotePencil.svg"

const db = firebase.database();

let userId = '';
let tasks = {};
let boardId = '';
let taskData = {};

document.addEventListener("DOMContentLoaded",  function() {
    let userId = localStorage['userId'] || '';
    const params = new URLSearchParams(window.location.search);
    boardId = JSON.parse(params.get("boardId"));
    getTasks(userId, boardId, async task => {
        if (tasks[task.id] === undefined) { // Display board only once
            tasks[task.id] = task;
            await displayTask(task);
        }
    });
    setBoardInfo();
});

async function displayTask(task) {
    await showTask(task)
}

function setBoardInfo() {

    getBoard(boardId, (board) => {
        const colorSquare = document.getElementById('colorSquare');
        const boardTitle = document.getElementById('boardTitle');
        colorSquare.setAttribute("style", "background-color: " + (board.colorValue) + ";");
        boardTitle.innerText = board.title;
    });
}

document.getElementById('addTask').addEventListener('click', function() {
    let taskColor = document.getElementById('primaryColor').value;
    let taskValue = document.getElementById('taskValue').value;
    if (taskValue) saveTask(taskValue, taskColor, '', 'todo', boardId);
    document.getElementById('taskValue').value = '';
    document.getElementById('primaryColor').value = '#FFFFFF';
});

async function showTask(task) {

    const taskValue = task.title;
    const taskColor = task.colorValue;

    let taskCard = document.createElement('li');
    taskCard.classList.add('task');
    taskCard.classList.add('fill');

    taskCard.setAttribute("draggable", "true");
    taskCard.setAttribute("id", task.id);
    taskCard.setAttribute("style", "background-color: " + (taskColor) + ";")
    taskCard.addEventListener('dragstart', dragStart);
    taskCard.addEventListener('dragend', dragEnd);

    let taskContent = document.createElement('div');
    taskContent.classList.add('task-content');
    taskContent.innerText = taskValue;

    let taskDesc = document.createElement('div');
    taskDesc.classList.add('desc');
    taskDesc.innerText = task.description;

    let pencil = document.createElement('button');
    pencil.classList.add('pencil');
    pencil.addEventListener('click', (e) => {
        let modal = document.getElementById('editModal')
        modal.style.display = "block";
        document.getElementById('taskTitle').value = task.title;
        document.getElementById('taskColor').value = task.colorValue;
        document.getElementById('descInput').value = task.description;
        taskData = task;
    });
    let pencilImg = document.createElement('img');
    pencilImg.setAttribute('src', pencilIcon);
    pencil.appendChild(pencilImg);

    let trash = document.createElement('button');
    trash.classList.add('trash');
    trash.addEventListener('click', (e) => {

        let list = e.target.parentNode.parentNode.parentNode;
        // Get current task
        let element = e.target.parentNode.parentNode;
        list.removeChild(element);

        db.ref('tasks/' + task.id).remove();
        db.ref('users/' + userId + '/boards/' + boardId + '/' + task.id).remove();
    });
    let trashImg = document.createElement('img');
    trashImg.setAttribute('src', trashIcon);
    trash.appendChild(trashImg);

    taskCard.appendChild(taskContent);
    taskCard.appendChild(taskDesc);
    taskCard.appendChild(pencil);
    taskCard.appendChild(trash);


    let tasks = document.getElementById(task.status);
    tasks.insertBefore(taskCard, tasks.childNodes[0]);
}

    document.getElementById('saveTaskEdit').addEventListener('click', function () {
        let titleInput = document.getElementById('taskTitle').value;
        let colorInput = document.getElementById('taskColor').value;
        let descInput = document.getElementById('descInput').value;
        const newTask = {
            title: titleInput,
            colorValue: colorInput,
            description: descInput,
            status: taskData.status
        }
        console.log(newTask)
        updateTask(newTask, taskData.id);

        let modal = document.getElementById('editModal')
        modal.style.display = "none";
        location.reload();
    });

// DRAG & DROP

let task

const dragStart = (event) => {

    event.target.className += ' hold';
    task = event.target;
    setTimeout(() => (event.target.className = 'invisible'), 0);
}

const dragEnd = (event) => {
    event.target.className = 'task fill';
}

const dropzones = document.querySelectorAll('.dropzone');

const dragEnter = (event) => {
    event.preventDefault();

    if(event.target.className === "column dropzone") {
        event.target.className += ' hovered';
    }
}

const dragOver = (event) => {
    event.preventDefault();
}

const dragLeave = (event) => {
    if(event.target.className === "column dropzone hovered") {
        event.target.className = "column dropzone"
    }
}

const dragDrop = (event) => {
    const newStatus = event.target.childNodes[1].innerText.toLowerCase();
    if(event.target.className === "column dropzone hovered") {
        event.target.className = "column dropzone"
    }

    getTask(task.id, (newTask) => {
        newTask.status = newStatus;
        updateTask(newTask, task.id);
        console.log(newTask);
    })
    event.target.append(task);
}

for(const dropzone of dropzones) {
    dropzone.addEventListener('dragenter', dragEnter);
    dropzone.addEventListener('dragover', dragOver);
    dropzone.addEventListener('dragleave', dragLeave);
    dropzone.addEventListener('drop', dragDrop);
}