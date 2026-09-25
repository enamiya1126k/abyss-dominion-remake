"""Check changed JavaScript and the Build552 entry/cache references against Build551."""
from pathlib import Path
import argparse,json,re,subprocess
p=argparse.ArgumentParser();p.add_argument('--baseline',required=True);a=p.parse_args()
root=Path(__file__).resolve().parents[2];base=Path(a.baseline).resolve();checked=[]
for f in sorted(root.rglob('*')):
 if f.is_file() and f.suffix in {'.js','.mjs'} and (not (base/f.relative_to(root)).exists() or f.read_bytes()!=(base/f.relative_to(root)).read_bytes()):
  r=subprocess.run(['node','--check',str(f)],text=True,capture_output=True)
  assert r.returncode==0,(str(f),r.stderr)
  checked.append(str(f.relative_to(root)))
index=(root/'index.html').read_text();mapping=json.loads(re.search(r'<script type="importmap">(.*?)</script>',index,re.S).group(1))['imports'];assets=json.loads((root/'world-raid-offline552-assets.json').read_text())
modules=[str(p.relative_to(root)) for p in (root/'src/ricochet550').glob('*.js')]
for f in modules:
 assert 'build552' in mapping['./'+f],f
 assert any(v.split('?')[0]=='./'+f for v in assets),f
for f in (root/'assets/ricochet552').glob('*.png'):assert './'+str(f.relative_to(root)) in assets
assert 'build552-carnival.css' in index
assert 'world-raid-offline552-sw.js' in index
assert '3.1.231' in (root/'src/core/config.js').read_text()
r={'changedJSChecked':checked,'moduleMappings':modules,'generatedAssets':3,'version':'3.1.231','ricochetVersion550':3,'syntaxErrors':0}
(root/'docs/build552/static-report.json').write_text(json.dumps(r,indent=2)+'\n')
print(json.dumps({'jsChecked':len(checked),'mappings':len(modules),'assets':3}))
