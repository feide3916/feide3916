import {pinyin} from 'pinyin-pro';
const clean=(s:string)=>s.normalize('NFKD').replace(/[\u0300-\u036f\s_-]/g,'').toLowerCase();
export function exerciseIndex(name:string){const syllables=pinyin(name,{toneType:'none',type:'array',nonZh:'consecutive'}).flatMap(s=>s.split(/\s+/)).filter(Boolean);return {name,key:clean(syllables.join('')),initials:clean(syllables.map(s=>s[0]).join(''))};}
export function exerciseMatches(name:string,query:string){const q=clean(query);if(!q)return true;const e=exerciseIndex(name);return clean(name).includes(q)||e.key.includes(q)||e.initials.includes(q);}
export function sortedExercises(names:string[]){return [...new Set(names)].sort((a,b)=>exerciseIndex(a).key.localeCompare(exerciseIndex(b).key,'en',{numeric:true})||a.localeCompare(b,'zh-CN'));}
