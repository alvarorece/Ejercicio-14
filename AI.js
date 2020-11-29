class AI {
    constructor() {
    }
    chooseMove(boardState) {
        for (let i = 0; i < boardState.length; i++) {
            for (let j = 0; j < boardState[i].length; j++) {
                const cell = boardState[i][j];
                if (cell === null || cell === undefined) {
                    return { x: i, y: j };
                }
            }
        }
    }
}