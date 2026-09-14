from pathlib import Path
import json,subprocess,hashlib,re
root=Path(__file__).resolve().parents[2]
assert not subprocess.check_output(['git','diff','--name-only','HEAD','--','src/worldRaid/runtime430'],cwd=root,text=True).strip()
assert 'APP_VERSION="3.1.117"' in (root/'src/core/config.js').read_text()
assert re.search(r'ASSET_BUILD = "build438"',(root/'index.html').read_text())
r=json.loads((root/'docs/build438/browser-result.json').read_text());assert len(r['checks'])>=69 and not r['errors'] and not r['missing']
tests=(root/'docs/build438/tests.tap').read_text();assert '# pass 97' in tests and '# fail 0' in tests
print(json.dumps({'targeted_tests':97,'browser_checks':len(r['checks']),'frozen_runtime_unchanged':True,'safari_device_tested':False}))
