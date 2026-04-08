// Surprise system: power-ups and penalties
const PowerupSystem = {
    goodSurprises: [
        {
            name: 'Rennen',
            description: 'Je beweegt sneller!',
            icon: '⚡',
            type: 'good',
            apply(fighter) { fighter.speed *= 1.5; }
        },
        {
            name: 'Turbo',
            description: 'Je slaat sneller!',
            icon: '💥',
            type: 'good',
            apply(fighter) { fighter.attackCooldownMax = Math.floor(fighter.attackCooldownMax * 0.6); }
        },
        {
            name: 'Extra Leven',
            description: 'Je begint met 6 levens!',
            icon: '❤️',
            type: 'good',
            apply(fighter) { fighter.lives = 6; }
        },
        {
            name: 'Schild',
            description: 'De eerste hit telt niet!',
            icon: '🛡️',
            type: 'good',
            apply(fighter) { fighter.shielded = true; }
        }
    ],

    badSurprises: [
        {
            name: 'Leven Kwijt',
            description: 'Je begint met 4 levens!',
            icon: '💔',
            type: 'bad',
            apply(fighter) { fighter.lives = 4; }
        },
        {
            name: 'Vertraagd',
            description: 'Je beweegt langzamer!',
            icon: '🐌',
            type: 'bad',
            apply(fighter) { fighter.speed *= 0.6; }
        },
        {
            name: 'Zwakke Aanval',
            description: '4 hits nodig per leven!',
            icon: '😵',
            type: 'bad',
            apply(fighter) { fighter.hitsPerLife = 4; }
        },
        {
            name: 'Omgekeerd',
            description: 'Besturing is omgekeerd!',
            icon: '🔄',
            type: 'bad',
            apply(fighter) { fighter.reversedControls = true; }
        }
    ],

    // Get a random surprise (50/50 good or bad)
    getRandomSurprise() {
        const isGood = Math.random() < 0.5;
        const pool = isGood ? this.goodSurprises : this.badSurprises;
        return pool[Math.floor(Math.random() * pool.length)];
    }
};
