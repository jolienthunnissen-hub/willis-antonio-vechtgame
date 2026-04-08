// Victory screen — shows the winner and replay option
const VictoryScene = {
    timer: 0,
    confetti: [],

    init() {
        this.timer = 0;
        // Generate confetti
        this.confetti = [];
        for (let i = 0; i < 60; i++) {
            this.confetti.push({
                x: Math.random() * 800,
                y: Math.random() * -500,
                vx: (Math.random() - 0.5) * 3,
                vy: Math.random() * 3 + 1,
                size: Math.random() * 8 + 4,
                color: ['#e74c3c', '#3498db', '#2ecc71', '#f1c40f', '#9b59b6', '#e67e22'][Math.floor(Math.random() * 6)],
                rotation: Math.random() * Math.PI * 2,
                rotSpeed: (Math.random() - 0.5) * 0.2
            });
        }
    },

    update() {
        this.timer++;

        // Update confetti
        this.confetti.forEach(c => {
            c.x += c.vx;
            c.y += c.vy;
            c.rotation += c.rotSpeed;
            if (c.y > 520) {
                c.y = -10;
                c.x = Math.random() * 800;
            }
        });

        // Check for restart
        const menu = InputSystem.getMenuInput();
        if (this.timer > 60 && (menu.p1.confirm || menu.p2.confirm)) {
            return 'characterSelect';
        }

        return null;
    },

    draw(ctx) {
        // Dark background
        ctx.fillStyle = '#1a1a2e';
        ctx.fillRect(0, 0, 800, 500);

        // Confetti
        this.confetti.forEach(c => {
            ctx.save();
            ctx.translate(c.x, c.y);
            ctx.rotate(c.rotation);
            ctx.fillStyle = c.color;
            ctx.fillRect(-c.size / 2, -c.size / 4, c.size, c.size / 2);
            ctx.restore();
        });

        // Winner announcement
        const winnerNum = Game.winner;
        const winnerChar = winnerNum === 1 ? Game.p1Character : Game.p2Character;
        const color = winnerNum === 1 ? '#3498db' : '#e74c3c';

        // Glow
        const glowPulse = 0.3 + Math.sin(this.timer * 0.05) * 0.2;
        ctx.shadowColor = color;
        ctx.shadowBlur = 30 * glowPulse;

        // Trophy
        ctx.fillStyle = '#f1c40f';
        ctx.font = '80px Arial';
        ctx.textAlign = 'center';
        const trophyBounce = Math.sin(this.timer * 0.06) * 10;
        ctx.fillText('🏆', 400, 120 + trophyBounce);

        ctx.shadowBlur = 0;

        // Winner text
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 48px Arial';
        ctx.fillText(`SPELER ${winnerNum} WINT!`, 400, 200);

        ctx.fillStyle = color;
        ctx.font = 'bold 36px Arial';
        ctx.fillText(winnerChar, 400, 250);

        // Draw winner character
        ctx.save();
        ctx.translate(400, 360);
        ctx.scale(2, 2);
        if (winnerChar === 'Slang') {
            this.drawSlangCelebration(ctx);
        } else {
            this.drawDonkieKonkCelebration(ctx);
        }
        ctx.restore();

        // Replay prompt
        if (this.timer > 60 && Math.floor(this.timer / 30) % 2 === 0) {
            ctx.fillStyle = '#fff';
            ctx.font = '22px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('Druk op SPATIE of ENTER om opnieuw te spelen!', 400, 470);
        }
    },

    drawSlangCelebration(ctx) {
        const t = this.timer;
        ctx.fillStyle = '#2ecc40';
        for (let i = 0; i < 5; i++) {
            const wiggle = Math.sin(t * 0.1 + i) * 4;
            ctx.beginPath();
            ctx.ellipse(-25 + i * 14, wiggle, 10, 8, 0, 0, Math.PI * 2);
            ctx.fill();
        }
        // Happy eye
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.arc(38, -6, 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#111';
        ctx.beginPath();
        ctx.arc(40, -6, 2.5, 0, Math.PI * 2);
        ctx.fill();
        // Celebratory tongue
        ctx.strokeStyle = '#e74c3c';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(45, 0);
        ctx.lineTo(55 + Math.sin(t * 0.2) * 5, -3);
        ctx.stroke();
    },

    drawDonkieKonkCelebration(ctx) {
        const t = this.timer;
        const bounce = Math.abs(Math.sin(t * 0.08)) * 5;
        // Body
        ctx.fillStyle = '#8B4513';
        ctx.beginPath();
        ctx.roundRect(-12, -8 - bounce, 24, 32, 5);
        ctx.fill();
        // Belly
        ctx.fillStyle = '#DEB887';
        ctx.beginPath();
        ctx.ellipse(0, 5 - bounce, 7, 10, 0, 0, Math.PI * 2);
        ctx.fill();
        // Head
        ctx.fillStyle = '#8B4513';
        ctx.beginPath();
        ctx.arc(0, -18 - bounce, 12, 0, Math.PI * 2);
        ctx.fill();
        // Face
        ctx.fillStyle = '#DEB887';
        ctx.beginPath();
        ctx.ellipse(3, -16 - bounce, 8, 7, 0, 0, Math.PI * 2);
        ctx.fill();
        // Happy eyes (closed arcs)
        ctx.strokeStyle = '#111';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(-3, -20 - bounce, 3, Math.PI, 0);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(5, -20 - bounce, 3, Math.PI, 0);
        ctx.stroke();
        // Big smile
        ctx.beginPath();
        ctx.arc(3, -14 - bounce, 4, 0, Math.PI);
        ctx.stroke();
        // Arms up!
        ctx.fillStyle = '#8B4513';
        const armWave = Math.sin(t * 0.15) * 15;
        ctx.save();
        ctx.translate(-14, -5 - bounce);
        ctx.rotate(-1.2 + Math.sin(t * 0.12) * 0.3);
        ctx.fillRect(-3, -15, 6, 18);
        ctx.restore();
        ctx.save();
        ctx.translate(14, -5 - bounce);
        ctx.rotate(1.2 + Math.sin(t * 0.12 + 1) * 0.3);
        ctx.fillRect(-3, -15, 6, 18);
        ctx.restore();
    }
};
