// House selection scene — both players choose a surprise house
const HouseSelectScene = {
    p1Selection: 0, // 0 = left house, 1 = right house
    p2Selection: 1,
    p1Confirmed: false,
    p2Confirmed: false,
    p1Surprise: null,
    p2Surprise: null,
    phase: 'choosing', // choosing, revealing, done
    revealTimer: 0,
    timer: 0,
    remoteMenuInput: { left: false, right: false, confirm: false },

    init() {
        this.p1Selection = 0;
        this.p2Selection = 1;
        this.p1Confirmed = false;
        this.p2Confirmed = false;
        this.p1Surprise = null;
        this.p2Surprise = null;
        this.phase = 'choosing';
        this.revealTimer = 0;
        this.timer = 0;
        this.remoteMenuInput = { left: false, right: false, confirm: false };

        if (Game.mode === 'online-host') {
            NetworkSystem.onMessage = (message) => {
                if (message.type === 'menu-input') {
                    this.remoteMenuInput = { ...this.remoteMenuInput, ...(message.payload || {}) };
                }
            };
        } else if (Game.mode === 'online-client') {
            NetworkSystem.onMessage = (message) => {
                if (message.type === 'house-select-state') {
                    const payload = message.payload || {};
                    this.p1Selection = payload.p1Selection ?? this.p1Selection;
                    this.p2Selection = payload.p2Selection ?? this.p2Selection;
                    this.p1Confirmed = !!payload.p1Confirmed;
                    this.p2Confirmed = !!payload.p2Confirmed;
                    this.p1Surprise = payload.p1Surprise ?? this.p1Surprise;
                    this.p2Surprise = payload.p2Surprise ?? this.p2Surprise;
                    this.phase = payload.phase || this.phase;
                    this.revealTimer = payload.revealTimer ?? this.revealTimer;
                } else if (message.type === 'go-fight') {
                    const payload = message.payload || {};
                    Game.p1Surprise = payload.p1Surprise || this.p1Surprise;
                    Game.p2Surprise = payload.p2Surprise || this.p2Surprise;
                    Game.switchScene('fight');
                }
            };
        }
    },

    update() {
        this.timer++;
        const isSingle = Game.mode === 'local' && Game.localMode === 'single';

        if (Game.mode === 'online-client') {
            const menu = InputSystem.getMenuInput();
            NetworkSystem.send('menu-input', menu.p2);
            return null;
        }

        if (this.phase === 'choosing') {
            const menu = InputSystem.getMenuInput();
            const p2Menu = Game.mode === 'online-host' ? this.remoteMenuInput : menu.p2;

            if (!this.p1Confirmed) {
                if (menu.p1.left) this.p1Selection = 0;
                if (menu.p1.right) this.p1Selection = 1;
                if (menu.p1.confirm) this.p1Confirmed = true;
            }

            if (isSingle) {
                this.p2Selection = Math.random() < 0.5 ? 0 : 1;
                this.p2Confirmed = true;
            } else if (!this.p2Confirmed) {
                if (p2Menu.left) this.p2Selection = 0;
                if (p2Menu.right) this.p2Selection = 1;
                if (p2Menu.confirm) this.p2Confirmed = true;
            }

            if (this.p1Confirmed && this.p2Confirmed) {
                this.p1Surprise = PowerupSystem.getRandomSurprise();
                this.p2Surprise = PowerupSystem.getRandomSurprise();
                this.phase = 'revealing';
                this.revealTimer = 0;
            }
        } else if (this.phase === 'revealing') {
            this.revealTimer++;
            if (this.revealTimer > 180) { // 3 seconds
                this.phase = 'done';
            }
        } else if (this.phase === 'done') {
            // Store surprises and proceed to fight
            Game.p1Surprise = this.p1Surprise;
            Game.p2Surprise = this.p2Surprise;
            if (Game.mode === 'online-host') {
                NetworkSystem.send('go-fight', {
                    p1Surprise: this.p1Surprise,
                    p2Surprise: this.p2Surprise
                });
            }
            return 'fight';
        }

        if (Game.mode === 'online-host') {
            NetworkSystem.send('house-select-state', {
                p1Selection: this.p1Selection,
                p2Selection: this.p2Selection,
                p1Confirmed: this.p1Confirmed,
                p2Confirmed: this.p2Confirmed,
                p1Surprise: this.p1Surprise,
                p2Surprise: this.p2Surprise,
                phase: this.phase,
                revealTimer: this.revealTimer
            });
        }

        return null;
    },

    draw(ctx) {
        // Street background
        const grad = ctx.createLinearGradient(0, 0, 0, 500);
        grad.addColorStop(0, '#87CEEB');
        grad.addColorStop(0.6, '#b0d4e8');
        grad.addColorStop(1, '#e0f0ff');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, 800, 500);

        // Ground / street
        ctx.fillStyle = '#888';
        ctx.fillRect(0, 380, 800, 120);
        ctx.fillStyle = '#666';
        ctx.fillRect(0, 380, 800, 4);
        // Road markings
        ctx.fillStyle = '#aaa';
        for (let i = 0; i < 10; i++) {
            ctx.fillRect(40 + i * 85, 430, 40, 6);
        }

        // Title
        ctx.fillStyle = '#2c3e50';
        ctx.font = 'bold 32px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('KIES EEN VERRASSINGSHUIS!', 400, 40);

        if (Game.mode === 'online-host' || Game.mode === 'online-client') {
            const roleText = Game.mode === 'online-host'
                ? 'Online: Jij bent host (Speler 1)'
                : 'Online: Jij bent deelnemer (Speler 2)';
            ctx.font = 'bold 16px Arial';
            ctx.fillStyle = '#f1c40f';
            ctx.fillText(roleText, 400, 64);
        } else if (Game.localMode === 'single') {
            ctx.font = 'bold 16px Arial';
            ctx.fillStyle = '#f1c40f';
            const diff = Game.aiDifficulty === 'hard' ? 'Moeilijk' : (Game.aiDifficulty === 'easy' ? 'Makkelijk' : 'Normaal');
            ctx.fillText(`Singleplayer: Speler 2 is AI (${diff})`, 400, 64);
        }

        // Draw the two houses
        this.drawSelectableHouse(ctx, 120, 150, '#e74c3c', '#c0392b', 0);
        this.drawSelectableHouse(ctx, 500, 150, '#3498db', '#2980b9', 1);

        // Question marks on houses
        ctx.fillStyle = '#f1c40f';
        ctx.font = 'bold 60px Arial';
        ctx.textAlign = 'center';
        if (this.phase === 'choosing') {
            ctx.fillText('?', 180, 280);
            ctx.fillText('?', 560, 280);
        }

        // Player indicators
        this.drawPlayerIndicator(ctx, 1, this.p1Selection, this.p1Confirmed, '#3498db');
        this.drawPlayerIndicator(ctx, 2, this.p2Selection, this.p2Confirmed, '#e74c3c');

        // Instructions
        if (this.phase === 'choosing') {
            ctx.font = '16px Arial';
            if (!this.p1Confirmed) {
                ctx.fillStyle = '#3498db';
                ctx.fillText('P1: A/D om te kiezen, Spatie om te bevestigen', 250, 480);
            }
            if (!this.p2Confirmed) {
                ctx.fillStyle = '#e74c3c';
                ctx.fillText('P2: ←/→ om te kiezen, Enter om te bevestigen', 550, 480);
            } else if (isSingle) {
                ctx.fillStyle = '#f39c12';
                ctx.fillText('P2 (computer) kiest automatisch', 550, 480);
            }
        }

        // Reveal phase
        if (this.phase === 'revealing' || this.phase === 'done') {
            this.drawReveal(ctx);
        }
    },

    drawSelectableHouse(ctx, x, y, color, darkColor, index) {
        // Wall
        ctx.fillStyle = color;
        ctx.fillRect(x, y, 160, 230);
        // Roof
        ctx.fillStyle = darkColor;
        ctx.beginPath();
        ctx.moveTo(x - 20, y);
        ctx.lineTo(x + 80, y - 60);
        ctx.lineTo(x + 180, y);
        ctx.closePath();
        ctx.fill();
        // Door
        ctx.fillStyle = '#8B4513';
        ctx.beginPath();
        ctx.roundRect(x + 55, y + 140, 50, 90, [8, 8, 0, 0]);
        ctx.fill();
        // Doorknob
        ctx.fillStyle = '#f1c40f';
        ctx.beginPath();
        ctx.arc(x + 95, y + 185, 4, 0, Math.PI * 2);
        ctx.fill();
        // Windows
        ctx.fillStyle = '#f1c40f';
        ctx.fillRect(x + 15, y + 40, 35, 35);
        ctx.fillRect(x + 110, y + 40, 35, 35);
        // Window frames
        ctx.strokeStyle = darkColor;
        ctx.lineWidth = 2;
        [x + 15, x + 110].forEach(wx => {
            ctx.beginPath();
            ctx.moveTo(wx + 17.5, y + 40);
            ctx.lineTo(wx + 17.5, y + 75);
            ctx.moveTo(wx, y + 57.5);
            ctx.lineTo(wx + 35, y + 57.5);
            ctx.stroke();
        });
    },

    drawPlayerIndicator(ctx, player, selection, confirmed, color) {
        const houseX = selection === 0 ? 200 : 580;
        const offsetY = player === 1 ? -10 : 10;

        // Arrow pointing at house
        ctx.fillStyle = confirmed ? '#2ecc71' : color;
        ctx.font = 'bold 20px Arial';
        ctx.textAlign = 'center';

        const bounce = confirmed ? 0 : Math.sin(this.timer * 0.1) * 5;
        ctx.fillText(
            confirmed ? `P${player} ✓` : `P${player} ▼`,
            houseX,
            140 + offsetY + bounce
        );
    },

    drawReveal(ctx) {
        // Semi-transparent overlay
        const alpha = Math.min(this.revealTimer / 30, 0.7);
        ctx.fillStyle = `rgba(0, 0, 0, ${alpha})`;
        ctx.fillRect(0, 0, 800, 500);

        if (this.revealTimer > 20) {
            // Player 1 surprise
            this.drawSurpriseCard(ctx, 100, 100, this.p1Surprise, 'Speler 1', '#3498db');
            // Player 2 surprise
            this.drawSurpriseCard(ctx, 430, 100, this.p2Surprise, 'Speler 2', '#e74c3c');
        }

        // Continue prompt
        if (this.revealTimer > 120 && Math.floor(this.revealTimer / 20) % 2 === 0) {
            ctx.fillStyle = '#fff';
            ctx.font = '18px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('Het gevecht begint zo...', 400, 460);
        }
    },

    drawSurpriseCard(ctx, x, y, surprise, playerLabel, color) {
        const cardW = 270;
        const cardH = 280;

        // Card
        const isGood = surprise.type === 'good';
        ctx.fillStyle = isGood ? 'rgba(46, 204, 113, 0.9)' : 'rgba(231, 76, 60, 0.9)';
        ctx.beginPath();
        ctx.roundRect(x, y, cardW, cardH, 15);
        ctx.fill();

        ctx.strokeStyle = isGood ? '#27ae60' : '#c0392b';
        ctx.lineWidth = 3;
        ctx.stroke();

        // Player label
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 18px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(playerLabel, x + cardW / 2, y + 30);

        // Icon
        ctx.font = '64px Arial';
        ctx.fillText(surprise.icon, x + cardW / 2, y + 110);

        // Name
        ctx.font = 'bold 24px Arial';
        ctx.fillText(surprise.name, x + cardW / 2, y + 170);

        // Description
        ctx.font = '16px Arial';
        ctx.fillText(surprise.description, x + cardW / 2, y + 210);

        // Good/Bad label
        ctx.font = 'bold 16px Arial';
        ctx.fillStyle = isGood ? '#145a32' : '#7b241c';
        ctx.fillText(isGood ? 'POWER-UP!' : 'PENALTY!', x + cardW / 2, y + 255);
    }
};
