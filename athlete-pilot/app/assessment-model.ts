import {validMeasurementDate,formatMetric} from './athlete-metrics';
export type Rating='优秀'|'待提高'|'重点提升';
export type ReportMeasure={key:string;name:string;value:number;unit:string;section:string;source:string};
export type Assessment={id:string;athlete:string;date:string;age?:number;sex?:string;sport:string;goal:string;observations:string;measurements:ReportMeasure[];ratings:Record<string,Rating>;summary:string;training:string;interpretations:Record<string,string>;sourceFile?:string;sourceColumn?:string;hidden?:string[]};
export type ImportedAssessment=Omit<Assessment,'athlete'>&{name:string};
export const ratingOptions:Rating[]=['重点提升','待提高','优秀'];
export const capabilityDefs=[
  {key:'cmj',name:'CMJ 跳跃',metrics:['cmj','cmjPower','mrsi'],meaning:'先下蹲再起跳，用于观察腿部发力与动作衔接。',advice:'练习稳定下蹲、推地与起跳衔接，提高动作质量。'},
  {key:'sj',name:'SJ 跳跃',metrics:['sj','sjPower'],meaning:'保持下蹲姿势后直接起跳，用于观察从静止姿势主动发力的表现。',advice:'巩固起跳姿势和直接推地发力，减少预摆动作。'},
  {key:'coordination',name:'全身协调',metrics:['armJump'],meaning:'摆臂起跳用于观察手臂与双腿协同发力的表现。',advice:'练习摆臂与蹬地的时机配合，提高全身动作协调。'},
  {key:'elastic',name:'下肢弹性与发力衔接',metrics:['rjt','rjtPower','eur','dj','rsi'],meaning:'连续起跳用于观察下肢弹性与重复动作表现；EUR 记录 CMJ 与 SJ 跳高的比值。',advice:'改善落地缓冲、重心控制与连续起跳的节奏。'},
  {key:'strength',name:'基础力量',metrics:['imtp','relativeForce'],meaning:'IMTP 是衡量全身基础力量的测试。',advice:'在稳定动作基础上逐步进阶抗阻训练，结合身体控制提高发力能力。'},
  {key:'direction',name:'5-10-5 变向能力',metrics:['left5105','right5105'],meaning:'用于观察减速、转向与再次加速的衔接表现。',advice:'加入动作模式学习，练习控制重心和转向后的再次加速。'},
  {key:'composition',name:'体成分',metrics:['weight','fat','muscle'],meaning:'记录体重、体脂率与肌肉量，用于持续跟踪身体状态。',advice:'结合实际目标改善生活习惯、饮食和规律训练，跟踪体成分变化。'},
  {key:'ankle',name:'脚踝活动度',metrics:['leftAnkle','rightAnkle','leftWall','rightWall'],meaning:'记录脚踝活动范围，保留角度或膝碰墙距离的测量方法。',advice:'结合动作需求，在可控制范围内练习活动度与稳定性。'},
  {key:'knee',name:'膝屈曲活动度',metrics:['leftKnee','rightKnee'],meaning:'记录膝屈曲活动范围，区分主动与被动测量。',advice:'结合现场表现，练习控制范围内的屈膝与身体稳定。'},
  {key:'sideStrength',name:'下肢左右侧力量差异',metrics:['leftForce','rightForce','leftJump','rightJump'],meaning:'分别记录左右侧力量与单腿跳跃表现，比较同方法、同单位的测试。',advice:'结合动作观察安排单侧训练，在动作稳定的基础上跟踪左右变化。'},
  {key:'keiser',name:'全身快速发力',metrics:['keiserSquatPower','keiserPullPower'],meaning:'记录 Keiser 在指定阻力下的功率；阻力与功率分别保存。',advice:'比较相同设备和阻力下的表现，逐步改善动作速度与发力配合。'},
  {key:'fieldJump',name:'场地跳跃表现',metrics:['standingJumpReach','approachReach'],meaning:'记录原地及助跑摸高，需结合站立摸高计算实际跳跃高度。',advice:'改善蹬地与摆臂配合，保持测试方法一致。'},
  {key:'pattern',name:'动作模式',metrics:[],meaning:'根据现场表现记录基础动作的控制与完成质量。',advice:'从清晰、容易理解的任务开始，逐步学习基础动作模式。'},
] as const;
export const measureFields=[
  [0,'standingReach','站立摸高','cm','身体形态'],[0,'standingJumpReach','原地起跳摸高','cm','场地跳跃'],[0,'approachReach','助跑摸高','cm','场地跳跃'],[0,'dj','DJ 跳高','cm','测力台'],[0,'rsi','DJ RSI（保留设备口径）','','测力台'],[0,'leftJump','左腿单腿跳高','cm','测力台'],[0,'rightJump','右腿单腿跳高','cm','测力台'],[0,'leftForce','IMTP 左侧峰值力','kgf','测力台'],[0,'rightForce','IMTP 右侧峰值力','kgf','测力台'],[0,'keiserSquatLoad','Keiser 深蹲阻力','lb','Keiser'],[0,'keiserSquatPower','Keiser 深蹲功率','W','Keiser'],[0,'keiserPullLoad','Keiser 下拉阻力','lb','Keiser'],[0,'keiserPullPower','Keiser 下拉功率','W','Keiser'],
  [15,'height','身高','cm','身体形态'],[16,'span','臂展','cm','身体形态'],[17,'leg','腿长','cm','身体形态'],
  [19,'weight','体重','kg','体成分'],[20,'fat','体脂率','%','体成分'],[21,'muscle','肌肉量（设备口径）','kg','体成分'],
  [25,'leftAnkle','左踝背屈角度','度','关节活动度'],[26,'rightAnkle','右踝背屈角度','度','关节活动度'],[27,'leftWall','左踝膝碰墙距离','cm','关节活动度'],[28,'rightWall','右踝膝碰墙距离','cm','关节活动度'],[30,'leftKnee','左膝屈曲活动度','度','关节活动度'],[31,'rightKnee','右膝屈曲活动度','度','关节活动度'],
  [34,'cmj','CMJ 跳跃高度','cm','测力台'],[35,'cmjPower','CMJ 相对峰值功率','W/kg','测力台'],[36,'mrsi','CMJ mRSI','m/s','测力台'],[37,'sj','SJ 跳跃高度','cm','测力台'],[38,'sjPower','SJ 相对峰值功率','W/kg','测力台'],[39,'armJump','摆臂 CMJ 跳高','cm','测力台'],[40,'rjt','RJT 连续跳平均高度','cm','测力台'],[41,'rjtPower','RJT 连续跳平均功率','W/kg','测力台'],[44,'fatigue','RJT 疲劳指数（设备原值）','','测力台'],[45,'imtp','IMTP 绝对峰值力','kg','测力台'],[46,'relativeForce','IMTP 相对峰值力','kg/kg','测力台'],[51,'left5105','5-10-5 左侧成绩','s','变向测试'],[52,'right5105','5-10-5 右侧成绩','s','变向测试'],
] as const;
export function shownMeasures(a:Assessment){return a.measurements.filter(m=>!a.hidden?.includes(m.key));}
export function capabilities(a:Assessment){const ms=shownMeasures(a);return capabilityDefs.filter(d=>d.key==='pattern'?Boolean(a.observations.trim()):d.metrics.some(k=>ms.some(m=>m.key===k)));}
export function measureText(m:ReportMeasure){return `${m.name} ${formatMetric(m.value)}${m.unit}`;}
export function summaryText(a:Assessment){
  if(a.summary.trim())return a.summary;
  const caps=capabilities(a),parts=ratingOptions.map(r=>{const names=caps.filter(c=>a.ratings[c.key]===r).map(c=>c.name);return names.length?`${r}：${names.join('、')}。`:'';}).filter(Boolean);
  return parts.length?`本次测试表现：${parts.join('')}`:'本次已记录实测数据，尚未补充能力评价。';
}
export function trainingText(a:Assessment){if(a.training.trim())return a.training;const focus=capabilities(a).filter(c=>a.ratings[c.key]==='重点提升');if(!focus.length)return '';return `本阶段优先改善${focus.map(c=>c.name).join('、')}，兼顾基础动作模式与规律训练。结合接受度安排每周两次训练，在家庭中坚持练习，8–16 周后根据实际情况复评。`;}
export function interpretation(a:Assessment,key:string){if(a.interpretations[key]?.trim())return a.interpretations[key];const cap=capabilityDefs.find(c=>c.key===key);if(!cap)return '';const ms=shownMeasures(a).filter(m=>cap.metrics.some(k=>k===m.key));return `${cap.meaning}${ms.length?`本次记录：${ms.map(measureText).join('，')}。`:a.observations}${a.ratings[key]?`当前评价为${a.ratings[key]}。${cap.advice}`:''}`;}
export function comparison(a:Assessment,b:Assessment){return shownMeasures(a).flatMap(m=>{const prior=shownMeasures(b).find(p=>p.key===m.key&&p.unit===m.unit&&p.source===m.source);return prior?[{measure:m,prior:prior.value,change:m.value-prior.value}]:[];});}
export function assessmentValid(a:Assessment){return !!a.athlete&&validMeasurementDate(a.date)&&a.measurements.every(m=>m.name.trim()&&Number.isFinite(m.value));}
