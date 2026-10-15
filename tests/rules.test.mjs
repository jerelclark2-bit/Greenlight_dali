import test from 'node:test';
import assert from 'node:assert/strict';
import {SHOT,gradeRelease,blockContact,shotValue,nextPossession} from '../dist/rules.js';

test('a centered release scores even under close pressure, unless separately blocked',()=>{
 for(const contest of [0,.5,1]){const result=gradeRelease(SHOT.target*SHOT.duration,contest);assert.equal(result.perfect,true);assert.equal(result.made,true);}
});
test('nearly green is good when open and misses under pressure',()=>{
 const time=(SHOT.target+.08)*SHOT.duration;
 assert.equal(gradeRelease(time,0).made,true);
 assert.equal(gradeRelease(time,.8).made,false);
});
test('very early and fully overcharged releases miss',()=>{
 assert.equal(gradeRelease(0).made,false);assert.equal(gradeRelease(2).made,false);
 assert.equal(gradeRelease(0).label,'EARLY');assert.equal(gradeRelease(2).label,'LATE');
});
test('every point inside the green window is accurate',()=>{
 for(let p=SHOT.target-SHOT.green+.00001;p<SHOT.target+SHOT.green;p+=.001){assert.equal(gradeRelease(p*SHOT.duration,1).made,true);}
});
test('blocks require horizontal proximity, hand height, and a jump',()=>{
 const d={x:0,z:2.05};
 assert.equal(blockContact({x:.1,y:3,z:2.1},d,.7),true);
 assert.equal(blockContact({x:2,y:3,z:2.1},d,.7),false);
 assert.equal(blockContact({x:0,y:4.5,z:2.1},d,.7),false);
 assert.equal(blockContact({x:0,y:2.4,z:2.1},d,0),false);
 assert.equal(blockContact({x:0,y:.5,z:2.1},d,.7),false);
});
test('corners are threes and ten alternating possessions give five turns each',()=>{
 assert.equal(shotValue(0),2);assert.equal(shotValue(-3),3);assert.equal(shotValue(3),3);
 const turns=Array.from({length:10},(_,i)=>nextPossession(i));assert.equal(turns.filter(x=>x===0).length,5);assert.equal(turns.filter(x=>x===1).length,5);
});
