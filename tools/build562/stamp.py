from pathlib import Path
import json,re
root=Path(__file__).resolve().parents[2]
base=root.parent/'baseline561'
version='3.1.241-build562'
changed={'./'+str(f.relative_to(root)) for f in (root/'src').rglob('*.js') if not (base/f.relative_to(root)).exists() or f.read_bytes()!=(base/f.relative_to(root)).read_bytes()}
changed.update({'./src/core/config.js','./src/worldRaid/WorldRaidOfflineCache430.js'})
p=root/'index.html';s=p.read_text();m=re.search(r'<script type="importmap">(.*?)</script>',s,re.S);d=json.loads(m.group(1));mapping=d['imports']
for k,v in list(mapping.items()):
 if v.split('?')[0] in changed:mapping[k]=v.split('?')[0]+'?v='+version
for name in changed:mapping[name]=name+'?v='+version;mapping[name+'?v='+version]=name+'?v='+version
s=s[:m.start(1)]+'\n'+json.dumps(d,ensure_ascii=False,indent=2)+'\n'+s[m.end(1):]
s=s.replace('world-raid-offline561-sw.js','world-raid-offline562-sw.js').replace('const ASSET_VERSION = "3.1.240"','const ASSET_VERSION = "3.1.241"').replace('const ASSET_BUILD = "build561"','const ASSET_BUILD = "build562"');p.write_text(s)
p=root/'src/core/config.js';p.write_text(p.read_text().replace('APP_VERSION="3.1.240"','APP_VERSION="3.1.241"'))
p=root/'src/worldRaid/WorldRaidOfflineCache430.js';p.write_text(p.read_text().replace('offline561','offline562'))
(root/'world-raid-offline562-sw.js').write_text((base/'world-raid-offline561-sw.js').read_text().replace('build561','build562'))
assets=json.loads((base/'world-raid-offline561-assets.json').read_text());assets=[s.split('?')[0]+'?v='+version if s.split('?')[0] in changed else s for s in assets]
for name in sorted(changed):
 if not any(v.split('?')[0]==name for v in assets):assets.append(name+'?v='+version)
(root/'world-raid-offline562-assets.json').write_text(json.dumps(assets,ensure_ascii=False,indent=2)+'\n')
print(json.dumps({'version':version,'modules':len(changed)}))
