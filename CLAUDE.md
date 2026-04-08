# Willis & Antonio's Vechtgame

## Project Overview
1v1 local multiplayer browser fighting game. Two animal characters (Slang and Donkie Konk) battle on a street arena after choosing surprise houses that give random power-ups or penalties.

## Architecture
- Multi-file vanilla JS project, no build step, no dependencies
- HTML5 Canvas 2D, 800x500px
- Scenes: menu → characterSelect → houseSelect → fight → victory
- Characters extend BaseCharacter class in `/js/characters/`
- Systems (input, physics, combat, powerups) in `/js/systems/`

## Key Design Decisions
- Designed by kids (Willis & Antonio) — keep art style playful and hand-drawn feeling
- Characters are drawn procedurally on canvas (no sprite images needed)
- 3 hits = 1 life lost, 5 lives default
- Surprise houses are the core twist mechanic (random power-up or penalty before each fight)
- Extensible: new characters = new file in /js/characters/ extending BaseCharacter

## Development
- Preview: open index.html directly or `python3 -m http.server 8080`
- No tests, no linting — hackathon project

## Controls
- P1: WASD + Space (punch)
- P2: Arrow keys + Enter (punch)
