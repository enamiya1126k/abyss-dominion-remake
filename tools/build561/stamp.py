from pathlib import Path
import re,json
root=Path(__file__).resolve().parents[2];base=root.parent/'baseline560';version='3.1.240-build561'
changed={'./'+str(f.relative_to(root)) for f in (root/'src').rglob('*.js') if not (base/f.relative_to(root)).exists() or f.read_bytes()!=(base/f.relative_to(root)).read_bytes()}
changed.update({'./src/core/config.js','./src/worldRaid/WorldRaidOfflineCache430.js'})
p=root/'index.html';s=p.read_text();m=re.search(r'<script type="importmap">(.*?)</script>',s,re.S);d=json.loads(m.group(1));mapping=d['imports']
for k,v in list(mapping.items()):
 if v.split('?')[0] in changed:mapping[k]=v.split('?')[0]+'?v='+version
mapping['./src/core/AudioSystem.js?v=3.1.1-build311']='./src/core/AudioSystem.js?v='+version
for name in changed:mapping[name]=name+'?v='+version;mapping[name+'?v='+version]=name+'?v='+version
s=s[:m.start(1)]+'\n'+json.dumps(d,ensure_ascii=False,indent=2)+'\n'+s[m.end(1):]
s=s.replace('world-raid-offline560-sw.js','world-raid-offline561-sw.js').replace('const ASSET_VERSION = "3.1.239"','const ASSET_VERSION = "3.1.240"').replace('const ASSET_BUILD = "build560"','const ASSET_BUILD = "build561"');p.write_text(s)
p=root/'src/core/config.js';p.write_text(p.read_text().replace('APP_VERSION="3.1.239"','APP_VERSION="3.1.240"'))
p=root/'src/worldRaid/WorldRaidOfflineCache430.js';p.write_text(p.read_text().replace('offline560','offline561'))
assets=json.loads((root/'world-raid-offline560-assets.json').read_text());assets=[s.split('?')[0]+'?v='+version if s.split('?')[0] in changed else s for s in assets]
for name in sorted(changed):
 if not any(v.split('?')[0]==name for v in assets):assets.append(name+'?v='+version)
(root/'world-raid-offline561-assets.json').write_text(json.dumps(assets,ensure_ascii=False,indent=2)+'\n')
print(json.dumps({'version':version,'modules':len(changed)}))
