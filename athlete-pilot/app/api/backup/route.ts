import {getCoachUser} from '../../coach-access';
import {db} from '../../runtime';
import {prepareImport,archiveColumns} from '../../backup-import';
export const dynamic='force-dynamic';
const tables=['coach_plan_history','coach_handoffs','coach_intake_links','coach_intake_responses','coach_reports'] as const;
export async function GET(){const u=await getCoachUser();if(!u)return Response.json({error:'请登录'},{status:401});const row=await db.prepare('SELECT data,revision FROM coach_state WHERE owner=?').bind(u.userId).first<any>();const records:Record<string,any[]>= {};for(const table of tables)records[table]=(await db.prepare(`SELECT * FROM ${table} WHERE owner=?`).bind(u.userId).all()).results;return Response.json({format:'athlete-backup-v1',exportedAt:new Date().toISOString(),workspace:u.userId,data:row?JSON.parse(row.data):null,revision:row?.revision||0,records},{headers:{'Cache-Control':'no-store','Content-Disposition':'attachment; filename="athlete-full-backup.json"'}});}
export async function POST(req:Request){
  if(req.headers.get('origin')!==(process.env.PUBLIC_ORIGIN||new URL(req.url).origin))return Response.json({error:'来源有误'},{status:403});
  const u=await getCoachUser();if(!u||u.email!==process.env.COACH_OWNER_EMAIL?.toLowerCase())return Response.json({error:'仅主管理员可以迁入备份'},{status:403});
  try{
    const text=await req.text();if(text.length>2500000)return Response.json({error:'文件过大，请拆分迁移'},{status:413});
    let backup:any;try{backup=JSON.parse(text);}catch{return Response.json({error:'文件不是有效 JSON'},{status:400});}
    for(let attempt=0;attempt<3;attempt++){
      const row=await db.prepare('SELECT data,revision FROM coach_state WHERE owner=?').bind(u.userId).first<any>();
      let prepared:ReturnType<typeof prepareImport>;try{prepared=prepareImport(row?JSON.parse(row.data):null,backup,u.userId);}catch(e:any){return Response.json({error:e.message||'备份格式有误'},{status:400});}
      const json=JSON.stringify(prepared.data),revision=row?.revision||0;
      const statements=[row?db.prepare('UPDATE coach_state SET data=?,revision=revision+1 WHERE owner=? AND revision=?').bind(json,u.userId,revision):db.prepare('INSERT OR IGNORE INTO coach_state(owner,data,revision) VALUES (?,?,1)').bind(u.userId,json)];
      for(const archive of prepared.archives){const columns=archiveColumns[archive.table];const existing=await db.prepare(`SELECT ${columns.join(',')} FROM ${archive.table} WHERE id=? AND owner=?`).bind(archive.originalId,u.userId).first<any>();if(existing&&columns.every((c,i)=>c==='id'||existing[c]===archive.values[i]))continue;statements.push(db.prepare(`INSERT OR IGNORE INTO ${archive.table}(${columns.join(',')}) VALUES (${columns.map(()=>'?').join(',')})`).bind(...archive.values));}
      try{await db.batch(statements,true);}catch(e:any){if(e.message==='IMPORT_CONFLICT')continue;throw e;}
      return Response.json({ok:true,message:`迁入完成：新增 ${prepared.added} 条档案/训练/体测/教案记录；同编号不同内容保留为 ${prepared.copies} 份副本。已有内容保留，归档已合并；旧问卷链接不会重新启用。`});
    }
    return Response.json({error:'其他教练正在保存，请稍后重试；未覆盖已有数据'},{status:409});
  }catch{return Response.json({error:'未确认迁入，原站及备份仍保留'},{status:503});}
}
