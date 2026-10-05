// V6-F3: pure source-native print document wrapper shared by runtime print and golden evidence.
// It intentionally does not authorize printing; Delivery Center remains the server policy gate.
export function buildPrintHtmlFromCanvasHtml(canvasHtml, opts = {}) {
 const {
  showWatermark, logo, watermarkOpacity, watermarkScale, half,
  bodyFont, urduFont, fontColor, letterSp, engLineH, urdLineH,
 } = opts
 const wmBlock = (showWatermark && logo && watermarkOpacity > 0)
  ? `<div class="print-watermark" style="position:fixed;top:52%;left:50%;transform:translate(-50%,-50%);width:${145 * watermarkScale}mm;height:${145 * watermarkScale}mm;opacity:${watermarkOpacity};z-index:0;pointer-events:none;display:flex;align-items:center;justify-content:center;"><img src="${logo}" style="max-width:100%;max-height:100%;object-fit:contain;" alt="" /></div>`
  : ''
 const halfCss = half ? `
  .half-cut-line{width:100%;max-width:210mm;margin:0 auto;border:none;border-top:2px dashed #666;height:0;position:relative;}
  .half-cut-line::after{content:'Cut along this line';position:absolute;left:50%;top:-10px;transform:translateX(-50%);background:#fff;padding:0 8px;font-size:9px;color:#666;letter-spacing:0.08em;text-transform:uppercase;}
  .preview-container.half-sheet{max-height:148.5mm;overflow:hidden;page-break-inside:avoid;}
  @media print{.half-cut-line{page-break-after:always;border-top:1px dashed #999;}.half-cut-line::after{color:#333;}}
 ` : ''
 return `<!DOCTYPE html><html><head><meta charset="UTF-8">
<link href="https://fonts.googleapis.com/css2?family=Noto+Nastaliq+Urdu:wght@400;700&display=swap" rel="stylesheet">
<style>
*,*::before,*::after{box-sizing:border-box}
html,body{margin:0;padding:0;background:white;color:${fontColor || '#1a1a1a'};font-family:${bodyFont || 'Arial, sans-serif'};letter-spacing:${letterSp || 0}px}
@page{size:A4 portrait;margin:4mm}
body{display:flex;flex-direction:column;align-items:center;width:100%;position:relative}
.print-watermark{z-index:0}
body>.print-shell{position:relative;z-index:1;width:100%}
[contenteditable]{outline:none!important;border:none!important;background:transparent!important}
table{border-collapse:collapse}
[data-edit-guide],[data-manual-edit]{border:none!important}
.preview-container{min-height:auto!important;box-shadow:none!important;margin:0 auto!important;width:100%!important;max-width:210mm!important}
.preview-wm{display:none!important}
.half-cut-guide{display:none!important}
${halfCss}
</style></head><body>
${wmBlock}
<div class="print-shell">${String(canvasHtml ?? '')}</div>
</body></html>`
}

export function buildPrintHtml(canvas, opts = {}) {
 if (!canvas || typeof canvas.innerHTML !== 'string') throw new Error('A paper canvas element is required.')
 return buildPrintHtmlFromCanvasHtml(canvas.innerHTML, opts)
}
