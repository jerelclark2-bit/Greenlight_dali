/** Build an offline, single-file HTML executable; no bundler or network needed. */
import {readFile,writeFile,mkdir} from 'node:fs/promises';
const read = path => readFile(new URL('../'+path,import.meta.url),'utf8');
const inlineModule = source => 'data:text/javascript;base64,'+Buffer.from(source).toString('base64');
const [html,css,game,rules,three] = await Promise.all(['dist/index.html','dist/style.css','dist/game.js','dist/rules.js','dist/vendor/three.module.js'].map(read));
let code=game.replace("'./vendor/three.module.js'",JSON.stringify(inlineModule(three))).replace("'./rules.js'",JSON.stringify(inlineModule(rules)));
// Offline build intentionally uses local system fonts and does not need a server.
const offlineCss=css.replace(/@import[^;]+;/,'');
const standalone=html.replace('<link rel="stylesheet" href="./style.css">',`<style>${offlineCss}</style>`).replace('<script type="module" src="./game.js"></script>',`<script type="module">${code.replace(/<\/script/gi,'<\\/script')}</script>`).replace('<a href="https://github.com/jerelclark2-bit/Greenlight_dali" target="_blank" rel="noopener noreferrer">SOURCE CODE ↗</a>','<span>OFFLINE EDITION</span>').replace('href="./" aria-label="Greenlight home"','href="#" aria-label="Greenlight home"');
await mkdir(new URL('../dist/downloads/',import.meta.url),{recursive:true});
await writeFile(new URL('../dist/downloads/Greenlight.html',import.meta.url),standalone);
await writeFile(new URL('../Greenlight.html',import.meta.url),standalone);
console.log(`Offline build: dist/downloads/Greenlight.html (${Buffer.byteLength(standalone)} bytes)`);
