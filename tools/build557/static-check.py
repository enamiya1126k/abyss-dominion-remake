"""Verify the Build557 delta without assuming the rest of the project is present."""
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
index=(root/'index.html').read_text();mapping=mapping_of(root/'index.html');previous=mapping_of(base/'index.html');assets=json.loads((root/'world-raid-offline557-assets.json').read_text())
assert set(previous).issubset(mapping),'Historical module alias was removed'
modules=[str(p.relative_to(root)) for p in (root/'src/cart').glob('*.js')]
for f in modules:
 assert mapping['./'+f]=='./'+f+'?v=3.1.236-build557',f
 assert any(v.split('?')[0]=='./'+f for v in assets),f
for f in checked:
 if f.startswith('src/'):
  assert mapping['./'+f]=='./'+f+'?v=3.1.236-build557',f
  assert all(v=='./'+f+'?v=3.1.236-build557' for v in mapping.values() if v.split('?')[0]=='./'+f),f
generated=list((root/'assets/cart557').glob('*.png'));assert len(generated)==1
for f in generated:assert './'+str(f.relative_to(root)) in assets
assert 'build557-cart-parking.css' in index
assert 'world-raid-offline557-sw.js' in index
assert '3.1.236' in (root/'src/core/config.js').read_text()
assert 'offline557' in (root/'src/worldRaid/WorldRaidOfflineCache430.js').read_text()
assert 'build557' in (root/'world-raid-offline557-sw.js').read_text()
assert 'cartVersion543:7' in (root/'online-server/src/RaceCoordinator451.js').read_text()
r={'changedJSChecked':checked,'moduleMappings':modules,'generatedAssets':len(generated),'historicalImportAliasesRetained':len(previous),'version':'3.1.236','cartVersion543':7,'ricochetVersion550':6,'syntaxErrors':0}
(root/'docs/build557/static-report.json').write_text(json.dumps(r,indent=2)+'\n')
print(json.dumps({'jsChecked':len(checked),'mappings':len(modules),'assets':len(generated),'historicalAliases':len(previous)}))
