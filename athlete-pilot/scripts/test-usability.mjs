import fs from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
const req=createRequire(import.meta.url);
const compile=s=>ts.transpileModule(s,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,jsx:ts.JsxEmit.ReactJSX}}).outputText;
function load(file){const c=vm.createContext({exports:{},structuredClone,Date,JSON,Map});vm.runInContext(compile(fs.readFileSync(file,'utf8')),c);return c.exports;}
const storage=load('app/plan-storage.ts'),undo=load('app/plan-undo.ts');
const action=(id,load)=>({id,exercise:id,group:'A',note:'',sets:[{reps:'5',load},{reps:'4',load:'70'}]});
const p={id:'course',athlete:'athlete',date:'2026-10-15',title:'QA',status:'计划中',note:'original',items:[action('squat','60'),action('jump','0')]};
const first=storage.rememberPlan([],p,false,'tab-A');
const second=storage.rememberPlan([], {...p,note:'other page edit'},false,'tab-B');
const combined=storage.mergePlanBackups(first,second);assert.equal(combined.length,2);assert.equal(new Set(combined.map(storage.backupKey)).size,2);
const afterA=storage.rememberPlan(combined,{...p,note:'latest A'},false,'tab-A');assert.equal(afterA.length,2);assert.equal(afterA.find(b=>b.writerId==='tab-B').session.note,'other page edit');
assert.equal(storage.recoverableBackups(first,[],p).length,0);assert.equal(storage.recoverableBackups(first,[]).length,1);
const removed=undo.removePlanAction(p,'squat');assert.equal(removed.next.items.length,1);
const changed={...removed.next,note:'new feedback',items:[{...removed.next.items[0],note:'new jump cue'}]};
const restored=undo.restorePlanEdit(changed,removed.undo);assert.equal(restored.items[0].id,'squat');assert.equal(restored.items[1].note,'new jump cue');assert.equal(restored.note,'new feedback');assert.equal(p.items.length,2);
assert.equal(undo.restorePlanEdit({...changed,id:'another course'},removed.undo),null);
const removedSet=undo.removePlanSet(p,'squat',0);const updated={...removedSet.next,items:removedSet.next.items.map(i=>i.id==='squat'?{...i,sets:[{...i.sets[0],load:'75'}]}:i)};
const restoredSet=undo.restorePlanEdit(updated,removedSet.undo);assert.equal(restoredSet.items[0].sets[0].load,'60');assert.equal(restoredSet.items[0].sets[1].load,'75');assert.equal(undo.removePlanSet({...p,items:[{...p.items[0],sets:[p.items[0].sets[0]]}]},'squat',0),null);
// ExercisePicker must use its latest selection callback after async creation.
const states=[],refs=[];let si=0,ri=0;const react={useState:v=>{const i=si++;if(!(i in states))states[i]=v;return [states[i],n=>{states[i]=typeof n==='function'?n(states[i]):n}];},useRef:v=>{const i=ri++;return refs[i]??=( {current:v});},useId:()=> 'picker',useEffect:()=>{},useMemo:f=>f()};
const module={exports:{}};const require=id=>id==='react'?react:id==='react/jsx-runtime'?req(id):id==='./exercise-search'?{sortedExercises:a=>a,exerciseIndex:name=>({name,key:name,initials:name}),exerciseMatches:()=>false}:new Proxy({},{get:()=>()=>null});
vm.runInNewContext(`(function(require,module,exports){${compile(fs.readFileSync('app/exercise-picker.tsx','utf8'))}})`)(require,module,module.exports);
let resolveCreate,oldCalls=0,newCalls=0;const props={options:[],label:'动作',value:'new exercise',onSelect:()=>oldCalls++,onCreate:()=>new Promise(resolve=>{resolveCreate=resolve})};
const render=props=>{si=0;ri=0;return module.exports.default(props)};
function find(tree,predicate){if(!tree||typeof tree!=='object')return null;if(predicate(tree))return tree;for(const child of [tree.props?.children].flat(Infinity)){const result=find(child,predicate);if(result)return result;}return null;}
let tree=render(props);find(tree,e=>e.type==='input').props.onFocus();tree=render(props);find(tree,e=>e.props?.className==='picker-create').props.onClick();render({...props,onSelect:()=>newCalls++});resolveCreate(true);await new Promise(resolve=>setImmediate(resolve));assert.equal(oldCalls,0);assert.equal(newCalls,1);
console.log('Usability regressions passed: independent-tab backups retained; active draft not misreported; undo restores action/set without overwriting later edits; async new exercise uses latest plan callback.');
// A storage quota/security failure must produce a real warning, not a false local-save confirmation.
const studio=fs.readFileSync('app/studio.tsx','utf8');const bs=studio.indexOf('function backupPlan('),be=studio.indexOf('useEffect(',bs);let backupError='';
const backupContext=vm.createContext({...storage,structuredClone,Date,JSON,workspaceKey:{current:'qa-workspace'},writerId:{current:'tab-A'},backupsRef:{current:[]},live:{current:{data:{sessions:[p]}}},setBackups:()=>{},setLocalBackupError:m=>{backupError=m},localStorage:{getItem:()=>null,setItem:()=>{throw Error('quota')}}});
vm.runInContext(compile(studio.slice(bs,be))+'\nthis.keep=backupPlan;',backupContext);backupContext.keep(p);assert.ok(backupError.includes('无法保留'));
console.log('Local storage failure is surfaced without blocking in-memory editing.');
// Render the real template library for a read-only coach: browsing stays available, editing does not.
const {renderToStaticMarkup}=req('react-dom/server'),React=req('react');const tm={exports:{}};
const templateReq=id=>id==='react'||id==='react/jsx-runtime'?req(id):id==='lucide-react'?new Proxy({},{get:()=>()=>null}):{compareGroups:()=>0};
vm.runInNewContext(`(function(require,module,exports){${compile(fs.readFileSync('app/template-library.tsx','utf8'))}})`)(templateReq,tm,tm.exports);
const readonlyHtml=renderToStaticMarkup(React.createElement(tm.exports.default,{templates:[{id:'qa',title:'test plan',courseType:'private',items:p.items}],busy:false,canEdit:false,target:'QA',onApply:()=>{},onEdit:()=>{},onReturn:()=>{}}));
assert.match(readonlyHtml,/<button disabled="" class="primary">套用教案/);assert.match(readonlyHtml,/<button disabled="">修改名称/);assert.ok(readonlyHtml.includes('查看动作'));
console.log('Read-only template library renders disabled edit/apply controls and available preview.');
