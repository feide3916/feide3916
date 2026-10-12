import JSZip from 'jszip';

// ExcelJS expects unprefixed SpreadsheetML tags; valid exporters may use x: tags.
export async function compatibleXlsx(bytes:ArrayBuffer|Uint8Array){
  const zip=await JSZip.loadAsync(bytes);
  let expanded=0;
  for(const entry of Object.values(zip.files)){
    if(entry.dir||!entry.name.endsWith('.xml')&&!entry.name.endsWith('.rels'))continue;
    let xml=await entry.async('string');
    expanded+=xml.length;
    if(expanded>40*1024*1024)throw Error('表格内容过大，请减少空白行或拆分后导入。');
    xml=xml.replace(/^\uFEFF/,'');
    const declarations=[...xml.matchAll(/xmlns:([A-Za-z_][\w.-]*)="http:\/\/schemas\.openxmlformats\.org\/spreadsheetml\/2006\/main"/g)];
    for(const [,prefix]of declarations){
      const escaped=prefix.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
      xml=xml.replace(new RegExp(`<(/?)${escaped}:([A-Za-z_][\\w.-]*)`,'g'),'<$1$2');
      xml=xml.replace(`xmlns:${prefix}="http://schemas.openxmlformats.org/spreadsheetml/2006/main"`,'xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"');
    }
    // ISO date cells are valid XLSX but ExcelJS otherwise parses the year as a serial.
    xml=xml.replace(/<c\b([^>]*\bt="d"[^>]*)>([\s\S]*?)<\/c>/g,(_whole,attributes,body)=>{
      const match=body.match(/<v>([^<]+)<\/v>/),time=match?Date.parse(match[1]):NaN;
      if(!Number.isFinite(time))throw Error('表格中存在无效日期。');
      const serial=(time-Date.UTC(1899,11,30))/86400000;
      return `<c${attributes.replace(/\s+t="d"/,'')}>${body.replace(/<v>[^<]+<\/v>/,`<v>${serial}</v>`)}</c>`;
    });
    zip.file(entry.name,xml);
  }
  return zip.generateAsync({type:'arraybuffer'});
}
