// Slang (Snake) character — based on Willis' drawing: coiled green snake with red tongue
class Slang extends BaseCharacter {
    constructor(x, y) {
        super('Slang', x, y);
        this.width = 60;
        this.height = 55;
        this.speed = 4.5;
        this.jumpForce = -11;
        this.attackRange = 50;
        this.bodyColor = '#6abf3a'; // Bright crayon green like the drawing
        this.accentColor = '#4a9e20';
    }

    drawCharacter(ctx) {
        const w = this.width;
        const h = this.height;
        const wiggle = Math.sin(this.animTimer * 0.15) * 2;
        const breathe = Math.sin(this.animTimer * 0.08) * 1.5;

        // Coiled body (like the drawing — circular coil shape)
        ctx.lineWidth = 12;
        ctx.strokeStyle = this.bodyColor;
        ctx.lineCap = 'round';

        // Main coil — thick green spiral like the drawing
        ctx.beginPath();
        const coilCX = -2;
        const coilCY = 4 + wiggle;
        const coilR = 16 + breathe;
        // Draw a spiral coil
        for (let a = 0.3; a < Math.PI * 1.8; a += 0.1) {
            const r = coilR + a * 2;
            const px = coilCX + Math.cos(a) * r;
            const py = coilCY + Math.sin(a) * r;
            if (a < 0.4) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
        }
        ctx.stroke();

        // Inner coil ring
        ctx.lineWidth = 10;
        ctx.strokeStyle = '#7dd44a';
        ctx.beginPath();
        ctx.arc(coilCX, coilCY, coilR * 0.6, 0.5, Math.PI * 1.6);
        ctx.stroke();

        // Green dots/spots on the body (like in the drawing)
        ctx.fillStyle = '#4a9e20';
        const spots = [[-12, -8], [8, -5], [-5, 12], [14, 8], [-15, 5]];
        spots.forEach(([sx, sy]) => {
            ctx.beginPath();
            ctx.arc(sx + wiggle * 0.3, sy + coilCY * 0.3, 3, 0, Math.PI * 2);
            ctx.fill();
        });

        // Head — poking up from the coil (round, like in drawing)
        const headX = 18;
        const headY = -18 + wiggle;
        ctx.fillStyle = this.bodyColor;
        ctx.beginPath();
        ctx.ellipse(headX, headY, 13, 11, 0.2, 0, Math.PI * 2);
        ctx.fill();

        // Neck connecting head to coil
        ctx.strokeStyle = this.bodyColor;
        ctx.lineWidth = 10;
        ctx.beginPath();
        ctx.moveTo(10, -2 + wiggle);
        ctx.quadraticCurveTo(14, -10 + wiggle, headX, headY);
        ctx.stroke();

        // Eyes — two dark dots like in the drawing
        ctx.fillStyle = '#222';
        ctx.beginPath();
        ctx.arc(headX + 3, headY - 4, 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(headX + 10, headY - 3, 2.5, 0, Math.PI * 2);
        ctx.fill();

        // Eye shine
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.arc(headX + 4, headY - 5, 1.2, 0, Math.PI * 2);
        ctx.fill();

        // Tongue — big red forked tongue like Willis drew it
        const tongueBase = this.isAttacking ? 1 : 0.5;
        const tongueLen = this.isAttacking
            ? 15 + Math.sin(this.attackFrame * 0.8) * 8
            : 8 + Math.sin(this.animTimer * 0.2) * 3;
        const tongueWag = Math.sin(this.animTimer * 0.3) * 3;

        ctx.strokeStyle = '#e23030'; // Bright red like the drawing
        ctx.lineWidth = 2.5;
        ctx.lineCap = 'round';
        ctx.beginPath();
        // Main tongue
        const tx = headX + 12;
        const ty = headY + 2;
        ctx.moveTo(tx, ty);
        ctx.lineTo(tx + tongueLen, ty + tongueWag);
        ctx.stroke();
        // Fork — two prongs like the drawing
        ctx.beginPath();
        ctx.moveTo(tx + tongueLen - 3, ty + tongueWag);
        ctx.lineTo(tx + tongueLen + 5, ty + tongueWag - 6);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(tx + tongueLen - 3, ty + tongueWag);
        ctx.lineTo(tx + tongueLen + 5, ty + tongueWag + 6);
        ctx.stroke();

        // Red fill at tongue tips (like the drawing's red triangle)
        ctx.fillStyle = '#e23030';
        ctx.beginPath();
        ctx.moveTo(tx + tongueLen - 3, ty + tongueWag);
        ctx.lineTo(tx + tongueLen + 5, ty + tongueWag - 6);
        ctx.lineTo(tx + tongueLen + 5, ty + tongueWag + 6);
        ctx.closePath();
        ctx.fill();

        // Attack lunge effect
        if (this.isAttacking && this.attackFrame > 2 && this.attackFrame < 8) {
            // Head lunges forward
            ctx.fillStyle = this.bodyColor;
            ctx.beginPath();
            ctx.ellipse(headX + 8, headY + 2, 10, 8, 0.3, 0, Math.PI * 2);
            ctx.fill();
        }
    }
}
