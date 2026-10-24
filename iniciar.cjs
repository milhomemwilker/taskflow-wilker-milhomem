const http = require('node:http');
const {spawn} = require('node:child_process');
const path = require('node:path');
const url = 'http://127.0.0.1:4173/';
function ready() {
  return new Promise(resolve => {
    const request = http.get(url, response => {
      let body = '';
      response.on('data', chunk => body += chunk);
      response.on('end', () => resolve(response.statusCode === 200 && body.includes('<title>TaskFlow</title>')));
    });
    request.setTimeout(1500, () => request.destroy());
    request.on('error', () => resolve(false));
  });
}
function openBrowser() {
  console.log('TaskFlow pronto: ' + url);
  if (process.platform === 'win32') {
    const browser = spawn('explorer.exe', [url], {stdio:'ignore'});
    browser.on('error', () => console.log('Abra o endereco acima no navegador.'));
  }
}
(async () => {
  if (await ready()) {openBrowser(); return;}
  const server = spawn(process.execPath, [path.join(__dirname, 'server.cjs')], {cwd:__dirname, stdio:'inherit'});
  let failed = false;
  server.on('error', error => {failed = true; console.error(error.message);});
  server.on('exit', () => {failed = true;});
  for (let attempt = 0; attempt < 25; attempt++) {
    if (await ready()) {openBrowser();console.log('Mantenha esta janela aberta durante o uso.');return;}
    if (failed) break;
    await new Promise(resolve => setTimeout(resolve, 300));
  }
  console.error('Nao foi possivel iniciar o TaskFlow. Confira se a porta 4173 esta ocupada.');
  server.kill();process.exitCode = 1;
})();
