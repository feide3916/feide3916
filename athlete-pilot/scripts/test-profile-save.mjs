import fs from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
import assert from 'node:assert/strict';

const source=fs.readFileSync('app/studio.tsx','utf8');
const start=source.indexOf('async function saveProfile('),end=source.indexOf('\nconst templates=',start);
assert.ok(start>0&&end>start);
const compiled=ts.transpileModule(source.slice(start,end),{compilerOptions:{target:ts.ScriptTarget.ES2022}}).outputText;
let finishAuto;
const pending=new Promise(resolve=>{finishAuto=resolve;});
const old={athletes:[{id:'old',name:'已有运动员'}],sessions:[],exercises:[],tests:[]};
const afterAuto={...old,athletes:[...old.athletes,{id:'other',name:'另一位教练刚加的运动员'}]};
let submitted,closed=false,selected='';
const context=vm.createContext({
 accessRole:'owner',pendingSave:{current:pending},live:{current:{data:old}},saving:{current:false},
 modal:'运动员',editingAthlete:'',newProfileId:{current:'new-athlete'},cloudBase:{current:old},profileBase:{current:undefined},
 persist:async data=>{submitted=data;return true;},setAthlete:id=>{selected=id;},setModal:value=>{closed=value==='';}
});
vm.runInContext(compiled+'\nthis.saveProfile=saveProfile;',context);
const result=context.saveProfile({name:'新运动员',sport:'篮球',goal:'',note:''});
assert.equal(submitted,undefined);
context.live.current.data=afterAuto;
context.cloudBase.current=afterAuto;
finishAuto(true);
assert.equal(await result,true);
assert.equal(submitted.athletes.map(a=>a.id).join(','),'old,other,new-athlete');
assert.equal(selected,'new-athlete');
assert.ok(closed);
assert.ok(!source.includes("if(m==='运动员'&&dirty)"));
console.log('Adding an athlete waits for plan autosave, preserves concurrent profiles, and is not blocked by an unsaved plan.');
