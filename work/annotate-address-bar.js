const fs = require('fs');

const source = 'C:/Users/ADMINI~1/AppData/Local/Temp/codex-clipboard-a37bc612-5886-42f6-8848-e0c67a07d522.png';
const output = 'C:/Users/Administrator/Documents/Codex/2026-10-17/githubsvg-https-zhida-zhihu-com-search/outputs/address-bar-marked.svg';
const image = fs.readFileSync(source).toString('base64');
const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="1104" height="600" viewBox="0 0 1104 600">
  <image href="data:image/png;base64,${image}" width="1104" height="600"/>
  <rect x="88" y="4" width="765" height="36" rx="4" fill="none" stroke="#e11d48" stroke-width="4"/>
  <path d="M930 78 L760 40" fill="none" stroke="#e11d48" stroke-width="5"/>
  <path d="M760 40 L778 38 M760 40 L772 52" fill="none" stroke="#e11d48" stroke-width="5"/>
  <rect x="875" y="78" width="220" height="43" rx="8" fill="#e11d48"/>
  <text x="985" y="106" text-anchor="middle" fill="white" font-size="22" font-family="Microsoft YaHei, Segoe UI, sans-serif">点击这里：地址栏</text>
</svg>`;
fs.writeFileSync(output, svg, 'utf8');
console.log(output);
