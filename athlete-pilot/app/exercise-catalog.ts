// Coach-facing translations of common resistance-training movements. These are
// curated names, not an official NSCA or EXOS licensed exercise database.
const catalog:[string,string,string[]?][]=[
 ['杠铃深蹲','Barbell Back Squat',['杠铃深蹲']],['前蹲','Front Squat'],['高脚杯深蹲','Goblet Squat',['负重高脚杯蹲']],['过顶深蹲','Overhead Squat'],['保加利亚分腿蹲','Bulgarian Split Squat'],['分腿蹲','Split Squat'],['单腿深蹲','Single-Leg Squat'],['腿举','Leg Press'],['靠墙静蹲','Wall Sit'],
 ['杠铃硬拉','Barbell Deadlift'],['六角杠硬拉','Trap Bar Deadlift',['六角杆硬拉']],['相扑硬拉','Sumo Deadlift'],['罗马尼亚硬拉','Romanian Deadlift'],['单腿罗马尼亚硬拉','Single-Leg Romanian Deadlift'],['早安式','Good Morning'],['臀桥','Glute Bridge'],['杠铃臀推','Barbell Hip Thrust'],['壶铃摇摆','Kettlebell Swing',['壶铃摇摆']],
 ['反向弓步','Reverse Lunge'],['行走弓步','Walking Lunge'],['侧向弓步','Lateral Lunge'],['登阶','Step-Up'],['下阶','Step-Down'],['壶铃分腿蹲','Kettlebell Split Squat'],
 ['杠铃卧推','Barbell Bench Press',['卧推','水平推（卧推）']],['哑铃卧推','Dumbbell Bench Press'],['上斜卧推','Incline Bench Press'],['俯卧撑','Push-Up'],['斜板俯卧撑','Incline Push-Up'],['哑铃肩推','Dumbbell Shoulder Press'],['杠铃肩推','Barbell Overhead Press'],['推举','Push Press'],['单臂半跪姿肩推','Half-Kneeling Single-Arm Press'],
 ['引体向上','Pull-Up'],['反手引体向上','Chin-Up'],['高位下拉','Lat Pulldown'],['杠铃俯身划船','Barbell Bent-Over Row'],['单臂哑铃划船','Single-Arm Dumbbell Row'],['坐姿划船','Seated Row'],['反向划船','Inverted Row'],['面拉','Face Pull'],
 ['箱式跳跃','Box Jump',['跳箱']],['下落跳','Drop Jump',['drop jump']],['纵跳','Countermovement Jump'],['分腿蹲跳','Split-Squat Jump'],['药球胸前推','Medicine Ball Chest Pass',['药球推']],['药球砸地','Medicine Ball Slam'],
 ['平板支撑','Plank'],['侧平板支撑','Side Plank'],['死虫','Dead Bug'],['鸟狗','Bird Dog'],['帕洛夫抗旋转推','Pallof Press'],['农夫行走','Farmer Carry'],['单侧负重行走','Suitcase Carry'],['北欧腘绳肌弯举','Nordic Hamstring Curl',['nordic']],
];
export const strengthExercises=catalog.map(([zh,en])=>`${zh}（${en}）`);
const aliases=new Map<string,string>();
for(const [zh,en,extra=[]] of catalog){const name=`${zh}（${en}）`;for(const alias of [zh,en,...extra,name])aliases.set(alias.trim().toLocaleLowerCase(),name);}
export function canonicalExercise(name:string){return aliases.get(name.trim().toLocaleLowerCase())||name.trim();}
export function sameExercise(a:string,b:string){return canonicalExercise(a)===canonicalExercise(b);}
export function libraryExercises(existing:string[]){return [...new Set([...strengthExercises,...existing.map(canonicalExercise)])];}
