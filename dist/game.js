import * as THREE from './vendor/three.module.js';
import { SHOT, clamp, gradeRelease, blockContact, shotValue, nextPossession } from './rules.js';

const $ = id => document.getElementById(id);
const keys = new Set();
const state = { mode:'practice', started:false, paused:false, help:false, over:false, phase:'ready', time:0, charge:0, x:0, dx:0, jump:0, jumpTime:0, cooldown:0, shots:0, made:0, streak:0, best:0, scores:[0,0], turn:0, feedbackUntil:0, shot:null, sound:false };
try { state.best = Number(localStorage.getItem('greenlight-best')) || 0; } catch {}
let audioContext;
function sound(type) {
  if(!state.sound) return;
  try {
    audioContext ??= new (window.AudioContext || window.webkitAudioContext)();
    audioContext.resume();
    const notes = type==='make' ? [660,880,1320] : type==='block' ? [110,75] : [180];
    notes.forEach((hz,i)=>{const osc=audioContext.createOscillator(), gain=audioContext.createGain(), t=audioContext.currentTime+i*.07;osc.type=type==='make'?'sine':'triangle';osc.frequency.setValueAtTime(hz,t);gain.gain.setValueAtTime(.065,t);gain.gain.exponentialRampToValueAtTime(.001,t+.18);osc.connect(gain).connect(audioContext.destination);osc.start(t);osc.stop(t+.2);});
  } catch {}
}
let renderer;
try { renderer = new THREE.WebGLRenderer({antialias:true,alpha:false}); } catch { $('webglError').hidden=false; }
if(renderer) boot();

function boot() {
renderer.setPixelRatio(Math.min(devicePixelRatio,2));
renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;
renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.NoToneMapping;renderer.toneMappingExposure=1;
$('court').appendChild(renderer.domElement);
const scene = new THREE.Scene();scene.background=new THREE.Color('#97dcf5');scene.fog=new THREE.FogExp2('#97dcf5',.012);
const camera = new THREE.PerspectiveCamera(43,1,.1,160);
const ambient=new THREE.HemisphereLight('#ffffff','#728462',2.2);scene.add(ambient);
const key=new THREE.DirectionalLight('#fff6d4',2);key.position.set(-5,14,5);key.castShadow=true;key.shadow.mapSize.set(2048,2048);key.shadow.camera.left=-16;key.shadow.camera.right=16;key.shadow.camera.top=16;key.shadow.camera.bottom=-16;key.shadow.normalBias=.035;scene.add(key);
const rimLight=new THREE.DirectionalLight('#ffffff',.7);rimLight.position.set(7,8,-8);scene.add(rimLight);
// Flat lighting and a small color ramp give the court its old browser-game look.
const ramp=new THREE.DataTexture(new Uint8Array([100,180,255]),3,1,THREE.RedFormat);ramp.needsUpdate=true;ramp.minFilter=THREE.NearestFilter;ramp.magFilter=THREE.NearestFilter;
const mat=(color,extra={})=>{const {roughness,metalness,...options}=extra;return new THREE.MeshToonMaterial({color,gradientMap:ramp,...options});};
const dark=mat('#39455f'),metal=mat('#39455f',{metalness:.7,roughness:.4}),cream=mat('#fff4d4'),lime=mat('#b9ef42'),orange=mat('#ff7d24'),skin=mat('#9b6645');
function mesh(geo,material,x=0,y=0,z=0,parent=scene){const m=new THREE.Mesh(geo,material);m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;parent.add(m);return m;}
function box(w,h,d,material,x,y,z,parent=scene){return mesh(new THREE.BoxGeometry(w,h,d),material,x,y,z,parent);}
function rod(a,b,r,material,parent=scene){const start=new THREE.Vector3(...a),end=new THREE.Vector3(...b);const m=mesh(new THREE.CylinderGeometry(r,r,start.distanceTo(end),8),material,0,0,0,parent);m.position.copy(start).add(end).multiplyScalar(.5);m.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),end.sub(start).normalize());return m;}
function line(points,color='#c4d3ac',parent=scene){const g=new THREE.BufferGeometry().setFromPoints(points.map(p=>new THREE.Vector3(...p)));const m=new THREE.Line(g,new THREE.LineBasicMaterial({color}));parent.add(m);return m;}
function texture(draw,w=1024,h=1024){const c=document.createElement('canvas');c.width=w;c.height=h;draw(c.getContext('2d'),w,h);const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;t.anisotropy=renderer.capabilities.getMaxAnisotropy();return t;}
let seed=34;function rand(){seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;}
const courtTex=texture((c,w,h)=>{
 c.fillStyle='#5263ab';c.fillRect(0,0,w,h);c.fillStyle='#5295ce';c.fillRect(84,72,856,880);
 c.fillStyle='#f6bd53';c.fillRect(377,73,270,365);c.fillStyle='#f3a34b';c.fillRect(387,82,250,347);
 for(let i=0;i<26000;i++){c.fillStyle=rand()>.5?'#ffffff07':'#00000008';c.fillRect(rand()*w,rand()*h,2,2);}
 c.strokeStyle='#fff4d8';c.lineWidth=6;c.strokeRect(84,72,856,880);c.strokeRect(377,72,270,365);
 c.beginPath();c.arc(512,437,135,0,Math.PI);c.stroke();c.setLineDash([13,12]);c.beginPath();c.arc(512,437,135,Math.PI,2*Math.PI);c.stroke();c.setLineDash([]);
 c.beginPath();c.moveTo(160,72);c.lineTo(160,220);c.bezierCurveTo(160,750,864,750,864,220);c.lineTo(864,72);c.stroke();
 c.beginPath();c.moveTo(84,877);c.lineTo(940,877);c.stroke();c.beginPath();c.arc(512,877,95,Math.PI,Math.PI*2);c.stroke();
 c.textAlign='center';c.font='bold 37px Trebuchet MS, Arial';c.lineWidth=5;c.strokeStyle='#293257';c.strokeText('JEREL CLARK',512,990);c.fillStyle='#fff3ba';c.fillText('JEREL CLARK',512,990);
 c.save();c.translate(512,760);c.beginPath();c.arc(0,0,60,0,Math.PI*2);c.fillStyle='#f8bb44';c.fill();c.strokeStyle='#fff4d8';c.lineWidth=6;c.stroke();c.font='bold italic 57px Arial';c.fillStyle='#3b4072';c.fillText('JC',0,20);c.restore();
},1024,1024);
box(21,.5,23,dark,0,-.35,0);
const floor=mesh(new THREE.PlaneGeometry(18,20),mat('#ffffff',{map:courtTex}),0,-.08,0);floor.rotation.x=-Math.PI/2;
// Court edging and warm strip lights.
box(.08,.06,20,lime,-9,.01,0);box(.08,.06,20,lime,9,.01,0);
const glow=mat('#fff1b7',{emissive:'#ffd06a',emissiveIntensity:.1});
box(21,.04,.04,glow,0,-.09,11.4);
// Chain-link perimeter, with open foreground for the camera.
for(let x=-10;x<=10;x+=2){box(.08,3.1,.08,metal,x,1.25,-10.5);}
for(let z=-10;z<=8;z+=2){box(.08,3.1,.08,metal,-10,1.25,z);box(.08,3.1,.08,metal,10,1.25,z);}
for(let y=0;y<2.9;y+=.28){line([[-10,y,-10.5],[10,y,-10.5]],'#536c83');line([[-10,y,-10.5],[-10,y,8]],'#536c83');line([[10,y,-10.5],[10,y,8]],'#536c83');}
for(let x=-10;x<=10;x+=.32)line([[x,-.1,-10.5],[x,2.8,-10.5]],'#536c83');
for(let z=-10.5;z<=8;z+=.32){line([[-10,-.1,z],[-10,2.8,z]],'#536c83');line([[10,-.1,z],[10,2.8,z]],'#536c83');}
box(20,.09,.09,metal,0,2.9,-10.5);
// Distant skyline with deterministic window patterns.
for(let i=0;i<29;i++){
 const x=(i-14)*3.2,z=-19-rand()*16,h=3+rand()*15,w=1.8+rand()*2;
 box(w,h,2+rand()*3,mat(new THREE.Color().setHSL(.58+rand()*.12,.24,.5+rand()*.17)),x,h/2-1,z);
 for(let yy=1;yy<h-1;yy+=1.2)for(let xx=-w/2+.4;xx<w/2;xx+=.7)if(rand()>.52)box(.23,.45,.025,mat('#e8efdc'),x+xx,yy,z+1.62);
}
// Puffy clouds and park trees keep the skyline cheerful and low-poly.
const cloud=mat('#ffffff');
for(const [x,y,z] of [[-16,13,-29],[5,17,-36],[21,12,-25]]){
 for(let j=-1;j<=1;j++)mesh(new THREE.SphereGeometry(j===0?2.2:1.6,10,7),cloud,x+j*2,y+(j===0?.4:0),z);
}
for(const [x,z] of [[-13,-10],[13,-13],[-13,4],[14,1]]){
 box(.4,3,.4,mat('#95643e'),x,1,z);
 mesh(new THREE.IcosahedronGeometry(2.2,1),mat('#73b855'),x,3.7,z);
 mesh(new THREE.IcosahedronGeometry(1.6,1),mat('#99cf56'),x-.5,5,z);
}
// Benches, equipment, and floodlights.
for(const x of [-8,8]){
 box(.65,.15,3.2,mat('#987b56'),x,.5,-5);box(.1,.7,3.2,metal,x+(x<0?-.3:.3),.9,-5);
 for(const z of [-6,-4])box(.5,.55,.12,metal,x,.2,z);
}
for(const x of [-9,9])for(const z of [-9,7]){
 box(.13,8,.13,metal,x,3.8,z);box(1.7,.18,.4,metal,x,7.8,z);box(1.5,.05,.34,glow,x,7.69,z);
}
box(.5,.65,.5,mat('#b5c0a5'),-8,.3,1);box(.55,.08,.55,dark,-8,.65,1);
// Basket, transparent backboard, regulation-height rim, hanging net.
box(.22,4,.22,metal,0,1.9,-6.8);rod([0,3.8,-6.8],[0,3.8,-6.1],.1,metal);
box(2.3,1.4,.11,mat('#a8d0c3',{transparent:true,opacity:.29,roughness:.15,metalness:.2}),0,3.7,-6.1);
for(const x of [-1.15,1.15])box(.06,1.44,.1,cream,x,3.7,-6.06);
for(const y of [3,4.4])box(2.35,.055,.1,cream,0,y,-6.06);
line([[-.42,3.15,-6.02],[-.42,3.7,-6.02],[.42,3.7,-6.02],[.42,3.15,-6.02],[-.42,3.15,-6.02]],'#eff1dd');
box(.22,.09,.35,orange,0,3.05,-5.92);
const rim=mesh(new THREE.TorusGeometry(.46,.04,10,40),orange,0,3.05,-5.5);rim.rotation.x=Math.PI/2;
const net=new THREE.Group();net.position.set(0,3.03,-5.5);scene.add(net);
for(let i=0;i<14;i++){
 const a=i/14*Math.PI*2,b=(i+1)/14*Math.PI*2;
 line([[Math.cos(a)*.45,0,Math.sin(a)*.45],[Math.cos(b)*.3,-.57,Math.sin(b)*.3]],'#dddcc3',net);
 line([[Math.cos(b)*.45,0,Math.sin(b)*.45],[Math.cos(a)*.3,-.57,Math.sin(a)*.3]],'#dddcc3',net);
}
for(let j=1;j<=3;j++){const r=.45-j*.05;const ring=mesh(new THREE.TorusGeometry(r,.008,4,28),cream,0,-j*.18,0,net);ring.rotation.x=Math.PI/2;ring.castShadow=false;}
const signTex=texture((c,w,h)=>{c.fillStyle='#6b419b';c.fillRect(0,0,w,h);c.strokeStyle='#ffd057';c.lineWidth=10;c.strokeRect(5,5,w-10,h-10);c.fillStyle='#fff0ac';c.textAlign='center';c.font='bold 43px Trebuchet MS, Arial';c.fillText('JEREL’S COURT',w/2,65);c.fillStyle='#ffffff';c.font='bold 20px Arial';c.fillText('PICK-UP BASKETBALL',w/2,100);},512,128);
box(4,.98,.08,mat('#ffffff',{map:signTex}),-4.3,2.1,-10.35);
// Players use joint pivots, so animations do not allocate new meshes each frame.
function player(color,number){
 const g=new THREE.Group();scene.add(g);const jersey=mat(color),black=mat('#152521');
 mesh(new THREE.CylinderGeometry(.26,.32,.65,10),jersey,0,1.25,0,g);
 mesh(new THREE.SphereGeometry(.28,12,9),skin,0,1.91,0,g);mesh(new THREE.SphereGeometry(.285,12,8,0,Math.PI*2,0,1.2),black,0,1.94,0,g);
 mesh(new THREE.CylinderGeometry(.1,.11,.19,8),skin,0,1.65,0,g);
 box(.59,.35,.35,black,0,.82,0,g);
 const arms=[],legs=[];
 for(const side of [-1,1]){
  const arm=new THREE.Group();arm.position.set(side*.33,1.48,0);g.add(arm);rod([0,0,0],[side*.07,-.51,0],.105,skin,arm);mesh(new THREE.SphereGeometry(.112,8,8),skin,side*.07,-.53,0,arm);arms.push(arm);
  const leg=new THREE.Group();leg.position.set(side*.17,.75,0);g.add(leg);rod([0,0,0],[0,-.55,0],.115,skin,leg);box(.21,.17,.38,cream,0,-.66,-.04,leg);legs.push(leg);
 }
 const num=texture((c,w,h)=>{c.clearRect(0,0,w,h);c.fillStyle='#26304b';c.textAlign='center';c.font='bold 24px Arial';c.fillText(number==='01'?'CLARK':'GUEST',64,29);c.font='bold 72px Arial';c.fillText(number,64,106);},128,128);
 mesh(new THREE.PlaneGeometry(.45,.45),new THREE.MeshBasicMaterial({map:num,transparent:true}),0,1.3,.292,g);
 // Thin silhouette outlines mimic classic Flash-era cartoon characters.
 const parts=[];g.traverse(o=>{if(o.isMesh && !o.material.transparent)parts.push(o)});
 const outlineMaterial=new THREE.MeshBasicMaterial({color:'#28314a',side:THREE.BackSide});
 for(const part of parts){const edge=new THREE.Mesh(part.geometry,outlineMaterial);edge.scale.setScalar(1.055);part.add(edge);}
 const marker=mesh(new THREE.RingGeometry(.53,.59,48),new THREE.MeshBasicMaterial({color,transparent:true,opacity:.8,side:THREE.DoubleSide}),0,-.04,0,g);marker.rotation.x=-Math.PI/2;
 return {g,arms,legs,marker};
}
const shooter=player('#b8f85b','01'),defender=player('#fa7659','02');shooter.g.position.set(0,0,3.5);defender.g.position.set(0,0,2.05);defender.g.rotation.y=Math.PI;
const ball=new THREE.Group();scene.add(ball);mesh(new THREE.SphereGeometry(.235,24,16),mat('#d86c2c',{roughness:.95}),0,0,0,ball);
const seamMat=new THREE.MeshBasicMaterial({color:'#442d1d'});
for(const rotation of [[0,0,0],[Math.PI/2,0,0],[0,Math.PI/2,0]]){const seam=mesh(new THREE.TorusGeometry(.236,.006,4,48),seamMat,0,0,0,ball);seam.rotation.set(...rotation);}
const ballShadow=mesh(new THREE.CircleGeometry(.24,32),new THREE.MeshBasicMaterial({color:'#0a1d14',transparent:true,opacity:.25,depthWrite:false}),0,-.065,3.5);ballShadow.rotation.x=-Math.PI/2;
const sparks=[];for(let i=0;i<20;i++){const m=mesh(new THREE.SphereGeometry(.035,5,4),lime);m.visible=false;sparks.push(m);}
let sparkleTime=-10, last=performance.now(), feedbackColor='';
function resize(){const w=$('court').clientWidth,h=$('court').clientHeight;renderer.setSize(w,h);camera.aspect=w/h;camera.position.set(w/h<1.1?11:12,w/h<1.1?13:11.8,w/h<1.1?21:17.8);camera.fov=w/h<.8?54:43;camera.lookAt(0,.9,-.4);camera.updateProjectionMatrix();}
new ResizeObserver(resize).observe($('court'));resize();
function feedback(title,detail,color='#b8f85b',duration=1.8){$('feedbackTitle').textContent=title;$('feedbackDetail').textContent=detail;$('feedback').style.color=color;$('feedback').classList.add('show');state.feedbackUntil=state.time+duration;feedbackColor=color;}
function hud(){
 const duel=state.mode==='duel';$('name0').textContent=duel?'PLAYER 1':'MADE';$('name1').textContent=duel?'PLAYER 2':'ATTEMPTS';
 $('score0').textContent=String(duel?state.scores[0]:state.made).padStart(2,'0');$('score1').textContent=String(duel?state.scores[1]:state.shots).padStart(2,'0');
 $('scoreLabel').textContent=duel?'2 PLAYERS':'FREE PLAY';$('round').textContent=duel?`${Math.min(state.shots+1,10)} / 10 · P${state.turn+1} SHOOTS`:'PRACTICE';
 $('shooterLabel').textContent=duel?`PLAYER ${state.turn+1} · SHOOTER`:'YOUR SHOT';$('defenderLabel').textContent=duel?`PLAYER ${2-state.turn} · DEFENDER`:'DEFENDER · 2P MODE';
 $('statLabel').textContent=duel?'SHOTS EACH':'BEST STREAK';$('best').textContent=duel?'5':state.best;
 $('modeDescription').innerHTML=duel?'Take turns! Five shots each.':'Warm up. Hit the green zone!';
 $('practice').classList.toggle('selected',!duel);$('duel').classList.toggle('selected',duel);defender.g.visible=duel;
}
function meter(progress=0){$('needle').style.left=progress*100+'%';$('meterFill').style.width=progress*100+'%';$('releaseTime').textContent=(progress*SHOT.duration).toFixed(2)+'s';document.querySelector('.meter-track').classList.toggle('green',Math.abs(progress-SHOT.target)<=SHOT.green);}
function reset(mode=state.mode){
 Object.assign(state,{mode,phase:'ready',charge:0,x:0,dx:0,jump:0,jumpTime:0,cooldown:0,shots:0,made:0,streak:0,scores:[0,0],turn:0,shot:null,over:false,paused:false});keys.clear();$('endModal').hidden=true;$('pauseModal').hidden=true;$('feedback').classList.remove('show');meter();hud();$('meterHint').textContent='HOLD S. RELEASE ON GREEN.';
 if(state.started) feedback(mode==='duel'?'PLAYER 1, YOU’RE UP':'PRACTICE',mode==='duel'?'PLAYER 2 DEFENDS · SWITCH AFTER EACH SHOT':'HOLD S TO CHARGE · RELEASE ON GREEN', '#e7eedc',1.8);
}
function canPlay(){return state.started&&!state.paused&&!state.help&&!state.over;}
function beginCharge(){if(!canPlay()||state.phase!=='ready')return;state.phase='charging';state.charge=0;$('feedback').classList.remove('show');$('meterHint').textContent='RELEASE INSIDE THE GREEN WINDOW';}
function release(){
 if(!canPlay()||state.phase!=='charging')return;
 const contest=state.mode==='duel'?clamp(1-Math.abs(state.x-state.dx)/1.7,0,1):0;
 const grade=gradeRelease(state.charge,contest),value=shotValue(state.x);
 const from=new THREE.Vector3(state.x,2.35,3.05),flight=1.12;
 const miss=grade.made?0:Math.sign(grade.error||1)*(.7+Math.abs(grade.error)*3);
 const target=new THREE.Vector3(miss,3.05,-5.5+(grade.made?0:Math.abs(grade.error)*2));
 state.shot={grade,value,t:0,flight,from,pos:from.clone(),velocity:target.clone().sub(from).divideScalar(flight),resolved:false,blocked:false,falling:false};
 state.shot.velocity.y+=.5*9.8*flight;state.phase='flight';meter(grade.progress);$('meterHint').textContent=grade.label;feedback(grade.label,grade.perfect?'PERFECT TIMING':`${Math.round(Math.abs(grade.error)*SHOT.duration*1000)} MS ${grade.error<0?'EARLY':'LATE'}`,grade.perfect?'#b8f85b':'#f0c38c',.9);sound('shoot');
}
function jump(){if(!canPlay()||state.mode!=='duel'||state.cooldown>0||state.jumpTime>0)return;state.jumpTime=.001;state.cooldown=1.05;}
function settleShot(made,blocked=false){
 const s=state.shot;if(s.resolved)return;s.resolved=true;state.shots++;
 if(made){state.made++;state.scores[state.turn]+=s.value;state.streak++;if(state.streak>state.best){state.best=state.streak;try{localStorage.setItem('greenlight-best',state.best)}catch{}}sparkleTime=state.time;feedback(s.grade.perfect?'SWISH!':'NICE SHOT!',`+${s.value} POINTS · ${state.mode==='practice'?state.streak+' IN A ROW':'PLAYER '+(state.turn+1)}`);sound('make');}
 else {state.streak=0;feedback(blocked?'BLOCKED!':'MISSED!',blocked?'BLOCKED · DEFENSE WINS THIS ONE':s.grade.label+' · FIND THE GREEN WINDOW','#f0b485');sound(blocked?'block':'miss');}
 hud();
}
function finishPossession(){
 state.phase='ready';state.shot=null;state.charge=0;meter();$('meterHint').textContent='HOLD S. RELEASE ON GREEN.';
 if(state.mode==='duel'){
  if(state.shots>=10){state.over=true;$('winner').textContent=state.scores[0]===state.scores[1]?'Evenly matched.':`Player ${state.scores[0]>state.scores[1]?1:2} wins.`;$('finalScore').textContent=`${state.scores[0]} – ${state.scores[1]} · Five shots each. Run it back?`;$('endModal').hidden=false;keys.clear();}
  else{state.turn=nextPossession(state.shots);state.x=0;state.dx=0;state.jump=0;state.jumpTime=0;state.cooldown=0;keys.clear();feedback(`PLAYER ${state.turn+1}, YOU’RE UP`,`PLAYER ${2-state.turn} DEFENDS · SWITCH CONTROLS`,'#e7eedc',1.7);}
 }hud();
}
function pause(){if(!state.started||state.over||state.help)return;state.paused=!state.paused;keys.clear();if(state.phase==='charging'){state.phase='ready';state.charge=0;meter();}$('pauseModal').hidden=!state.paused;}
function press(code){if(keys.has(code))return;keys.add(code);if(code==='KeyS')beginCharge();if(code==='Space')jump();}
function lift(code){keys.delete(code);if(code==='KeyS')release();}
window.addEventListener('keydown',e=>{if(['KeyS','KeyA','KeyD','ArrowLeft','ArrowRight','Space','Escape'].includes(e.code)){if(e.target.closest('button')&&e.code==='Space'&&!canPlay())return;e.preventDefault();if(e.code==='Escape'&&!e.repeat){if(state.help)closeHelp();else pause();return;}if(!e.repeat)press(e.code);}});
window.addEventListener('keyup',e=>lift(e.code));
window.addEventListener('blur',()=>{keys.clear();if(canPlay())pause();});
document.addEventListener('visibilitychange',()=>{if(document.hidden&&canPlay())pause();});
document.querySelectorAll('[data-hold]').forEach(b=>{b.addEventListener('pointerdown',e=>{e.preventDefault();b.setPointerCapture(e.pointerId);press(b.dataset.hold);});b.addEventListener('pointerup',e=>{e.preventDefault();lift(b.dataset.hold)});b.addEventListener('pointercancel',()=>{keys.delete(b.dataset.hold);if(state.phase==='charging'){state.phase='ready';state.charge=0;meter();}});});
$('start').onclick=()=>{state.started=true;$('intro').hidden=true;document.body.classList.add('playing');keys.clear();};
$('practice').onclick=()=>reset('practice');$('duel').onclick=()=>reset('duel');$('reset').onclick=()=>reset();$('rematch').onclick=()=>reset();$('resume').onclick=()=>pause();
$('help').onclick=()=>{state.help=true;keys.clear();if(state.phase==='charging'){state.phase='ready';state.charge=0;meter();}$('helpModal').hidden=false;};
function closeHelp(){state.help=false;$('helpModal').hidden=true;}$('closeHelp').onclick=closeHelp;$('helpDone').onclick=closeHelp;
$('audio').onclick=()=>{state.sound=!state.sound;$('audio').style.color=state.sound?'#b8f85b':'';$('audio').setAttribute('aria-label',state.sound?'Mute sound':'Enable sound');sound('make');};
$('fullscreen').onclick=async()=>{try{if(document.fullscreenElement)await document.exitFullscreen();else await document.documentElement.requestFullscreen();}catch{feedback('GO BIG.', 'USE YOUR BROWSER’S FULLSCREEN OPTION','#e7eedc');}};
reset();
function animate(now){
 requestAnimationFrame(animate);const dt=Math.min((now-last)/1000,.035);last=now;
 const active=canPlay();if(active)state.time+=dt;
 if(active){
  if(state.phase==='ready')state.x=clamp(state.x+((keys.has('KeyD')?1:0)-(keys.has('KeyA')?1:0))*3.5*dt,-4.8,4.8);
  if(state.mode==='duel'){state.dx=clamp(state.dx+((keys.has('ArrowRight')?1:0)-(keys.has('ArrowLeft')?1:0))*4.6*dt,-5,5);state.cooldown=Math.max(0,state.cooldown-dt);if(state.jumpTime>0){state.jumpTime+=dt;state.jump=Math.max(0,4.6*state.jumpTime-5.8*state.jumpTime**2);if(state.jumpTime>.8){state.jumpTime=0;state.jump=0;}}}
  if(state.phase==='charging'){state.charge=Math.min(SHOT.duration,state.charge+dt);meter(state.charge/SHOT.duration);if(state.charge>=SHOT.duration)release();}
  if(state.shot){
   const s=state.shot;s.t+=dt;
   // Ballistic integration; split the flight at the hoop for exact scoring resolution.
   if(!s.falling){s.pos.copy(s.from).addScaledVector(s.velocity,s.t);s.pos.y-=4.9*s.t*s.t;
    if(state.mode==='duel'&&!s.blocked&&blockContact(s.pos,{x:state.dx,z:2.05},state.jump)){
     s.blocked=true;s.falling=true;s.velocity.set((s.pos.x-state.dx)*4+1,2.2,4.2);settleShot(false,true);
    } else if(s.t>=s.flight){s.falling=true;s.velocity.y-=9.8*s.t;settleShot(s.grade.made);if(s.grade.made){s.velocity.x=0;s.velocity.z=0;s.pos.x=0;s.pos.z=-5.5;}else{s.velocity.x+=s.grade.error<0?-1.5:1.5;s.velocity.y=1.9;}}
   }else{s.velocity.y-=9.8*dt;s.pos.addScaledVector(s.velocity,dt);if(s.pos.y<.24){s.pos.y=.24;s.velocity.y=Math.abs(s.velocity.y)*.48;s.velocity.x*=.8;s.velocity.z*=.8;}}
   ball.position.copy(s.pos);ball.rotation.x+=dt*7;ball.rotation.z+=dt*2;
   if(s.t>2.65)finishPossession();
  }
  if(state.time>state.feedbackUntil)$('feedback').classList.remove('show');
 }
 const t=state.time;
 shooter.g.position.set(state.x,state.phase==='flight'?Math.max(0,Math.sin(Math.min(state.shot?.t||0,.65)/.65*Math.PI))*.35:0,3.5);
 const raised=state.phase==='charging'?clamp(state.charge/.35,0,1):state.phase==='flight'?Math.max(0,1-(state.shot?.t||0)/.8):0;
 shooter.arms[0].rotation.x=raised*2.7;shooter.arms[1].rotation.x=raised*2.7;
 shooter.arms[0].rotation.z=-.25+raised*.15;shooter.arms[1].rotation.z=.25-raised*.15;
 const walking=active&&state.phase==='ready'&&(keys.has('KeyA')||keys.has('KeyD'));
 shooter.legs[0].rotation.x=walking?Math.sin(t*13)*.4:0;shooter.legs[1].rotation.x=walking?-Math.sin(t*13)*.4:0;
 defender.g.position.set(state.dx,state.jump,2.05);defender.arms[0].rotation.z=state.jumpTime>0?-2.7:-.9;defender.arms[1].rotation.z=state.jumpTime>0?2.7:.9;
 const dWalking=active&&(keys.has('ArrowLeft')||keys.has('ArrowRight'));defender.legs[0].rotation.x=dWalking?Math.sin(t*15)*.35:0;defender.legs[1].rotation.x=dWalking?-Math.sin(t*15)*.35:0;
 defender.marker.position.y=-state.jump-.04;shooter.marker.position.y=-shooter.g.position.y-.04;
 if(!state.shot){ball.position.set(state.x+.3*(1-raised),state.phase==='charging'?1.2+raised*1.1:.5+Math.abs(Math.sin(t*5))* .75,3.28-raised*.2);ball.rotation.x=t*2;}
 ballShadow.position.x=ball.position.x;ballShadow.position.z=ball.position.z;ballShadow.scale.setScalar(1+ball.position.y*.12);ballShadow.material.opacity=.28/(1+ball.position.y*.2);
 const since=t-sparkleTime;net.scale.y=since<.5?1+Math.sin(since*22)*.13:1;
 sparks.forEach((p,i)=>{p.visible=since>=0&&since<.85;if(p.visible){const a=i/20*Math.PI*2;p.position.set(Math.cos(a)*since*2,3.1+since*(1.5+(i%3)*.4)-since*since*3,-5.5+Math.sin(a)*since*2);p.scale.setScalar(1-since/.85);}});
 $('distance').textContent=shotValue(state.x)+'-POINT RANGE';
 if(state.mode==='duel')$('defenderLabel').textContent=`PLAYER ${2-state.turn} · ${state.cooldown>0?'RECOVERING':'DEFENDER'}`;
 renderer.render(scene,camera);
}
requestAnimationFrame(animate);
}
