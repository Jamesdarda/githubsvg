const fs = require('fs');
const zlib = require('zlib');

const input = 'C:/Users/ADMINI~1/AppData/Local/Temp/codex-clipboard-a37bc612-5886-42f6-8848-e0c67a07d522.png';
const output = 'C:/Users/Administrator/Documents/Codex/2026-10-17/githubsvg-https-zhida-zhihu-com-search/outputs/address-bar-marked.png';
const png = fs.readFileSync(input);

let pos = 8, width, height, bitDepth, colorType, interlace, idats = [];
while (pos < png.length) {
  const len = png.readUInt32BE(pos); const type = png.toString('ascii', pos + 4, pos + 8);
  const data = png.subarray(pos + 8, pos + 8 + len); pos += 12 + len;
  if (type === 'IHDR') { width = data.readUInt32BE(0); height = data.readUInt32BE(4); bitDepth = data[8]; colorType = data[9]; interlace = data[12]; }
  if (type === 'IDAT') idats.push(data);
  if (type === 'IEND') break;
}
if (bitDepth !== 8 || interlace !== 0 || ![2, 6].includes(colorType)) throw new Error(`Unsupported PNG type ${colorType}/${bitDepth}/${interlace}`);
const channels = colorType === 6 ? 4 : 3, stride = width * channels;
const packed = zlib.inflateSync(Buffer.concat(idats));
const pixels = Buffer.alloc(stride * height); let src = 0;
const paeth = (a,b,c) => { const p=a+b-c, pa=Math.abs(p-a), pb=Math.abs(p-b), pc=Math.abs(p-c); return pa<=pb&&pa<=pc?a:pb<=pc?b:c; };
for (let y=0;y<height;y++) {
  const filter=packed[src++];
  for (let x=0;x<stride;x++) {
    const raw=packed[src++], left=x>=channels?pixels[y*stride+x-channels]:0, up=y?pixels[(y-1)*stride+x]:0, ul=y&&x>=channels?pixels[(y-1)*stride+x-channels]:0;
    let v=raw; if(filter===1)v+=left; else if(filter===2)v+=up; else if(filter===3)v+=Math.floor((left+up)/2); else if(filter===4)v+=paeth(left,up,ul);
    pixels[y*stride+x]=v&255;
  }
}
const red=[225,29,72,255];
function dot(x,y,c=red){ if(x<0||y<0||x>=width||y>=height)return; const i=y*stride+x*channels; pixels[i]=c[0];pixels[i+1]=c[1];pixels[i+2]=c[2];if(channels===4)pixels[i+3]=c[3]; }
function thickLine(x0,y0,x1,y1,t=4,c=red){ const dx=x1-x0,dy=y1-y0,n=Math.max(Math.abs(dx),Math.abs(dy)); for(let s=0;s<=n;s++){const x=Math.round(x0+dx*s/n),y=Math.round(y0+dy*s/n);for(let oy=-t;oy<=t;oy++)for(let ox=-t;ox<=t;ox++)if(ox*ox+oy*oy<=t*t)dot(x+ox,y+oy,c);} }
function rect(x,y,w,h,t=4){ thickLine(x,y,x+w,y,t);thickLine(x+w,y,x+w,y+h,t);thickLine(x+w,y+h,x,y+h,t);thickLine(x,y+h,x,y,t); }
function fillCircle(cx,cy,r,c=red){for(let y=-r;y<=r;y++)for(let x=-r;x<=r;x++)if(x*x+y*y<=r*r)dot(cx+x,cy+y,c);}
rect(87,3,767,39,4);
thickLine(995,98,785,43,5); thickLine(785,43,807,40,5); thickLine(785,43,800,59,5);
fillCircle(1000,100,25); const white=[255,255,255,255]; thickLine(1000,85,1000,115,3,white); thickLine(993,91,1000,85,3,white);

const scan = Buffer.alloc((stride+1)*height); for(let y=0;y<height;y++){ scan[y*(stride+1)]=0; pixels.copy(scan,y*(stride+1)+1,y*stride,(y+1)*stride); }
const crcTable=(()=>{const t=[];for(let n=0;n<256;n++){let c=n;for(let k=0;k<8;k++)c=c&1?0xedb88320^(c>>>1):c>>>1;t[n]=c>>>0;}return t;})();
function crc32(buf){let c=0xffffffff;for(const b of buf)c=crcTable[(c^b)&255]^(c>>>8);return(c^0xffffffff)>>>0;}
function chunk(type,data){const tb=Buffer.from(type), out=Buffer.alloc(data.length+12);out.writeUInt32BE(data.length,0);tb.copy(out,4);data.copy(out,8);out.writeUInt32BE(crc32(Buffer.concat([tb,data])),8+data.length);return out;}
const ihdr=Buffer.alloc(13);ihdr.writeUInt32BE(width,0);ihdr.writeUInt32BE(height,4);ihdr[8]=8;ihdr[9]=colorType;ihdr[10]=0;ihdr[11]=0;ihdr[12]=0;
fs.writeFileSync(output,Buffer.concat([Buffer.from([137,80,78,71,13,10,26,10]),chunk('IHDR',ihdr),chunk('IDAT',zlib.deflateSync(scan,{level:9})),chunk('IEND',Buffer.alloc(0))]));
console.log(output);
