require('/var/www/apex-backend/node_modules/dotenv').config({path:'/var/www/apex-backend/.env'});
const {pool}=require('/var/www/apex-backend/config/database');
const bcrypt=require('/var/www/apex-backend/node_modules/bcryptjs');
const crypto=require('node:crypto');
const {chromium,firefox,webkit}=require('/opt/assps-editor-worker/repo/al-siddique-frontend/node_modules/playwright');
const engineName=process.argv[3]||'firefox';const browserType={chromium,firefox,webkit}[engineName];if(!browserType)throw Error('unsupported engine');
const fs=require('node:fs');
const PORT=Number(process.argv[2]||3126),BASE=process.argv[3]==='webkit'?'https://api.assps.edu.pk':`http://127.0.0.1:${PORT}`;
const widths=[320,375,390,430,768,1024];
const heights={320:568,360:740,375:812,390:844,412:915,430:932,768:1024,820:1180,1024:768,1280:800};
const child={admin:'/admin/users',teacher:'/teacher/attendance',student:'/student/exams',parent:'/parent/finance'};
async function run(){
 let browser,sid;const db=await pool.connect();const summary=[];let screenshots=0;const suffix=crypto.randomBytes(5).toString('hex'),code=`mobqa${suffix}`,password=crypto.randomBytes(20).toString('base64url');
 try{
  const school=await db.query("INSERT INTO schools(name,code,status,tenant_id) VALUES('Synthetic Mobile Visual QA',$1,'active',$1) RETURNING id",[code]);sid=school.rows[0].id;
  const hash=await bcrypt.hash(password,10);const people={};
  for(const role of ['admin','teacher','student','parent']){
    const email=`mobile-${role}-${suffix}@invalid.example`;people[role]={email};
    await db.query('INSERT INTO users(school_id,tenant_id,name,email,role,password,is_active) VALUES($1,$2,$3,$4,$5,$6,true)',[sid,code,`Visual QA ${role}`,email,role,hash]);
  }
  browser=await browserType.launch({headless:true,...(engineName==='chromium'?{args:['--no-sandbox']}:{})});
  for(const role of ['admin','teacher','student','parent']){
   let context,page;const jsErrors=[];
   const freshContext=async(width,height)=>{
     context=await browser.newContext({viewport:{width,height},deviceScaleFactor:2,hasTouch:true,isMobile:engineName!=='firefox',locale:'en-PK',timezoneId:'Asia/Karachi',reducedMotion:'reduce'});
     const login=await context.request.post(`${BASE}/api/auth/login`,{data:{email:people[role].email,password,role,school_code:code}});
     if(login.status()!==200)throw Error(`${role} API login HTTP ${login.status()} ${String(await login.text()).slice(0,150)}`);
     page=await context.newPage();page.on('pageerror',e=>jsErrors.push(e.message));page.on('response',r=>{if(r.status()>=400)console.log('HTTP_DIAGNOSTIC',role,r.status(),r.url())});
   };
   if(engineName!=='webkit')await freshContext(390,844);
   for(const width of widths){
    if(engineName==='webkit'){
      if(context)await context.close();
      await freshContext(width,heights[width]);
    }else await page.setViewportSize({width,height:heights[width]});
    const response=await page.goto(`${BASE}/${role}`,{waitUntil:'domcontentloaded',timeout:25000});
    await page.locator('.cw-shell .tws-topbar').waitFor({timeout:12000});
    const state=await page.evaluate(()=>{
      const rect=sel=>{const e=document.querySelector(sel);if(!e)return null;const r=e.getBoundingClientRect();return {left:Math.round(r.left),right:Math.round(r.right),width:Math.round(r.width),height:Math.round(r.height)};};
      const sc=document.querySelector('.tws-main');
      return {viewport:innerWidth,docWidth:document.documentElement.scrollWidth,bodyWidth:document.body.scrollWidth,topbar:rect('.tws-topbar'),work:rect('.tws-workspace'),main:rect('.tws-main'),inner:rect('.tws-main-inner'),menuVisible:(()=>{const el=document.querySelector('.tws-menu-button');return el?getComputedStyle(el).display!=='none':false})(),mainScrollHeight:sc?.scrollHeight,mainClientHeight:sc?.clientHeight};
    });
    const fail=[];
    if(![200,304].includes(response.status()))fail.push(`HTTP ${response.status()}`);
    if(state.docWidth>width+2 || state.bodyWidth>width+2)fail.push(`horizontal document overflow: ${state.docWidth}/${state.bodyWidth}`);
    for(const k of ['topbar','work','main','inner']){const r=state[k];if(r&&(r.right>width+3||r.left< -3))fail.push(`${k} clipped ${JSON.stringify(r)}`)}
    if(width<1024 && !state.menuVisible)fail.push('mobile nav toggle not visible');
    if(width>=1024 && state.menuVisible)fail.push('desktop toggle incorrectly visible');
    if(width<=430 && engineName!=='webkit'){
      const menu=page.locator('.tws-menu-button');if(engineName==='webkit'){const r=await menu.boundingBox();if(!r)throw Error('mobile menu has no bounding box');await page.touchscreen.tap(r.x+r.width/2,r.y+r.height/2)}else await menu.click();
      await page.locator('.tws-sidebar').waitFor({state:'visible',timeout:4000});
      const expanded=await menu.getAttribute('aria-expanded');
      const labels=await page.locator('.tws-sidebar .tws-nav-link span').count();
      const focused=await page.evaluate(()=>document.activeElement?.closest('.tws-sidebar')!==null);
      const bodyLocked=await page.evaluate(()=>document.body.style.position==='fixed');
      if(expanded!=='true'||labels<3||!focused||!bodyLocked)fail.push(`drawer expanded=${expanded} labels=${labels} focused=${focused} bodyLocked=${bodyLocked}`);
      await page.keyboard.press('Escape');
      const closed=await menu.getAttribute('aria-expanded');
      const menuFocused=await menu.evaluate(el=>document.activeElement===el);
      if(closed!=='false'||!menuFocused)fail.push(`ESC close=${closed} focus=${menuFocused}`);
    }
    if(width===375){
      fs.mkdirSync('/tmp/apex-mobile-v36-shots',{recursive:true});
      if(engineName!=='webkit'){await page.screenshot({path:`/tmp/apex-mobile-v36-shots/${engineName}-${role}-375.png`,fullPage:true,timeout:12000});screenshots++;}
      const inner=await page.goto(`${BASE}${child[role]}`,{waitUntil:'domcontentloaded',timeout:25000});
      try{await page.locator('.cw-shell .tws-topbar').waitFor({timeout:15000})}catch(e){console.log('INNER_DIAGNOSTIC',role,inner.status(),page.url(),(await page.locator('body').innerText()).slice(0,140));throw e;}
      const innerMetrics=await page.evaluate(()=>({document:document.documentElement.scrollWidth,body:document.body.scrollWidth,viewport:innerWidth}));
      if(![200,304].includes(inner.status())||innerMetrics.document>width+2||innerMetrics.body>width+2)fail.push(`inner ${child[role]} http ${inner.status()} overflow ${JSON.stringify(innerMetrics)}`);
      if(engineName!=='webkit'){await page.screenshot({path:`/tmp/apex-mobile-v36-shots/${engineName}-${role}-inner-375.png`,fullPage:true,timeout:12000});screenshots++;}
      if(role==='admin' && engineName!=='webkit'){
        if(engineName==='webkit'){const r=await page.getByRole('button',{name:/add administrator/i}).boundingBox();if(!r)throw Error('Admin action has no bounding box');await page.touchscreen.tap(r.x+r.width/2,r.y+r.height/2)}else await page.getByRole('button',{name:/add administrator/i}).click();
        const dlg=page.getByRole('dialog');await dlg.waitFor({timeout:3500});
        const r=await dlg.boundingBox();
        if(!r||r.x<0||r.x+r.width>width+2||r.y<0||r.y+r.height>heights[width]+3)fail.push(`admin modal viewport ${JSON.stringify(r)}`);
        await page.screenshot({path:'/tmp/apex-mobile-v36-shots/${engineName}-admin-modal-375.png'});screenshots++;
      }
    }
    const record={role,width,...state,fail};summary.push(record);
    console.log(`${fail.length?'FAIL':'PASS'} ${role} ${width}px doc=${state.docWidth} menu=${state.menuVisible} ${fail.join(' | ')}`);
   }
   if(jsErrors.length)console.log(`JS_ERRORS ${role} ${JSON.stringify(jsErrors.slice(0,3))}`);
   await context.close();
  }
  fs.writeFileSync(`/tmp/apex-mobile-v36-${engineName}-matrix.json`,JSON.stringify(summary,null,2));
  const failed=summary.filter(x=>x.fail.length);
  console.log(`ENGINE_${engineName.toUpperCase()} ${engineName==='webkit'?'LAYOUT_ONLY':'INTERACTION_AND_LAYOUT'} RESULT ${summary.length-failed.length}/${summary.length} viewport_role_tests PASS; ${screenshots} screenshots; failures=${failed.length}`);
  if(failed.length)process.exitCode=1;
 }finally{
  if(browser)await browser.close().catch(()=>{});
  if(sid){await db.query('DELETE FROM teacher_class_assignments WHERE school_id=$1',[sid]).catch(()=>{});await db.query('DELETE FROM users WHERE school_id=$1',[sid]).catch(()=>{});await db.query('DELETE FROM schools WHERE id=$1',[sid]).catch(()=>{});console.log('SYNTHETIC_MOBILE_FIXTURES_CLEANED')}
  db.release();
 }
}
run().catch(e=>{console.error('MOBILE_MATRIX_FAILED',e.stack||e.message);process.exitCode=1});
