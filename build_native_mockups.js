const fs = require('fs');

// 1. UPDATE CSS
const cssPath = 'C:/projects/My SAas/super-app/src/app/apex/apex.module.css';
let css = fs.readFileSync(cssPath, 'utf-8');

const nativeCSS = `
/* ========================================================
   ULTRA-HD NATIVE DOM MOCKUPS
   ======================================================== */

/* Generic UI Container */
:global(.native-ui-container) {
  width: 100%;
  height: 100%;
  display: flex;
  background: #000000;
  color: #fff;
  font-family: 'Plus Jakarta Sans', sans-serif;
  overflow: hidden;
}

/* Sidebar */
:global(.ui-sidebar) {
  width: 22%;
  background: #04080f;
  border-right: 1px solid rgba(255,255,255,0.06);
  padding: 16px 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
:global(.ui-nav-item) {
  height: 24px;
  border-radius: 6px;
  background: rgba(255,255,255,0.02);
  display: flex;
  align-items: center;
  padding: 0 10px;
  gap: 8px;
}
:global(.ui-nav-item.active) {
  background: rgba(201, 168, 76, 0.15);
  border-left: 2px solid var(--apex-gold);
}
:global(.ui-nav-icon) {
  width: 12px; height: 12px;
  background: rgba(255,255,255,0.2);
  border-radius: 3px;
}
:global(.ui-nav-item.active .ui-nav-icon) {
  background: var(--apex-gold);
}
:global(.ui-nav-text) {
  width: 60%; height: 6px;
  background: rgba(255,255,255,0.2);
  border-radius: 3px;
}
:global(.ui-nav-item.active .ui-nav-text) {
  background: var(--apex-gold);
}

/* Main Content Area */
:global(.ui-main) {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: #010306;
}
:global(.ui-header) {
  height: 48px;
  border-bottom: 1px solid rgba(255,255,255,0.06);
  display: flex;
  align-items: center;
  padding: 0 20px;
  justify-content: space-between;
}
:global(.ui-header-title) {
  width: 120px; height: 10px;
  background: rgba(255,255,255,0.4);
  border-radius: 4px;
}
:global(.ui-header-actions) {
  display: flex;
  gap: 8px;
}
:global(.ui-avatar) {
  width: 20px; height: 20px;
  border-radius: 50%;
  background: var(--apex-gold);
}
:global(.ui-content) {
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  flex: 1;
  overflow: hidden;
}

/* OS Dashboard Grid */
:global(.ui-grid-3) {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
}
:global(.ui-card) {
  background: rgba(255,255,255,0.02);
  border: 1px solid rgba(255,255,255,0.06);
  border-radius: 12px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}
:global(.ui-card-title) {
  font-size: 10px;
  color: rgba(255,255,255,0.4);
  text-transform: uppercase;
  font-family: var(--mono-font);
}
:global(.ui-card-value) {
  font-size: 24px;
  font-weight: 800;
  color: #fff;
}
:global(.ui-chart-area) {
  flex: 1;
  background: rgba(255,255,255,0.02);
  border-radius: 12px;
  border: 1px solid rgba(255,255,255,0.06);
  display: flex;
  align-items: flex-end;
  padding: 16px;
  gap: 8px;
}
:global(.ui-bar) {
  flex: 1;
  background: rgba(201, 168, 76, 0.4);
  border-radius: 4px 4px 0 0;
  min-height: 10%;
}

/* Academic Forge specific */
:global(.ui-forge-list) {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
:global(.ui-forge-row) {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: rgba(255,255,255,0.02);
  padding: 12px;
  border-radius: 8px;
  border: 1px solid rgba(255,255,255,0.04);
}
:global(.ui-q-text) {
  width: 70%; height: 8px;
  background: rgba(255,255,255,0.6);
  border-radius: 4px;
}
:global(.ui-q-tag) {
  padding: 4px 8px;
  background: rgba(201,168,76,0.1);
  color: var(--apex-gold);
  border: 1px solid rgba(201,168,76,0.3);
  border-radius: 4px;
  font-size: 9px;
  font-weight: 800;
  font-family: var(--mono-font);
}

/* Finance Ledger specific */
:global(.ui-receipt) {
  background: #ffffff;
  border-radius: 12px;
  flex: 1;
  margin: 10px 40px;
  padding: 24px;
  display: flex;
  flex-direction: column;
  color: #000;
  position: relative;
  box-shadow: 0 20px 40px rgba(0,0,0,0.5);
}
:global(.ui-receipt-head) {
  text-align: center;
  border-bottom: 2px dashed #ccc;
  padding-bottom: 12px;
  margin-bottom: 12px;
}
:global(.ui-receipt-title) {
  font-size: 16px; font-weight: 800; letter-spacing: 2px;
}
:global(.ui-receipt-row) {
  display: flex; justify-content: space-between;
  margin-bottom: 8px;
  font-size: 11px;
  font-family: var(--mono-font);
  font-weight: 600;
  color: #444;
}
:global(.ui-receipt-total) {
  border-top: 2px dashed #ccc;
  padding-top: 12px;
  margin-top: 12px;
  display: flex; justify-content: space-between;
  font-size: 14px; font-weight: 800;
}
:global(.ui-stamp) {
  position: absolute;
  top: 50%; left: 50%;
  transform: translate(-50%, -50%) rotate(-15deg);
  border: 4px solid #27c93f;
  color: #27c93f;
  font-size: 32px;
  font-weight: 800;
  padding: 8px 16px;
  border-radius: 8px;
  opacity: 0.8;
  letter-spacing: 6px;
}

/* Mobile specific */
:global(.ui-mobile-head) {
  padding: 20px 16px 16px;
  background: #04080f;
  display: flex;
  align-items: center;
  gap: 12px;
  border-bottom: 1px solid rgba(255,255,255,0.06);
}
:global(.ui-mobile-avatar) {
  width: 40px; height: 40px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--apex-gold), #fff);
}
:global(.ui-mobile-info) {
  display: flex; flex-direction: column; gap: 4px;
}
:global(.ui-mobile-name) {
  width: 100px; height: 10px; background: #fff; border-radius: 4px;
}
:global(.ui-mobile-class) {
  width: 60px; height: 6px; background: rgba(255,255,255,0.4); border-radius: 3px;
}
:global(.ui-mobile-feed) {
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}
:global(.ui-feed-card) {
  background: rgba(255,255,255,0.04);
  border-radius: 12px;
  padding: 16px;
}

/* Background Texture classes for split sections */
:global(.bg-texture-grid) {
  position: absolute; inset: 0;
  background-size: 40px 40px;
  background-image: 
    linear-gradient(to right, rgba(255, 255, 255, 0.02) 1px, transparent 1px),
    linear-gradient(to bottom, rgba(255, 255, 255, 0.02) 1px, transparent 1px);
  z-index: 0; pointer-events: none;
}
`;

if(!css.includes('native-ui-container')) {
    css += nativeCSS;
    fs.writeFileSync(cssPath, css);
}

// 2. UPDATE TSX
const tsxPath = 'C:/projects/My SAas/super-app/src/app/apex/ApexGatewayClient.tsx';
let tsx = fs.readFileSync(tsxPath, 'utf-8');

// Replace standard image mockups with the new React functional components
const osDashboardReplacement = `
            <div className="native-ui-container">
              <div className="ui-sidebar">
                <div className="ui-nav-item active"><div className="ui-nav-icon"/><div className="ui-nav-text"/></div>
                <div className="ui-nav-item"><div className="ui-nav-icon"/><div className="ui-nav-text"/></div>
                <div className="ui-nav-item"><div className="ui-nav-icon"/><div className="ui-nav-text"/></div>
                <div className="ui-nav-item"><div className="ui-nav-icon"/><div className="ui-nav-text"/></div>
              </div>
              <div className="ui-main">
                <div className="ui-header">
                  <div className="ui-header-title"/>
                  <div className="ui-header-actions"><div className="ui-avatar"/></div>
                </div>
                <div className="ui-content">
                  <div className="ui-grid-3">
                    <div className="ui-card"><span className="ui-card-title">Total Students</span><span className="ui-card-value">12,450</span></div>
                    <div className="ui-card"><span className="ui-card-title">Active Staff</span><span className="ui-card-value">342</span></div>
                    <div className="ui-card"><span className="ui-card-title">Revenue</span><span className="ui-card-value" style={{color: 'var(--apex-gold)'}}>$1.2M</span></div>
                  </div>
                  <div className="ui-chart-area">
                    <div className="ui-bar" style={{height: '40%'}}/>
                    <div className="ui-bar" style={{height: '60%'}}/>
                    <div className="ui-bar" style={{height: '30%'}}/>
                    <div className="ui-bar" style={{height: '80%', background: '#fff'}}/>
                    <div className="ui-bar" style={{height: '100%', background: 'var(--apex-gold)'}}/>
                    <div className="ui-bar" style={{height: '70%'}}/>
                  </div>
                </div>
              </div>
            </div>
`;

tsx = tsx.replace(
  `{screenshotSrc && (
          <img src={screenshotSrc} alt={title} className="mock-screenshot-img" />
        )}`,
  `{screenshotSrc === '/apex/screenshots/dashboard.png' && (${osDashboardReplacement})}
   {screenshotSrc === '/apex/screenshots/paper-generator.png' && (
      <div className="native-ui-container">
        <div className="ui-main">
          <div className="ui-header">
            <div className="ui-header-title" style={{width: '180px'}}/>
            <div className="ui-header-actions"><div className="ui-q-tag">GENERATE</div></div>
          </div>
          <div className="ui-content">
            <div className="ui-forge-list">
              {[1,2,3,4,5].map(i => (
                <div className="ui-forge-row" key={i}>
                  <div className="ui-q-text"/>
                  <div className="ui-q-tag">{i % 2 === 0 ? 'MCQ' : 'LONG Q'}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
   )}
   {screenshotSrc === '/apex/screenshots/fees.png' && (
      <div className="native-ui-container" style={{background: '#0a0a0a', padding: '20px'}}>
        <div className="ui-receipt">
          <div className="ui-receipt-head">
            <div className="ui-receipt-title">APEX ACADEMY</div>
            <div style={{fontSize: '9px', marginTop: '4px'}}>FEE CHALLAN VOUCHER</div>
          </div>
          <div className="ui-receipt-row"><span>Tuition Fee</span><span>Rs. 8,500</span></div>
          <div className="ui-receipt-row"><span>Lab Charges</span><span>Rs. 1,200</span></div>
          <div className="ui-receipt-row"><span>Arrears</span><span>Rs. 0</span></div>
          <div className="ui-receipt-total"><span>TOTAL</span><span>Rs. 9,700</span></div>
          <div className="ui-stamp">PAID</div>
        </div>
      </div>
   )}
   {screenshotSrc === '/apex/screenshots/identity-studio.png' && (
      <div className="native-ui-container">
        <div className="ui-main" style={{alignItems: 'center', justifyContent: 'center'}}>
          <div style={{width: '140px', height: '200px', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', background: 'rgba(255,255,255,0.02)', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '20px', gap: '16px'}}>
             <div style={{width: '60px', height: '60px', borderRadius: '50%', background: '#fff'}} />
             <div style={{width: '80%', height: '8px', background: 'var(--apex-gold)', borderRadius: '4px'}} />
             <div style={{width: '100%', height: '40px', borderTop: '1px solid rgba(255,255,255,0.1)', marginTop: 'auto'}} />
          </div>
        </div>
      </div>
   )}
`
);

const mobileDashboardReplacement = `
                  <div className="native-ui-container" style={{flexDirection: 'column'}}>
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
                  </div>
`;

tsx = tsx.replace(
  `<img 
                    src={mobileScreens[activeScreenIndex].src} 
                    alt={mobileScreens[activeScreenIndex].title} 
                    className="screenshot-base-img mobile-screenshot mock-screenshot-img" 
                  />`,
  mobileDashboardReplacement
);

// 3. FIX GSAP ANIMATION SPEEDS
tsx = tsx.replace(/duration: 1\.5/g, 'duration: 0.6');
tsx = tsx.replace(/duration: 1\.3/g, 'duration: 0.5');
tsx = tsx.replace(/duration: 1\.2/g, 'duration: 0.5');
tsx = tsx.replace(/duration: 1\b/g, 'duration: 0.4');
tsx = tsx.replace(/duration: 0\.8/g, 'duration: 0.4');
tsx = tsx.replace(/ease: "power2.out"/g, 'ease: "expo.out"');
tsx = tsx.replace(/ease: "power3.out"/g, 'ease: "expo.out"');
tsx = tsx.replace(/ease: "power4.out"/g, 'ease: "expo.out"');
// For staggers, make them ultra tight
tsx = tsx.replace(/stagger: 0\.15/g, 'stagger: 0.05');
tsx = tsx.replace(/stagger: 0\.25/g, 'stagger: 0.08');

// 4. ADD BACKGROUND TEXTURES TO FIX "EMPTY" FEEL
tsx = tsx.replace(/<section className="apex-story apex-story-os">/g, '<section className="apex-story apex-story-os"><div className="bg-texture-grid" />');
tsx = tsx.replace(/<section className="apex-story layout-reverse apex-story-forge">/g, '<section className="apex-story layout-reverse apex-story-forge"><div className="bg-texture-grid" />');
tsx = tsx.replace(/<section className="apex-story apex-story-finance">/g, '<section className="apex-story apex-story-finance"><div className="bg-texture-grid" />');
tsx = tsx.replace(/<section id="modules" className="apex-story layout-reverse apex-story-connect">/g, '<section id="modules" className="apex-story layout-reverse apex-story-connect"><div className="bg-texture-grid" />');
tsx = tsx.replace(/<section className="apex-story apex-story-command">/g, '<section className="apex-story apex-story-command"><div className="bg-texture-grid" />');


fs.writeFileSync(tsxPath, tsx);

console.log("Native UI and Speed Optimizations Complete");
