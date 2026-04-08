// Base character class — all characters extend this
class BaseCharacter {
    constructor(name, x, y) {
        this.name = name;
        this.x = x;
        this.y = y;
        this.width = 50;
        this.height = 70;

        // Movement
        this.vx = 0;
        this.vy = 0;
        this.speed = 4;
        this.jumpForce = -12;
        this.onGround = false;
        this.facing = 1; // 1 = right, -1 = left

        // Combat
        this.lives = 5;
        this.hitsTaken = 0;
        this.hitsPerLife = 3;
        this.isAttacking = false;
        this.attackFrame = 0;
        this.attackDuration = 12;
        this.attackCooldown = 0;
        this.attackCooldownMax = 20;
        this.attackRange = 45;
        this.stunTimer = 0;

        // Power-up states
        this.shielded = false;
        this.reversedControls = false;

        // Animation
        this.animTimer = 0;
        this.animFrame = 0;
        this.state = 'idle'; // idle, walk, jump, attack, hurt

        // Color (overridden by subclasses)
        this.bodyColor = '#888';
        this.accentColor = '#666';
    }

    handleInput(input) {
        if (this.stunTimer > 0) {
            this.stunTimer--;
            return;
        }

        let left = input.left;
        let right = input.right;

        // Reversed controls
        if (this.reversedControls) {
            [left, right] = [right, left];
        }

        // Horizontal movement
        if (left) {
            this.vx = -this.speed;
            this.facing = -1;
        } else if (right) {
            this.vx = this.speed;
            this.facing = 1;
        }

        // Jump
        if (input.jump && this.onGround) {
            this.vy = this.jumpForce;
            this.onGround = false;
        }

        // Attack
        if (input.attack && this.attackCooldown <= 0 && !this.isAttacking) {
            this.isAttacking = true;
            this.attackFrame = 0;
            this.attackCooldown = this.attackCooldownMax;
        }
    }

    update() {
        // Attack animation
        if (this.isAttacking) {
            this.attackFrame++;
            if (this.attackFrame >= this.attackDuration) {
                this.isAttacking = false;
                this.attackFrame = 0;
            }
        }

        if (this.attackCooldown > 0) this.attackCooldown--;

        // Animation state
        if (this.stunTimer > 0) {
            this.state = 'hurt';
        } else if (this.isAttacking) {
            this.state = 'attack';
        } else if (!this.onGround) {
            this.state = 'jump';
        } else if (Math.abs(this.vx) > 0.5) {
            this.state = 'walk';
        } else {
            this.state = 'idle';
        }

        // Animation timer
        this.animTimer++;
        if (this.animTimer >= 8) {
            this.animTimer = 0;
            this.animFrame = (this.animFrame + 1) % 4;
        }
    }

    // Default draw — overridden by subclasses for unique looks
    draw(ctx) {
        ctx.save();
        ctx.translate(this.x + this.width / 2, this.y + this.height / 2);
        if (this.facing === -1) ctx.scale(-1, 1);

        // Shield glow
        if (this.shielded) {
            ctx.shadowColor = '#00ffff';
            ctx.shadowBlur = 15;
            ctx.strokeStyle = 'rgba(0, 255, 255, 0.5)';
            ctx.lineWidth = 3;
            ctx.strokeRect(-this.width / 2 - 5, -this.height / 2 - 5, this.width + 10, this.height + 10);
            ctx.shadowBlur = 0;
        }

        // Hurt flash
        if (this.stunTimer > 0 && this.animFrame % 2 === 0) {
            ctx.globalAlpha = 0.5;
        }

        this.drawCharacter(ctx);

        ctx.restore();
    }

    // Override this in subclasses
    drawCharacter(ctx) {
        // Default: colored rectangle
        ctx.fillStyle = this.bodyColor;
        ctx.fillRect(-this.width / 2, -this.height / 2, this.width, this.height);
    }
}
