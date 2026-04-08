// Character selection screen — both players pick a character
const CharacterSelectScene = {
    characters: ['Slang', 'Donkie Konk'],
    p1Selection: 0,
    p2Selection: 1,
    p1Confirmed: false,
    p2Confirmed: false,
    timer: 0,

    init() {
        this.p1Selection = 0;
        this.p2Selection = 1;
        this.p1Confirmed = false;
        this.p2Confirmed = false;
        this.timer = 0;
    },

    update() {
        this.timer++;
        const menu = InputSystem.getMenuInput();

        if (!this.p1Confirmed) {
            if (menu.p1.left) this.p1Selection = (this.p1Selection + this.characters.length - 1) % this.characters.length;
            if (menu.p1.right) this.p1Selection = (this.p1Selection + 1) % this.characters.length;
            if (menu.p1.confirm) this.p1Confirmed = true;
        }

        if (!this.p2Confirmed) {
            if (menu.p2.left) this.p2Selection = (this.p2Selection + this.characters.length - 1) % this.characters.length;
            if (menu.p2.right) this.p2Selection = (this.p2Selection + 1) % this.characters.length;
            if (menu.p2.confirm) this.p2Confirmed = true;
        }

        if (this.p1Confirmed && this.p2Confirmed) {
            Game.p1Character = this.characters[this.p1Selection];
            Game.p2Character = this.characters[this.p2Selection];
            return 'houseSelect';
        }

        return null;
    },

    draw(ctx) {
        ctx.fillStyle = '#1a1a2e';
        ctx.fillRect(0, 0, 800, 500);

        ctx.fillStyle = '#fff';
        ctx.font = 'bold 36px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('KIES JE CHARACTER!', 400, 50);

        ctx.font = '20px Arial';
        ctx.fillStyle = '#3498db';
        ctx.fillText('Speler 1 (WASD + Spatie)', 200, 85);
        ctx.fillStyle = '#e74c3c';
        ctx.fillText('Speler 2 (Pijltjes + Enter)', 600, 85);

        this.drawCard(ctx, 100, 110, this.p1Selection, this.p1Confirmed, '#3498db');
        this.drawCard(ctx, 500, 110, this.p2Selection, this.p2Confirmed, '#e74c3c');

        if (!this.p1Confirmed) {
            ctx.fillStyle = '#3498db';
            ctx.font = '24px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('◀  A / D  ▶', 200, 420);
            ctx.font = '16px Arial';
            ctx.fillText('Spatie om te kiezen', 200, 450);
        } else {
            ctx.fillStyle = '#2ecc71';
            ctx.font = 'bold 22px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('✓ KLAAR!', 200, 435);
        }

        if (!this.p2Confirmed) {
            ctx.fillStyle = '#e74c3c';
            ctx.font = '24px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('◀  ← / →  ▶', 600, 420);
            ctx.font = '16px Arial';
            ctx.fillText('Enter om te kiezen', 600, 450);
        } else {
            ctx.fillStyle = '#2ecc71';
            ctx.font = 'bold 22px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('✓ KLAAR!', 600, 435);
        }
    },

    drawCard(ctx, x, y, selection, confirmed, color) {
        const cardW = 200;
        const cardH = 280;

        ctx.fillStyle = confirmed ? 'rgba(46, 204, 113, 0.2)' : 'rgba(255,255,255,0.1)';
        ctx.strokeStyle = confirmed ? '#2ecc71' : color;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.roundRect(x, y, cardW, cardH, 10);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#fff';
        ctx.font = 'bold 24px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(this.characters[selection], x + cardW / 2, y + 35);

        ctx.save();
        ctx.translate(x + cardW / 2, y + 170);
        if (this.characters[selection] === 'Slang') {
            this.drawSlangPreview(ctx);
        } else {
            this.drawDonkieKonkPreview(ctx);
        }
        ctx.restore();
    },

    drawSlangPreview(ctx) {
        const wiggle = Math.sin(this.timer * 0.08) * 3;
        const breathe = Math.sin(this.timer * 0.05) * 2;

        // Outer coil
        ctx.strokeStyle = '#6abf3a';
        ctx.lineWidth = 14;
        ctx.lineCap = 'round';
        ctx.beginPath();
        for (let a = 0.3; a < Math.PI * 1.8; a += 0.1) {
            const r = 22 + breathe + a * 3;
            const px = Math.cos(a) * r;
            const py = 8 + Math.sin(a) * r + wiggle;
            if (a < 0.4) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
        }
        ctx.stroke();

        // Inner coil
        ctx.lineWidth = 11;
        ctx.strokeStyle = '#7dd44a';
        ctx.beginPath();
        ctx.arc(0, 8 + wiggle, 14 + breathe * 0.5, 0.5, Math.PI * 1.5);
        ctx.stroke();

        // Green spots
        ctx.fillStyle = '#4a9e20';
        [[-15, -5], [10, 0], [-5, 18], [18, 12], [-18, 10]].forEach(([sx, sy]) => {
            ctx.beginPath();
            ctx.arc(sx, sy + wiggle, 4, 0, Math.PI * 2);
            ctx.fill();
        });

        // Head
        ctx.fillStyle = '#6abf3a';
        ctx.beginPath();
        ctx.ellipse(30, -20 + wiggle, 16, 13, 0.2, 0, Math.PI * 2);
        ctx.fill();

        // Neck
        ctx.strokeStyle = '#6abf3a';
        ctx.lineWidth = 12;
        ctx.beginPath();
        ctx.moveTo(14, 0 + wiggle);
        ctx.quadraticCurveTo(20, -12 + wiggle, 30, -20 + wiggle);
        ctx.stroke();

        // Eyes
        ctx.fillStyle = '#222';
        ctx.beginPath();
        ctx.arc(34, -25 + wiggle, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(42, -24 + wiggle, 3.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.arc(35, -26 + wiggle, 1.5, 0, Math.PI * 2);
        ctx.fill();

        // Tongue
        const tongueLen = 14 + Math.sin(this.timer * 0.15) * 5;
        ctx.strokeStyle = '#e23030';
        ctx.lineWidth = 3;
        ctx.lineCap = 'round';
        const tx = 44, ty = -17 + wiggle;
        ctx.beginPath();
        ctx.moveTo(tx, ty);
        ctx.lineTo(tx + tongueLen, ty);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(tx + tongueLen - 3, ty);
        ctx.lineTo(tx + tongueLen + 6, ty - 7);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(tx + tongueLen - 3, ty);
        ctx.lineTo(tx + tongueLen + 6, ty + 7);
        ctx.stroke();
        ctx.fillStyle = '#e23030';
        ctx.beginPath();
        ctx.moveTo(tx + tongueLen - 3, ty);
        ctx.lineTo(tx + tongueLen + 6, ty - 7);
        ctx.lineTo(tx + tongueLen + 6, ty + 7);
        ctx.closePath();
        ctx.fill();
    },

    drawDonkieKonkPreview(ctx) {
        const bounce = Math.sin(this.timer * 0.06) * 4;

        // Legs
        ctx.strokeStyle = '#b8932a';
        ctx.lineWidth = 14;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(-12, 18 + bounce);
        ctx.lineTo(-14, 52 + bounce);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(12, 18 + bounce);
        ctx.lineTo(14, 52 + bounce);
        ctx.stroke();
        ctx.fillStyle = '#8a6d1e';
        ctx.beginPath();
        ctx.ellipse(-14, 55 + bounce, 10, 5, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(14, 55 + bounce, 10, 5, 0, 0, Math.PI * 2);
        ctx.fill();

        // Body
        ctx.fillStyle = '#b8932a';
        ctx.beginPath();
        ctx.ellipse(0, -2 + bounce, 24, 28, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#d4a83a';
        ctx.lineWidth = 3;
        for (let i = -14; i < 14; i += 7) {
            ctx.beginPath();
            ctx.moveTo(i - 1, -22 + bounce);
            ctx.lineTo(i + 1, 18 + bounce);
            ctx.stroke();
        }
        ctx.fillStyle = '#f0c8a0';
        ctx.beginPath();
        ctx.ellipse(0, 2 + bounce, 14, 17, 0, 0, Math.PI * 2);
        ctx.fill();

        // Arms
        ctx.strokeStyle = '#b8932a';
        ctx.lineWidth = 12;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(-22, -8 + bounce);
        ctx.lineTo(-28, 10 + bounce);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(22, -8 + bounce);
        ctx.lineTo(28, 10 + bounce);
        ctx.stroke();
        ctx.fillStyle = '#d4a83a';
        ctx.beginPath();
        ctx.arc(-28, 14 + bounce, 8, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(28, 14 + bounce, 8, 0, Math.PI * 2);
        ctx.fill();

        // Head
        ctx.fillStyle = '#b8932a';
        ctx.beginPath();
        ctx.arc(0, -34 + bounce, 22, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#f0c8a0';
        ctx.beginPath();
        ctx.ellipse(4, -32 + bounce, 14, 12, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#b8932a';
        ctx.beginPath();
        ctx.arc(-20, -36 + bounce, 9, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(20, -36 + bounce, 9, 0, Math.PI * 2);
        ctx.fill();
        // Eyes
        ctx.fillStyle = '#2244aa';
        ctx.beginPath();
        ctx.arc(-5, -38 + bounce, 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(9, -37 + bounce, 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#111';
        ctx.beginPath();
        ctx.arc(-3, -38 + bounce, 2.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(11, -37 + bounce, 2.5, 0, Math.PI * 2);
        ctx.fill();
        // Color dots
        ctx.fillStyle = '#e74c3c';
        ctx.beginPath();
        ctx.arc(16, -30 + bounce, 2.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#3498db';
        ctx.beginPath();
        ctx.arc(-10, -28 + bounce, 2, 0, Math.PI * 2);
        ctx.fill();
        // Smile
        ctx.strokeStyle = '#5a3a10';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(5, -28 + bounce, 5, 0.2, Math.PI - 0.2);
        ctx.stroke();
    }
};
