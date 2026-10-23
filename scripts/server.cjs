'use strict';
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const types = {'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.mjs':'text/javascript; charset=utf-8','.json':'application/json; charset=utf-8','.md':'text/plain; charset=utf-8','.svg':'image/svg+xml','.woff2':'font/woff2','.ttf':'font/ttf','.png':'image/png','.zip':'application/zip','.txt':'text/plain; charset=utf-8'};
const publicFiles=new Set(['index.html','polish.css','style.css','learning.css','app.js','content-model.mjs','course-motion.mjs','course-motion.css','README.md','CONTRIBUTING.md','THIRD-PARTY-NOTICES.md']);
const publicDirs=new Set(['assets','content','labs','docs','evidence']);
function makeServer() {
  return http.createServer((req,res)=>{
    res.setHeader('X-Content-Type-Options','nosniff');
    res.setHeader('Cache-Control','no-cache');
    res.setHeader('Content-Security-Policy',"default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; font-src 'self'; connect-src 'self'; frame-ancestors 'none'; base-uri 'self'; form-action 'none'");
    if(req.method!=='GET'&&req.method!=='HEAD'){res.writeHead(405,{'Allow':'GET, HEAD'});res.end();return;}
    let url;
    try { url = new URL(req.url,'http://localhost'); } catch { res.writeHead(400);res.end('Bad request');return; }
    let decoded;
    try { decoded = decodeURIComponent(url.pathname); } catch { res.writeHead(400);res.end('Bad request');return; }
    if(/[\\\x00-\x1f]/.test(decoded)){res.writeHead(403);res.end('Forbidden');return;}
    const file = path.resolve(root,'.' + (decoded==='/'?'/index.html':decoded));
    const segments=path.relative(root,file).split(path.sep);
    if (!file.startsWith(root + path.sep) || segments.some(p=>p.startsWith('.')) || !(publicFiles.has(segments.join('/'))||publicDirs.has(segments[0]))) { res.writeHead(403);res.end('Forbidden');return; }
    fs.realpath(file,(err,real)=>{
      if(err){res.writeHead(404,{'Content-Type':'text/plain; charset=utf-8'});res.end('Resource not found.');return;}
      if(!real.startsWith(root+path.sep)){res.writeHead(403);res.end('Forbidden');return;}
      fs.stat(real,(err,stat)=>{
        if(err||!stat.isFile()){res.writeHead(404,{'Content-Type':'text/plain; charset=utf-8'});res.end('Resource not found.');return;}
        res.setHeader('Content-Type',types[path.extname(file)]||'application/octet-stream');
        res.setHeader('Content-Length',stat.size);
        if(path.extname(file)==='.zip')res.setHeader('Content-Disposition',`attachment; filename="${path.basename(file)}"`);
        res.writeHead(200);
        if(req.method==='HEAD'){res.end();return;}
        const stream=fs.createReadStream(real);stream.on('error',()=>res.destroy());stream.pipe(res);
      });
    });
  });
}
if(require.main===module){const server=makeServer();const port=Number(process.env.PORT)||4173;server.listen(port,'127.0.0.1',()=>process.stdout.write(`Howto codex: http://127.0.0.1:${port}\n`));server.on('error',err=>{process.stderr.write(err.message+'\n');process.exitCode=1;});}
module.exports={makeServer};
