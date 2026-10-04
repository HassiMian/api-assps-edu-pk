/* APEX Connect V3 — semantic text and control contrast gate (WCAG 2.2). */
const rgb=(hex)=>hex.replace('#','').match(/.{2}/g).map(x=>parseInt(x,16)/255);
const lum=(hex)=>rgb(hex).map(c=>c<=.04045?c/12.92:((c+.055)/1.055)**2.4).reduce((s,c,i)=>s+c*[.2126,.7152,.0722][i],0);
const ratio=(a,b)=>{const x=lum(a),y=lum(b);return (Math.max(x,y)+.05)/(Math.min(x,y)+.05)};
const tests=[
 ['primary ink on pearl','#26362D','#F6F6F2',4.5],
 ['primary ink on white','#26362D','#FFFFFF',4.5],
 ['secondary on white','#55645B','#FFFFFF',4.5],
 ['muted on white','#65756B','#FFFFFF',4.5],
 ['sage teacher text on light','#245C43','#E7F1E9',4.5],
 ['student purple text on light','#60468B','#F0EBFA',4.5],
 ['parent mineral text on light','#216C66','#E2F2EF',4.5],
 ['admin ochre text on light','#735127','#F4EADB',4.5],
 ['teacher button white on sage','#FFFFFF','#285C48',4.5],
 ['student button white on violet','#FFFFFF','#69539A',4.5],
 ['parent button white on teal','#FFFFFF','#25736F',4.5],
 ['admin button white on ochre','#FFFFFF','#785A35',4.5],
 ['warning text on warning surface','#915A23','#FFF5F0',4.5],
 ['danger text on light','#9C3E3B','#FFF5F0',4.5],
 ['sidebar nav default on white','#56675B','#FFFFFF',4.5],
 ['sidebar nav-label on white','#56675B','#FFFFFF',4.5],
 ['legacy teacher small secondary on white','#586B5C','#FFFFFF',4.5],
 ['legacy card warning label on white','#82511E','#FFFFFF',4.5],
 ['legacy card success label on white','#236748','#FFFFFF',4.5],
 ['legacy card blue label on white','#285A84','#FFFFFF',4.5],
 ['legacy card violet label on white','#654B90','#FFFFFF',4.5],
 ['legacy card error label on white','#913A39','#FFFFFF',4.5],
];
let fail=0;for(const [label,fg,bg,min] of tests){const actual=ratio(fg,bg);const passed=actual>=min;console.log(`${passed?'PASS':'FAIL'} ${label}: ${actual.toFixed(2)}:1 (required ${min}:1)`);if(!passed)fail++}
console.log(`CONTRAST_GATE ${tests.length-fail}/${tests.length} PASS`);process.exit(fail?1:0)
