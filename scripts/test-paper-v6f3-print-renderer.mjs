import test from 'node:test'
import assert from 'node:assert/strict'
import {createHash} from 'node:crypto'
import {readFileSync} from 'node:fs'
import {buildPrintHtml,buildPrintHtmlFromCanvasHtml} from '../src/components/PaperGeneratorSaaS/printDocumentRenderer.mjs'
const sha=x=>createHash('sha256').update(x).digest('hex')
const canvasHtml='<div id="paper-canvas"><section dir="rtl"><b>سوال</b></section><section>Question</section></div>'
const opts={showWatermark:true,logo:'/school-logo.png',watermarkOpacity:.08,watermarkScale:1.1,half:true,bodyFont:'Times New Roman, serif',urduFont:'Noto Nastaliq Urdu, serif',fontColor:'#111111',letterSp:.1,engLineH:1.5,urdLineH:2}

test('runtime wrapper and pure print helper are byte-identical',()=>{
 const direct=buildPrintHtmlFromCanvasHtml(canvasHtml,opts)
 const wrapped=buildPrintHtml({innerHTML:canvasHtml},opts)
 assert.equal(wrapped,direct)
 assert.equal((direct.match(/id="paper-canvas"/g)||[]).length,1)
})

test('print contract retains A4, native canvas, font and watermark semantics',()=>{
 const html=buildPrintHtmlFromCanvasHtml(canvasHtml,opts)
 for(const value of ['@page{size:A4 portrait;margin:4mm}','Noto+Nastaliq+Urdu','Times New Roman, serif','print-watermark','/school-logo.png','Cut along this line','<b>سوال</b>','Question'])assert.ok(html.includes(value),value)
 assert.ok(!html.includes('body { display: none'))
})

test('full-sheet no-watermark output does not invent optional print artifacts',()=>{
 const html=buildPrintHtmlFromCanvasHtml(canvasHtml,{showWatermark:false,half:false,bodyFont:'Arial, sans-serif'})
 assert.equal(html.includes('class="print-watermark"'),false)
 assert.equal(html.includes('Cut along this line'),false)
 assert.ok(html.includes(canvasHtml))
})

test('renderer extraction remains the sole PTSPaperGenerator print HTML implementation',()=>{
 const source=readFileSync(new URL('../src/components/PaperGeneratorSaaS/PTSPaperGenerator.jsx',import.meta.url),'utf8')
 assert.ok(source.includes("import { buildPrintHtml } from './printDocumentRenderer.mjs'"))
 assert.equal((source.match(/function buildPrintHtml\(/g)||[]).length,0)
 assert.ok(source.includes('doc.write(buildPrintHtml(canvas, {'))
})

test('deterministic renderer output hash is emitted for pinning',()=>{
 const hash=sha(buildPrintHtmlFromCanvasHtml(canvasHtml,opts))
 assert.equal(hash,'d39993fa2e7109c5324faae32d4ac6b9671f40b81338d62d4ce741af8c9980bb')
 console.log('V6F3_PRINT_CONTRACT_SHA256='+hash)
})
