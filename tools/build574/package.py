from pathlib import Path
import hashlib,json,subprocess,sys,zipfile
root=Path(__file__).resolve().parents[2]
files={x['path'] for x in json.loads((root/'BUILD573_MANIFEST.json').read_text())['files']}
files.update(subprocess.check_output(['git','diff','--name-only','1ca7141'],cwd=root,text=True).splitlines())
for folder in ['tools/build574','docs/build574']:
 files.update(str(p.relative_to(root)) for p in (root/folder).iterdir() if p.is_file() and p.suffix!='.png')
files.update(['README_BUILD574.md','tests/build574-chest.test.mjs','src/luck/Chest574.js','docs/build512/generated-assets.json','BUILD573_MANIFEST.json','world-raid-offline573-assets.json','world-raid-offline573-sw.js','world-raid-offline574-assets.json','world-raid-offline574-sw.js'])
files.discard('BUILD574_MANIFEST.json')
for p in files:
 assert not p.startswith('online-server/data/') and (root/p).is_file(),p
 if p.endswith(('.js','.mjs')):subprocess.run(['node','--check',str(root/p)],check=True,capture_output=True)
assert '# pass 25\n' in (root/'docs/build574/tests.tap').read_text()
browser=json.loads((root/'docs/build574/browser.json').read_text());assert len(browser['cases'])==8 and not browser['errors'] and not browser['failed']
manifest={'build':574,'version':'3.1.253','type':'cumulative-patch','baseBuilds':list(range(563,574)),'serverRestart':'Only when updating from Build570 or earlier; unchanged from Build571','tests':{'node':25,'browserCases':8,'nativeIPhone':False},'files':[{'path':p,'size':(root/p).stat().st_size,'sha256':hashlib.sha256((root/p).read_bytes()).hexdigest()} for p in sorted(files)]}
(root/'BUILD574_MANIFEST.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+'\n')
out=Path(sys.argv[1])
with zipfile.ZipFile(out,'w',zipfile.ZIP_DEFLATED,compresslevel=9) as z:
 for p in sorted(files|{'BUILD574_MANIFEST.json'}):z.write(root/p,p)
with zipfile.ZipFile(out) as z:
 assert z.testzip() is None
 for f in manifest['files']:assert hashlib.sha256(z.read(f['path'])).hexdigest()==f['sha256']
print(json.dumps({'path':str(out),'files':len(files)+1,'bytes':out.stat().st_size}))
