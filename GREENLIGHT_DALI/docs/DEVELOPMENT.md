# GREENLIGHT

**Old-school browser hoops on Jerel Clark’s court.** A realtime 3D basketball shooting game built for the DALI 26F Development Challenge. Hold **S**, release inside the green window, and make your shot. A second player can move into position and jump to block it.

The game runs on Three.js/WebGL, with a bright, procedurally modeled cartoon court, animated players, ball flight, shadows, a city skyline, sound effects, a shot meter, and keyboard/touch controls. No paid assets, accounts, or runtime API keys.

## Play and built version

- Hosted preview: https://greenlight-hoops.jerelclark-2.chatgpt.site (owner-private preview; use the downloadable web build for sharing until public hosting is configured).
- **Built app:** [Download Greenlight.html](dist/downloads/Greenlight.html). Download the file and open it in a modern browser. This is the offline, single-file web build; no install or server required. It uses system fonts offline.
- Source entry point: `dist/index.html`.
- Requires a WebGL-capable browser. Desktop keyboard is recommended; touch controls also support pointer input.
- This is a **browser 3D game**, not a Unity project or native `.app`/`.exe`. The challenge allows other similar realtime tools; confirm a web build is acceptable if the reviewers require a native executable.

## Controls

| Action | Key / input |
|---|---|
| Move shooter | A / D |
| Charge shot | Hold S |
| Release shot | Release S |
| Move defender | Left / right arrows |
| Jump to block | Space |
| Pause / resume | Escape |
| Touch play | Hold the matching buttons below the court |

Practice mode has unlimited shots, a make counter, and a locally saved best streak. Two-player mode uses one keyboard: alternate roles after every possession, five shots each. Player 1 always takes the first shot. The highest score after ten possessions wins; equal scores produce a draw. This is local multiplayer, not online multiplayer. Switch to 2 players before starting or during play; switching modes resets the match.

Shots from the middle count for two. Moving beyond either marked corner threshold counts for three; the HUD explicitly shows the active value. This is an arcade scoring rule, not a complete regulation basketball simulation.

## Timing and defense

The meter fills over 1.25 seconds. Its target is at 68%, approximately 0.85 seconds. Green is a roughly 130 ms total window. A green release is accurate; a defender may still physically block the ball. Nearly green shots score only when the shooter is open. Holding too long automatically releases a late shot.

Blocks require the defender to be airborne, close to the ball in the court plane, and reaching its height. After jumping the defender has a cooldown. Merely pressing Space does not guarantee a block.

Ball motion uses a ballistic trajectory (`p(t) = p0 + v0*t + 0.5*g*t²`), with the launch velocity solved for a target at the hoop. Misses use timing-dependent target offsets. Landing bounces are damped. Rim contacts and rebounds are stylized rather than a full rigid-body physics simulation.

## Run locally

With Python 3 installed, from the repository root:

```sh
python3 -m http.server 8000 --directory dist
```

Visit `http://localhost:8000`. ES modules in the source version need an HTTP server. Alternatively, double-click the built `dist/downloads/Greenlight.html` without a server.

## Build and test

Node.js 18+ is sufficient. No npm install is needed because the only runtime dependency is vendored.

```sh
npm test
npm run build
```

`npm run build` generates the self-contained HTML build. It embeds the Three.js and game-rules modules as data URLs and embeds the styles. Both the hosted game and offline build use local system fonts and make no font requests.

## Source map

- `dist/game.js`: scene construction, animation, input, game state, UI, audio.
- `dist/rules.js`: pure timing, scoring, turn, and block rules.
- `dist/style.css`: responsive interface and touch controls.
- `dist/vendor/`: pinned Three.js 0.170.0 and its MIT license.
- `scripts/build.mjs`: reproducible offline build.
- `tests/rules.test.mjs`: deterministic rule tests.
- `.github/workflows/pages.yml`: optional GitHub Pages deployment.

## Demo / screenshots

Suggested 30-second demo: start practice, hit one green release, deliberately release early, switch to two players, show one successful block, and show the next player's possession. Capture the court and shot meter together.

**Capture is still required before submission.** No screenshot or recorded video is included because browser-based visual QA was unavailable in the creation environment. Do not label generated artwork as a gameplay screenshot.

## Learning Journey

This project was developed with AI assistance. The following describes the project's design and implementation; the applicant should replace or extend it with their actual learning experience before submission, and follow the application's AI-use policy.

### Inspiration

Basketball jump shots depend on rhythm and responding to defense. GREENLIGHT compresses that experience into a small interaction: hold, read the meter, and release. Its colorful court and short sessions recall classic browser arcade games. Jerel Clark’s name is painted on the baseline, the court has a JC emblem, and the shooter wears a CLARK jersey.

### Potential impact

The intended experience is accessible, quick local competition without account creation or equipment beyond a browser. Practice provides clear feedback, and alternating roles gives both players an equal number of opportunities. The game is not a sports-training or motor-skill assessment tool.

### Technology explored and why

Three.js provides realtime 3D rendering, materials, shadows, scene graphs, cameras, and procedural geometry in a browser. JavaScript keeps the gameplay logic directly inspectable. Choosing a web build reduces installation friction for reviewers. This project does not claim prior Unity or C# experience.

### Challenges and implementation lessons

- **Timing fairness:** pure functions separate release quality from visuals, making outcomes reproducible and testable.
- **Defensive interactions:** a block depends on proximity and height during the ball's flight instead of a keypress alone.
- **State management:** ready, charging, and flight phases prevent duplicate shots. Modal/pause states stop simulation and clear held inputs.
- **Frame independence:** movement and animation use elapsed time, with long-frame clamping to avoid sudden jumps after stalls. This remains an arcade approximation; frame drops can slightly affect timing and collisions.
- **Distribution:** embedding local modules makes a standalone HTML build usable offline. The readable source remains separate.
- **Performance:** reused geometry/joint pivots, capped pixel ratio, simple materials, and limited effects keep the scene modest.

### Applicant reflection prompts

Before submitting, explain in your own words: why the launch velocity includes `0.5*g*T`, what a scene graph is, how the two-player state changes, one bug you personally fixed, and one feature you would improve. Replace these prompts with your answers, add real screenshots, and describe the assistance used accurately.

## Validation and limitations

Automated tests cover the green release window, early/late misses, contested near-green shots, block bounds, scoring values, and equal possessions. JavaScript syntax and local dependency references were checked. Browser rendering and a complete interactive match were **not** verified in this environment. Before submission, play a full match in the target browser, test sound/fullscreen/touch, and check the offline file.

## GitHub submission

Create a new **public** GitHub repository and upload this project. Do not upload it into an unrelated project. To use the included Pages workflow, select **Settings → Pages → Source → GitHub Actions**. GitHub Pages publishes the `dist` folder and gives a public playable link. Update this README with that URL and screenshots. The source archive includes the standalone built app.

## Credits

All court geometry, characters, UI, and sound effects are procedural or authored for this project with AI assistance. Three.js is Copyright © 2010–2024 three.js authors, MIT licensed; see `dist/vendor/THREE-LICENSE.txt`. Typography uses local system fonts. The retro arcade treatment uses original procedural art and does not include Friv logos or third-party game assets.
