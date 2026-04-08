// Donkie Konk character — based on Antonio's drawing: golden-brown ape, round head, sturdy body
class DonkieKonk extends BaseCharacter {
    constructor(x, y) {
        super('Donkie Konk', x, y);
        this.width = 50;
        this.height = 70;
        this.speed = 3.5;
        this.jumpForce = -13;
        this.attackRange = 40;
        this.bodyColor = '#b8932a'; // Golden brown crayon color from drawing
        this.accentColor = '#d4a83a';
        this.darkColor = '#8a6d1e';
    }

    drawCharacter(ctx) {
        const w = this.width;
        const h = this.height;
        const bounce = this.state === 'walk' ? Math.sin(this.animTimer * 0.5) * 3 : 0;

        // Crayon-style drawing with slightly rough edges

        // Legs — two thick lines going down (like the drawing)
        ctx.strokeStyle = this.bodyColor;
        ctx.lineWidth = 12;
        ctx.lineCap = 'round';
        const legSpread = this.state === 'walk' ? Math.sin(this.animTimer * 0.4) * 5 : 0;

        // Left leg
        ctx.beginPath();
        ctx.moveTo(-10, 8 + bounce);
        ctx.lineTo(-12 - legSpread, h / 2 - 5);
        ctx.stroke();

        // Right leg
        ctx.beginPath();
        ctx.moveTo(10, 8 + bounce);
        ctx.lineTo(12 + legSpread, h / 2 - 5);
        ctx.stroke();

        // Feet — small round blobs
        ctx.fillStyle = this.darkColor;
        ctx.beginPath();
        ctx.ellipse(-12 - legSpread, h / 2 - 2, 8, 5, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(12 + legSpread, h / 2 - 2, 8, 5, 0, 0, Math.PI * 2);
        ctx.fill();

        // Body — thick rounded torso (like the drawing's crayon-filled body)
        ctx.fillStyle = this.bodyColor;
        ctx.beginPath();
        ctx.ellipse(0, -5 + bounce, 20, 24, 0, 0, Math.PI * 2);
        ctx.fill();

        // Body texture — crayon-like strokes
        ctx.strokeStyle = this.accentColor;
        ctx.lineWidth = 3;
        for (let i = -12; i < 12; i += 6) {
            ctx.beginPath();
            ctx.moveTo(i - 2, -18 + bounce);
            ctx.lineTo(i + 1, 12 + bounce);
            ctx.stroke();
        }

        // Belly — lighter oval in center (peach/skin tone like the drawing)
        ctx.fillStyle = '#f0c8a0';
        ctx.beginPath();
        ctx.ellipse(0, -2 + bounce, 11, 13, 0, 0, Math.PI * 2);
        ctx.fill();

        // Arms — thick lines sticking out (like the drawing)
        ctx.strokeStyle = this.bodyColor;
        ctx.lineWidth = 10;
        ctx.lineCap = 'round';

        // Left arm
        const armSwingL = this.state === 'walk' ? Math.sin(this.animTimer * 0.4) * 15 : 0;
        ctx.beginPath();
        ctx.moveTo(-18, -12 + bounce);
        if (this.isAttacking) {
            // Punch forward
            const extend = this.attackFrame < 4 ? this.attackFrame * 6 : Math.max(0, 24 - (this.attackFrame - 4) * 4);
            ctx.lineTo(-20, -18 + bounce);
        } else {
            ctx.lineTo(-24, -2 + armSwingL + bounce);
        }
        ctx.stroke();

        // Right arm (punching arm)
        ctx.beginPath();
        ctx.moveTo(18, -12 + bounce);
        if (this.isAttacking) {
            const extend = this.attackFrame < 4 ? this.attackFrame * 8 : Math.max(0, 32 - (this.attackFrame - 4) * 5);
            ctx.lineTo(18 + extend, -16 + bounce);
            ctx.stroke();
            // Fist
            ctx.fillStyle = this.accentColor;
            ctx.beginPath();
            ctx.arc(18 + extend + 4, -16 + bounce, 7, 0, Math.PI * 2);
            ctx.fill();
        } else {
            ctx.lineTo(24, -2 - armSwingL + bounce);
            ctx.stroke();
        }

        // Hands (when not attacking)
        if (!this.isAttacking) {
            ctx.fillStyle = this.accentColor;
            ctx.beginPath();
            ctx.arc(-24, -2 + armSwingL + bounce, 6, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.arc(24, -2 - armSwingL + bounce, 6, 0, Math.PI * 2);
            ctx.fill();
        }

        // Head — round circle on top (like the drawing)
        ctx.fillStyle = this.bodyColor;
        ctx.beginPath();
        ctx.arc(0, -30 + bounce, 17, 0, Math.PI * 2);
        ctx.fill();

        // Face — lighter area
        ctx.fillStyle = '#f0c8a0';
        ctx.beginPath();
        ctx.ellipse(3, -28 + bounce, 11, 10, 0, 0, Math.PI * 2);
        ctx.fill();

        // Eyes — dark dots with colored iris (like the drawing's small eyes)
        // Left eye — blue dot like the drawing
        ctx.fillStyle = '#2244aa';
        ctx.beginPath();
        ctx.arc(-3, -32 + bounce, 3.5, 0, Math.PI * 2);
        ctx.fill();
        // Right eye — blue dot
        ctx.beginPath();
        ctx.arc(7, -31 + bounce, 3.5, 0, Math.PI * 2);
        ctx.fill();
        // Pupils
        ctx.fillStyle = '#111';
        ctx.beginPath();
        ctx.arc(-2, -32 + bounce, 1.8, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(8, -31 + bounce, 1.8, 0, Math.PI * 2);
        ctx.fill();

        // Small colored dots near face (like the drawing has colorful spots)
        ctx.fillStyle = '#e74c3c'; // red dot
        ctx.beginPath();
        ctx.arc(12, -28 + bounce, 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#3498db'; // blue dot
        ctx.beginPath();
        ctx.arc(-8, -26 + bounce, 1.5, 0, Math.PI * 2);
        ctx.fill();

        // Ears — round bumps on sides of head
        ctx.fillStyle = this.bodyColor;
        ctx.beginPath();
        ctx.arc(-15, -32 + bounce, 7, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(15, -32 + bounce, 7, 0, Math.PI * 2);
        ctx.fill();

        // Mouth
        ctx.strokeStyle = '#5a3a10';
        ctx.lineWidth = 2;
        ctx.beginPath();
        if (this.isAttacking) {
            // Open mouth
            ctx.arc(4, -24 + bounce, 5, 0, Math.PI);
        } else {
            // Small smile
            ctx.arc(4, -25 + bounce, 3, 0.2, Math.PI - 0.2);
        }
        ctx.stroke();
    }
}
