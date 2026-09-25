"""Package only the Build548 delta over the supplied Build547 baseline."""
from pathlib import Path
import argparse, hashlib, json, zipfile
parser=argparse.ArgumentParser()
parser.add_argument('--baseline',required=True)
parser.add_argument('--output',required=True)
args=parser.parse_args()
root=Path(__file__).resolve().parents[2]
base=Path(args.baseline).resolve()
out=Path(args.output).resolve()
paths=[]
for p in sorted(root.rglob('*')):
 if not p.is_file():continue
 rel=p.relative_to(root)
 if str(rel).startswith('online-server/data/') or any(x in {'node_modules','.git','__pycache__'} for x in rel.parts):continue
 if rel.name=='BUILD548_MANIFEST.json' or (str(rel).startswith('docs/build548/') and p.suffix=='.png'):continue
 if not(base/rel).exists() or p.read_bytes()!=(base/rel).read_bytes():paths.append(str(rel))
manifest={'build':548,'version':'3.1.227','baseBuild':547,'type':'patch','requiredServerRestart':False,'cartVersion543':4,
 'files':[{'path':p,'size':(root/p).stat().st_size,'sha256':hashlib.sha256((root/p).read_bytes()).hexdigest()} for p in paths]}
manifest_path=root/'BUILD548_MANIFEST.json'
manifest_path.write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+'\n')
out.parent.mkdir(parents=True,exist_ok=True)
with zipfile.ZipFile(out,'w',zipfile.ZIP_DEFLATED,compresslevel=9) as z:
 for p in [*paths,'BUILD548_MANIFEST.json']:z.write(root/p,p)
with zipfile.ZipFile(out) as z:
 assert z.testzip() is None
 for f in manifest['files']:assert hashlib.sha256(z.read(f['path'])).hexdigest()==f['sha256']
print(json.dumps({'file':str(out),'files':len(paths)+1,'bytes':out.stat().st_size,'sha256':hashlib.sha256(out.read_bytes()).hexdigest()}))
