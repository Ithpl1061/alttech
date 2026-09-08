import { readFile } from 'node:fs/promises'
import { fileURLToPath, pathToFileURL } from 'node:url'
import path from 'node:path'
import { chromium } from 'playwright'
import { config } from '../config/env.js'

const serverRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..')
const reportLogoPath = path.join(serverRoot, 'frontend', 'src', 'assets', 'Alltech-Logo.avif')
const signaturePath = path.join(serverRoot, 'frontend', 'src', 'assets', '21aec37710d94a55a24d470aa9cb64cb_gemini-3.1-flash-image-preview.jpg')

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[character]))
}

function formatDate(value) {
  if (!value) return ''
  const [year, month, day] = String(value).split('-')
  return year && month && day ? `${day}.${month}.${year}` : value
}

async function dataUri(filePath, mimeType) {
  const content = await readFile(filePath)
  return `data:${mimeType};base64,${content.toString('base64')}`
}

function reportMarkup(report, logoUri, signatureUri) {
  const rows = report.tests.map((row) => `<div class="figma-results-row"><span>${escapeHtml(row.parameter)}</span><span>${escapeHtml(row.method)}</span><span>${escapeHtml(row.result)}</span><span>${escapeHtml(row.unit)}</span><span>${escapeHtml(row.remark)}</span></div>`).join('')
  return `<!doctype html><html><head><meta charset="utf-8"><style>
@page{size:210mm 297mm;margin:0}*{box-sizing:border-box}html,body{margin:0;padding:0;background:#fff}body{font-family:Arial,Helvetica,"Liberation Sans",sans-serif;color:#000}.figma-report{position:relative;width:210mm;height:296.5mm;min-height:296.5mm;padding:10.054mm 10.583mm 6.35mm;display:flex;flex-direction:column;background:#fff;overflow:visible}.figma-header{display:flex;flex-direction:column;align-items:flex-end}.figma-logo{display:flex;align-items:center;color:#111;line-height:1}.figma-logo-img{flex:none;height:200px;width:auto;margin-right:6px;transform:translateX(2px);mix-blend-mode:multiply}.figma-foundation{font-family:"Arial Black",Arial,sans-serif;margin-left:10px;font-size:42px;font-weight:900;letter-spacing:-2px;line-height:1}.figma-services{margin-top:-65px;position:relative;z-index:1;font-family:"Arial Black",Arial,sans-serif;color:#000;font-size:20px;font-weight:900;letter-spacing:-.5px}.figma-orange-divider{height:14px;margin:16px -34px 0;border-top:2px solid #000;border-right:1px solid #000;border-left:1px solid #000;background:#e2601a}.figma-title{margin-top:30px;color:#1f3864;font-size:18px;font-weight:700;text-align:center;text-decoration:underline;text-decoration-thickness:1px;text-underline-offset:3px}.figma-client{margin:28px 0 0 42px;color:#1f4e79;font-size:14px}.figma-client p{margin:0}.figma-client p+p{margin:6px 0 0 42px}.figma-section-rule{height:2px;margin:40px 20px 0;background:#000}.figma-info{display:flex;gap:56px;margin:18px 0 0 42px;color:#000;font-size:13px;line-height:20px}.figma-info p{display:flex;margin:0;white-space:nowrap}.figma-info p span{width:150px;flex:none}.figma-info p b{width:12px;flex:none;color:#000;font-weight:400}.figma-results{margin:40px 20px 0}.figma-results-head{display:grid;grid-template-columns:38% 17% 15% 15% 15%;padding:9px 12px;border-top:1px solid #000;border-bottom:1px solid #000;font-size:14px}.figma-results-head span:last-child{text-align:right}.figma-results-row{display:grid;grid-template-columns:38% 17% 15% 15% 15%;align-items:center;min-height:34px;padding:9px 12px;font-size:13px}.figma-results-row:nth-child(odd){background:#dce6f2}.figma-results-row span:last-child{text-align:center}.figma-after-results{margin-top:5.291mm}.figma-signatory{margin:5.291mm 0 0 20px;color:#000}.figma-signatory p{margin:0;font-size:14px}.figma-stamp-crop{position:relative;display:block;width:80px;height:80px;margin:8px 0 0 40px;overflow:hidden;border-radius:50%;background:transparent}.figma-stamp-crop img{position:absolute;width:123px;max-width:none;height:auto;left:-28px;top:-17px;mix-blend-mode:multiply;filter:contrast(1.35) brightness(1.1)}.figma-disclaimer{margin:5.291mm 20px 0;border-top:1px solid #000;border-bottom:1px solid #000;padding:8px 0;color:#000}.figma-disclaimer p{margin:0;font-size:7.2px;font-weight:700;line-height:10.4px}.figma-footer{position:absolute;right:10.583mm;bottom:6.35mm;left:10.583mm;margin:0;padding-top:4.233mm;padding-bottom:0;color:#000;font-size:8.04px;line-height:11.76px;text-align:center}.figma-footer p{margin:0}.figma-footer b{font-weight:700}.figma-footer span{display:block;margin-top:1.2px;font-size:8.04px;text-align:right}
</style></head><body><article class="figma-report"><header class="figma-header"><div class="figma-logo"><img class="figma-logo-img" src="${logoUri}" alt="Alltech logo"><span class="figma-foundation">FOUNDATION</span></div><div class="figma-services">Laboratory Services</div></header><div class="figma-orange-divider"></div><div class="figma-title">TEST REPORT</div><section class="figma-client"><p>Name: ${escapeHtml(report.name)}</p><p>${escapeHtml(report.address)}</p></section><div class="figma-section-rule"></div><section class="figma-info"><div><p><span>Report no</span><b>:</b>${escapeHtml(report.reportNo)}</p><p><span>Sample Name and No:</span><b>:</b>${escapeHtml(report.sampleNameNo)}</p><p><span>Sample packing</span><b>:</b>${escapeHtml(report.samplePacking)}</p></div><div><p><span>Sample receipt date:</span><b>:</b>${formatDate(report.sampleReceiptDate)}</p><p><span>Report date</span><b>:</b>${formatDate(report.reportDate)}</p></div></section><section class="figma-results"><div class="figma-results-head"><span>Parameter</span><span>Method</span><span>Result</span><span>Unit</span><span>Remark</span></div>${rows}</section><div class="figma-section-rule figma-after-results"></div><section class="figma-signatory"><p>Authorised Signatory,</p><span class="figma-stamp-crop"><img src="${signatureUri}" alt="Alltech Foundation Pune stamp"></span></section><section class="figma-disclaimer"><p>This report is issued solely for the tested sample(s) and does not imply certification or endorsement of an entire product. The laboratory holds no legal and/or incidental responsibility for the application or interpretation of the results. Results of tests are based on parameters applied and may vary at different laboratories.<br>Alltech Foundation and its related entities, including its personnel make no warranties, express or implied, with respect to this report and assume no liability or responsibility for any loss, claim or damage that may occur as a result of presuming the meaning or context of the report, or the use of report in any activities, or any conduct.</p></section><footer class="figma-footer"><p>Registered Office : <b>Alltech Foundation</b> | PAP-S-65 | Village &ndash; Savardari | MIDC &ndash; Phase-II<br>Chakan Industrial Area | Taluka: Khed | Dist. Pune-410501, Maharashtra | India | Tel: +91-2135-631666<br>Regd. No. E-9281/Pune</p><span>1</span></footer></article></body></html>`
}

export async function generateReportPdf(report) {
  const [logoUri, signatureUri] = await Promise.all([dataUri(reportLogoPath, 'image/avif'), dataUri(signaturePath, 'image/jpeg')])
  const browser = await chromium.launch({ headless: true, ...(config.playwrightExecutablePath ? { executablePath: config.playwrightExecutablePath } : {}) })
  try {
    const page = await browser.newPage({ viewport: { width: 794, height: 1123 }, deviceScaleFactor: 1 })
    await page.setContent(reportMarkup(report, logoUri, signatureUri), { waitUntil: 'load' })
    await page.emulateMedia({ media: 'print' })
    return await page.pdf({ printBackground: true, preferCSSPageSize: true, displayHeaderFooter: false, margin: { top: 0, right: 0, bottom: 0, left: 0 } })
  } finally {
    await browser.close()
  }
}

export { reportMarkup, pathToFileURL }
