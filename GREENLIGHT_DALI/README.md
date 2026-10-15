# GREENLIGHT_DALI

A 3D basketball shooting game for the DALI 26F Development Challenge.

Hold **S** to charge a shot, then release it inside the green part of the meter. A second player can move across the court and jump to block the ball. The game has a colorful, old-school browser-game style, with Jerel Clark painted on the baseline and a CLARK jersey on the shooter.

Built with JavaScript and Three.js. Runs in a browser.

## Play

Download [Greenlight.html](Greenlight.html) using GitHub's **Download raw file** button, then open it in your browser. This is the complete offline web build. No installation is needed.

[Hosted preview](https://greenlight-hoops.jerelclark-2.chatgpt.site) currently requires the owner's sign-in. The offline build can be shared with reviewers.

## Controls

| Player | Action | Key |
| --- | --- | --- |
| Shooter | Move | A / D |
| Shooter | Charge and release | Hold / release S |
| Defender | Move | Left / right arrows |
| Defender | Jump to block | Space |
| Either | Pause | Escape |

The buttons below the court also work with touch.

## Game Objects

### 1. Court

The court, hoop, backboard, net, benches, and surrounding buildings are generated in code. Court markings and lettering use canvas textures. A fixed camera keeps the shooter and basket in view.

### 2. Shooter

The shooter moves left and right before charging. Holding S fills the shot meter and raises the player's arms. Releasing S launches the ball. Shots from the middle are worth two points; moving into either corner range makes them worth three.

### 3. Defender

The defender moves with the arrow keys and jumps with Space. A block requires the player to be close to the ball and reaching its height. Jumping has a cooldown.

### 4. Basketball

The ball follows a calculated arc toward the basket. Release timing determines its target. Early or late shots miss; green releases are accurate unless blocked. Rebounds and bounces use simplified physics.

### 5. Shot Meter and Scoreboard

The meter fills over 1.25 seconds. The green window is centered at approximately 0.85 seconds. The scoreboard tracks makes and attempts in practice, or each player's points in a match.

## Work Flow

The game starts in practice mode. Choose **2 players** for a local match on one keyboard.

Each possession moves through three states: ready, charging, and ball in flight. The shot is evaluated once, then the court resets. In a two-player match, players switch roles after each shot. Each player gets five attempts. The highest total wins; equal scores produce a draw.

Pausing or opening the instructions stops the game. Practice streak records are saved in the browser.

## Running the Source

From the repository folder, run:

```sh
python3 -m http.server 8000 --directory dist
```

Open `http://localhost:8000`.

To rebuild the standalone game or run the rule tests, use Node.js 18 or newer:

```sh
npm run build
npm test
```

No dependency installation is required. Three.js is included in `dist/vendor`.

## Project Files

| File / folder | Contents |
| --- | --- |
| `Greenlight.html` | Complete offline web build |
| `dist/` | HTML, CSS, game scripts, and local dependencies |
| `dist/rules.js` | Timing, scoring, and block rules |
| `scripts/` | Standalone build script |
| `tests/` | Automated rule tests |
| `docs/` | Development details and submission checklist |
| `.github/workflows/pages.yml` | Optional GitHub Pages deployment |

## Learning Journey

### Inspiration

The idea combines basketball shot timing with the simple controls and bright graphics of older browser games. The goal is a quick game that friends can play on one computer.

### Potential Impact

Practice mode gives immediate feedback on early, late, and accurate releases. Two-player mode adds a short, accessible local competition with an equal number of shots for both players.

### Technology and Design Choices

Three.js provides realtime 3D rendering directly in a browser. Procedural geometry avoids large asset downloads, while JavaScript keeps the game logic readable. A single HTML build makes the project easy to run and share.

### Challenges and Lessons

Release timing, ball motion, and defense need to agree. Separating the timing and collision rules from rendering makes those decisions testable. Explicit game states prevent duplicate shots and scoring. Delta-time-based movement helps the game behave consistently across frame rates, although low frame rates can still affect precise timing and collisions.

### Final Note

The implementation was developed with AI assistance and directed through gameplay and visual feedback from Jerel Clark. The applicant's personal learning reflection and real gameplay screenshots are still to be added before submission. See [submission notes](docs/SUBMISSION.md).

## Credits

Three.js 0.170.0, MIT license: [license text](dist/vendor/THREE-LICENSE.txt).

Court art, characters, textures, interface, and sounds are procedural or authored for this project with AI assistance. No Friv assets or logos are used.
