class NoticeBoard extends GameObject {
  constructor(playground) {
    super();

    this.playground = playground;
    this.ctx = this.playground.game_map.ctx;
    this.text = "Ready players: 0";

    this.start();
  }

  start() {}

  write(text) {
    this.text = text;
  }

  update() {
    this.render();
  }

  render() {
    this.ctx.font = "20px serif";
    this.ctx.fillStyle = "white";
    this.ctx.textAlign = "center";
    this.ctx.fillText(this.text, this.playground.width / 2, 20);
  }
}
