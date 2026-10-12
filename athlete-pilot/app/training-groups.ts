export function groupNumber(group:string){return /^[A-Z]+$/.test(group)?[...group].reduce((n,c)=>n*26+c.charCodeAt(0)-64,0):Number.MAX_SAFE_INTEGER;}
export function compareGroups(a:string,b:string){return groupNumber(a)-groupNumber(b)||a.localeCompare(b);}
export function groupLabel(number:number){let label='';while(number>0){number--;label=String.fromCharCode(65+number%26)+label;number=Math.floor(number/26);}return label;}
export function nextExtraGroup(groups:string[]){const numbered=groups.map(groupNumber).filter(n=>n!==Number.MAX_SAFE_INTEGER);return groupLabel(Math.max(6,...numbered)+1);}
export function groupColor(group:string){const n=groupNumber(group);return groupLabel(n===Number.MAX_SAFE_INTEGER?1:(n-1)%10+1);}
