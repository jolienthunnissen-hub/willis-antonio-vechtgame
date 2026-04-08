// Title screen / main menu
const MenuScene = {
    timer: 0,

    init() {
        this.timer = 0;
    },

    update() {
        this.timer++;
        const menu = InputSystem.getMenuInput();
        if (menu.p1.confirm || menu.p2.confirm) {
            return 'characterSelect';
        }
        return null;
    },

    draw(ctx) {
        // Sky background
        const grad = ctx.createLinearGradient(0, 0, 0, 500);
        grad.addColorStop(0, '#87CEEB');
        grad.addColorStop(1, '#e0f0ff');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, 800, 500);

        // Ground
        ctx.fillStyle = '#666';
        ctx.fillRect(0, 400, 800, 100);
        ctx.fillStyle = '#555';
        ctx.fillRect(0, 400, 800, 4);

        // Houses in background
        this.drawHouse(ctx, 100, 250, '#e74c3c', '#c0392b');
        this.drawHouse(ctx, 550, 250, '#3498db', '#2980b9');

        // Title
        const bounce = Math.sin(this.timer * 0.05) * 8;
        ctx.save();
        ctx.translate(400, 120 + bounce);

        ctx.fillStyle = '#2c3e50';
        ctx.font = 'bold 56px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        // Shadow
        ctx.fillStyle = 'rgba(0,0,0,0.3)';
        ctx.fillText('VECHTGAME!', 3, 3);
        // Main text
        ctx.fillStyle = '#e74c3c';
        ctx.fillText('VECHTGAME!', 0, 0);

        ctx.restore();

        // Subtitle
        ctx.fillStyle = '#2c3e50';
        ctx.font = '20px Arial';
        ctx.textAlign = 'center';
        ctx.fillText("Willis & Antonio's", 400, 175);

        // Draw small characters
        this.drawMiniSlang(ctx, 250, 350);
        this.drawMiniDonkieKonk(ctx, 520, 320);

        // "VS" text
        ctx.fillStyle = '#e74c3c';
        ctx.font = 'bold 48px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('VS', 400, 350);

        // Start prompt
        if (Math.floor(this.timer / 30) % 2 === 0) {
            ctx.fillStyle = '#2c3e50';
            ctx.font = '22px Arial';
            ctx.fillText('Druk op SPATIE of ENTER om te beginnen!', 400, 460);
        }
    },

    drawHouse(ctx, x, y, color, darkColor) {
        // Pink marker outlined house like Antonio's drawing
        ctx.strokeStyle = '#c23078';
        ctx.lineWidth = 3;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        // Building outline
        ctx.beginPath();
        ctx.moveTo(x, y + 150);
        ctx.lineTo(x + 2, y + 3);
        ctx.quadraticCurveTo(x + 60, y - 40, x + 118, y + 3);
        ctx.lineTo(x + 120, y + 150);
        ctx.stroke();

        // Door — arched
        ctx.beginPath();
        ctx.moveTo(x + 42, y + 150);
        ctx.lineTo(x + 42, y + 85);
        ctx.quadraticCurveTo(x + 60, y + 65, x + 78, y + 85);
        ctx.lineTo(x + 78, y + 150);
        ctx.stroke();

        // Door handle
        ctx.beginPath();
        ctx.arc(x + 72, y + 120, 3, 0, Math.PI * 2);
        ctx.stroke();

        // Windows
        ctx.strokeRect(x + 12, y + 30, 22, 25);
        ctx.strokeRect(x + 86, y + 30, 22, 25);
    },

    drawMiniSlang(ctx, x, y) {
        // Coiled snake like Willis' drawing
        const wiggle = Math.sin(this.timer * 0.1) * 2;
        ctx.strokeStyle = '#6abf3a';
        ctx.lineWidth = 10;
        ctx.lineCap = 'round';
        // Coil
        ctx.beginPath();
        ctx.arc(x, y + wiggle, 20, 0.3, Math.PI * 1.7);
        ctx.stroke();
        ctx.lineWidth = 7;
        ctx.beginPath();
        ctx.arc(x, y + wiggle, 10, 0.8, Math.PI * 1.4);
        ctx.stroke();
        // Head
        ctx.fillStyle = '#6abf3a';
        ctx.beginPath();
        ctx.ellipse(x + 22, y - 12 + wiggle, 10, 8, 0.2, 0, Math.PI * 2);
        ctx.fill();
        // Eye
        ctx.fillStyle = '#222';
        ctx.beginPath();
        ctx.arc(x + 27, y - 15 + wiggle, 2.5, 0, Math.PI * 2);
        ctx.fill();
        // Tongue
        ctx.strokeStyle = '#e23030';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(x + 32, y - 11 + wiggle);
        ctx.lineTo(x + 42, y - 13 + wiggle);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(x + 40, y - 13 + wiggle);
        ctx.lineTo(x + 45, y - 17 + wiggle);
        ctx.moveTo(x + 40, y - 13 + wiggle);
        ctx.lineTo(x + 45, y - 9 + wiggle);
        ctx.stroke();
    },

    drawMiniDonkieKonk(ctx, x, y) {
        const bounce = Math.sin(this.timer * 0.08) * 3;
        // Body — golden brown like the drawing
        ctx.fillStyle = '#b8932a';
        ctx.beginPath();
        ctx.ellipse(x, y + 10 + bounce, 14, 20, 0, 0, Math.PI * 2);
        ctx.fill();
        // Belly
        ctx.fillStyle = '#f0c8a0';
        ctx.beginPath();
        ctx.ellipse(x, y + 12 + bounce, 8, 11, 0, 0, Math.PI * 2);
        ctx.fill();
        // Head
        ctx.fillStyle = '#b8932a';
        ctx.beginPath();
        ctx.arc(x, y - 14 + bounce, 14, 0, Math.PI * 2);
        ctx.fill();
        // Face
        ctx.fillStyle = '#f0c8a0';
        ctx.beginPath();
        ctx.ellipse(x + 2, y - 13 + bounce, 9, 8, 0, 0, Math.PI * 2);
        ctx.fill();
        // Eyes
        ctx.fillStyle = '#2244aa';
        ctx.beginPath();
        ctx.arc(x - 3, y - 17 + bounce, 3, 0, Math.PI * 2);
        ctx.arc(x + 6, y - 16 + bounce, 3, 0, Math.PI * 2);
        ctx.fill();
        // Ears
        ctx.fillStyle = '#b8932a';
        ctx.beginPath();
        ctx.arc(x - 13, y - 16 + bounce, 5, 0, Math.PI * 2);
        ctx.arc(x + 13, y - 16 + bounce, 5, 0, Math.PI * 2);
        ctx.fill();
        // Arms
        ctx.strokeStyle = '#b8932a';
        ctx.lineWidth = 6;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(x - 14, y + 2 + bounce);
        ctx.lineTo(x - 20, y + 18 + bounce);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(x + 14, y + 2 + bounce);
        ctx.lineTo(x + 20, y + 18 + bounce);
        ctx.stroke();
    }
};
