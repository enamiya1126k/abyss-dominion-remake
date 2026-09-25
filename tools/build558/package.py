"""Build558 visual-only delta over Build557."""
from pathlib import Path
import argparse,hashlib,json,zipfile
p=argparse.ArgumentParser();p.add_argument('--baseline',required=True);p.add_argument('--output',required=True);a=p.parse_args()
root=Path(__file__).resolve().parents[2];base=Path(a.baseline).resolve();out=Path(a.output).resolve();paths=[]
assert '3.1.236' in (base/'src/core/config.js').read_text(),'Expected Build557'
for f in sorted(root.rglob('*')):
 if not f.is_file():continue
 rel=f.relative_to(root)
 if any(part in {'.git','node_modules','__pycache__'} for part in rel.parts) or str(rel).startswith('online-server/data/'):continue
 if rel.name=='BUILD558_MANIFEST.json' or str(rel).startswith('docs/build558/') and f.suffix in {'.png','.jpeg','.webm'}:continue
 if not (base/rel).exists() or f.read_bytes()!=(base/rel).read_bytes():paths.append(str(rel))
assert not any(n.startswith('online-server/') for n in paths)
manifest={'build':558,'version':'3.1.237','baseBuild':557,'type':'patch','games':['cart'],'cartVersion543':7,'ricochetVersion550':6,'requiredServerRestart':False,'files':[{'path':n,'size':(root/n).stat().st_size,'sha256':hashlib.sha256((root/n).read_bytes()).hexdigest()} for n in paths]}
(root/'BUILD558_MANIFEST.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+'\n');out.parent.mkdir(parents=True,exist_ok=True)
with zipfile.ZipFile(out,'w',zipfile.ZIP_DEFLATED,compresslevel=9) as z:
 for n in [*paths,'BUILD558_MANIFEST.json']:z.write(root/n,n)
with zipfile.ZipFile(out) as z:
 assert z.testzip() is None
 for f in manifest['files']:assert hashlib.sha256(z.read(f['path'])).hexdigest()==f['sha256']
print(json.dumps({'file':str(out),'files':len(paths)+1,'bytes':out.stat().st_size,'sha256':hashlib.sha256(out.read_bytes()).hexdigest()}))
