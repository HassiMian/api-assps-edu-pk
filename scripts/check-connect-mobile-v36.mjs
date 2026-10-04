import fs from 'node:fs';import path from 'node:path';
const read=p=>fs.readFileSync(path.resolve('src',p),'utf8');
const css=read('app/globals.css'),shell=read('components/ConnectWorkspaceShell.tsx'),layout=read('app/layout.tsx');
const tests=[
 ['Blanket .flex-row column forcing removed',!/\.flex-row,\s*\n\s*\.md\\:flex-row/.test(css)&&!/\.lg\\:flex-row\s*\{\s*flex-direction:\s*column\s*!important/.test(css)],
 ['No universal table minimum 650px forcing',!/\n\s*table\s*\{\s*width:\s*100%\s*!important;\s*min-width:\s*650px/.test(css)],
 ['Workspace has scoped safe-area insets',css.includes('.cw-shell .tws-sidebar')&&css.includes('env(safe-area-inset-top)')&&css.includes('env(safe-area-inset-bottom)')],
 ['Mobile input font protects iOS zoom',css.includes('font-size:16px!important')],
 ['Drawer supports ESC focus return and tab wrap',shell.includes("event.key==='Escape'")&&shell.includes('menuRef.current?.focus')&&shell.includes("event.key==='Tab'")],
 ['Hidden mobile drawer cannot receive focus',shell.includes('inert={mobile&&!drawer}')],
 ['Drawer provides labelled accessible relationship',shell.includes('aria-controls={`${role}-navigation`}')&&shell.includes('aria-expanded={drawer}')],
 ['iOS body scroll lock is cleaned up',shell.includes("document.body.style.position='fixed'")&&shell.includes('document.body.style.position=oldPosition')],
 ['Touch targets and modal dynamic sizing present',css.includes('min-height:44px')&&css.includes('100dvh')&&css.includes('.cw-modal-panel')],
 ['Viewport allows zoom and notch cover',layout.includes("viewportFit: 'cover'")&&layout.includes('userScalable: true')],
 ['Reduced motion and print remain supported',css.includes('prefers-reduced-motion:reduce')&&css.includes('@media print{.cw-shell')],
 ['Role navigation does not cause unnecessary route prefetches',(shell.match(/prefetch=\{false\}/g)||[]).length>=3],
 ['Bilingual Urdu/RTL wrapping is scoped',css.includes('[lang="ur"]')&&css.includes('overflow-wrap:break-word')],
];let fail=0;for(const [name,ok] of tests){console.log(`${ok?'PASS':'FAIL'} ${name}`);if(!ok)fail++}console.log(`MOBILE_V36_SOURCE_GATE ${tests.length-fail}/${tests.length} ${fail?'FAIL':'PASS'}`);if(fail)process.exitCode=1;
