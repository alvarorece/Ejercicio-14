const canvas = document.getElementById('board');
const canvasContext = canvas.getContext('2d');
const size = 600;
const squareSize = size / 3;
let player = 1;
let isBlack = true;
class Controller {
    constructor(game, ai, canvas, squareSize, statusView, pauseButton) {
        this.game = game;
        this.ai = ai;
        this.squareSize = squareSize;
        this.canvas = canvas;
        this.statusView = statusView;
        this.pauseButton = pauseButton;
        this.isPaused = false;
        canvas.addEventListener('mouseup', this.doTurn.bind(this));
        document.addEventListener("keypress", this.fullScreen.bind(this), false);
        this.canvasContext = canvasContext;
        this.drawLines();
    }
    get halfSquare() {
        return this.squareSize * 0.5;
    }
    set isPaused(value) {
        if (value === false) {
            this.statusView.innerHTML = 'Juega contra el círculo!';
            this.pauseButton.disabled = true;
        }
        else {
            this.statusView.innerHTML = 'Dale a continuar para seguir jugando';
            this.pauseButton.disabled = false;
        }
        this.pause = value;
    }
    get isPaused() {
        return this._isPaused;
    }
    paintState() {
        const board = this.game.board;
        this.canvasContext.clearRect(0, 0, this.canvas.width, this.canvas.height);
        for (let i = 0; i < board.length; i++)
            for (let j = 0; j < board[0].length; j++)
                if (board[i][j] === true)
                    this.drawX(i * this.squareSize + 1, j * this.squareSize + 1);
                else if (board[i][j] === false) {
                    this.drawO(i * this.squareSize + 1, j * this.squareSize + 1);
                }
        this.drawLines();
    }
    checkFinalState() {
        if (this.game.hasCrossWon()) {
            alert('CrossWon!');
            this.resetState();
            return true;
        }
        else if (this.game.isDraw()) {
            alert('Its a draw!');
            this.resetState();
            return true;
        }
        return false;
    }
    doTurn(event) {
        if (this.isPaused === true)
            return;
        const canvasMousePosition = this.getMousePos(event);
        const row = Math.floor(canvasMousePosition.x / this.squareSize);
        const col = Math.floor(canvasMousePosition.y / this.squareSize);
        this.place(canvasMousePosition);
        this.game.move(row, col);
        this.drawLines();
        if (!this.checkFinalState()) {
            this.moveAI();
            this.checkFinalState();
        }
    }
    moveAI() {
        const result = this.ai.chooseMove(this.game.board);
        if (this.game.isCrossTurn === true) {
            this.drawX(result.x * this.squareSize, result.y * this.squareSize);
        }
        else {
            this.drawO(result.x * this.squareSize, result.y * this.squareSize);
        }
        this.game.move(result.x, result.y);
    }
    drawLines() {
        this.canvasContext.lineWidth = 10;
        this.canvasContext.strokeStyle = "#000000";
        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 3; j++)
                this.canvasContext.strokeRect(j * 200, i * 200, 200, 200);
        }
    }
    drawO(x, y) {
        const centerX = x + this.halfSquare;
        const centerY = y + this.halfSquare;
        const startAngle = 0 * Math.PI;
        const endAngle = 2 * Math.PI;
        const radius = (this.squareSize - 100) / 2;
        this.canvasContext.lineWidth = 10;
        this.canvasContext.strokeStyle = "#ff0000";
        this.canvasContext.beginPath();
        this.canvasContext.arc(centerX, centerY, radius, startAngle, endAngle);
        this.canvasContext.stroke();
    }
    drawX(x, y) {
        this.canvasContext.strokeStyle = "#006FCD";
        this.canvasContext.beginPath();
        const margin = 50;
        this.canvasContext.moveTo(x + margin, y + this.squareSize - margin);
        this.canvasContext.lineTo(x + this.squareSize - margin, y + margin);
        this.canvasContext.moveTo(x + margin, y + margin);
        this.canvasContext.lineTo(x + this.squareSize - margin, y + this.squareSize - margin);
        this.canvasContext.stroke();
    }
    place(mouse) {
        for (var i = 0; i < 3; i++) {
            for (var j = 0; j < 3; j++) {
                const x = i * this.squareSize;
                const y = j * this.squareSize;
                if (mouse.x >= x && mouse.x <= x + this.squareSize &&
                    mouse.y >= y && mouse.y <= y + this.squareSize) {
                    this.clearPlayingArea(x, y);
                    if (this.game.isCrossTurn === true) {
                        this.drawX(x, y);
                    } else {
                        this.drawO(x, y);
                    }
                }
            }
        }
    }
    getMousePos(event) {
        const rect = canvas.getBoundingClientRect();
        return {
            x: event.clientX - rect.left,
            y: event.clientY - rect.top
        }
    }
    clearPlayingArea(xCordinate, yCordinate) {
        this.canvasContext.fillStyle = "#fff";
        this.canvasContext.fillRect(xCordinate, yCordinate, this.squareSize, this.squareSize);
    }
    loadState(fileBrowser) {
        const file = fileBrowser.files[0];
        file.text().then(result => {
            const newState = JSON.parse(result);
            Object.assign(this.game, newState);
            this.paintState();
            this.isPaused = true;
            if (this.checkFinalState() === false && this.game.isCrossTurn === false) {
                while (this.isPaused) {
                    if (this.isPaused === false)
                        this.moveAI();
                    this.checkFinalState();
                }
            }
        });
    }
    resetState() {
        this.game = new Game();
        this.paintState();
    }
    downloadState() {
        const str = JSON.stringify(this.game);
        const data = new Blob([str], { type: 'application/json' });
        const url = window.URL.createObjectURL(data);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'match.json';
        a.click();
        window.URL.revokeObjectURL(url);
    }
    fullScreen(e) {
        if (e.key === 'Enter') {
            if (!document.fullscreenElement) {
                document.documentElement.requestFullscreen();
            } else {
                if (document.exitFullscreen) {
                    document.exitFullscreen();
                }
            }
        }
    }
}
const controller = new Controller(new Game(), new AI(), canvas, squareSize, document.getElementById('status'), document.getElementById('pause'));