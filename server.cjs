const http=require('node:http');
const fs=require('node:fs');
const path=require('node:path');
const root=__dirname;
const port=Number(process.env.PORT)||4173;
const types={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.svg':'image/svg+xml','.png':'image/png','.json':'application/json'};
http.createServer((req,res)=>{
 let filename;
 try{const pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname);filename=path.resolve(root,'.'+(pathname==='/'?'/index.html':pathname));}catch{res.writeHead(400);res.end('Requisição inválida');return;}
 if(!filename.startsWith(root+path.sep)){res.writeHead(403);res.end('Acesso negado');return;}
 fs.readFile(filename,(error,body)=>{if(error){res.writeHead(404);res.end('Arquivo não encontrado');return;}res.writeHead(200,{'Content-Type':types[path.extname(filename)]||'application/octet-stream','Cache-Control':'no-store'});res.end(body);});
}).on('error',error=>{console.error(error.code==='EADDRINUSE'?`Porta ${port} em uso. Abra http://localhost:${port}`:error.message);process.exitCode=1;}).listen(port,'127.0.0.1',()=>console.log(`TaskFlow: http://127.0.0.1:${port}\nMantenha esta janela aberta. Ctrl+C encerra.`));
