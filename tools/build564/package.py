"""Create a reviewed Build564 patch for the GitHub Build563 baseline."""
from pathlib import Path
import hashlib
import json
import re
import subprocess
import zipfile

root = Path(__file__).resolve().parents[2]
base = '72c63563787f2ab5b2e519e86551065da7830ff4'
runtime = '''index.html
online-server/src/PartyCoordinator462.js
online-server/src/RaceCoordinator451.js
online-server/src/Realtime563.js
online-server/src/RicochetCoordinator550.js
src/core/config.js
src/party/Arcade563.js
src/party/PartyGames462.js
src/party/PartyView462.js
src/race/RaceClient451.js
src/ricochet550/Rules550.js
src/ricochet550/View550.js
src/ricochet550/Hockey564.js
src/ricochet550/Board564.js
src/ricochet550/Teams564.js
src/Styles/build564-hockey.css
src/worldRaid/WorldRaidOfflineCache430.js
world-raid-offline564-assets.json
world-raid-offline564-sw.js'''.splitlines()
files = set(runtime) | {'README_BUILD564.md', 'tests/build563-wire.test.mjs',
    'tools/build563/wire-fixture.mjs'}
for folder in ('docs/build564', 'tools/build564'):
    files.update(str(p.relative_to(root)) for p in (root/folder).iterdir() if p.is_file())
files.update(str(p.relative_to(root)) for p in (root/'tests').glob('build564-*.test.mjs'))
for name in files:
    assert (root/name).is_file(), name
    if name.endswith(('.js', '.mjs')):
        subprocess.run(['node', '--check', str(root/name)], check=True, capture_output=True)
    if name.endswith(('.js','.mjs','.md','.json','.py')):
        assert not re.search(r'/workspace/scratch/[0-9a-z]+/', (root/name).read_text()), name

tap=(root/'docs/build564/tests.tap').read_text()
assert '# tests 38\n' in tap and '# pass 38\n' in tap and '# fail 0\n' in tap
browser=json.loads((root/'docs/build564/chromium-browser.json').read_text())
assert not browser['errors'] and not browser['failed'] and len(browser['sizes'])==6
manifest={'build':564,'version':'3.1.243','baseBuilds':[563],'sourceCommit':base,
    'requiredServerRestart':True,'type':'patch','tests':{'node':38,'aiMatches':32,
    'aiTeamGoals':[106,103],'webSocketClients':4,'browser':browser['browserVersion'],
    'viewports':[[390,740],[320,568],[740,390]],'nativeIPhoneTested':False},
    'files':[{'path':name,'size':(root/name).stat().st_size,
    'sha256':hashlib.sha256((root/name).read_bytes()).hexdigest()} for name in sorted(files)]}
(root/'BUILD564_MANIFEST.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+'\n')
out=root.parent/'output/ABYSS_DOMINION_Build564_patch.zip'
out.parent.mkdir(exist_ok=True)
with zipfile.ZipFile(out,'w',zipfile.ZIP_DEFLATED,compresslevel=9) as z:
    for name in [*sorted(files),'BUILD564_MANIFEST.json']:z.write(root/name,name)
with zipfile.ZipFile(out) as z:
    assert z.testzip() is None
    for f in manifest['files']:assert hashlib.sha256(z.read(f['path'])).hexdigest()==f['sha256']
print(json.dumps({'file':str(out),'files':len(files)+1,'bytes':out.stat().st_size}))
