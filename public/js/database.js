
const db = firebase.database();

export function saveTask(title, colorValue, description, status, boardId) {
    let userId = localStorage['userId'] || '';
    const taskData = {
        title: title,
        colorValue: colorValue,
        description: description,
        status: status
    }

    const newTaskRef = db.ref('tasks/').push();
    newTaskRef.set(taskData);

    const newTaskId = newTaskRef.key;
    const userTask = db.ref('users/' + userId + '/boards/' + boardId + '/tasks').push();
    userTask.set(newTaskId);

}

export function saveBoard(title, colorValue) {
    let userId = localStorage['userId'] || '';
    const boardData = {
        title: title,
        colorValue: colorValue
    }

    const newBoardRef = db.ref('boards').push();
    newBoardRef.set(boardData);

    const newBoardId = newBoardRef.key;
    const userBoard = db.ref('users/' + userId + '/boards').push();
    userBoard.set({
        boardId: newBoardId
    });
}

export function getBoards(userId, displayBoard, removeElements) {

    db
        .ref('users/' + userId + '/boards/')
        .on('value', snap => {

            const userBoards = snap.val();

            if (userBoards) {
                Object.values(userBoards)?.forEach(board => {
                    db
                        .ref('boards/' + board.boardId)
                        .on('value', snap => {
                            const boardVal = snap.val();
                            if (!boardVal) return;

                            boardVal.id = board.boardId;
                            displayBoard(boardVal);
                        });
                });
            } else {
                removeElements();
            }
        });
}

export function getBoard(boardId, setBoard) {
    let board = {};
    db
        .ref('boards/' + boardId)
        .on('value', snap => {
            board = snap.val();
            setBoard(board)

        });
}

export function getTask(taskId, setTask) {
    let task = {};
    db
        .ref('tasks/' + taskId)
        .on('value', snap => {

            task = snap.val();
            setTask(task);

        });
}

export function getTasks(userId, boardId, displayTasks, removeElements) {
    db
        .ref('users/' + userId + '/boards/' + boardId + '/tasks/')
        .on('value', snap => {
            const userTasks = snap.val();

            if (userTasks) {
                Object.values(userTasks)?.forEach(taskId => {
                    db
                        .ref('tasks/' + taskId)
                        .on('value', snap => {
                            const taskVal = snap.val();
                            if (!taskVal) return;
                            taskVal.id = taskId

                            displayTasks(taskVal);
                        });
                });
            } else {
                removeElements();
            }

        });
}

export function updateBoard(boardData, boardId) {
    let updates = {};
    updates['boards/' + boardId] = boardData;
    db
        .ref()
        .update(updates);
}

export function updateTask(taskData, taskId) {
    let updates = {};
    updates['tasks/' + taskId] = taskData;
    db
        .ref()
        .update(updates);
}

