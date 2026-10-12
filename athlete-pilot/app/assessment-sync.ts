import type {Assessment, ImportedAssessment} from './assessment-model';
import type {Measurement} from './athlete-metrics';

export type SyncAthlete = {id:string;name:string;sport:string;goal:string;note:string;demo?:boolean;sex?:string;birthDate?:string};
export type SyncData = {athletes:SyncAthlete[];tests:Measurement[];assessments?:Assessment[]};

// A revised session replaces only the explicitly confirmed imported session.
export function mergeAssessments<T extends SyncData>(data:T, records:ImportedAssessment[], targets:Record<string,string>, replace:boolean, makeId:()=>string):{data:T;added:number;skipped:number;firstAthlete?:string} {
  const athletes=[...data.athletes], tests=[...data.tests], assessments=[...(data.assessments||[])];
  const created=new Map<string,string>();
  let added=0,skipped=0,firstAthlete:string|undefined;
  for(const record of records){
    let target=targets[record.id];
    if(!target)throw Error(`请选择 ${record.name} 对应的运动员。`);
    if(target==='new'){
      target=created.get(record.name)||'';
      if(!target){target=makeId();created.set(record.name,target);athletes.push({id:target,name:record.name,sport:record.sport,goal:record.goal,note:''});}
    }
    if(!athletes.some(a=>a.id===target))throw Error('所选运动员不存在，请重新选择。');
    if(assessments.some(a=>a.id===record.id&&a.athlete===target)){skipped++;continue;}
    const same=assessments.filter(a=>a.athlete===target&&a.date===record.date&&a.sourceFile);
    if(same.length&&!replace){skipped++;continue;}
    for(const old of same){
      assessments.splice(assessments.indexOf(old),1);
      for(let i=tests.length-1;i>=0;i--)if(tests[i].id.startsWith(`assessment:${old.id}:`))tests.splice(i,1);
    }
    const {name,...rest}=record;
    const assessment={...rest,athlete:target};
    // Never overwrite independently maintained profile goals or coach notes.
    const index=athletes.findIndex(a=>a.id===target),ath=athletes[index];
    athletes[index]={...ath,sport:ath.sport||record.sport,goal:ath.goal||record.goal};
    assessments.push(assessment);
    for(const m of record.measurements)tests.push({id:`assessment:${record.id}:${m.key}`,athlete:target,date:record.date,metric:m.name,value:m.value,unit:m.unit,source:m.source});
    firstAthlete??=target;added++;
  }
  return {data:{...data,athletes,tests,assessments},added,skipped,firstAthlete};
}
