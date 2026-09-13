from pathlib import Path
import json,subprocess,hashlib,re
root=Path(__file__).resolve().parents[2]
assert not subprocess.check_output(['git','diff','--name-only','HEAD','--','src/worldRaid/runtime430'],cwd=root,text=True).strip()
assert 'APP_VERSION="3.1.116"' in (root/'src/core/config.js').read_text()
assert re.search(r'ASSET_BUILD = "build437"',(root/'index.html').read_text())
r=json.loads((root/'docs/build437/browser-result.json').read_text());assert len(r['checks'])==27 and not r['errors'] and not r['missing']
tests=(root/'docs/build437/tests.tap').read_text();assert '# pass 219' in tests and '# fail 0' in tests
print(json.dumps({'targeted_tests':219,'browser_checks':27,'frozen_runtime_unchanged':True,'safari_device_tested':False}))
