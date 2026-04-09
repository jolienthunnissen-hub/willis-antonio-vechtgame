// Fight scene — the main battle arena
const FightScene = {
    p1: null,
    p2: null,
    countdownTimer: 0,
    phase: 'countdown', // countdown, fighting, ko
    koTimer: 0,
    winner: null,
    hitEffects: [],
    shakeTimer: 0,
    shakeIntensity: 0,
    remoteInput: { left: false, right: false, jump: false, attack: false },
    lastRemoteSnapshot: null,
    aiDecisionTimer: 0,
    aiMoveDirection: 0,

    init() {
        // Create characters based on selections
        this.p1 = this.createCharacter(Game.p1Character, 150, 300);
        this.p2 = this.createCharacter(Game.p2Character, 600, 300);
        this.p2.facing = -1;

        // Apply surprises
        if (Game.p1Surprise) Game.p1Surprise.apply(this.p1);
        if (Game.p2Surprise) Game.p2Surprise.apply(this.p2);

        this.countdownTimer = 180; // 3 seconds
        this.phase = 'countdown';
        this.koTimer = 0;
        this.winner = null;
        this.hitEffects = [];
        this.shakeTimer = 0;
        this.shakeIntensity = 0;
        this.remoteInput = { left: false, right: false, jump: false, attack: false };
        this.lastRemoteSnapshot = null;
        this.aiDecisionTimer = 0;
        this.aiMoveDirection = 0;

        if (Game.mode === 'online-host') {
            NetworkSystem.onMessage = (message) => {
                if (message.type === 'client-input') {
                    this.remoteInput = { ...this.remoteInput, ...(message.payload || {}) };
                }
            };
            NetworkSystem.send('start-match', {
                p1Character: Game.p1Character,
                p2Character: Game.p2Character,
                p1Surprise: Game.p1Surprise,
                p2Surprise: Game.p2Surprise
            });
        }

        if (Game.mode === 'online-client') {
            NetworkSystem.onMessage = (message) => {
                if (message.type === 'state') {
                    this.lastRemoteSnapshot = message.payload;
                    this.applySnapshot(this.lastRemoteSnapshot);
                }
            };
        }
    },

    createCharacter(name, x, y) {
        if (name === 'Slang') return new Slang(x, y);
        if (name === 'Donkie Konk') return new DonkieKonk(x, y);
        return new BaseCharacter(name, x, y);
    },

    update() {
        if (Game.mode === 'online-client') {
            const p2Input = InputSystem.getPlayer2();
            NetworkSystem.send('client-input', p2Input);

            if (this.lastRemoteSnapshot) {
                Game.winner = this.lastRemoteSnapshot.winner || null;
                if (this.lastRemoteSnapshot.scene === 'victory') {
                    return 'victory';
                }
            }
            return null;
        }

        if (this.phase === 'countdown') {
            this.countdownTimer--;
            if (this.countdownTimer <= 0) {
                this.phase = 'fighting';
            }
            if (Game.mode === 'online-host') this.broadcastSnapshot();
            return null;
        }

        if (this.phase === 'ko') {
            this.koTimer++;
            if (this.koTimer > 120) {
                Game.winner = this.winner;
                if (Game.mode === 'online-host') {
                    this.broadcastSnapshot('victory');
                }
                return 'victory';
            }
            if (Game.mode === 'online-host') this.broadcastSnapshot();
            return null;
        }

        // Get input
        const p1Input = InputSystem.getPlayer1();
        const p2Input = Game.mode === 'online-host'
            ? this.remoteInput
            : (Game.mode === 'local' && Game.localMode === 'single'
                ? this.getSinglePlayerAIInput()
                : InputSystem.getPlayer2());

        // Handle input
        this.p1.handleInput(p1Input);
        this.p2.handleInput(p2Input);

        // Physics
        PhysicsSystem.update(this.p1);
        PhysicsSystem.update(this.p2);

        // Update characters
        this.p1.update();
        this.p2.update();

        // Face each other
        if (this.p1.stunTimer <= 0 && !this.p1.isAttacking) {
            this.p1.facing = this.p2.x > this.p1.x ? 1 : -1;
        }
        if (this.p2.stunTimer <= 0 && !this.p2.isAttacking) {
            this.p2.facing = this.p1.x > this.p2.x ? 1 : -1;
        }

        // Combat — punch detection
        if (CombatSystem.checkPunchHit(this.p1, this.p2)) {
            const result = CombatSystem.applyHit(this.p2);
            const dir = this.p1.facing;
            CombatSystem.applyKnockback(this.p2, dir);
            this.addHitEffect(this.p2.x + this.p2.width / 2, this.p2.y + this.p2.height / 2, result.lostLife);
            if (result.lostLife) {
                this.shakeTimer = 12;
                this.shakeIntensity = 8;
            }
        }

        if (CombatSystem.checkPunchHit(this.p2, this.p1)) {
            const result = CombatSystem.applyHit(this.p1);
            const dir = this.p2.facing;
            CombatSystem.applyKnockback(this.p1, dir);
            this.addHitEffect(this.p1.x + this.p1.width / 2, this.p1.y + this.p1.height / 2, result.lostLife);
            if (result.lostLife) {
                this.shakeTimer = 12;
                this.shakeIntensity = 8;
            }
        }

        // Stomp detection
        if (PhysicsSystem.checkStomp(this.p1, this.p2)) {
            const result = CombatSystem.applyHit(this.p2);
            this.p1.vy = -8; // Bounce off
            CombatSystem.applyKnockback(this.p2, this.p1.facing);
            this.addHitEffect(this.p2.x + this.p2.width / 2, this.p2.y, result.lostLife);
        }

        if (PhysicsSystem.checkStomp(this.p2, this.p1)) {
            const result = CombatSystem.applyHit(this.p1);
            this.p2.vy = -8;
            CombatSystem.applyKnockback(this.p1, this.p2.facing);
            this.addHitEffect(this.p1.x + this.p1.width / 2, this.p1.y, result.lostLife);
        }

        // Update effects
        this.hitEffects = this.hitEffects.filter(e => {
            e.timer++;
            return e.timer < 20;
        });

        if (this.shakeTimer > 0) this.shakeTimer--;

        // Check KO
        if (this.p1.lives <= 0) {
            this.phase = 'ko';
            this.winner = 2;
        } else if (this.p2.lives <= 0) {
            this.phase = 'ko';
            this.winner = 1;
        }

        if (Game.mode === 'online-host') this.broadcastSnapshot();

        return null;
    },

    getSinglePlayerAIInput() {
        const difficulty = Game.aiDifficulty || 'normal';
        const settings = this.getAISettings(difficulty);
        const dx = this.p1.x - this.p2.x;
        const distance = Math.abs(dx);
        const sameHeight = Math.abs(this.p1.y - this.p2.y) < 40;

        if (this.aiDecisionTimer <= 0) {
            this.aiDecisionTimer = settings.decisionMin + Math.floor(Math.random() * settings.decisionRange);
            if (distance > 140) {
                this.aiMoveDirection = dx > 0 ? 1 : -1;
            } else if (distance < 60) {
                this.aiMoveDirection = dx > 0 ? -1 : 1;
            } else {
                this.aiMoveDirection = Math.random() < settings.chaseChance ? (dx > 0 ? 1 : -1) : 0;
            }
        } else {
            this.aiDecisionTimer--;
        }

        const input = {
            left: this.aiMoveDirection < 0,
            right: this.aiMoveDirection > 0,
            jump: false,
            attack: false
        };

        if (this.p2.onGround && sameHeight && distance > 70 && distance < 200 && Math.random() < settings.jumpChance) {
            input.jump = true;
        }

        if (sameHeight && distance < this.p2.attackRange + settings.attackRangeBonus && this.p2.attackCooldown <= 0 && Math.random() < settings.attackChance) {
            input.attack = true;
        }

        return input;
    },

    getAISettings(difficulty) {
        if (difficulty === 'easy') {
            return {
                decisionMin: 28,
                decisionRange: 24,
                chaseChance: 0.62,
                jumpChance: 0.018,
                attackChance: 0.09,
                attackRangeBonus: 10
            };
        }
        if (difficulty === 'hard') {
            return {
                decisionMin: 12,
                decisionRange: 10,
                chaseChance: 0.9,
                jumpChance: 0.05,
                attackChance: 0.32,
                attackRangeBonus: 28
            };
        }
        return {
            decisionMin: 18,
            decisionRange: 16,
            chaseChance: 0.75,
            jumpChance: 0.03,
            attackChance: 0.18,
            attackRangeBonus: 20
        };
    },

    broadcastSnapshot(scene = 'fight') {
        NetworkSystem.send('state', {
            scene,
            phase: this.phase,
            countdownTimer: this.countdownTimer,
            koTimer: this.koTimer,
            winner: this.winner,
            shakeTimer: this.shakeTimer,
            shakeIntensity: this.shakeIntensity,
            p1: this.serializeFighter(this.p1),
            p2: this.serializeFighter(this.p2),
            hitEffects: this.hitEffects
        });
    },

    serializeFighter(fighter) {
        return {
            x: fighter.x,
            y: fighter.y,
            vx: fighter.vx,
            vy: fighter.vy,
            onGround: fighter.onGround,
            facing: fighter.facing,
            lives: fighter.lives,
            hitsTaken: fighter.hitsTaken,
            isAttacking: fighter.isAttacking,
            attackFrame: fighter.attackFrame,
            attackCooldown: fighter.attackCooldown,
            stunTimer: fighter.stunTimer,
            shielded: fighter.shielded,
            reversedControls: fighter.reversedControls,
            animTimer: fighter.animTimer,
            animFrame: fighter.animFrame,
            state: fighter.state
        };
    },

    applyFighterSnapshot(fighter, snapshot) {
        if (!fighter || !snapshot) return;
        fighter.x = snapshot.x;
        fighter.y = snapshot.y;
        fighter.vx = snapshot.vx;
        fighter.vy = snapshot.vy;
        fighter.onGround = snapshot.onGround;
        fighter.facing = snapshot.facing;
        fighter.lives = snapshot.lives;
        fighter.hitsTaken = snapshot.hitsTaken;
        fighter.isAttacking = snapshot.isAttacking;
        fighter.attackFrame = snapshot.attackFrame;
        fighter.attackCooldown = snapshot.attackCooldown;
        fighter.stunTimer = snapshot.stunTimer;
        fighter.shielded = snapshot.shielded;
        fighter.reversedControls = snapshot.reversedControls;
        fighter.animTimer = snapshot.animTimer;
        fighter.animFrame = snapshot.animFrame;
        fighter.state = snapshot.state;
    },

    applySnapshot(snapshot) {
        if (!snapshot) return;
        this.phase = snapshot.phase;
        this.countdownTimer = snapshot.countdownTimer;
        this.koTimer = snapshot.koTimer;
        this.winner = snapshot.winner;
        this.shakeTimer = snapshot.shakeTimer;
        this.shakeIntensity = snapshot.shakeIntensity;
        this.hitEffects = Array.isArray(snapshot.hitEffects) ? snapshot.hitEffects : [];

        this.applyFighterSnapshot(this.p1, snapshot.p1);
        this.applyFighterSnapshot(this.p2, snapshot.p2);
    },

    addHitEffect(x, y, big) {
        this.hitEffects.push({ x, y, timer: 0, big });
    },

    draw(ctx) {
        ctx.save();

        // Screen shake
        if (this.shakeTimer > 0) {
            const sx = (Math.random() - 0.5) * this.shakeIntensity;
            const sy = (Math.random() - 0.5) * this.shakeIntensity;
            ctx.translate(sx, sy);
        }

        // Sky
        const grad = ctx.createLinearGradient(0, 0, 0, 500);
        grad.addColorStop(0, '#87CEEB');
        grad.addColorStop(1, '#c8e6f5');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, 800, 500);

        // Clouds
        this.drawClouds(ctx);

        // Background — Antonio's drawing style: pink marker outlined buildings
        this.drawTree(ctx, 30, 280);
        this.drawBackgroundHouse(ctx, 100, 210);
        this.drawSmallHouse(ctx, 280, 270);
        this.drawBackgroundHouse(ctx, 420, 220);
        this.drawSmallHouse(ctx, 600, 260);
        this.drawStairs(ctx, 740, 280);

        // Ground line — thick pink marker line like the drawing
        ctx.strokeStyle = '#c23078';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(0, 390);
        ctx.lineTo(800, 390);
        ctx.stroke();

        // Street below the line
        ctx.fillStyle = '#e8ddd0'; // Light paper/concrete color
        ctx.fillRect(0, 390, 800, 110);

        // Draw fighters
        this.p1.draw(ctx);
        this.p2.draw(ctx);

        // Hit effects
        this.hitEffects.forEach(e => {
            const alpha = 1 - e.timer / 20;
            const size = e.big ? 30 + e.timer * 2 : 15 + e.timer;
            ctx.globalAlpha = alpha;
            ctx.fillStyle = e.big ? '#e74c3c' : '#f1c40f';
            ctx.font = `bold ${size}px Arial`;
            ctx.textAlign = 'center';
            ctx.fillText(e.big ? 'BAM!' : 'POW!', e.x, e.y - e.timer * 2);
            ctx.globalAlpha = 1;
        });

        ctx.restore();

        // UI (not affected by shake)
        this.drawUI(ctx);

        // Countdown overlay
        if (this.phase === 'countdown') {
            this.drawCountdown(ctx);
        }

        // KO overlay
        if (this.phase === 'ko') {
            this.drawKO(ctx);
        }
    },

    drawClouds(ctx) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
        [[100, 60], [350, 40], [600, 70], [750, 30]].forEach(([cx, cy]) => {
            ctx.beginPath();
            ctx.ellipse(cx, cy, 50, 20, 0, 0, Math.PI * 2);
            ctx.ellipse(cx + 30, cy - 10, 35, 18, 0, 0, Math.PI * 2);
            ctx.ellipse(cx - 25, cy + 5, 30, 15, 0, 0, Math.PI * 2);
            ctx.fill();
        });
    },

    // All background buildings based on Antonio's pink marker drawing
    drawBackgroundHouse(ctx, x, y, color, dark) {
        ctx.strokeStyle = '#c23078'; // Pink/magenta marker like the drawing
        ctx.lineWidth = 3;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        // Building outline (hand-drawn style — slightly wobbly)
        ctx.beginPath();
        ctx.moveTo(x, y + 170);
        ctx.lineTo(x + 2, y + 3);
        // Curved roof like the drawing
        ctx.quadraticCurveTo(x + 65, y - 40, x + 128, y + 3);
        ctx.lineTo(x + 130, y + 170);
        ctx.stroke();

        // Door — tall arch like in the drawing
        ctx.beginPath();
        ctx.moveTo(x + 45, y + 170);
        ctx.lineTo(x + 45, y + 80);
        ctx.quadraticCurveTo(x + 65, y + 55, x + 85, y + 80);
        ctx.lineTo(x + 85, y + 170);
        ctx.stroke();

        // Door handle — small circle
        ctx.beginPath();
        ctx.arc(x + 78, y + 130, 3, 0, Math.PI * 2);
        ctx.stroke();

        // Windows — simple rectangles with marker outline
        ctx.strokeRect(x + 12, y + 35, 22, 28);
        ctx.strokeRect(x + 96, y + 35, 22, 28);
    },

    drawSmallHouse(ctx, x, y, color, dark) {
        ctx.strokeStyle = '#c23078';
        ctx.lineWidth = 3;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        // Smaller building
        ctx.beginPath();
        ctx.moveTo(x, y + 110);
        ctx.lineTo(x + 1, y + 2);
        ctx.quadraticCurveTo(x + 40, y - 25, x + 79, y + 2);
        ctx.lineTo(x + 80, y + 110);
        ctx.stroke();

        // Door
        ctx.beginPath();
        ctx.moveTo(x + 28, y + 110);
        ctx.lineTo(x + 28, y + 60);
        ctx.quadraticCurveTo(x + 40, y + 45, x + 52, y + 60);
        ctx.lineTo(x + 52, y + 110);
        ctx.stroke();

        // Door handle
        ctx.beginPath();
        ctx.arc(x + 47, y + 85, 2.5, 0, Math.PI * 2);
        ctx.stroke();

        // Window
        ctx.strokeRect(x + 10, y + 25, 18, 18);
        ctx.strokeRect(x + 52, y + 25, 18, 18);
    },

    // Tree from Antonio's drawing (left side — pink outlined tree with scribble top)
    drawTree(ctx, x, y) {
        ctx.strokeStyle = '#c23078';
        ctx.lineWidth = 3;
        ctx.lineCap = 'round';

        // Trunk — two vertical lines
        ctx.beginPath();
        ctx.moveTo(x, y + 80);
        ctx.lineTo(x + 1, y + 15);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(x + 10, y + 80);
        ctx.lineTo(x + 9, y + 15);
        ctx.stroke();

        // Foliage — scribbled circle on top
        ctx.beginPath();
        ctx.arc(x + 5, y + 5, 16, 0, Math.PI * 2);
        ctx.stroke();
        // Inner scribble
        ctx.beginPath();
        ctx.arc(x + 3, y + 2, 8, 0.5, Math.PI * 1.5);
        ctx.stroke();
    },

    // Stairs/ladder from the right side of Antonio's drawing
    drawStairs(ctx, x, y) {
        ctx.strokeStyle = '#c23078';
        ctx.lineWidth = 3;
        ctx.fillStyle = '#c23078';

        // Vertical rails
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x, y + 100);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(x + 25, y);
        ctx.lineTo(x + 25, y + 100);
        ctx.stroke();

        // Horizontal rungs — filled like the drawing's hatched pattern
        for (let i = 0; i < 8; i++) {
            ctx.fillRect(x, y + 5 + i * 12, 25, 6);
        }
    },

    drawUI(ctx) {
        // Player 1 info (left)
        this.drawPlayerHUD(ctx, 10, 10, this.p1, Game.p1Character, '#3498db', 'Speler 1');
        // Player 2 info (right)
        const p2Label = Game.mode === 'local' && Game.localMode === 'single' ? 'Computer' : 'Speler 2';
        this.drawPlayerHUD(ctx, 490, 10, this.p2, Game.p2Character, '#e74c3c', p2Label);

        // Power-up indicators
        if (Game.p1Surprise) {
            ctx.fillStyle = Game.p1Surprise.type === 'good' ? '#2ecc71' : '#e74c3c';
            ctx.font = '14px Arial';
            ctx.textAlign = 'left';
            ctx.fillText(`${Game.p1Surprise.icon} ${Game.p1Surprise.name}`, 10, 75);
        }
        if (Game.p2Surprise) {
            ctx.fillStyle = Game.p2Surprise.type === 'good' ? '#2ecc71' : '#e74c3c';
            ctx.font = '14px Arial';
            ctx.textAlign = 'right';
            ctx.fillText(`${Game.p2Surprise.icon} ${Game.p2Surprise.name}`, 790, 75);
        }
    },

    drawPlayerHUD(ctx, x, y, fighter, charName, color, label) {
        // Background
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.beginPath();
        ctx.roundRect(x, y, 300, 55, 8);
        ctx.fill();

        // Label
        ctx.fillStyle = color;
        ctx.font = 'bold 14px Arial';
        ctx.textAlign = 'left';
        ctx.fillText(`${label} — ${charName}`, x + 10, y + 18);

        // Hearts
        for (let i = 0; i < fighter.lives; i++) {
            ctx.fillStyle = '#e74c3c';
            ctx.font = '18px Arial';
            ctx.fillText('❤️', x + 10 + i * 24, y + 42);
        }
        // Empty hearts
        const maxLives = Math.max(fighter.lives, 6);
        for (let i = fighter.lives; i < maxLives && i < 6; i++) {
            ctx.fillStyle = '#555';
            ctx.font = '18px Arial';
            ctx.fillText('♡', x + 10 + i * 24, y + 42);
        }

        // Hit counter
        ctx.fillStyle = '#fff';
        ctx.font = '14px Arial';
        ctx.fillText(`Hits: ${fighter.hitsTaken}/${fighter.hitsPerLife}`, x + 200, y + 42);

        // Shield indicator
        if (fighter.shielded) {
            ctx.fillStyle = '#00ffff';
            ctx.font = '14px Arial';
            ctx.fillText('🛡️', x + 270, y + 42);
        }
    },

    drawCountdown(ctx) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
        ctx.fillRect(0, 0, 800, 500);

        const seconds = Math.ceil(this.countdownTimer / 60);
        const text = seconds > 0 ? seconds.toString() : 'VECHT!';
        const pulse = 1 + Math.sin(this.countdownTimer * 0.3) * 0.1;

        ctx.save();
        ctx.translate(400, 250);
        ctx.scale(pulse, pulse);
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 80px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(text, 0, 0);
        ctx.restore();
    },

    drawKO(ctx) {
        const alpha = Math.min(this.koTimer / 30, 0.6);
        ctx.fillStyle = `rgba(0, 0, 0, ${alpha})`;
        ctx.fillRect(0, 0, 800, 500);

        if (this.koTimer > 20) {
            const scale = Math.min((this.koTimer - 20) / 15, 1);
            ctx.save();
            ctx.translate(400, 250);
            ctx.scale(scale, scale);
            ctx.fillStyle = '#e74c3c';
            ctx.font = 'bold 72px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('K.O.!', 0, 0);
            ctx.restore();

            ctx.fillStyle = '#fff';
            ctx.font = '28px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(`Speler ${this.winner} wint!`, 400, 320);
        }
    }
};
