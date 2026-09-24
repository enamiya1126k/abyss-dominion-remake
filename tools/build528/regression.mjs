// Adapt protocol fixtures only; exercise the original regression assertions.
import {readFile,writeFile,unlink} from 'node:fs/promises';
import {spawnSync} from 'node:child_process';
const generated=[];
try {
 for(const name of ['build511-luck','build482-sugoroku','build498-zoom']){
  const source=new URL('../../tests/'+name+'.test.mjs',import.meta.url),target=new URL('../../tests/'+name+'.qa528.test.mjs',import.meta.url);
  let s=(await readFile(source,'utf8')).replaceAll('rulesVersion:18','rulesVersion:19,minigamesVersion528:1').replaceAll('rulesVersion,18','rulesVersion,19').replaceAll('/Build483/','/Build528/');
  if(name==='build511-luck')s=s.replace('return{clientHeight:350','return{getBoundingClientRect:()=>({top:0,bottom:140}),clientHeight:350');
  await writeFile(target,s);generated.push(target);
 }
 const result=spawnSync(process.execPath,['--test',...generated.map(x=>x.pathname)],{stdio:'inherit'});process.exitCode=result.status??1;
} finally {for(const path of generated)await unlink(path);}
