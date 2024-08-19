class GameMenu {
    constructor(root) {
        this.root = root;
        this.$menu = $(`
<div class="game-menu">
    <div class="game-menu-field">
        <div class="game-menu-tooltip">
            <h3>Operation Tips</h3>
            <ul>
                <li>Mouse click to move</li>
                <li>Press <strong>Q</strong> to shoot</li>
                <li>Press <strong>F</strong> to flash</li>
                <li>After winning or losing, tap the screen to return</li>
            </ul>
        </div>
        <div class="game-menu-field-item game-menu-field-item-single-mode">
            Start
        </div>
        <br>
        <div class="game-menu-field-item game-menu-field-item-settings">
            Exit
        </div>
    </div>
    
</div>`);
        this.$menu.hide();
        this.root.$game.append(this.$menu);
        this.$single_mode = this.$menu.find('.game-menu-field-item-single-mode');
        this.$multi_mode = this.$menu.find('.game-menu-field-item-multi-mode');
        this.$settings = this.$menu.find('.game-menu-field-item-settings');

        this.start();
    }

    start() {
        this.add_listening_events();
    }

    add_listening_events() {
        let outer = this;
        this.$single_mode.click(function(){
            outer.hide();
            outer.root.playground.show("single mode");
        });
        this.$multi_mode.click(function(){
            outer.hide();
            outer.root.playground.show("multi mode");
        });
        this.$settings.click(function(){
            outer.root.settings.logout_on_remote();
        });
    }

    show() {  // 显示menu界面
        this.$menu.show();
    }

    hide() {  // 关闭menu界面
        this.$menu.hide();
    }

}
let GAME_OBJECTS = [];

class GameObject {
    constructor() {
        GAME_OBJECTS.push(this);

        this.has_called_start = false;
        this.timedelta = 0;

        this.uuid = this.create_uuid();
    }

    create_uuid() {
        let res = "";
        for (let i = 0; i < 8; i++) {
            let x = parseInt(Math.floor(Math.random() * 10));
            res += x;
        }
        return res;
    }

    // only run in the first frame
    start() {}

    // run in each frame
    update() {}

     late_update() {
     }

    // only run after destroy
    on_destroy() {}

    // delete this object
    destroy() {
        this.on_destroy();

        for (let i = 0; i < GAME_OBJECTS.length; i++) {
            if (GAME_OBJECTS[i] === this) {
                GAME_OBJECTS.splice(i, 1);
                break;
            }
        }
    }
}

let last_timestamp;
let GAME_ANIMATION = function (timestamp) {
    for (let i = 0; i < GAME_OBJECTS.length; i++) {
        let obj = GAME_OBJECTS[i];
        if (!obj.has_called_start) {
            obj.start();
            obj.has_called_start = true;
        } else {
            obj.timedelta = timestamp - last_timestamp;
            obj.update();
        }
    }

    for (let i = 0; i < GAME_OBJECTS.length; i ++ ) {
        let obj = GAME_OBJECTS[i];
        obj.late_update();
    }

    last_timestamp = timestamp;
    
    // recursion itself to achieve render animation each frame
    requestAnimationFrame(GAME_ANIMATION);
};

// update object and render animation
requestAnimationFrame(GAME_ANIMATION);
class ScoreBoard extends GameObject {
    constructor(playground) {
        super();
        this.playground = playground;
        this.ctx = this.playground.game_map.ctx;

        this.state = null;  // win: 胜利，lose：失败

        this.win_img = new Image();
        this.win_img.src = "/static/image/playground/win.png";

        this.lose_img = new Image();
        this.lose_img.src = "/static/image/playground/lose.png";
    }

    start() {
    }

    add_listening_events() {
        let outer = this;
        let $canvas = this.playground.game_map.$canvas;

        $canvas.on('click', function() {
            outer.playground.hide();
            outer.playground.root.menu.show();
        });
    }

    win() {
        this.state = "win";

        let outer = this;
        setTimeout(function() {
            outer.add_listening_events();
        }, 1000);
    }

    lose() {
        this.state = "lose";

        let outer = this;
        setTimeout(function() {
            outer.add_listening_events();
        }, 1000);
    }

    late_update() {
        this.render();
    }

    render() {
        let len = this.playground.height / 2;
        if (this.state === "win") {
            this.ctx.drawImage(this.win_img, this.playground.width / 2 - len / 2, this.playground.height / 2 - len / 2, len, len);
        } else if (this.state === "lose") {
            this.ctx.drawImage(this.lose_img, this.playground.width / 2 - len / 2, this.playground.height / 2 - len / 2, len, len);
        }
    }
}

class ChatField {
  constructor(playground) {
    this.playground = playground;

    this.$history = $(`<div class="game-chat-field-history">hello</div>`);
    this.$input = $(`<input type="text" class="game-chat-field-input">`);

    this.$history.hide();
    this.$input.hide();

    this.func_id = null;

    this.playground.$playground.append(this.$history);
    this.playground.$playground.append(this.$input);

    this.start();
  }

  start() {
    this.add_listening_events();
  }

  add_listening_events() {
    let outer = this;

    this.$input.keydown(function (e) {
      if (e.which === 27) {
        outer.hide_input();
        return false;
      } else if (e.which === 13) {
        let username = outer.playground.root.settings.username;
        let text = outer.$input.val();
        if (text) {
          outer.$input.val("");
          outer.add_message(username, text);
          outer.playground.mps.send_message(username, text);
        }
        return false;
      }
    });
  }

  render_message(message) {
    return $(`<div>${message}</div>`);
  }

  add_message(username, text) {
    this.show_history();
    let message = `[${username}]${text}`;
    this.$history.append(this.render_message(message));
    this.$history.scrollTop(this.$history[0].scrollHeight);
  }

  show_history() {
    let outer = this;
    this.$history.fadeIn();

    if (this.func_id) clearTimeout(this.func_id);

    setTimeout(function () {
      outer.$history.fadeOut();
      outer.func_id = null;
    }, 3000);
  }

  show_input() {
    this.show_history();
    this.$input.show();
    this.$input.focus();
  }

  hide_input() {
    this.$input.hide();
    this.playground.game_map.$canvas.focus();
  }
}
class GameMap extends GameObject {
      constructor(playground) {
              super();
              this.playground = playground;
              this.$canvas = $(`<canvas tabindex=0></canvas>`);
              this.ctx = this.$canvas[0].getContext("2d");
              this.ctx.canvas.width = this.playground.width;
              this.ctx.canvas.height = this.playground.height;
              this.playground.$playground.append(this.$canvas);
            }

      start() {
              this.$canvas.focus();
            }

      resize() {
              this.ctx.canvas.width = this.playground.width;
              this.ctx.canvas.height = this.playground.height;
              this.ctx.fillStyle = "rgba(0, 0, 0, 1)";
              this.ctx.fillRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
            }

      update() {
              this.render();
            }

      render() {
              this.ctx.fillStyle = "rgba(0, 0, 0, 0.2)";
              this.ctx.fillRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
            }
}
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
class Particle extends GameObject {
  constructor(playground, x, y, radius, vx, vy, color, speed, move_length) {
    super();
    this.playground = playground;
    this.ctx = this.playground.game_map.ctx;
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.vx = vx;
    this.vy = vy;
    this.color = color;
    this.speed = speed;
    this.move_length = move_length;
    this.friction = 0.9;
    this.eps = 0.01;
  }

  start() {}

  update() {
    if (this.move_length < this.eps || this.speed < this.eps) {
      this.destroy();
      return false;
    }
    let moved = Math.min(
      this.move_length,
      (this.speed * this.timedelta) / 1000,
    );
    this.x += this.vx * moved;
    this.y += this.vy * moved;
    this.speed *= this.friction;
    this.move_length -= moved;
    this.render();
  }

  render() {
    let scale = this.playground.scale;
    this.ctx.beginPath();
    this.ctx.arc(
      this.x * scale,
      this.y * scale,
      this.radius * scale,
      0,
      Math.PI * 2,
      false,
    );
    this.ctx.fillStyle = this.color;
    this.ctx.fill();
  }
}
class Player extends GameObject {
    constructor(
        playground,
        x,
        y,
        radius,
        color,
        speed,
        character,
        username,
        photo,
    ) {
        super();
        this.playground = playground;
        this.ctx = this.playground.game_map.ctx;
        this.x = x;
        this.y = y;
        this.vx = 0;
        this.vy = 0;
        this.damage_x = 0;
        this.damage_y = 0;
        this.damage_speed = 0;
        this.move_length = 0;
        this.radius = radius;
        this.color = color;
        this.speed = speed;
        this.character = character;
        this.username = username;
        this.photo = photo;
        this.eps = 0.03;
        this.friction = 0.9;
        this.spent_time = 0;
        this.fireballs = [];

        this.cur_skill = null;

        if (this.character !== "robot") {
            this.img = new Image();
            this.img.src = this.photo;
        }

        if (this.character === "me") {
            this.fireball_coldtime = 3;
            this.fireball_img = new Image();
            this.fireball_img.src =
                "https://cdn.acwing.com/media/article/image/2021/12/02/1_9340c86053-fireball.png";

            this.blink_coldtime = 5;
            this.blink_img = new Image();
            this.blink_img.src =
                "https://cdn.acwing.com/media/article/image/2021/12/02/1_daccabdc53-blink.png";
        }
    }

    start() {
        this.playground.player_count++;
        this.playground.notice_board.write(
            "Ready players: " + this.playground.player_count,
        );

        if (this.playground.player_count >= 3) {
            this.playground.state = "fighting";
            this.playground.notice_board.write("Fighting");
        }

        if (this.character === "me") {
            this.add_listening_events();
        } else if (this.character === "robot") {
            let tx = (Math.random() * this.playground.width) / this.playground.scale;
            let ty = (Math.random() * this.playground.height) / this.playground.scale;
            this.move_to(tx, ty);
        }
    }

    add_listening_events() {
        let outer = this;
        this.playground.game_map.$canvas.on("contextmenu", function () {
            return false;
        });
        this.playground.game_map.$canvas.mousedown(function (e) {
            if (outer.playground.state !== "fighting") return true;

            const rect = outer.ctx.canvas.getBoundingClientRect();
            //console.log(rect.left);
            if (e.which === 3) {
                let tx = (e.clientX - rect.left) / outer.playground.scale;
                let ty = (e.clientY - rect.top) / outer.playground.scale;
                outer.move_to(tx, ty);
                //outer.move_to(
                //  e.clientX / outer.playground.scale,
                //  e.clientY / outer.playground.scale,
                //);
                if (outer.playground.mode === "multi mode") {
                    outer.playground.mps.send_move_to(tx, ty);
                }
            } else if (e.which === 1) {
                let tx = (e.clientX - rect.left) / outer.playground.scale;
                let ty = (e.clientY - rect.top) / outer.playground.scale;

                if (outer.cur_skill === "fireball") {
                    if (outer.fireball_coldtime > outer.eps) return false;

                    let fireball = outer.shoot_fireball(tx, ty); // for acapp
                    if (outer.playground.mode === "multi mode") {
                        outer.playground.mps.send_shoot_fireball(tx, ty, fireball.uuid);
                    }
                    //outer.shoot_fireball(
                    //  e.clientX / outer.playground.scale,
                    //  e.clientY / outer.playground.scale,
                    //);
                } else if (outer.cur_skill === "blink") {
                    if (outer.blink_coldtime > outer.eps) return false;
                    outer.blink(tx, ty);

                    if (outer.playground.mode === "multi mode") {
                        outer.playground.mps.send_blink(tx, ty);
                    }
                }
                outer.cur_skill = null;
            }
        });

        this.playground.game_map.$canvas.keydown(function (e) {
            if (e.which === 13) {
                if (outer.playground.mode === "multi mode") {
                    outer.playground.chat_field.show_input();
                    return false;
                }
            } else if (e.which === 27) {
                if (outer.playground.mode === "multi mode") {
                    outer.playground.chat_field.hide_input();
                }
            }

            if (outer.playground.state !== "fighting") return true;

            if (e.which === 81) {
                if (outer.fireball_coldtime > outer.eps) return true;

                outer.cur_skill = "fireball";
                return false;
            } else if (e.which === 70) {
                if (outer.blink_coldtime > outer.eps) return true;

                outer.cur_skill = "blink";
                return false;
            }
        });
    }

    shoot_fireball(tx, ty) {
        let x = this.x,
            y = this.y;
        let radius = 0.01;
        let angle = Math.atan2(ty - this.y, tx - this.x);
        let vx = Math.cos(angle),
            vy = Math.sin(angle);
        let color = "orange";
        let speed = 0.5;
        let move_length = 1;
        let fireball = new FireBall(
            this.playground,
            this,
            x,
            y,
            radius,
            vx,
            vy,
            color,
            speed,
            move_length,
            0.005,
        );
        this.fireballs.push(fireball);

        this.fireball_coldtime = 3;

        return fireball;
    }

    destroy_fireball(uuid) {
        for (let i = 0; i < this.fireballs.length; i++) {
            let fireball = this.fireballs[i];
            if (uuid === fireball.uuid) {
                fireball.destroy();
                break;
            }
        }
    }

    blink(tx, ty) {
        let d = this.get_dist(this.x, this.y, tx, ty);
        d = Math.min(d, 0.8);
        let angle = Math.atan2(ty - this.y, tx - this.x);
        this.x += d * Math.cos(angle);
        this.y += d * Math.sin(angle);

        this.blink_coldtime = 5;
        this.move_length = 0;
    }

    get_dist(x1, y1, x2, y2) {
        let dx = x1 - x2;
        let dy = y1 - y2;
        return Math.sqrt(dx * dx + dy * dy);
    }

    move_to(tx, ty) {
        this.move_length = this.get_dist(this.x, this.y, tx, ty);
        let angle = Math.atan2(ty - this.y, tx - this.x);
        this.vx = Math.cos(angle);
        this.vy = Math.sin(angle);
    }

    is_attacked(angle, damage) {
        for (let i = 0; i < 20 + Math.random() * 5; i++) {
            let x = this.x,
                y = this.y;
            let radius = this.radius * Math.random() * 0.1;
            let angle = Math.PI * Math.random();
            let vx = Math.cos(angle),
                vy = Math.sin(angle);
            let color = this.color;
            let speed = this.speed * 10;
            let move_length = this.radius * Math.random() * 5;
            new Particle(
                this.playground,
                x,
                y,
                radius,
                vx,
                vy,
                color,
                speed,
                move_length,
            );
        }

        this.radius -= damage;
        if (this.radius < this.eps) {
            this.destroy();
            // avoid myself die to still attack
            //this.is_me = false;
            return false;
        }
        this.damage_x = Math.cos(angle);
        this.damage_y = Math.sin(angle);
        this.damage_speed = damage * 100;
    }

    receive_attack(x, y, angle, damage, ball_uuid, attacker) {
        attacker.destroy_fireball(ball_uuid);
        this.x = x;
        this.y = y;
        this.is_attacked(angle, damage);
    }

    update() {
        this.spent_time += this.timedelta / 1000;

        this.update_win();

        if (this.character === "me" && this.playground.state === "fighting") {
            this.update_coldtime();
        }
        this.update_move();
        this.render();
    }

    update_win() {
        if (this.playground.state === "fighting" && this.character === "me" && this.playground.players.length === 1) {
            this.playground.state = "over";
            this.playground.score_board.win();
        }
    }


    update_coldtime() {
        this.fireball_coldtime -= this.timedelta / 1000;
        this.fireball_coldtime = Math.max(this.fireball_coldtime, 0);

        this.blink_coldtime -= this.timedelta / 1000;
        this.blink_coldtime = Math.max(this.blink_coldtime, 0);
    }

    update_move() {
        this.spent_time += this.timedelta / 1000;
        // AI attack
        if (
            this.character === "robot" &&
            this.spent_time > 4 &&
            Math.random() < 1 / 300.0
        ) {
            let player =
                this.playground.players[
                    Math.floor(Math.random() * this.playground.players.length)
                ];
            // attack for predict position
            let tx =
                player.x + ((player.speed * this.vx * this.timedelta) / 1000) * 0.3;
            let ty =
                player.y + ((player.speed * this.vy * this.timedelta) / 1000) * 0.3;
            this.shoot_fireball(tx, ty);
        }

        // attck back effect
        if (this.damage_speed > this.eps) {
            this.vx = this.vy = 0;
            this.move_length = 0;
            this.x += (this.damage_x * this.damage_speed * this.timedelta) / 1000;
            this.y += (this.damage_y * this.damage_speed * this.timedelta) / 1000;
            this.damage_speed *= this.friction;
        } else {
            if (this.move_length < this.eps) {
                this.move_length = 0;
                this.vx = this.vy = 0;
                // generate new move for AI
                if (this.character === "robot") {
                    let tx =
                        (Math.random() * this.playground.width) / this.playground.scale;
                    let ty =
                        (Math.random() * this.playground.height) / this.playground.scale;
                    this.move_to(tx, ty);
                }
            } else {
                let moved = Math.min(
                    this.move_length,
                    (this.speed * this.timedelta) / 1000,
                );
                this.x += this.vx * moved;
                this.y += this.vy * moved;
                this.move_length -= moved;
            }
        }
    }

    render() {
        let scale = this.playground.scale;
        if (this.character !== "robot") {
            this.ctx.save();
            this.ctx.beginPath();
            this.ctx.arc(
                this.x * scale,
                this.y * scale,
                this.radius * scale,
                0,
                Math.PI * 2,
                false,
            );
            this.ctx.stroke();
            this.ctx.clip();
            this.ctx.drawImage(
                this.img,
                (this.x - this.radius) * scale,
                (this.y - this.radius) * scale,
                this.radius * 2 * scale,
                this.radius * 2 * scale,
            );
            this.ctx.restore();
        } else {
            this.ctx.beginPath();
            this.ctx.arc(
                this.x * scale,
                this.y * scale,
                this.radius * scale,
                0,
                Math.PI * 2,
                false,
            );
            this.ctx.fillStyle = this.color;
            this.ctx.fill();
        }

        if (this.character === "me" && this.playground.state === "fighting") {
            this.render_skill_coldtime();
        }
    }

    render_skill_coldtime() {
        let scale = this.playground.scale;
        let x = 1.5,
            y = 0.9,
            r = 0.04;

        this.ctx.save();
        this.ctx.beginPath();
        this.ctx.arc(x * scale, y * scale, r * scale, 0, Math.PI * 2, false);
        this.ctx.stroke();
        this.ctx.clip();
        this.ctx.drawImage(
            this.fireball_img,
            (x - r) * scale,
            (y - r) * scale,
            r * 2 * scale,
            r * 2 * scale,
        );
        this.ctx.restore();

        if (this.fireball_coldtime > 0) {
            this.ctx.beginPath();
            this.ctx.moveTo(x * scale, y * scale);
            this.ctx.arc(
                x * scale,
                y * scale,
                r * scale,
                0 - Math.PI / 2,
                Math.PI * 2 * (1 - this.fireball_coldtime / 3) - Math.PI / 2,
                true,
            );
            this.ctx.lineTo(x * scale, y * scale);
            this.ctx.fillStyle = "rgba(0, 0, 255, 0.6)";
            this.ctx.fill();
        }

        (x = 1.62), (y = 0.9), (r = 0.04);
        this.ctx.save();
        this.ctx.beginPath();
        this.ctx.arc(x * scale, y * scale, r * scale, 0, Math.PI * 2, false);
        this.ctx.stroke();
        this.ctx.clip();
        this.ctx.drawImage(
            this.blink_img,
            (x - r) * scale,
            (y - r) * scale,
            r * 2 * scale,
            r * 2 * scale,
        );
        this.ctx.restore();

        if (this.blink_coldtime > 0) {
            this.ctx.beginPath();
            this.ctx.moveTo(x * scale, y * scale);
            this.ctx.arc(
                x * scale,
                y * scale,
                r * scale,
                0 - Math.PI / 2,
                Math.PI * 2 * (1 - this.blink_coldtime / 5) - Math.PI / 2,
                true,
            );
            this.ctx.lineTo(x * scale, y * scale);
            this.ctx.fillStyle = "rgba(0, 0, 255, 0.6)";
            this.ctx.fill();
        }
    }

    on_destroy() {
        if (this.character === "me") {
            if (this.playground.state === "fighting") {
                this.playground.state = "over";
                this.playground.score_board.lose();
            }
        }

        for (let i = 0; i < this.playground.players.length; i++) {
            if (this.playground.players[i] === this) {
                this.playground.players.splice(i, 1);
                break;
            }
        }
    }
}
class FireBall extends GameObject {
  constructor(
    playground,
    player,
    x,
    y,
    radius,
    vx,
    vy,
    color,
    speed,
    move_length,
    damage,
  ) {
    super();
    this.playground = playground;
    this.player = player;
    this.ctx = this.playground.game_map.ctx;
    this.x = x;
    this.y = y;
    this.vx = vx;
    this.vy = vy;
    this.radius = radius;
    this.color = color;
    this.speed = speed;
    this.move_length = move_length;
    this.damage = damage;
    this.eps = 0.01;
  }

  start() {}

  update() {
    if (this.move_length < this.eps) {
      this.destroy();
      return false;
    }

    this.update_move();

    if (this.player.character !== "enemy") {
      this.update_attack();
    }

    this.update_attack();

    this.render();
  }

  update_move() {
    let moved = Math.min(
      this.move_length,
      (this.speed * this.timedelta) / 1000,
    );
    this.x += this.vx * moved;
    this.y += this.vy * moved;
    this.move_length -= moved;
  }

  update_attack() {
    for (let i = 0; i < this.playground.players.length; i++) {
      let player = this.playground.players[i];
      if (this.player !== player && this.is_collision(player)) {
        this.attack(player);
        break;
      }
    }
  }

  get_dist(x1, y1, x2, y2) {
    let dx = x1 - x2;
    let dy = y1 - y2;
    return Math.sqrt(dx * dx + dy * dy);
  }

  is_collision(player) {
    let distance = this.get_dist(this.x, this.y, player.x, player.y);
    if (distance < this.radius + player.radius) {
      return true;
    }
    return false;
  }

  attack(player) {
    let angle = Math.atan2(player.y - this.y, player.x - this.x);

    player.is_attacked(angle, this.damage);

    if (this.playground.mode === "multi mode") {
      this.playground.mps.send_attack(
        player.uuid,
        player.x,
        player.y,
        angle,
        this.damage,
        this.uuid,
      );
    }

    this.destroy();
  }

  render() {
    let scale = this.playground.scale;
    this.ctx.beginPath();
    this.ctx.arc(
      this.x * scale,
      this.y * scale,
      this.radius * scale,
      0,
      Math.PI * 2,
      false,
    );
    this.ctx.fillStyle = this.color;
    this.ctx.fill();
  }

  on_destroy() {
    let fireballs = this.player.fireballs;
    for (let i = 0; i < fireballs.length; i++) {
      if (fireballs[i] === this) {
        fireballs.splice(i, 1);
        break;
      }
    }
  }
}
class GamePlayground {
    constructor(root) {
        this.root = root;
        this.$playground = $(`<div class="game-playground"></div>`);

        this.hide();
        this.root.$game.append(this.$playground);

        this.start();
    }

    get_random_color() {
        let colors = ["blue", "red", "green", "yellow", "pink", "purple"];
        return colors[Math.floor(Math.random() * 6)];
    }

    create_uuid() {
        let res = "";
        for (let i = 0; i < 8; i ++ ) {
            let x = parseInt(Math.floor(Math.random() * 10));  // 返回[0, 1)之间的数
            res += x;
        }
        return res;
    }


    start() {
        let outer = this;
        let uuid = this.create_uuid();
        $(window).on(`resize.${uuid}`, function () {
            outer.resize();
        });
    }

    resize() {
        this.width = this.$playground.width();
        this.height = this.$playground.height();
        let unit = Math.min(this.width / 16, this.height / 9);
        this.width = unit * 16;
        this.height = unit * 9;
        this.scale = this.height;
        if (this.game_map) this.game_map.resize();
    }

    show(mode) {
        let outer = this;
        this.$playground.show();

        this.width = this.$playground.width();
        this.height = this.$playground.height();
        this.game_map = new GameMap(this);

        this.mode = mode;
        this.state = "waiting"; // waiting -> fighting -> end
        this.notice_board = new NoticeBoard(this);
        this.score_board = new ScoreBoard(this);
        this.player_count = 0;

        this.resize();

        this.players = [];
        this.players.push(
            new Player(
                this,
                this.width / 2 / this.scale, // x coordinate
                0.5, // y coordinate
                0.05, // radius
                "white", // color
                0.2, // speed
                "me", // is_me
                this.root.settings.username,
                this.root.settings.photo,
            ),
        );

        if (mode === "single mode") {
            // add enemy
            for (let i = 0; i < 5; i++) {
                this.players.push(
                    new Player(
                        this,
                        this.width / 2 / this.scale,
                        0.5,
                        0.05,
                        this.get_random_color(),
                        0.2,
                        "robot",
                    ),
                );
            }
        } else if (mode === "multi mode") {
            this.chat_field = new ChatField(this);
            this.mps = new MultiPlayerSocket(this);
            this.mps.uuid = this.players[0].uuid;

            this.mps.ws.onopen = function () {
                outer.mps.send_create_player(
                    outer.root.settings.username,
                    outer.root.settings.photo,
                );
            };
        }
    }

    hide() {
        //this.$playground.hide();
        while (this.players && this.players.length > 0) {
            this.players[0].destroy();
        }

        if (this.game_map) {
            this.game_map.destroy();
            this.game_map = null;
        }

        if (this.notice_board) {
            this.notice_board.destroy();
            this.notice_board = null;
        }

        if (this.score_board) {
            this.score_board.destroy();
            this.score_board = null;
        }

        this.$playground.empty();

        this.$playground.hide();
    }

}
class Settings {
    constructor(root) {
        this.root = root;
        this.platform = "WEB";
        this.username = "";
        this.photo = "";

        this.$settings = $(`
<div class="game-settings">
    <div class="game-settings-login">
        <div class="game-settings-title">
            Shooter
        </div>
        <div class="game-settings-username">
            <div class="game-settings-item">
                <input type="text" placeholder="Username">
            </div>
        </div>
        <div class="game-settings-password">
            <div class="game-settings-item">
                <input type="password" placeholder="Password">
            </div>
        </div>
        <div class="game-settings-submit">
            <div class="game-settings-item">
                <button>Log In</button>
            </div>
        </div>
        <div id="error-message" class="game-settings-error-message">
        </div>
        <div class="game-settings-option">
            Sign Up
        </div>
        <br>
    </div>
    <div class="game-settings-register">
        <div class="game-settings-title">
            Shooter
        </div>
        <div class="game-settings-username">
            <div class="game-settings-item">
                <input type="text" placeholder="Username">
            </div>
        </div>
        <div class="game-settings-password game-settings-password-first">
            <div class="game-settings-item">
                <input type="password" placeholder="Password">
            </div>
        </div>
        <div class="game-settings-password game-settings-password-second">
            <div class="game-settings-item">
                <input type="password" placeholder="Password confirm">
            </div>
        </div>
        <div class="game-settings-submit">
            <div class="game-settings-item">
                <button>Sign Up</button>
            </div>
        </div>
        <div id="error-message" class="game-settings-error-message">
        </div>
        <div class="game-settings-option">
            Log In
        </div>
        <br>
    </div>
</div>
`);
        this.$login = this.$settings.find(".game-settings-login");
        this.$login_username = this.$login.find(".game-settings-username input");
        this.$login_password = this.$login.find(".game-settings-password input");
        // login button
        this.$login_submit = this.$login.find(".game-settings-submit button");
        this.$login_error_message = this.$login.find("#error-message");
        this.$login_register = this.$login.find(".game-settings-option");

        this.$login.hide();

        this.$register = this.$settings.find(".game-settings-register");
        this.$register_username = this.$register.find(".game-settings-username input");
        this.$register_password = this.$register.find(".game-settings-password-first input");
        this.$register_password_confirm = this.$register.find(".game-settings-password-second input");
        // register button
        this.$register_submit = this.$register.find(".game-settings-submit button");
        this.$register_error_message = this.$register.find("#error-message");
        this.$register_login = this.$register.find(".game-settings-option");

        this.$register.hide();

        //this.$github_login = this.$settings.find('.game-settings-github img');

        this.root.$game.append(this.$settings);

        this.start();
    }

    start() {
            //if (this.root.access) {
            //    this.getinfo_web();
            //    this.refresh_jwt_token();
            //} else {
            //    this.login();
            //}
            this.getinfo_web();
            this.add_listening_events();
    }

    add_listening_events() {
        let outer = this;
        this.add_listening_events_login();
        this.add_listening_events_register();

        //this.$github_login.click(function() {
        //    outer.github_login();
        //});
    }

    add_listening_events_login() {
        let outer = this;

        this.$login_register.click(function() {
            outer.register();
        });
        this.$login_submit.click(function() {
            outer.login_on_remote();
        });
    }

    add_listening_events_register() {
        let outer = this;
        this.$register_login.click(function() {
            outer.login();
        });
        this.$register_submit.click(function() {
            outer.register_on_remote();
        });
    }


    login_on_remote(username, password) {
        username = username || this.$login_username.val();
        password = password || this.$login_password.val();

        let outer = this;
        $.ajax({
            url: "https://hangzhang.site/settings/login/",
            type: "GET",
            data: {
                username: username,
                password: password,
            },
            success: resp => {
                //console.log(resp);
                if (resp.result === "success") {
                    //this.root.access = resp.access;
                    //this.root.refresh = resp.refresh;
                    //this.refresh_jwt_token();
                    this.getinfo_web();
                    //location.reload();
                }
                else {
                    outer.$login_error_message.html(resp.result);
                    outer.$login_error_message.addClass('visible').css('visibility', 'visible');
                    setTimeout(() => {
                        outer.$login_error_message.removeClass('visible').css('visibility', 'hidden');
                    }, 3000);
                }
            },
            //error: () => {
            //    outer.$login_error_message.html(resp.result);
            //}
        });
    }

    register_on_remote() {
        let outer = this;

        let username = this.$register_username.val();
        let password = this.$register_password.val();
        let password_confirm = this.$register_password_confirm.val();

        $.ajax({
            url: "https://hangzhang.site/settings/register/",
            type: "GET",
            data: {
                username: username,
                password: password,
                password_confirm: password_confirm,
            },
            success: function (resp) {
                if (resp.result === "success") {
                location.reload();
                } else {
                    outer.$register_error_message.html(resp.result);
                    outer.$register_error_message.addClass('visible').css('visibility', 'visible');
                    setTimeout(() => {
                        outer.$register_error_message.removeClass('visible').css('visibility', 'hidden');
                    }, 3000);
                }
            },
        });
    }

    logout_on_remote() {
            //this.root.access = "";
            //this.root.refresh = "";
            //location.href = "/";
            $.ajax({
                url: "https://hangzhang.site/settings/logout/",
                type: "GET",
                success: function (resp) {
                    if (resp.result === "success") {
                        location.reload();
                    }
                },
            });
    }

    register() {  // 打开注册界面
        this.$login.hide();
        this.$register.show();
    }

    login() {  // 打开登录界面
        this.$register.hide();
        this.$login.show();
    }

    getinfo_web() {
        let outer = this;
        $.ajax({
            url: "https://hangzhang.site/settings/getinfo/",
            type: "get",
            data: {
                platform: this.platform,
            },
            //headers: {
            //    'Authorization': "Bearer " + this.root.access,
           //},
            success: resp => {
                if (resp.result === "success") {
                    //console.log(resp);
                    outer.username = resp.username;
                    outer.photo = resp.photo;
                    outer.hide();
                    outer.root.menu.show();
                } else {
                    //console.log(resp);
                    outer.login();
                }
            }
        });
    }

    hide() {
        this.$settings.hide();
    }

    show() {
        this.$settings.show();
    }
}

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

