/* Static risk inventory. Manual visual and screen-reader checks remain separate acceptance gates. */
import fs from 'node:fs';import path from 'node:path';
const root=path.resolve('src/app');const roles=['admin','teacher','student','parent'];
const crawl=p=>fs.readdirSync(p,{withFileTypes:true}).flatMap(e=>e.isDirectory()?crawl(path.join(p,e.name)):/\.(tsx|jsx)$/.test(e.name)?[path.join(p,e.name)]:[]);
let issues=[];
for(const role of roles){const files=crawl(path.join(root,role));let dark=0,white=0,dynamic=0,modal=0,large=0;for(const file of files){const text=fs.readFileSync(file,'utf8');const n=regex=>(text.match(regex)||[]).length;const d=n(/\bbg-(?:slate|blue|gray|navy)-(?:[789]\d\d|950)/g)+n(/\bbg-\[#[01][0-9a-fA-F]{5}\]/g);const w=n(/\btext-white\b/g);const dyn=n(/(?:bg|text|border)-\$\{/g);const m=n(/fixed\s+inset-0/g);dark+=d;white+=w;dynamic+=dyn;modal+=m;if(d+w+dyn>20)issues.push({route:path.relative(root,file),legacy_dark_utilities:d,white_text:w,dynamic_tailwind:dyn});}console.log(JSON.stringify({role,files:files.length,dark_utility_hits:dark,white_text_hits:white,dynamic_class_hits:dynamic,modal_hits:modal}));}
issues.sort((a,b)=>(b.legacy_dark_utilities+b.white_text)-(a.legacy_dark_utilities+a.white_text));
console.log('TOP_REVIEW_FILES',JSON.stringify(issues.slice(0,16)));
