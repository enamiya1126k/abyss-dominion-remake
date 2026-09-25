from pathlib import Path
import argparse,json,re,subprocess
p=argparse.ArgumentParser();p.add_argument('--baseline',required=True);a=p.parse_args()
root=Path(__file__).resolve().parents[2];base=Path(a.baseline).resolve();checked=[]
for f in sorted(root.rglob('*')):
 if f.is_file() and f.suffix in {'.js','.mjs'} and (not (base/f.relative_to(root)).exists() or f.read_bytes()!=(base/f.relative_to(root)).read_bytes()):
  r=subprocess.run(['node','--check',str(f)],text=True,capture_output=True);assert r.returncode==0,(str(f),r.stderr);checked.append(str(f.relative_to(root)))
def mapping(path):return json.loads(re.search(r'<script type="importmap">(.*?)</script>',path.read_text(),re.S).group(1))['imports']
current=mapping(root/'index.html');previous=mapping(base/'index.html');assets=json.loads((root/'world-raid-offline559-assets.json').read_text())
assert set(previous).issubset(current)
for f in checked:
 if f.startswith('src/'):
  key='./'+f;url=key+'?v=3.1.238-build559';assert current[key]==url,(key,current.get(key))
  assert all(v==url for v in current.values() if v.split('?')[0]==key)
  assert url in assets
for folder in ['src/cart','src/ricochet550','assets']:
 for f in (base/folder).rglob('*'):
  if f.is_file():assert f.read_bytes()==(root/f.relative_to(base)).read_bytes(),str(f)
assert 'world-raid-offline559-sw.js' in (root/'index.html').read_text()
assert '3.1.238' in (root/'src/core/config.js').read_text()
assert 'offline559' in (root/'src/worldRaid/WorldRaidOfflineCache430.js').read_text()
assert './src/Styles/build559-hide.css?v=3.1.238-build559' in assets
assert 'build559-hide.css' in (root/'index.html').read_text()
assert 'hunterSpeed:260' in (root/'src/hide/Rules536.js').read_text()
assert 'rulesVersion:6' in (root/'src/hide/Rules536.js').read_text()
assert 'hideVersion536:6' in (root/'src/race/RaceClient451.js').read_text()
assert 'hideVersion536:6' in (root/'online-server/src/RaceCoordinator451.js').read_text()
assert 'm.hideVersion536!==6' in (root/'online-server/src/HideCoordinator536.js').read_text()
report={'version':'3.1.238','changedJSChecked':checked,'cartAndPinballUnchanged':True,'historicalAliasesRetained':len(previous),'hideProtocol':6,'cartProtocol':7,'pinballProtocol':6,'serverRestartRequired':True}
(root/'docs/build559/static-report.json').write_text(json.dumps(report,indent=2)+'\n');print(json.dumps(report))
