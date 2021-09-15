export default class Piece {
    constructor(player,fig,title) {
        this.value = fig;
        this.player = player;
        this.title = title;
    }
    getPlayer() {
        return this.player;
    }
    geTitle() {
        return this.title;
    }
}