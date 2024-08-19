export class Game {
    constructor(id) {
        this.id = id;
        this.$game = $('#' + id);

        this.settings = new Settings(this);
        this.menu = new GameMenu(this);
        this.playground = new GamePlayground(this);

        this.start();
    }

    start() {
    }
}

