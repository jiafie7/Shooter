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

