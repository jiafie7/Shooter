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
