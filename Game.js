class Game {
    constructor() {
        this.board = [[], [], []];
        for (let i = 0; i < 3; i++)
            for (let j = 0; j < 3; j++)
                this.board[i].push(null);
        this.isCrossTurn = true;
    }
    move(x, y) {
        if (this.isOccupied(x, y))
            throw new Error('Position already occupied!');
        if (this.isCrossTurn)
            this.placeCross(x, y);
        else
            this.placeCircle(x, y);
        this.isCrossTurn = !this.isCrossTurn;
    }
    placeCross(x, y) {
        this.board[x][y] = true;
    }
    placeCircle(x, y) {
        this.board[x][y] = false;
    }
    isOccupied(x, y) {
        return this.board[x][y] !== null && this.board[x][y] !== undefined;
    }
    hasCrossWon() {
        const board = this.board;
        for (let row = 0; row < 3; row++) {
            if (board[row][0] == board[row][1] &&
                board[row][1] == board[row][2] && board[row][0] !== null) {
                return board[row][0];
            }
        }

        for (let col = 0; col < 3; col++) {
            if (board[0][col] == board[1][col] &&
                board[1][col] == board[2][col] && board[0][col] !== null) {
                return board[0][col];
            }
        }

        if (board[0][0] !== null && board[0][0] == board[1][1] && board[1][1] == board[2][2]) {
            return board[0][0];
        }

        if (board[0][2] !== null && board[0][2] == board[1][1] && board[1][1] == board[2][0]) {
            return board[0][2];
        }
        return undefined;
    }
    isDraw() {
        const board = this.board;
        for (const row of board)
            for (const cell of row)
                if (cell !== null && cell !== undefined)
                    return false;
        return true;
    }
}