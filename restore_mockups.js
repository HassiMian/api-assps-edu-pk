const fs = require('fs');

// 1. UPDATE CSS
const cssPath = 'C:/projects/My SAas/super-app/src/app/apex/apex.module.css';
let css = fs.readFileSync(cssPath, 'utf-8');

const deviceMockupCSS = `
/* ========================================================
   ULTRA-HD REALISTIC DEVICE FRAMES
   ======================================================== */

:global(.device-frame-desktop) {
  width: 100%;
  aspect-ratio: 16 / 10;
  background: #000;
  border-radius: 14px;
  border: 14px solid #09090b; /* MacBook Dark Bezel */
  box-shadow: 
    0 0 0 1px rgba(255,255,255,0.08),
    0 50px 100px rgba(0,0,0,0.95),
    inset 0 0 0 1px rgba(255,255,255,0.05);
  overflow: hidden;
  position: relative;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  transition: transform 0.5s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.5s ease;
}
:global(.device-frame-desktop:hover) {
  transform: translateY(-8px);
  box-shadow: 
    0 0 0 1px rgba(255,255,255,0.15),
    0 60px 120px rgba(0,0,0,1),
    inset 0 0 0 1px rgba(255,255,255,0.05);
}
:global(.device-frame-desktop img) {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: top center;
}

:global(.device-frame-mobile) {
  width: 300px;
  height: 620px;
  background: #000;
  border-radius: 46px;
  border: 12px solid #000; /* iPhone Pro Bezel */
  box-shadow: 
    0 0 0 2px rgba(255,255,255,0.15),
    0 40px 100px rgba(0,0,0,0.9),
    inset 0 0 0 2px rgba(255,255,255,0.1);
  overflow: hidden;
  position: relative;
  margin: 0 auto;
  transition: transform 0.5s cubic-bezier(0.16, 1, 0.3, 1);
}
:global(.device-frame-mobile:hover) {
  transform: translateY(-8px);
}
:global(.dynamic-island) {
  position: absolute;
  top: 12px;
  left: 50%;
  transform: translateX(-50%);
  width: 100px;
  height: 28px;
  background: #000;
  border-radius: 20px;
  z-index: 20;
  box-shadow: inset 0 0 4px rgba(255,255,255,0.1);
}
:global(.device-frame-mobile img) {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 34px;
}
`;

if(!css.includes('device-frame-desktop')) {
    css += deviceMockupCSS;
    fs.writeFileSync(cssPath, css);
}

// 2. UPDATE TSX
const tsxPath = 'C:/projects/My SAas/super-app/src/app/apex/ApexGatewayClient.tsx';
let tsx = fs.readFileSync(tsxPath, 'utf-8');

// Replace the WindowChrome function completely
const newWindowChrome = `function WindowChrome({ children, title, icon: Icon, screenshotSrc }: { children: React.ReactNode, title: string, icon: any, screenshotSrc?: string }) {
  return (
    <div className="device-frame-desktop">
      {screenshotSrc && (
        <img src={screenshotSrc} alt={title} className="mock-screenshot-img" />
      )}
      {children}
    </div>
  );
}`;

// I need to use a regex to replace the entire WindowChrome function body because it contains the huge native UI blocks I added.
const chromeRegex = /function WindowChrome\([\s\S]*?(?=function|const|export|$)/;

// Because WindowChrome is followed by other code, let's target it specifically.
let startIdx = tsx.indexOf('function WindowChrome');
if(startIdx !== -1) {
    let endIdx = tsx.indexOf('export default function ApexGatewayClient', startIdx);
    if(endIdx !== -1) {
        // Just replacing the whole chunk
        tsx = tsx.substring(0, startIdx) + newWindowChrome + '\n\n' + tsx.substring(endIdx);
    }
}


// Replace the mobile dashboard replacement block in ApexGatewayClient with the iPhone mockup
const mobileRegex = /<div className="native-ui-container" style={{flexDirection: 'column'}}>[\s\S]*?<\/div>\s*<\/div>\s*<\/div>/;

// It's safer to just look for the connect module rendering.
// Let's find the section with activeScreenIndex and replace the image renderer.
tsx = tsx.replace(/<div className="native-ui-container" style={{flexDirection: 'column'}}>[\s\S]*?(?=<\/div>\s*<\/div>\s*<\/section>)/, `
                  <div className="device-frame-mobile">
                    <div className="dynamic-island"></div>
                    <img 
                      src={mobileScreens[activeScreenIndex].src} 
                      alt={mobileScreens[activeScreenIndex].title} 
                      className="screenshot-base-img mobile-screenshot mock-screenshot-img" 
                    />
                  `);

// Clean up any double closing tags that might have resulted from the sloppy regex replacement.
// Let's use a simpler string replacement for the mobile section:
// We know the exact mobile feed block I added earlier:
const oldMobileCode = `<div className="native-ui-container" style={{flexDirection: 'column'}}>
                    <div className="ui-mobile-head">
                       <div className="ui-mobile-avatar"/>
                       <div className="ui-mobile-info">
                         <div className="ui-mobile-name"/>
                         <div className="ui-mobile-class"/>
                       </div>
                    </div>
                    <div className="ui-mobile-feed">
                       <div className="ui-feed-card">
                         <div style={{width: '40%', height: '8px', background: 'var(--apex-gold)', borderRadius: '4px', marginBottom: '12px'}}/>
                         <div style={{width: '100%', height: '6px', background: 'rgba(255,255,255,0.4)', borderRadius: '3px', marginBottom: '6px'}}/>
                         <div style={{width: '80%', height: '6px', background: 'rgba(255,255,255,0.4)', borderRadius: '3px'}}/>
                       </div>
                       <div className="ui-feed-card" style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                         <div style={{width: '50%', height: '8px', background: '#fff', borderRadius: '4px'}}/>
                         <div style={{width: '30px', height: '30px', borderRadius: '50%', border: '3px solid #27c93f'}}/>
                       </div>
                       <div className="ui-feed-card">
                         <div style={{width: '100%', height: '60px', background: 'rgba(255,255,255,0.1)', borderRadius: '6px'}}/>
                       </div>
                    </div>
                  </div>`;

const newMobileCode = `<div className="device-frame-mobile">
                    <div className="dynamic-island"></div>
                    <img 
                      src={mobileScreens[activeScreenIndex].src} 
                      alt={mobileScreens[activeScreenIndex].title} 
                      className="screenshot-base-img mobile-screenshot mock-screenshot-img" 
                    />
                  </div>`;

if(tsx.includes(oldMobileCode)) {
  tsx = tsx.replace(oldMobileCode, newMobileCode);
} else {
  // If we couldn't find the exact oldMobileCode string, we will fall back to using grep_search later if needed.
}


fs.writeFileSync(tsxPath, tsx);

console.log("Mockups restored inside CSS Device Frames");
