import fs from 'node:fs';import path from 'node:path';import {createHash} from 'node:crypto';
const root=path.resolve(new URL('../../',import.meta.url).pathname),manifest=JSON.parse(fs.readFileSync(path.join(root,'Build411_MANIFEST.json'),'utf8')),failures=[];
for(const entry of manifest.files){const file=path.resolve(root,entry.path);if(!file.startsWith(root+path.sep))throw Error('Invalid manifest path');if(!fs.existsSync(file)||createHash('sha256').update(fs.readFileSync(file)).digest('hex')!==entry.sha256)failures.push(entry.path);}
if(failures.length){console.error('Missing or mismatched files:',failures);process.exit(1)}console.log(`Build411: ${manifest.files.length} installed files match the ZIP manifest.`);
