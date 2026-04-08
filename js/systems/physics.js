// Physics system: gravity, movement, collisions
const PhysicsSystem = {
    gravity: 0.6,
    groundY: 390, // Y position of the ground (matches street line)

    update(fighter) {
        // Apply gravity
        fighter.vy += this.gravity;

        // Apply velocity
        fighter.x += fighter.vx;
        fighter.y += fighter.vy;

        // Ground collision
        if (fighter.y + fighter.height >= this.groundY) {
            fighter.y = this.groundY - fighter.height;
            fighter.vy = 0;
            fighter.onGround = true;
        }

        // Wall boundaries (keep on screen)
        if (fighter.x < 0) fighter.x = 0;
        if (fighter.x + fighter.width > 800) fighter.x = 800 - fighter.width;

        // Friction when on ground
        if (fighter.onGround) {
            fighter.vx *= 0.8;
        }
    },

    // Check if two fighters overlap (for stomp detection)
    checkOverlap(a, b) {
        return (
            a.x < b.x + b.width &&
            a.x + a.width > b.x &&
            a.y < b.y + b.height &&
            a.y + a.height > b.y
        );
    },

    // Check if fighter A is landing on top of fighter B
    checkStomp(attacker, defender) {
        // Attacker must be falling
        if (attacker.vy <= 0) return false;

        // Attacker's feet must be near defender's head
        const attackerBottom = attacker.y + attacker.height;
        const defenderTop = defender.y;

        return (
            attackerBottom >= defenderTop &&
            attackerBottom <= defenderTop + 20 &&
            attacker.x + attacker.width > defender.x + 5 &&
            attacker.x < defender.x + defender.width - 5
        );
    }
};
