// Main game object and loop
const Game = {
    canvas: null,
    ctx: null,
    currentScene: null,
    p1Character: null,
    p2Character: null,
    p1Surprise: null,
    p2Surprise: null,
    winner: null,
    mode: 'local', // local | online-host | online-client
    localMode: 'versus', // versus | single
    aiDifficulty: 'easy', // easy | normal | hard

    scenes: {
        menu: MenuScene,
        characterSelect: CharacterSelectScene,
        houseSelect: HouseSelectScene,
        fight: FightScene,
        victory: VictoryScene
    },

    init() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');

        InputSystem.init();
        this.resetMatchConfig();
        this.switchScene('menu');

        this.loop();
    },

    switchScene(name) {
        this.currentScene = this.scenes[name];
        if (this.currentScene.init) {
            this.currentScene.init();
        }
    },

    loop() {
        // Update input
        InputSystem.update();

        // Update current scene
        const nextScene = this.currentScene.update();
        if (nextScene) {
            this.switchScene(nextScene);
        }

        // Clear and draw
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.currentScene.draw(this.ctx);

        requestAnimationFrame(() => this.loop());
    },

    resetMatchConfig() {
        this.p1Character = 'Slang';
        this.p2Character = 'Donkie Konk';
        this.p1Surprise = null;
        this.p2Surprise = null;
        this.winner = null;
        this.localMode = 'versus';
        this.aiDifficulty = 'normal';
    }
};

// Start the game when the page loads
window.addEventListener('load', () => {
    Game.init();
});
