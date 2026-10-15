# GREENLIGHT 🏀

**Jerel's Court. Two players, one keyboard, and a whole lot of jump shots.**

Remember those little browser games you played instead of doing homework? That's the vibe. GREENLIGHT is a small 3D basketball game with a shot meter, a defender who can actually block you, and a court with my name on it.

Made for Dartmouth's DALI 26F development challenge.

## Play

**[PLAY GREENLIGHT](https://jerelclark2-bit.github.io/Greenlight_dali/)** — the web version (GitHub Pages needs to be enabled first).

Want to play offline? Download **[Greenlight.html](Greenlight.html)** using GitHub's **Download raw file** option and open it in your browser. No install, no Wi-Fi, no setup.

## Controls

| | Keys |
| --- | --- |
| Move the shooter | A / D |
| Shoot | Hold S, release on green |
| Move the defender (2 player) | ← / → |
| Go for the block | Space |
| Pause | Esc |

**Practice:** no clock, just you and the hoop.

**2 players:** switch sides after every shot. Five attempts each. Corner shots count for three.

You can also use the buttons under the court on a touchscreen.

## Running the project

You'll need Node.js 18+ if you want to build or run tests, but there's nothing to install.

```bash
npm test
npm run build
python3 -m http.server 8000 --directory dist
```

Then open `http://localhost:8000`.

The game runs on **JavaScript + Three.js**. The court, players, hoop, and graphics are put together in code. I kept the game rules separate from the 3D stuff so I could test shooting, scoring, and blocks without opening a browser.

`dist/` is the browser version. `Greenlight.html` is the complete one-file offline version. `tests/` has the rule tests, and `docs/` has development and submission notes.

## Credits

A project by **Jerel Clark**. Built with AI assistance and my gameplay and visual direction. Three.js 0.170.0 is MIT licensed; see [the license](dist/vendor/THREE-LICENSE.txt).

No actual Friv art or assets were used. Just a little inspiration from that era.
