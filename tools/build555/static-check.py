"""Check changed JS, import aliases and Build555 offline assets against Build554."""
from pathlib import Path
import argparse,json,re,subprocess
p=argparse.ArgumentParser();p.add_argument('--baseline',required=True);a=p.parse_args()
root=Path(__file__).resolve().parents[2];base=Path(a.baseline).resolve();checked=[]
for f in sorted(root.rglob('*')):
 if f.is_file() and f.suffix in {'.js','.mjs'} and (not (base/f.relative_to(root)).exists() or f.read_bytes()!=(base/f.relative_to(root)).read_bytes()):
  r=subprocess.run(['node','--check',str(f)],text=True,capture_output=True)
  assert r.returncode==0,(str(f),r.stderr)
  checked.append(str(f.relative_to(root)))
def mapping_of(path):return json.loads(re.search(r'<script type="importmap">(.*?)</script>',path.read_text(),re.S).group(1))['imports']
index=(root/'index.html').read_text();mapping=mapping_of(root/'index.html');previous=mapping_of(base/'index.html');assets=json.loads((root/'world-raid-offline555-assets.json').read_text())
assert set(previous).issubset(mapping),'Historical module alias was removed'
modules=[str(p.relative_to(root)) for p in (root/'src/ricochet550').glob('*.js')]
for f in modules:
 assert mapping['./'+f]=='./'+f+'?v=3.1.234-build555',f
 assert any(v.split('?')[0]=='./'+f for v in assets),f
generated=list((root/'assets/ricochet555').glob('*.png'))
assert len(generated)==2
for f in generated:assert './'+str(f.relative_to(root)) in assets
for name in ['Art555','Arena555']:assert './src/ricochet550/'+name+'.js' in mapping
assert 'build555-impact.css' in index
assert 'world-raid-offline555-sw.js' in index
assert '3.1.234' in (root/'src/core/config.js').read_text()
assert 'offline555' in (root/'src/worldRaid/WorldRaidOfflineCache430.js').read_text()
assert 'build555' in (root/'world-raid-offline555-sw.js').read_text()
r={'changedJSChecked':checked,'moduleMappings':modules,'generatedAssets':len(generated),'historicalImportAliasesRetained':len(previous),'version':'3.1.234','ricochetVersion550':6,'syntaxErrors':0}
(root/'docs/build555/static-report.json').write_text(json.dumps(r,indent=2)+'\n')
print(json.dumps({'jsChecked':len(checked),'mappings':len(modules),'assets':len(generated),'historicalAliases':len(previous)}))
