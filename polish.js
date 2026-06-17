const fs = require('fs');

const cssPath = 'C:/projects/My SAas/super-app/src/app/apex/apex.module.css';
let css = fs.readFileSync(cssPath, 'utf-8');

// 1. Upgrade visual-glow-bg to Animated Aurora
css = css.replace(
`/* Soft Radial Glow behind visual blocks */
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
}`,
`/* Animated Aurora Glow behind visual blocks */
@keyframes auroraSpin {
  0% { transform: translate(-50%, -50%) rotate(0deg) scale(1); }
  50% { transform: translate(-50%, -50%) rotate(180deg) scale(1.15); }
  100% { transform: translate(-50%, -50%) rotate(360deg) scale(1); }
}

:global(.visual-glow-bg) {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 130%;
  height: 130%;
  background: 
    radial-gradient(ellipse at 30% 30%, rgba(201, 168, 76, 0.14) 0%, transparent 50%),
    radial-gradient(ellipse at 70% 70%, rgba(31, 88, 148, 0.18) 0%, transparent 55%),
    radial-gradient(ellipse at 50% 80%, rgba(13, 33, 56, 0.4) 0%, transparent 70%);
  filter: blur(60px);
  z-index: 0;
  pointer-events: none;
  animation: auroraSpin 25s linear infinite;
  opacity: 0.9;
}`
);

// 2. Add Engineering Grid to the top
if (!css.includes('engineering-grid')) {
  css += `\n
/* Engineering Grid for Hero */
:global(.engineering-grid) {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  background-size: 50px 50px;
  background-image: 
    linear-gradient(to right, rgba(255, 255, 255, 0.03) 1px, transparent 1px),
    linear-gradient(to bottom, rgba(255, 255, 255, 0.03) 1px, transparent 1px);
  z-index: 0;
  mask-image: radial-gradient(circle at 50% 40%, rgba(0,0,0,1) 0%, rgba(0,0,0,0) 70%);
  -webkit-mask-image: radial-gradient(circle at 50% 40%, rgba(0,0,0,1) 0%, rgba(0,0,0,0) 70%);
  pointer-events: none;
}\n`;
}

// 3. Typography polish for text-staggers
if (!css.includes('text-stagger-line')) {
  css += `\n
/* GSAP Text Stagger wrappers */
:global(.text-stagger-line) {
  overflow: hidden;
  display: block;
}
:global(.text-stagger-inner) {
  display: block;
}\n`;
}

// 4. Hover states for buttons
css = css.replace(
`:global(.apex-btn.primary) {
  background: var(--apex-gold);
  color: var(--apex-navy);
  box-shadow: 0 8px 30px rgba(201, 168, 76, 0.35);
}`,
`:global(.apex-btn.primary) {
  background: linear-gradient(135deg, #dfc067 0%, #c9a84c 100%);
  color: #040b14;
  box-shadow: 0 8px 30px rgba(201, 168, 76, 0.35);
}`
);

fs.writeFileSync(cssPath, css);


const tsxPath = 'C:/projects/My SAas/super-app/src/app/apex/ApexGatewayClient.tsx';
let tsx = fs.readFileSync(tsxPath, 'utf-8');

// Add Engineering grid to Hero
tsx = tsx.replace(
  `<section id="top" className="apex-hero-cinematic apex-scene">`,
  `<section id="top" className="apex-hero-cinematic apex-scene">\n        <div className="engineering-grid" aria-hidden="true" />`
);

// Wrap h2 elements for stagger animations
tsx = tsx.replace(
  `<h2 className="premium-text">The operating system behind every school operation.</h2>`,
  `<h2 className="premium-text">
            <span className="text-stagger-line"><span className="text-stagger-inner">The operating system behind</span></span>
            <span className="text-stagger-line"><span className="text-stagger-inner">every school operation.</span></span>
          </h2>`
);
tsx = tsx.replace(
  `<h2 className="premium-text">From question banks to complete exam papers.</h2>`,
  `<h2 className="premium-text">
            <span className="text-stagger-line"><span className="text-stagger-inner">From question banks to</span></span>
            <span className="text-stagger-line"><span className="text-stagger-inner">complete exam papers.</span></span>
          </h2>`
);
tsx = tsx.replace(
  `<h2 className="premium-text">Every rupee tracked. Every record connected.</h2>`,
  `<h2 className="premium-text">
            <span className="text-stagger-line"><span className="text-stagger-inner">Every rupee tracked.</span></span>
            <span className="text-stagger-line"><span className="text-stagger-inner">Every record connected.</span></span>
          </h2>`
);
tsx = tsx.replace(
  `<h2 className="premium-text">One connected experience for families, teachers, and students.</h2>`,
  `<h2 className="premium-text">
            <span className="text-stagger-line"><span className="text-stagger-inner">One connected experience for</span></span>
            <span className="text-stagger-line"><span className="text-stagger-inner">families, teachers, and students.</span></span>
          </h2>`
);

// GSAP Mobile Override implementation
// Replace 'pin: true' with 'pin: !isMobile' for smoother mobile scrolling
tsx = tsx.replace(/pin: true,/g, 'pin: !isMobile,');

// Implement GSAP Text Stagger animations
tsx = tsx.replace(
  `osTl.fromTo(".apex-story-os .story-panel", 
        { opacity: 0, x: -50 }, 
        { opacity: 1, x: 0, duration: 1 }, 
        0
      );`,
  `osTl.fromTo(".apex-story-os .story-panel", 
        { opacity: 0, x: -40 }, 
        { opacity: 1, x: 0, duration: 1, ease: "power3.out" }, 
        0
      );
      osTl.fromTo(".apex-story-os .text-stagger-inner",
        { y: "120%", rotation: 4 },
        { y: "0%", rotation: 0, duration: 1.2, stagger: 0.15, ease: "power4.out" },
        0.1
      );`
);

tsx = tsx.replace(
  `forgeTl.fromTo(".apex-story-forge .story-panel", 
        { opacity: 0, x: 50 }, 
        { opacity: 1, x: 0, duration: 1 }, 
        0
      );`,
  `forgeTl.fromTo(".apex-story-forge .story-panel", 
        { opacity: 0, x: 40 }, 
        { opacity: 1, x: 0, duration: 1, ease: "power3.out" }, 
        0
      );
      forgeTl.fromTo(".apex-story-forge .text-stagger-inner",
        { y: "120%", rotation: 4 },
        { y: "0%", rotation: 0, duration: 1.2, stagger: 0.15, ease: "power4.out" },
        0.1
      );`
);

tsx = tsx.replace(
  `financeTl.fromTo(".apex-story-finance .story-panel", 
        { opacity: 0, x: -50 }, 
        { opacity: 1, x: 0, duration: 1 }, 
        0
      );`,
  `financeTl.fromTo(".apex-story-finance .story-panel", 
        { opacity: 0, x: -40 }, 
        { opacity: 1, x: 0, duration: 1, ease: "power3.out" }, 
        0
      );
      financeTl.fromTo(".apex-story-finance .text-stagger-inner",
        { y: "120%", rotation: 4 },
        { y: "0%", rotation: 0, duration: 1.2, stagger: 0.15, ease: "power4.out" },
        0.1
      );`
);

tsx = tsx.replace(
  `connectTl.fromTo(".apex-story-connect .story-panel", 
        { opacity: 0, x: 50 }, 
        { opacity: 1, x: 0, duration: 1 }, 
        0
      );`,
  `connectTl.fromTo(".apex-story-connect .story-panel", 
        { opacity: 0, x: 40 }, 
        { opacity: 1, x: 0, duration: 1, ease: "power3.out" }, 
        0
      );
      connectTl.fromTo(".apex-story-connect .text-stagger-inner",
        { y: "120%", rotation: 4 },
        { y: "0%", rotation: 0, duration: 1.2, stagger: 0.15, ease: "power4.out" },
        0.1
      );`
);


fs.writeFileSync(tsxPath, tsx);

console.log("Polish complete");
