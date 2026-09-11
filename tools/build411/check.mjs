import fs from 'node:fs';import {spawnSync} from 'node:child_process';
const root=new URL('../../',import.meta.url),gates=JSON.parse(fs.readFileSync(new URL('../../docs/build411/gate-files.json',import.meta.url),'utf8'));
const result=spawnSync(process.execPath,['--test','--test-reporter=tap',...gates.files,...gates.additionalFiles],{cwd:root,stdio:'inherit'});process.exit(result.status??1);
