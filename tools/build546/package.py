"""Package the reviewed Build546 visual-only delta over Build545."""
from pathlib import Path
import argparse, hashlib, json, zipfile

parser=argparse.ArgumentParser()
parser.add_argument('--output', required=True)
args=parser.parse_args()
root=Path(__file__).resolve().parents[2]
out=Path(args.output).resolve()
paths=[
 'README_BUILD546.md','index.html','src/core/config.js',
 'src/cart/Renderer543.js','src/cart/Courses544.js',
 'src/worldRaid/WorldRaidOfflineCache430.js',
 'world-raid-offline546-sw.js','world-raid-offline546-assets.json',
 'assets/cart546/wax.webp','assets/cart546/sale.webp',
]
paths+=sorted(str(p.relative_to(root)) for folder in ('docs/build546','tools/build546') for p in (root/folder).glob('*') if p.is_file() and p.suffix!='.png')
manifest={'build':546,'version':'3.1.225','baseBuild':545,'type':'patch','requiredServerRestart':False,
 'files':[{'path':p,'size':(root/p).stat().st_size,'sha256':hashlib.sha256((root/p).read_bytes()).hexdigest()} for p in paths]}
manifest_path=root/'BUILD546_MANIFEST.json'
manifest_path.write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+'\n')
out.parent.mkdir(parents=True,exist_ok=True)
with zipfile.ZipFile(out,'w',zipfile.ZIP_DEFLATED,compresslevel=9) as z:
 for p in [*paths,'BUILD546_MANIFEST.json']:z.write(root/p,p)
with zipfile.ZipFile(out) as z:
 assert z.testzip() is None
 for f in manifest['files']:assert hashlib.sha256(z.read(f['path'])).hexdigest()==f['sha256']
print(json.dumps({'file':str(out),'files':len(paths)+1,'bytes':out.stat().st_size,'sha256':hashlib.sha256(out.read_bytes()).hexdigest()}))
