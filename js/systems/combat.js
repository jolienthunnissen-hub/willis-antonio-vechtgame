// Combat system: hit detection, damage, lives
const CombatSystem = {
    // Check if a punch connects
    checkPunchHit(attacker, defender) {
        if (!attacker.isAttacking) return false;
        if (attacker.attackFrame !== 1) return false; // Only hit on the active frame

        const attackRange = attacker.attackRange || 45;
        const attackX = attacker.facing === 1
            ? attacker.x + attacker.width
            : attacker.x - attackRange;

        const hitbox = {
            x: attackX,
            y: attacker.y + 10,
            width: attackRange,
            height: attacker.height - 20
        };

        return (
            hitbox.x < defender.x + defender.width &&
            hitbox.x + hitbox.width > defender.x &&
            hitbox.y < defender.y + defender.height &&
            hitbox.y + hitbox.height > defender.y
        );
    },

    // Apply a hit to a fighter
    applyHit(fighter) {
        if (fighter.shielded) {
            fighter.shielded = false; // Shield absorbs one hit
            return { lostLife: false, shieldBroken: true };
        }

        const hitsNeeded = fighter.hitsPerLife || 3;
        fighter.hitsTaken++;

        if (fighter.hitsTaken >= hitsNeeded) {
            fighter.hitsTaken = 0;
            fighter.lives--;
            return { lostLife: true, shieldBroken: false };
        }

        return { lostLife: false, shieldBroken: false };
    },

    // Knockback effect
    applyKnockback(fighter, direction) {
        fighter.vx = direction * 8;
        fighter.vy = -3;
        fighter.onGround = false;
        fighter.stunTimer = 15; // Frames of stun
    }
};
