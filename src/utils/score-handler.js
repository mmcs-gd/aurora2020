export default class ScoreHandler {
    /* Score key is used as key in localstorage for score and as id for div with score */
    /* HighScore key is used as key in localStorage for high score and as id for div with highscore */
    constructor(scoreKey, highScoreKey) {
        this.scoreKey = scoreKey;
        this.highScoreKey = highScoreKey;
        this.score = parseInt(window.localStorage.getItem(scoreKey) || '0')
        this.highScore = parseInt(window.localStorage.getItem(highScoreKey) || '0')
    }

    killed(object) {
        this._modifyScore(50)
    }

    found(object) {
        this._modifyScore(50)
    }

    exit() {
        this._modifyScore(300)
    }

    _modifyScore(delta) {
        console.log(`Modifying score by ${delta}`);
        this.score += delta;
        this._updateStorage();
        this._updateView();
    }

    _updateStorage() {
        window.localStorage.setItem(this.scoreKey, this.score);
        if (this.score > this.highScore) window.localStorage.setItem(this.highScoreKey, this.score);
    }

    _updateView() {
        const maybeScoreDiv = document.getElementById(this.scoreKey)
        if (maybeScoreDiv) maybeScoreDiv.innerText = `Score: ${this.score}`;
        
        if (this.score > this.highScore) {
            const maybeHighScoreDiv = document.getElementById(this.highScoreKey)
            if (maybeHighScoreDiv) maybeHighScoreDiv.innerText = `High-Score: ${this.score}`;
        }
    }
}