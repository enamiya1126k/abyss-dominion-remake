import * as fs from 'node:fs';
import {dirname,basename,join} from 'node:path';
import {randomUUID} from 'node:crypto';

const transient = e => ['EPERM','EBUSY','EACCES'].includes(e?.code);
const limit = 32*1024*1024;
// A locked Windows/OneDrive destination must never cause delete-before-rename.
// A complete, flushed, uniquely named snapshot is itself a recovery record.
export class AtomicSnapshot540 {
 constructor(path,{io=fs,schedule=setTimeout,cancel=clearTimeout}={}){Object.assign(this,{path,io,schedule,cancel,pending:null,timer:null,retry:0,obsolete:[]})}
 load(){
  const {io,path}=this,dir=dirname(path),prefix=basename(path)+'.pending540-';
  const files=io.existsSync(dir)?io.readdirSync(dir).filter(n=>n.startsWith(prefix)).map(n=>join(dir,n)):[];
  let best=null,selected=null,mainError=null;
  for(const name of [path,...files]){
   if(!io.existsSync(name))continue;
   try{const raw=io.readFileSync(name,'utf8');if(Buffer.byteLength(raw)>limit)throw Error('レース保存容量を超えています');const data=JSON.parse(raw);if(data.version!==1||!data.rooms||!data.accounts||!Number.isSafeInteger(data.serial)||!Number.isSafeInteger(data.revision??0))throw Error('レース保存形式が不正です');if(!best||(data.revision??0)>(best.revision??0)){best=data;selected=name}}
   catch(e){if(name===path)mainError=e}
  }
  if(!best&&mainError)throw mainError;
  this.obsolete=files.filter(n=>n!==selected);
  if(selected&&selected!==path){this.pending=selected;this.defer()}
  else if(best)this.clean();
  return best;
 }
 commit(raw,revision){
  if(Buffer.byteLength(raw)>limit)throw Error('レース保存容量がいっぱいです');
  const {io,path}=this;io.mkdirSync(dirname(path),{recursive:true});
  const next=path+'.pending540-'+revision+'-'+randomUUID();let fd;
  try{fd=io.openSync(next,'wx',0o600);io.writeFileSync(fd,raw);io.fsyncSync(fd);io.closeSync(fd);fd=null}
  catch(e){if(fd!=null)try{io.closeSync(fd)}catch{}try{io.unlinkSync(next)}catch{}throw e}
  try{io.renameSync(next,path)}catch(e){
   if(!transient(e)){try{io.unlinkSync(next)}catch{}throw e}
   if(this.pending)this.obsolete.push(this.pending);this.pending=next;this.clean();this.defer();return;
  }
  if(this.pending)this.obsolete.push(this.pending);this.pending=null;this.retry=0;this.clean();
 }
 defer(){if(this.timer!=null||!this.pending)return;this.timer=this.schedule(()=>{this.timer=null;this.flush()},[30,100,300,1000,3000][Math.min(this.retry++,4)]);this.timer?.unref?.()}
 flush(){if(!this.pending)return true;try{this.io.renameSync(this.pending,this.path);this.pending=null;this.retry=0;this.clean();return true}catch{this.defer();return false}}
 clean(){this.obsolete=this.obsolete.filter(path=>{try{this.io.unlinkSync(path);return false}catch(e){return e.code!=='ENOENT'}})}
 close(){if(this.timer!=null)this.cancel(this.timer);this.timer=null}
}
