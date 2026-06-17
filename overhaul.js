const fs = require('fs');

const cssPath = 'C:/projects/My SAas/super-app/src/app/apex/apex.module.css';
let css = fs.readFileSync(cssPath, 'utf-8');

// 1. Theme Palette Update & Font Imports
css = css.replace(
  `@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap');`,
  `@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;600;800&display=swap');`
);

css = css.replace(
`:global(:root) {
  --apex-navy: #071525;
  --apex-navy-2: #0d2138;
  --apex-blue: #15385f;
  --apex-gold: #c9a84c;
  --apex-cream: #f4efe4;
  --apex-white: #ffffff;
  --apex-muted: #9fb0c2;
  --apex-line: rgba(255, 255, 255, 0.08);
  --apex-glass-bg: rgba(255, 255, 255, 0.02);
  --apex-glass-border: rgba(255, 255, 255, 0.06);
}`,
`:global(:root) {
  --apex-navy: #000000;
  --apex-navy-2: #09090b;
  --apex-blue: #111113;
  --apex-gold: #c9a84c;
  --apex-cream: #f4efe4;
  --apex-white: #ffffff;
  --apex-muted: #888888;
  --apex-line: rgba(255, 255, 255, 0.06);
  --apex-glass-bg: rgba(255, 255, 255, 0.015);
  --apex-glass-border: rgba(255, 255, 255, 0.04);
  --mono-font: 'JetBrains Mono', monospace;
}`
);

// Update nav background to black blur
css = css.replace(
  `background: rgba(7, 21, 37, 0.72);`,
  `background: rgba(0, 0, 0, 0.6);`
);

// 2. Technical Kickers & Typography
css = css.replace(
`:global(.apex-kicker) {
  color: var(--apex-gold);
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  margin-bottom: 16px;
  display: block;
}`,
`:global(.apex-kicker) {
  color: var(--apex-muted);
  font-family: var(--mono-font);
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  margin-bottom: 20px;
  display: block;
  border-left: 1px solid var(--apex-gold);
  padding-left: 12px;
}`
);

// Premium Text updates
css = css.replace(
`:global(.premium-text) {
  background: linear-gradient(135deg, #ffffff 0%, #cbd5e1 50%, #94a3b8 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}`,
`:global(.premium-text) {
  background: linear-gradient(180deg, #ffffff 0%, #a1a1aa 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}`
);

// 3. New Hero Section Styling
if (!css.includes('.monumental-hero')) {
  css += `
/* Monumental Hero */
:global(.monumental-hero) {
  position: relative;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  padding-top: 22vh;
  min-height: 120vh;
  z-index: 10;
}
:global(.monumental-hero h1) {
  font-size: clamp(48px, 8vw, 96px);
  font-weight: 800;
  line-height: 1;
  text-align: center;
  letter-spacing: -0.04em;
  max-width: 1100px;
  margin: 0 0 24px;
}
:global(.monumental-sub) {
  font-size: clamp(18px, 2vw, 24px);
  color: var(--apex-muted);
  text-align: center;
  max-width: 700px;
  line-height: 1.5;
  margin-bottom: 48px;
}
:global(.hero-bento-dock) {
  position: relative;
  width: 100%;
  max-width: 1200px;
  height: 60vh;
  margin-top: 60px;
  transform: perspective(1000px) rotateX(15deg) scale(0.95);
  transform-origin: top center;
  border-radius: 24px;
  background: linear-gradient(180deg, rgba(201,168,76,0.05) 0%, transparent 100%);
  border-top: 1px solid rgba(201,168,76,0.2);
  box-shadow: 0 -40px 100px rgba(201,168,76,0.1);
  display: flex;
  justify-content: center;
  overflow: hidden;
}
:global(.hero-bento-dock::after) {
  content: '';
  position: absolute;
  bottom: 0; left: 0; right: 0; height: 50%;
  background: linear-gradient(to bottom, transparent, #000000);
}
`;
}

// 4. Borderless Bento Glass (Replacing fake browser chrome)
css = css.replace(
`/* macOS Mock Browser */
:global(.premium-mock-window) {
  width: 100%;
  aspect-ratio: 16 / 10;
  border-radius: 18px;
  background: linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.02) 100%);
  backdrop-filter: blur(28px);
  border: 1px solid rgba(255, 255, 255, 0.15);
  box-shadow: 
    0 40px 100px rgba(0, 0, 0, 0.85), 
    inset 0 1px 0 rgba(255, 255, 255, 0.25);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  position: relative;
  z-index: 10;
}`,
`/* Ultra-Premium Borderless Bento Glass */
:global(.premium-mock-window) {
  width: 100%;
  aspect-ratio: 16 / 10;
  border-radius: 20px;
  background: rgba(9, 9, 11, 0.6);
  backdrop-filter: blur(40px);
  border: 1px solid rgba(255, 255, 255, 0.05);
  box-shadow: 
    0 40px 100px rgba(0, 0, 0, 0.9), 
    inset 0 1px 1px rgba(255, 255, 255, 0.1);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  position: relative;
  z-index: 10;
  transition: transform 0.5s cubic-bezier(0.16, 1, 0.3, 1), border-color 0.5s ease;
}
:global(.premium-mock-window:hover) {
  border-color: rgba(255, 255, 255, 0.15);
  transform: translateY(-4px);
}`
);

// 5. Update Panels (Floating glass panels to be sleeker)
css = css.replace(
`:global(.floating-glass-panel) {
  position: absolute;
  z-index: 4;
  background: rgba(13, 33, 56, 0.76);
  backdrop-filter: blur(14px);
  border: 1px solid rgba(201, 168, 76, 0.3);
  box-shadow: 
    0 24px 60px rgba(0, 0, 0, 0.65),
    inset 0 1px 0 rgba(255, 255, 255, 0.12);
  padding: 16px 20px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  gap: 14px;
  max-width: 290px;
}`,
`:global(.floating-glass-panel) {
  position: absolute;
  z-index: 4;
  background: rgba(9, 9, 11, 0.85);
  backdrop-filter: blur(24px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow: 
    0 30px 60px rgba(0, 0, 0, 0.8),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
  padding: 16px 20px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  gap: 14px;
  max-width: 290px;
  transition: all 0.3s ease;
}
:global(.floating-glass-panel:hover) {
  border-color: rgba(201, 168, 76, 0.4);
}`
);

// 6. Fix background of features
css = css.replace(/background: rgba\(7, 21, 37, 0\.72\);/g, 'background: rgba(9, 9, 11, 0.72);');
css = css.replace(/background: #050d17;/g, 'background: #000000;');
css = css.replace(/background: #060e18;/g, 'background: #000000;');

fs.writeFileSync(cssPath, css);


const tsxPath = 'C:/projects/My SAas/super-app/src/app/apex/ApexGatewayClient.tsx';
let tsx = fs.readFileSync(tsxPath, 'utf-8');

// 1. Remove Fake Browser Chrome controls
tsx = tsx.replace(
`function WindowChrome({ children, title, icon: Icon, screenshotSrc }: { children: React.ReactNode, title: string, icon: any, screenshotSrc?: string }) {
  return (
    <div className="premium-mock-window">
      <div className="window-header">
        <div className="traffic-lights">
          <span className="tl close" />
          <span className="tl minimize" />
          <span className="tl maximize" />
        </div>
        <div className="window-title">
          <Icon size={12} className="w-icon" />
          {title}
        </div>
        <div className="window-actions">
           <Search size={12} />
           <Bell size={12} />
        </div>
      </div>
      <div className="window-body" style={{ position: "relative", overflow: "hidden" }}>
        {screenshotSrc && (
          <img src={screenshotSrc} alt={title} className="mock-screenshot-img" />
        )}
        {children}
      </div>
    </div>
  );
}`,
`function WindowChrome({ children, title, icon: Icon, screenshotSrc }: { children: React.ReactNode, title: string, icon: any, screenshotSrc?: string }) {
  return (
    <div className="premium-mock-window">
      <div className="window-body" style={{ position: "relative", overflow: "hidden", height: "100%" }}>
        {screenshotSrc && (
          <img src={screenshotSrc} alt={title} className="mock-screenshot-img" />
        )}
        {/* Subtle Top Inner shadow to fake bezel depth */}
        <div style={{position: 'absolute', top: 0, left: 0, right: 0, height: '60px', background: 'linear-gradient(to bottom, rgba(0,0,0,0.4), transparent)', pointerEvents: 'none', zIndex: 5}} />
        {children}
      </div>
    </div>
  );
}`
);

// 2. Monumental Hero Replacement
const heroOld = `<section id="top" className="apex-hero-cinematic apex-scene">
        <div className="engineering-grid" aria-hidden="true" />
        {/* Floating Data Objects representing records */}
        <div className="chaos-container" aria-hidden="true">
          <div className="chaos-item type-records" style={{ left: "6%", top: "42%" }}>Student Records</div>
          <div className="chaos-item type-fees" style={{ left: "28%", top: "25%" }}>Rs. Fees Ledger</div>
          <div className="chaos-item type-attendance" style={{ left: "46%", top: "54%" }}>Attendance Log</div>
          <div className="chaos-item type-exams" style={{ left: "64%", top: "20%" }}>Exams Marks</div>
          <div className="chaos-item type-families" style={{ left: "80%", top: "35%" }}>Family Records</div>
          <div className="chaos-item type-reports" style={{ left: "12%", top: "60%" }}>Result Sheets</div>
          <div className="chaos-item type-messages" style={{ left: "72%", top: "66%" }}>SMS Alerts</div>
          <div className="chaos-item type-forge" style={{ left: "48%", top: "74%" }}>Paper Generator</div>
        </div>

        {/* Scene 1 Overlay Text */}
        <div className="chaos-text-overlay">
          <h1 className="chaos-anim-text premium-text">Schools generate thousands of records every day.</h1>
        </div>

        {/* Scene 2 Overlay Text */}
        <div className="disconnected-text-overlay">
          <h2 className="break-line premium-text">Most systems were never built for this complexity.</h2>
        </div>

        {/* Scene 3: Central Emerge Logo */}
        <div className="apex-logo-emerge">
          <img src="/apex-logo.svg" alt="Apex Core Logo" className="emerge-brand-svg" />
          
          <div className="apex-hero-final-actions">
            <a href="#portals" className="apex-btn primary">Enter Ecosystem</a>
            <a href="#demo" className="apex-btn ghost">Request SaaS Demo</a>
          </div>
        </div>
      </section>`;

const heroNew = `<section id="top" className="monumental-hero">
        <div className="engineering-grid" aria-hidden="true" />
        <div className="visual-glow-bg" style={{ top: '30%', filter: 'blur(100px)' }} />
        
        <h1 className="premium-text">
          <span className="text-stagger-line"><span className="hero-stagger-inner">The Education</span></span><br/>
          <span className="text-stagger-line"><span className="hero-stagger-inner">Operating System.</span></span>
        </h1>
        <p className="monumental-sub text-stagger-line">
          <span className="hero-stagger-inner">A singular, uncompromising enterprise architecture designed to unify administration, academics, and families.</span>
        </p>

        <div className="apex-hero-final-actions text-stagger-line">
          <div className="hero-stagger-inner">
            <a href="#portals" className="apex-btn primary">Enter Ecosystem</a>
            <a href="#demo" className="apex-btn ghost" style={{ marginLeft: '16px' }}>Request SaaS Demo</a>
          </div>
        </div>

        <div className="hero-bento-dock">
          <img src="/apex/screenshots/dashboard.png" alt="Apex OS Architecture" style={{ width: '100%', height: 'auto', objectFit: 'cover', opacity: 0.8 }} />
        </div>
      </section>`;

tsx = tsx.replace(heroOld, heroNew);

// 3. Fix GSAP logic for the new Hero
const heroGsapOld = `// Scene 1, 2, 3: Cinematic Hero Intro (Pinned)
      const heroTl = gsap.timeline({
        scrollTrigger: {
          trigger: ".apex-hero-cinematic",
          start: "top top",
          end: "+=300%",
          scrub: 1,
          pin: !isMobile,
        }
      });

      heroTl.fromTo(".chaos-item", 
        { y: "100vh", opacity: 0, scale: 0.85 },
        { y: "-35vh", opacity: 1, scale: 1, stagger: 0.08, duration: 1.5, ease: "power2.inOut" },
        0
      );
      heroTl.to(".chaos-text-overlay", { opacity: 1, duration: 0.6 }, 0.2);
      heroTl.to(".chaos-text-overlay", { opacity: 0, y: -45, duration: 0.5 }, 1.4);

      heroTl.to(".chaos-item", { 
        x: () => (Math.random() - 0.5) * 600, 
        y: () => (Math.random() - 0.5) * 400, 
        opacity: 0.25, 
        filter: "grayscale(100%) blur(4px)",
        stagger: 0.02, 
        duration: 1.2, 
        ease: "power2.inOut" 
      }, 1.6);
      heroTl.to(".disconnected-text-overlay", { opacity: 1, duration: 0.6 }, 1.6);
      heroTl.to(".disconnected-text-overlay", { opacity: 0, y: -45, duration: 0.5 }, 2.4);

      heroTl.to(".chaos-item", { x: 0, y: 0, opacity: 0, scale: 0.1, duration: 1 }, 2.6);
      heroTl.to(".apex-logo-emerge", { opacity: 1, scale: 1, duration: 1.2, ease: "back.out(1.5)" }, 2.8);
      heroTl.to(".apex-hero-final-actions", { opacity: 1, y: 0, duration: 0.6 }, 3.3);`;

const heroGsapNew = `// Monumental Hero Intro Animation
      const heroTl = gsap.timeline({ defaults: { ease: "power4.out" } });
      heroTl.fromTo(".hero-stagger-inner", 
        { y: "120%", rotation: 4, opacity: 0 },
        { y: "0%", rotation: 0, opacity: 1, duration: 1.2, stagger: 0.15 },
        0.2
      );
      heroTl.fromTo(".hero-bento-dock",
        { y: 150, opacity: 0, rotationX: 25 },
        { y: 0, opacity: 1, rotationX: 15, duration: 1.5, ease: "power3.out" },
        0.6
      );
      
      // Scale down hero on scroll
      gsap.to(".hero-bento-dock", {
        scrollTrigger: {
          trigger: ".monumental-hero",
          start: "top top",
          end: "bottom top",
          scrub: 1
        },
        scale: 0.85,
        opacity: 0.2,
        y: -100
      });`;

tsx = tsx.replace(heroGsapOld, heroGsapNew);

fs.writeFileSync(tsxPath, tsx);

console.log("Tier-1 Overhaul complete");
