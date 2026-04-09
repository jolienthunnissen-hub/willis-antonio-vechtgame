# Willis & Antonio's Vechtgame 🥊

Een 1-tegen-1 fighting game in de browser! Kies je character, ga een verrassingshuis in, en vecht op straat!

## Hoe te spelen

1. Open `index.html` in je browser
2. Of start een server: `python3 -m http.server 8080` en ga naar http://localhost:8080

## Besturing

| Actie | Speler 1 | Speler 2 |
|---|---|---|
| Links | A | ← |
| Rechts | D | → |
| Springen | W | ↑ |
| Boksen | Spatie | Enter |

## Online spelen (WebRTC)

Je kunt nu ook online 1-tegen-1 spelen via WebRTC (zonder backend server).

1. Beide spelers openen dezelfde game-build.
2. In het menu:
   - **Host** drukt `H`
   - **Join** drukt `J`
3. Host kopieert de HOST code en stuurt die naar de andere speler.
4. Join plakt die code, krijgt een ANSWER code terug, en stuurt die naar host.
5. Host plakt de ANSWER code. Daarna start het online gevecht automatisch.

### Belangrijk

- Voor WebRTC werkt het meestal het best via een echte server/hosting (of localhost tijdens testen).
- De online mode is host-authoritative: speler 1 draait op host, speler 2 bestuurt op de join-client.
- Character-select en huis-select lopen nu ook online synchroon (host bepaalt de flow, join bestuurt speler 2).

## Characters

- **Slang** — Snel, lang bereik
- **Donkie Konk** — Springt hoger, stevig gebouwd

## Game Flow

1. Kies je character
2. Kies een verrassingshuis (power-up of penalty!)
3. Vecht! 3 hits = 1 leven kwijt. Wie eerst 0 levens heeft verliest!

*Ontworpen door Willis & Antonio*
