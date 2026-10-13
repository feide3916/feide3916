import {db} from '../../runtime';
export const dynamic='force-dynamic';
export async function GET(){
  try{await db.prepare('SELECT 1 AS ready').first();return Response.json({ok:true},{headers:{'Cache-Control':'no-store'}});}
  catch{return Response.json({ok:false},{status:503,headers:{'Cache-Control':'no-store'}});}
}
