// Keyboard input handler for both players
const InputSystem = {
    keys: {},
    justPressed: {},
    previousKeys: {},

    init() {
        window.addEventListener('keydown', (e) => {
            this.keys[e.key] = true;
            e.preventDefault();
        });
        window.addEventListener('keyup', (e) => {
            this.keys[e.key] = false;
            e.preventDefault();
        });
    },

    update() {
        // Track which keys were just pressed this frame
        for (const key in this.keys) {
            this.justPressed[key] = this.keys[key] && !this.previousKeys[key];
        }
        this.previousKeys = { ...this.keys };
    },

    isDown(key) {
        return !!this.keys[key];
    },

    wasJustPressed(key) {
        return !!this.justPressed[key];
    },

    // Player 1: WASD + Space
    getPlayer1() {
        return {
            left: this.isDown('a') || this.isDown('A'),
            right: this.isDown('d') || this.isDown('D'),
            jump: this.wasJustPressed('w') || this.wasJustPressed('W'),
            attack: this.wasJustPressed(' ')
        };
    },

    // Player 2: Arrow keys + Enter
    getPlayer2() {
        return {
            left: this.isDown('ArrowLeft'),
            right: this.isDown('ArrowRight'),
            jump: this.wasJustPressed('ArrowUp'),
            attack: this.wasJustPressed('Enter')
        };
    },

    // For menu navigation - returns {p1, p2} with left/right/confirm just-pressed
    getMenuInput() {
        return {
            p1: {
                left: this.wasJustPressed('a') || this.wasJustPressed('A'),
                right: this.wasJustPressed('d') || this.wasJustPressed('D'),
                confirm: this.wasJustPressed(' ') || this.wasJustPressed('w') || this.wasJustPressed('W')
            },
            p2: {
                left: this.wasJustPressed('ArrowLeft'),
                right: this.wasJustPressed('ArrowRight'),
                confirm: this.wasJustPressed('Enter') || this.wasJustPressed('ArrowUp')
            }
        };
    }
};
