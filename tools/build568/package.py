"""Make a cumulative Build568 patch, leaving server runtime data untouched."""
from pathlib import Path
import hashlib
import json
import re
import subprocess
import sys
import zipfile
root = Path(__file__).resolve().parents[2]
files = {f['path'] for f in json.loads((root / 'BUILD567_MANIFEST.json').read_text())['files']}
changed = subprocess.check_output(['git', 'diff', '--name-only', '2c026240baf45c87933a6b728eee81ac388b0546'], cwd=root, text=True).splitlines()
files.update(f for f in changed if f == 'index.html' or f.startswith(('src/', 'online-server/', 'tests/', 'tools/')))
files.update(['src/ricochet550/Control568.js', 'README_BUILD568.md', 'world-raid-offline568-sw.js', 'world-raid-offline568-assets.json'])
for folder in ['tools/build568', 'docs/build568']:
    files.update(str(p.relative_to(root)) for p in (root / folder).iterdir() if p.is_file() and p.suffix != '.log')
files.update(str(p.relative_to(root)) for p in (root / 'tests').glob('build568-*.test.mjs'))
for name in files:
    assert not name.startswith('online-server/data/'), name
    assert (root / name).is_file(), name
    if name.endswith(('.js', '.mjs')):
        subprocess.run(['node', '--check', str(root / name)], check=True, capture_output=True)
    if name.endswith(('.js', '.mjs', '.md', '.json', '.py')):
        assert not re.search(r'/workspace/scratch/[0-9a-z]+/', (root / name).read_text()), name
tap = (root / 'docs/build568/tests.tap').read_text()
assert '# tests 86\n' in tap and '# pass 86\n' in tap and '# fail 0\n' in tap
browser = json.loads((root / 'docs/build568/chromium-browser.json').read_text())
assert len(browser['sizes']) == 12 and not browser['errors'] and not browser['failed']
assert (root / 'docs/build568/team-view-demo.gif').stat().st_size > 10000
manifest = {'build':568, 'version':'3.1.247', 'type':'cumulative-patch', 'baseBuilds':[563,564,565,566,567],
 'sourceMain':'77184f3d5917c9d250d427e8a2e5c26e7a1b5239',
 'previousRemoteCommit':'5738e815bfb19627508f642e457fd74040533e81', 'requiredServerRestart':True,
 'tests':{'node':86, 'webSocketClients':4, 'viewports':[[390,740],[320,568],[740,390]], 'allFourSeats':True, 'nativeIPhoneTested':False, 'aiComparisonMatchesPerVersion':48},
 'files':[{'path':name, 'size':(root/name).stat().st_size, 'sha256':hashlib.sha256((root/name).read_bytes()).hexdigest()} for name in sorted(files)]}
(root / 'BUILD568_MANIFEST.json').write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + '\n')
out = Path(sys.argv[1]).resolve() if len(sys.argv) > 1 else root.parent / 'output/ABYSS_DOMINION_Build568_patch.zip'
out.parent.mkdir(parents=True, exist_ok=True)
with zipfile.ZipFile(out, 'w', zipfile.ZIP_DEFLATED, compresslevel=9) as z:
    for name in [*sorted(files), 'BUILD568_MANIFEST.json']:
        z.write(root / name, name)
with zipfile.ZipFile(out) as z:
    assert z.testzip() is None
    for f in manifest['files']:
        assert hashlib.sha256(z.read(f['path'])).hexdigest() == f['sha256']
print(json.dumps({'file':str(out), 'files':len(files)+1, 'bytes':out.stat().st_size}))
