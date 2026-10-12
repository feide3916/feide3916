import type {Workbook,CellValue} from 'exceljs';
import {measureFields,type ImportedAssessment,type ReportMeasure,type Rating} from './assessment-model';
import {validMeasurementDate} from './athlete-metrics';
import {compatibleXlsx} from './assessment-xlsx';
function plain(v:CellValue):unknown{if(v&&typeof v==='object'&&!(v instanceof Date)){if('result'in v)return v.result;if('richText'in v)return v.richText.map(t=>t.text).join('');if('text'in v)return v.text;if('error'in v)throw Error('表格中有公式错误，请在 Excel 中检查并保存后重试。');}return v;}
const text=(v:unknown)=>v===null||v===undefined?'':String(v).trim();
function numeric(v:unknown,label:string){if(v===null||v===undefined||v==='')return null;const n=typeof v==='number'?v:Number(text(v).replace(/%$/,''));if(!Number.isFinite(n))throw Error(`${label}不是有效数字。`);return n;}
function dateValue(v:unknown){let d='';if(v instanceof Date)d=v.toISOString().slice(0,10);else if(typeof v==='number')d=new Date(Date.UTC(1899,11,30)+v*86400000).toISOString().slice(0,10);else{const m=text(v).match(/^(\d{4})[./-](\d{1,2})[./-](\d{1,2})$/);if(m)d=`${m[1]}-${m[2].padStart(2,'0')}-${m[3].padStart(2,'0')}`;}if(!validMeasurementDate(d))throw Error('请为每列填写真实、有效的测试日期。');return d;}
function rating(v:unknown):Rating|undefined{const s=text(v);if(s==='优秀'||s==='待提高'||s==='重点提升')return s;if(s==='3')return '优秀';if(s==='2'||s==='一般')return '待提高';if(s==='1')return '重点提升';return undefined;}
export function parseAssessmentWorkbook(wb:Workbook,fileName:string,digest:string):ImportedAssessment[]{
  const sheet=wb.getWorksheet('体测录入');if(!sheet)throw Error('请使用已有的“体测录入＋补充测量”Excel 模板。');
  if(text(plain(sheet.getCell('A5').value))!=='姓名'||text(plain(sheet.getCell('A6').value))!=='测试日期')throw Error('模板的姓名或测试日期位置已改变，请先核对表格结构。');
  const extra=wb.getWorksheet('补充测量'),out:ImportedAssessment[]=[];
  for(let col=3;col<=Math.min(sheet.columnCount,100);col++){
    if(!text(plain(sheet.getCell(4,col).value)))continue;
    const get=(row:number)=>plain(sheet.getCell(row,col).value),name=text(get(5));if(!name)continue;
    const date=dateValue(get(6)),source=text(get(47))||'测力台（来源未填）',bodySource=text(get(22))||'体测（来源未填）';
    const measurements:ReportMeasure[]=[];
    for(const [row,key,label,unit,section]of measureFields){if(row===0)continue;let value=numeric(get(row),`${name}的${label}`);if(value===null)continue;if(key==='fat'){const raw=get(row);if(typeof raw==='number'&&sheet.getCell(row,col).numFmt.includes('%'))value*=100;if(value<0||value>100)throw Error(`${name}的体脂率超出 0–100%，请按百分比填写。`);}
      const method=section==='关节活动度'?text(get(row<29?24:29)):key==='leg'?text(get(18)):section==='变向测试'?text(get(53)):'';
      measurements.push({key,name:label,value,unit,section,source:method||(['测力台'].includes(section)?source:['身体形态','体成分'].includes(section)?bodySource:section)});
    }
    const cmj=measurements.find(m=>m.key==='cmj'),sj=measurements.find(m=>m.key==='sj');if(cmj&&sj&&sj.value>0)measurements.push({key:'eur',name:'EUR（CMJ / SJ）',value:cmj.value/sj.value,unit:'倍',section:'测力台',source});
    if(extra)for(let row=5;row<=Math.min(extra.rowCount,250);row++){const group=text(plain(extra.getCell(row,1).value)),label=text(plain(extra.getCell(row,2).value)),unit=text(plain(extra.getCell(row,3).value)),raw=plain(extra.getCell(row,col+1).value);if(!label||raw===null||raw===undefined||raw==='')continue;const value=numeric(raw,`${name}的${label}`);if(value!==null)measurements.push({key:`extra:${group}:${label}:${unit}`,name:label,value,unit,section:group||'补充测量',source:bodySource});}
    const ratings:Record<string,Rating>={};for(const [row,key]of [[12,'pattern'],[56,'cmj'],[57,'sj'],[58,'coordination'],[59,'strength'],[60,'elastic'],[62,'direction'],[63,'ankle'],[64,'knee'],[65,'composition']]as const){const r=rating(get(row));if(r)ratings[key]=r;}
    if(!ratings.elastic){const r=rating(get(61));if(r)ratings.elastic=r;}
    if(!measurements.length&&!text(get(11)))throw Error(`${name}这一列没有实测数据或现场评估。`);
    out.push({id:`excel-${digest}-${col}`,name,date,age:numeric(get(8),'年龄')??undefined,sex:text(get(7)),sport:text(get(9)),goal:text(get(10)),observations:text(get(11)),measurements,ratings,summary:'',training:text(get(48)),interpretations:{},sourceFile:fileName,sourceColumn:sheet.getCell(5,col).address.replace(/\d+$/,'')});
  }
  if(!out.length)throw Error('表格里没有填写姓名的测试记录。');return out;
}
export async function readAssessmentFile(file:File){if(file.size>10*1024*1024)throw Error('请使用 10 MB 以内的 Excel 文件。');const bytes=await file.arrayBuffer(),hash=Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',bytes))).map(n=>n.toString(16).padStart(2,'0')).join('');const ExcelJS=(await import('exceljs/dist/exceljs.min.js')).default,wb=new ExcelJS.Workbook();const compatible=await compatibleXlsx(bytes);await wb.xlsx.load(compatible as Parameters<typeof wb.xlsx.load>[0]);return parseAssessmentWorkbook(wb,file.name,hash);}
