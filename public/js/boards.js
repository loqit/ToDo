import { getBoards, saveBoard, updateBoard } from "./database.js";

const trashIcon = "../res/trash-can.svg";
const pencilIcon = "../res/NotePencil.svg";

const db = firebase.database();
let userId = '';
let boards = {};
let boardId = '';



document.addEventListener("DOMContentLoaded", function() {
    userId = localStorage['userId'] || '';

    getBoards(userId, async board => {
        if (boards[board.id] === undefined) { // Display board only once
            boards[board.id] = board;
            await displayBoard(board);
        }
    });
    setTimeout(function(){ removeElementsByClass('board-skeleton') }, 300);
});

function removeElementsByClass(className){
    const elements = document.getElementsByClassName(className);
    while(elements.length > 0){
        elements[0].parentNode.removeChild(elements[0]);
    }
}

async function displayBoard(board) {
    removeElementsByClass('board-skeleton')
    await showBoard(board);
}

document.getElementById('addBoard').addEventListener('click',function() {

    let boardColor = document.getElementById('primaryColor').value;
    let boardValue = document.getElementById('boardValue').value;
    if (boardValue) saveBoard(boardValue, boardColor);

    document.getElementById('boardValue').value = '';
    document.getElementById('primaryColor').value = '#FFFFFF';
});

async function showBoard(board) {

    const boardValue = board.title;
    const boardColor = board.colorValue;

    let boardCard = document.createElement('div');
    boardCard.classList.add('board');
    boardCard.setAttribute("style", "background-color: " + (boardColor) + ";");
    boardCard.addEventListener('click', function () {
        boardId = JSON.stringify(board.id);
        let params = new URLSearchParams();
        params.append('boardId', boardId);

        let url = '../html/tasks.html?' + params;
        location.replace(url);
    });

    let boardTitle = document.createElement('div');
    boardTitle.classList.add('board-title');
    boardTitle.innerText = boardValue;

    let pencil = document.createElement('button');
    pencil.classList.add('pencil');
    pencil.addEventListener('click',  (e) => {
        e.stopPropagation();
        let modal = document.getElementById('editModal')
        modal.style.display = "block";
        document.getElementById('boardTitle').value = board.title;
        document.getElementById('boardColor').value = board.colorValue;

        boardId = board.id;

    });
    let pencilImg = document.createElement('img');
    pencilImg.setAttribute('src', pencilIcon);
    pencil.appendChild(pencilImg);

    let trash = document.createElement('button');
    trash.classList.add('trash');
    trash.addEventListener('click',   (e) => {
        e.stopPropagation();
        let list = e.target.parentNode.parentNode.parentNode;
        // Get current task
        let element = e.target.parentNode.parentNode;
        list.removeChild(element);

        db.ref('boards/' + board.id).remove();
        db.ref('users/' + userId + '/boards/' + board.id).remove();
    });
    let trashImg = document.createElement('img');
    trashImg.setAttribute('src', trashIcon);
    trash.appendChild(trashImg);

    boardCard.appendChild(boardTitle);
    boardCard.appendChild(pencil);
    boardCard.appendChild(trash);

    let boards = document.getElementById('boardAdded');
    boards.insertBefore(boardCard, boards.childNodes[0]);
}

document.getElementById('saveBoardEdit').addEventListener('click', function () {
    let titleInput = document.getElementById('boardTitle').value;
    let colorInput = document.getElementById('boardColor').value;

    const newBoard = {
        title: titleInput,
        colorValue: colorInput
    }

    updateBoard(newBoard, boardId);

    let modal = document.getElementById('editModal')
    modal.style.display = "none";
    location.reload();
})
