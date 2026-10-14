type EmptyDraft={title:string;note:string;stages?:Record<string,string>};
type Template={title:string;sessionNote?:string;stages?:Record<string,string>};
export function emptyDraftTemplateDetails(template:Template,draft:EmptyDraft|null){
 return {title:draft?.title.trim()&&draft.title!=='新课程'?draft.title:template.title,
  note:[template.sessionNote,draft?.note].filter(Boolean).filter((v,i,a)=>a.indexOf(v)===i).join('\n'),
  stages:{...template.stages,...draft?.stages}};
}
