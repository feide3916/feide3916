import fs from 'node:fs';
import ts from 'typescript';
import vm from 'node:vm';
import assert from 'node:assert/strict';
const transpile=code=>ts.transpileModule(code,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
const storageContext=vm.createContext({exports:{},structuredClone,Date,JSON});vm.runInContext(transpile(fs.readFileSync('app/plan-storage.ts','utf8')),storageContext);const storage=storageContext.exports;
const base={id:'plan-one',athlete:'athlete-one',date:'2026-10-14',title:'测试训练',status:'计划中',items:[{id:'action',group:'A',exercise:'深蹲',sets:[{reps:'5',load:'50'}],note:''}],note:'初稿'};
assert.equal(storage.readPlanBackups('bad json').length,0);assert.equal(storage.readPlanBackups('[{"session":{}}]').length,0);
const initial=storage.rememberPlan([],base);assert.equal(storage.recoverableBackups(initial,[]).length,1);
assert.equal(storage.recoverableBackups(initial,[base]).length,0);
const confirmed=storage.rememberPlan(initial,base,true);assert.equal(storage.recoverableBackups(confirmed,[base]).length,0);
const changed={...base,note:'新修改'};const unconfirmed=storage.rememberPlan(confirmed,changed);assert.equal(unconfirmed[0].confirmedAt,undefined);assert.equal(storage.recoverableBackups(unconfirmed,[base]).length,1);
assert.equal(storage.recoverableBackups([{...unconfirmed[0],recoveredTo:'new-id'}],[base]).length,0);
assert.ok(storage.meaningfulPlan({...base,items:[]}));
assert.ok(!storage.meaningfulPlan({...base,title:'新课程',items:[],note:''}));
const source=fs.readFileSync('app/studio.tsx','utf8');const start=source.indexOf('async function commitPlan('),end=source.indexOf('useEffect(()=>{if(!data||!draft||!dirty',start);assert.ok(start>0&&end>start);
let resolveWrite,calls=[],backups=[],draftWrites=[],receipt='',errors=[],retries=[];
const live={current:{data:{athletes:[{id:base.athlete,name:'测试运动员'}],sessions:[],exercises:['深蹲'],tests:[]},draft:structuredClone(base),dirty:true,athlete:base.athlete,date:base.date,revision:0}};
const cloudBase={current:structuredClone(live.current.data)},draftBase={current:undefined},failedAuto={current:''},navigator={onLine:true};
const context=vm.createContext({structuredClone,Date,JSON,navigator,live,cloudBase,draftBase,failedAuto,retryableSave:{current:true},autoRetryCount:{current:0},autoRetryTimer:{current:null},clearTimeout:()=>{},schedulePlanRetry:fp=>retries.push(fp),...storage,
 backupPlan:(s,confirmed=false)=>backups.push({session:structuredClone(s),confirmed}),
 setMessage:m=>errors.push(m),setSaveError:m=>errors.push(m),startRecording:()=>{},setDraft:s=>draftWrites.push(structuredClone(s)),setDirty:v=>{live.current.dirty=v},setSavedReceipt:s=>{receipt=s},localStorage:{setItem:()=>{}},
 persist:async(...args)=>{calls.push(structuredClone(args));return new Promise(resolve=>{resolveWrite=resolve;});}
});vm.runInContext(transpile(source.slice(start,end))+'\nthis.commit=commitPlan;',context);
const first=context.commit(undefined,true);assert.equal(calls.length,1);assert.equal(calls[0][0].sessions[0].note,'初稿');
// Continue typing while the first cloud request is pending.
live.current.draft=structuredClone(changed);resolveWrite(true);assert.equal(await first,true);
assert.equal(live.current.dirty,true);assert.equal(live.current.draft.note,'新修改');assert.equal(draftWrites.length,0);assert.equal(draftBase.current.note,'初稿');assert.equal(backups.at(-1).session.note,'新修改');assert.equal(backups.at(-1).confirmed,false);
const second=context.commit(undefined,true);assert.equal(calls[1][0].sessions[0].note,'新修改');resolveWrite(true);assert.equal(await second,true);assert.equal(live.current.dirty,false);assert.equal(backups.at(-1).confirmed,true);assert.ok(receipt.includes('自动保存'));
// Failed saves never clear dirty or mark local data as cloud-confirmed.
live.current.draft={...changed,note:'失败时保留'};live.current.dirty=true;const failed=context.commit(undefined,true);resolveWrite(false);assert.equal(await failed,false);assert.equal(live.current.dirty,true);assert.equal(failedAuto.current,storage.planFingerprint(live.current.draft));assert.equal(backups.at(-1).confirmed,false);assert.equal(retries.length,1);
const before=calls.length;navigator.onLine=false;live.current.draft={...changed,note:'离线修改'};assert.equal(await context.commit(undefined,true),false);assert.equal(calls.length,before);assert.equal(live.current.dirty,true);assert.ok(errors.at(-1).includes('离线'));
console.log('Autosave regression passed: snapshot save, edits during a pending request remain dirty, next save confirms only latest draft, failed/offline writes preserve input, recoverable drafts and malformed backups handled. Actual commitPlan function tested with mocked transport.');
// Removing the final action of an existing course must persist, rather than reappear after refresh.
navigator.onLine=true;live.current.data.sessions=[structuredClone(base)];live.current.draft={...base,items:[],note:'',status:'已完成'};live.current.dirty=true;
const cleared=context.commit(undefined,true);assert.equal(calls.at(-1)[0].sessions[0].items.length,0);assert.equal(calls.at(-1)[0].sessions[0].status,'计划中');resolveWrite(true);assert.equal(await cleared,true);assert.equal(live.current.dirty,false);
console.log('Existing course final-action removal persists as a non-completed course.');
