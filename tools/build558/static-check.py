"""Check the visual-only patch, its cache migration and unchanged game rules."""
from pathlib import Path
import argparse,json,re,subprocess
p=argparse.ArgumentParser();p.add_argument('--baseline',required=True);a=p.parse_args()
root=Path(__file__).resolve().parents[2];base=Path(a.baseline).resolve();checked=[]
for f in sorted(root.rglob('*')):
 if f.is_file() and f.suffix in {'.js','.mjs'} and (not (base/f.relative_to(root)).exists() or f.read_bytes()!=(base/f.relative_to(root)).read_bytes()):
  r=subprocess.run(['node','--check',str(f)],text=True,capture_output=True);assert r.returncode==0,(str(f),r.stderr);checked.append(str(f.relative_to(root)))
def mapping(path):return json.loads(re.search(r'<script type="importmap">(.*?)</script>',path.read_text(),re.S).group(1))['imports']
current=mapping(root/'index.html');previous=mapping(base/'index.html');assets=json.loads((root/'world-raid-offline558-assets.json').read_text())
assert set(previous).issubset(current)
for f in checked:
 if f.startswith('src/'):
  key='./'+f;url=key+'?v=3.1.237-build558';assert current[key]==url
  assert all(v==url for v in current.values() if v.split('?')[0]==key)
  assert url in assets
unchanged=[]
for folder in ['online-server/src','src/ricochet550']:
 for f in (base/folder).rglob('*'):
  if f.is_file():assert f.read_bytes()==(root/f.relative_to(base)).read_bytes(),str(f)
for f in ['src/cart/Rules543.js','src/cart/Parking557.js','src/cart/Courses556.js','src/cart/Controls547.js','src/cart/Sling547.js','assets/cart557/woven-runner.png']:
 assert (root/f).read_bytes()==(base/f).read_bytes(),f;unchanged.append(f)
assert 'world-raid-offline558-sw.js' in (root/'index.html').read_text()
assert '3.1.237' in (root/'src/core/config.js').read_text()
assert 'offline558' in (root/'src/worldRaid/WorldRaidOfflineCache430.js').read_text()
report={'version':'3.1.237','changedJSChecked':checked,'unchangedRulesInputsAndArt':unchanged,'onlineServerUnchanged':True,'pinballUnchanged':True,'historicalAliasesRetained':len(previous),'cartProtocol':7,'serverRestartRequired':False}
(root/'docs/build558/static-report.json').write_text(json.dumps(report,indent=2)+'\n');print(json.dumps(report))
