# GREENLIGHT 🏀

**Jerel's Court. Two players, one keyboard, and a whole lot of jump shots.**

Remember those little browser games you played instead of doing homework? That's the vibe. GREENLIGHT is a small 3D basketball game with a shot meter, a defender who can actually block you, and a court with my name on it.

Made for Dartmouth's DALI 26F development challenge.

## Play

**[PLAY GREENLIGHT](https://jerelclark2-bit.github.io/Greenlight_dali/)** — play in your browser.

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

## Under the hood

This started with one question: can shooting a basketball feel good with just one key?

The game keeps the rules separate from the 3D scene. A possession goes through *ready → charging → ball in flight → reset*. `dist/rules.js` handles release grades, the 2-point/3-point boundary, blocking checks, and whose turn comes next. `dist/game.js` handles input, animation, and rendering.

A full shot-meter cycle lasts 1.25 seconds, and the ideal release is about 0.85 seconds in. The green window is deliberately narrow; the timing rules are deterministic and covered by `npm test`.

**Tradeoff:** this is simplified arcade physics, not a realistic basketball simulation. I'd rather have shots that feel responsive than make someone wait through a physics lecture before playing.

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
