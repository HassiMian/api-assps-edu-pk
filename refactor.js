const fs = require('fs');

const cssPath = 'C:/projects/My SAas/super-app/src/app/apex/apex.module.css';
let css = fs.readFileSync(cssPath, 'utf-8');

// 1. Replace centered layout with split layout in CSS
css = css.replace(
`/* Centered Product Marketing Sections (Treating screenshots as products) */
:global(.apex-story-centered) {
  min-height: 100vh;
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 140px 56px 80px;
  border-bottom: 1px solid var(--apex-line);
  overflow: hidden;
}

:global(.story-panel-center) {
  max-width: 860px;
  margin-bottom: 48px;
  position: relative;
  z-index: 5;
}

:global(.apex-kicker) {
  color: var(--apex-gold);
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  margin-bottom: 16px;
  display: block;
}

:global(.story-panel-center h2) {
  font-size: clamp(36px, 4.8vw, 64px);
  line-height: 1.05;
  font-weight: 800;
  margin: 0 0 24px;
}

:global(.lead-p) {
  color: rgba(255, 255, 255, 0.7);
  font-size: 19px;
  line-height: 1.65;
  max-width: 780px;
  margin: 0 auto 36px;
}

/* Focused centered Grid */
:global(.centered-grid) {
  max-width: 980px;
  margin: auto;
  border-top: 1px solid var(--apex-line);
  padding-top: 28px;
  display: flex;
  justify-content: center;
  gap: 64px;
}

:global(.centered-grid .module-group) {
  flex: 1;
}

:global(.centered-grid .module-group h4) {
  color: var(--apex-gold);
  font-size: 13px;
  font-weight: 800;
  margin: 0 0 10px;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

:global(.centered-grid .module-group p) {
  color: var(--apex-muted);
  font-size: 14.5px;
  line-height: 1.5;
}

/* Primary Centered Visual container (60-70% width) */
:global(.centered-visual-container) {
  width: 100%;
  max-width: 940px;
  position: relative;
  z-index: 2;
  margin-top: 12px;
  display: flex;
  justify-content: center;
}`,
`/* Premium Product Split Sections (45/55 layout) */
:global(.apex-story) {
  min-height: 100vh;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 140px 6%;
  gap: 60px;
  border-bottom: 1px solid var(--apex-line);
  overflow: hidden;
}

:global(.apex-story.layout-reverse) {
  flex-direction: row-reverse;
}

:global(.story-panel) {
  width: 45%;
  flex-shrink: 0;
  position: relative;
  z-index: 5;
  text-align: left;
}

:global(.apex-kicker) {
  color: var(--apex-gold);
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  margin-bottom: 16px;
  display: block;
}

:global(.story-panel h2) {
  font-size: clamp(36px, 4vw, 56px);
  line-height: 1.1;
  font-weight: 800;
  margin: 0 0 24px;
}

:global(.story-panel .lead-p) {
  color: rgba(255, 255, 255, 0.7);
  font-size: 18px;
  line-height: 1.65;
  max-width: 600px;
  margin: 0 0 36px;
}

/* Feature Grid for split layout */
:global(.feature-grid) {
  border-top: 1px solid var(--apex-line);
  padding-top: 28px;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

:global(.feature-grid .module-group h4) {
  color: var(--apex-gold);
  font-size: 13px;
  font-weight: 800;
  margin: 0 0 8px;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

:global(.feature-grid .module-group p) {
  color: var(--apex-muted);
  font-size: 14.5px;
  line-height: 1.5;
  margin: 0;
}

/* Primary Visual container (55% width) */
:global(.visual-block) {
  width: 55%;
  position: relative;
  z-index: 2;
  display: flex;
  justify-content: center;
}

/* Soft Radial Glow behind visual blocks */
:global(.visual-glow-bg) {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 90%;
  height: 90%;
  background: radial-gradient(circle, rgba(201, 168, 76, 0.12) 0%, rgba(21, 56, 95, 0.2) 40%, transparent 70%);
  filter: blur(50px);
  z-index: 0;
  pointer-events: none;
}`
);

// 2. Enhance mock window
css = css.replace(
`/* macOS Mock Browser */
:global(.premium-mock-window) {
  width: 100%;
  aspect-ratio: 16 / 10;
  border-radius: 18px;
  background: linear-gradient(135deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.01) 100%);
  backdrop-filter: blur(24px);
  border: 1px solid var(--apex-glass-border);
  box-shadow: 
    0 40px 100px rgba(0, 0, 0, 0.7), 
    inset 0 1px 0 rgba(255, 255, 255, 0.18);
  overflow: hidden;
  display: flex;
  flex-direction: column;
}`,
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
}`
);

// 3. Remove .admin-cinema-copy-center
css = css.replace(
`:global(.admin-cinema-copy-center) {
  max-width: 860px;
  margin-bottom: 48px;
  position: relative;
  z-index: 5;
}

:global(.admin-cinema-copy-center h2) {
  font-size: clamp(36px, 4.8vw, 64px);
  line-height: 1.05;
  font-weight: 800;
  margin: 0 0 24px;
}

:global(.admin-cinema-copy-center p) {
  color: rgba(255, 255, 255, 0.7);
  font-size: 19px;
  line-height: 1.65;
  max-width: 780px;
  margin: 0 auto 36px;
}`,
``
);

// 4. Remove old absolute positioned layout block
css = css.replace(/\/\* ========================================================\r?\n   CINEMATIC SPLIT-SCREEN LAYOUT FOR SIDE MOCKUP CARDS\r?\n   ======================================================== \*\/[\s\S]*?aspect-ratio: 9 \/ 19\.5 !important;\r?\n}/, 
`/* ========================================================
   RESPONSIVE MEDIA QUERIES FOR SPLIT LAYOUT
   ======================================================== */
@media (max-width: 1024px) {
  :global(.apex-story), :global(.apex-story.layout-reverse) {
    flex-direction: column;
    padding: 100px 6%;
    gap: 40px;
  }
  :global(.story-panel), :global(.visual-block) {
    width: 100%;
  }
  :global(.story-panel) {
    text-align: center;
  }
  :global(.feature-grid) {
    flex-direction: row;
    flex-wrap: wrap;
    justify-content: center;
    text-align: left;
  }
  :global(.feature-grid .module-group) {
    flex: 1 1 300px;
  }
}`
);

// Mobile cleanup
css = css.replace(
  `:global(.apex-story-centered),\n  :global(.apex-payment) {`,
  `:global(.apex-payment) {`
);
css = css.replace(
  `:global(.centered-grid) {`,
  `:global(.feature-grid) {`
);
css = css.replace(
  `:global(.story-panel-center),\n  :global(.payment-copy),\n  :global(.admin-cinema-copy-center) {`,
  `:global(.payment-copy) {`
);


fs.writeFileSync(cssPath, css);


const tsxPath = 'C:/projects/My SAas/super-app/src/app/apex/ApexGatewayClient.tsx';
let tsx = fs.readFileSync(tsxPath, 'utf-8');

// Apex OS
tsx = tsx.replace(
  `<section id="ecosystem" className="apex-story-centered apex-story-os">
        <div className="story-panel-center text-center">`,
  `<section id="ecosystem" className="apex-story apex-story-os">
        <div className="story-panel apex-reveal">`
).replace(
  `<div className="centered-visual-container">
          <div className="mock-device browser-mock">`,
  `<div className="visual-block">
          <div className="visual-glow-bg" />
          <div className="mock-device browser-mock">`
).replace(
  `<div className="centered-grid">`,
  `<div className="feature-grid">`
);

// Academic Forge
tsx = tsx.replace(
  `<section className="apex-story-centered apex-story-forge">
        <div className="story-panel-center text-center">`,
  `<section className="apex-story layout-reverse apex-story-forge">
        <div className="story-panel apex-reveal">`
).replace(
  `<div className="centered-visual-container">
          <div className="mock-device browser-mock">`,
  `<div className="visual-block">
          <div className="visual-glow-bg" />
          <div className="mock-device browser-mock">`
).replace(
  `<div className="centered-grid">`,
  `<div className="feature-grid">`
);

// Fees & Finance
tsx = tsx.replace(
  `<section className="apex-story-centered apex-story-finance">
        <div className="story-panel-center text-center">`,
  `<section className="apex-story apex-story-finance">
        <div className="story-panel apex-reveal">`
).replace(
  `<div className="centered-visual-container">
          <div className="mock-device browser-mock challan-revealer-section">`,
  `<div className="visual-block">
          <div className="visual-glow-bg" />
          <div className="mock-device browser-mock challan-revealer-section">`
).replace(
  `<div className="centered-grid">`,
  `<div className="feature-grid">`
);

// Apex Connect
tsx = tsx.replace(
  `<section id="modules" className="apex-story-centered apex-story-connect">
        <div className="story-panel-center text-center">`,
  `<section id="modules" className="apex-story layout-reverse apex-story-connect">
        <div className="story-panel apex-reveal">`
).replace(
  `<div className="centered-visual-container">
          <div className="phone-sequence-showcase">`,
  `<div className="visual-block">
          <div className="visual-glow-bg" />
          <div className="phone-sequence-showcase">`
).replace(
  `<div className="centered-grid">`,
  `<div className="feature-grid">`
);

// Command Center
tsx = tsx.replace(
  `<section className="apex-story-centered apex-story-command">
        <div className="admin-cinema-copy-center text-center">`,
  `<section className="apex-story apex-story-command">
        <div className="story-panel apex-reveal">`
).replace(
  `<section className="apex-story-centered apex-story-command">
        <div className="story-panel-center text-center">`,
  `<section className="apex-story apex-story-command">
        <div className="story-panel apex-reveal">`
).replace(
  `<div className="centered-visual-container">
          <div className="mock-device browser-mock">`,
  `<div className="visual-block">
          <div className="visual-glow-bg" />
          <div className="mock-device browser-mock">`
).replace(
  `<div className="centered-grid">`,
  `<div className="feature-grid">`
);

// Fix GSAP Triggers
tsx = tsx.replace(/\.apex-story-os \.story-panel-center/g, '.apex-story-os .story-panel')
         .replace(/\.apex-story-forge \.story-panel-center/g, '.apex-story-forge .story-panel')
         .replace(/\.apex-story-finance \.story-panel-center/g, '.apex-story-finance .story-panel')
         .replace(/\.apex-story-connect \.story-panel-center/g, '.apex-story-connect .story-panel')
         .replace(/\.apex-story-command \.story-panel-center/g, '.apex-story-command .story-panel');

// Refactor GSAP offsets for side-by-side
tsx = tsx.replace(
  `osTl.fromTo(".apex-story-os .story-panel", 
        { opacity: 0, y: 40 }, 
        { opacity: 1, y: 0, duration: 1 }, 
        0
      );
      osTl.fromTo(".apex-story-os .mock-device", 
        { y: 100, opacity: 0, scale: 0.88 }, 
        { y: 0, opacity: 1, scale: 1, duration: 1.3, ease: "power3.out" }, 
        0.2
      );`,
  `osTl.fromTo(".apex-story-os .story-panel", 
        { opacity: 0, x: -50 }, 
        { opacity: 1, x: 0, duration: 1 }, 
        0
      );
      osTl.fromTo(".apex-story-os .mock-device", 
        { x: 100, opacity: 0, scale: 0.9 }, 
        { x: 0, opacity: 1, scale: 1, duration: 1.3, ease: "power3.out" }, 
        0.2
      );`
);

tsx = tsx.replace(
  `forgeTl.fromTo(".apex-story-forge .story-panel", 
        { opacity: 0, y: 40 }, 
        { opacity: 1, y: 0, duration: 1 }, 
        0
      );
      forgeTl.fromTo(".apex-story-forge .mock-device", 
        { y: 100, opacity: 0, scale: 0.88 }, 
        { y: 0, opacity: 1, scale: 1, duration: 1.3, ease: "power3.out" }, 
        0.2
      );`,
  `forgeTl.fromTo(".apex-story-forge .story-panel", 
        { opacity: 0, x: 50 }, 
        { opacity: 1, x: 0, duration: 1 }, 
        0
      );
      forgeTl.fromTo(".apex-story-forge .mock-device", 
        { x: -100, opacity: 0, scale: 0.9 }, 
        { x: 0, opacity: 1, scale: 1, duration: 1.3, ease: "power3.out" }, 
        0.2
      );`
);

tsx = tsx.replace(
  `financeTl.fromTo(".apex-story-finance .story-panel", 
        { opacity: 0, y: 40 }, 
        { opacity: 1, y: 0, duration: 1 }, 
        0
      );
      
      // 1. Challan enters from left tilted
      financeTl.fromTo(".apex-story-finance .mock-device", 
        { x: 0, y: 100, opacity: 0, scale: 0.75, rotationZ: -8, rotationY: 10 },`,
  `financeTl.fromTo(".apex-story-finance .story-panel", 
        { opacity: 0, x: -50 }, 
        { opacity: 1, x: 0, duration: 1 }, 
        0
      );
      
      // 1. Challan enters from left tilted
      financeTl.fromTo(".apex-story-finance .mock-device", 
        { x: 100, y: 0, opacity: 0, scale: 0.75, rotationZ: -8, rotationY: 10 },`
);

tsx = tsx.replace(
  `connectTl.fromTo(".apex-story-connect .story-panel", 
        { opacity: 0, y: 40 }, 
        { opacity: 1, y: 0, duration: 1 }, 
        0
      );
      connectTl.fromTo(".apex-story-connect .mock-device", 
        { y: 100, opacity: 0, scale: 0.85 },
        { y: 0, opacity: 1, scale: 1, duration: 1.2, ease: "power3.out" },
        0.2
      );`,
  `connectTl.fromTo(".apex-story-connect .story-panel", 
        { opacity: 0, x: 50 }, 
        { opacity: 1, x: 0, duration: 1 }, 
        0
      );
      connectTl.fromTo(".apex-story-connect .phone-sequence-showcase", 
        { x: -100, opacity: 0, scale: 0.9 },
        { x: 0, opacity: 1, scale: 1, duration: 1.2, ease: "power3.out" },
        0.2
      );`
);

tsx = tsx.replace(
  `commandTl.fromTo(".apex-story-command .story-panel", 
        { opacity: 0, y: 40 }, 
        { opacity: 1, y: 0, duration: 1 }, 
        0
      );
      commandTl.fromTo(".apex-story-command .mock-device", 
        { y: 100, opacity: 0, scale: 0.88 }, 
        { y: 0, opacity: 1, scale: 1, duration: 1.2, ease: "power3.out" }, 
        0.2
      );`,
  `commandTl.fromTo(".apex-story-command .story-panel", 
        { opacity: 0, x: -50 }, 
        { opacity: 1, x: 0, duration: 1 }, 
        0
      );
      commandTl.fromTo(".apex-story-command .mock-device", 
        { x: 100, opacity: 0, scale: 0.9 }, 
        { x: 0, opacity: 1, scale: 1, duration: 1.2, ease: "power3.out" }, 
        0.2
      );`
);

fs.writeFileSync(tsxPath, tsx);

console.log("Refactoring complete");
