"""Create the cumulative overwrite ZIP from the delivered Build436 archive."""
from pathlib import Path
import hashlib,json,subprocess,zipfile,sys
root=Path(__file__).resolve().parents[2]
previous=Path(sys.argv[1]).resolve();out=Path(sys.argv[2]).resolve()
with zipfile.ZipFile(previous) as z:
 assert z.testzip() is None
 contents={n:z.read(n) for n in z.namelist() if not n.endswith('/')}
old_hashes={n:hashlib.sha256(b).hexdigest() for n,b in contents.items()}
changed=set(subprocess.check_output(['git','diff','--name-only','HEAD'],cwd=root,text=True).splitlines())
changed.update(subprocess.check_output(['git','ls-files','--others','--exclude-standard'],cwd=root,text=True).splitlines())
manifest_name='docs/build436/patch-manifest.json';changed.discard(manifest_name)
for name in changed:
 p=Path(name)
 assert not p.is_absolute() and '..' not in p.parts and '.git' not in p.parts
 assert 'node_modules' not in p.parts and not p.name.startswith('.env')
 assert not (p.parts[0]=='online-server' and 'data' in p.parts)
 assert (root/p).is_file(),f'Deletion needs an explicit migration: {name}'
 contents[name]=(root/p).read_bytes()
assert contents['src/core/config.js'].find(b'APP_VERSION="3.1.115"')>=0
assert json.loads(contents['docs/build436/browser-result.json'])['errors']==[]
assert json.loads(contents['docs/build436/browser-result.json'])['missing']==[]
assert json.loads(contents['docs/build436/final-ui-result.json'])['errors']==[]
assert json.loads(contents['docs/build436/final-ui-result.json'])['missing']==[]
assert b'# pass 149' in contents['docs/build436/tests.tap'] and b'# fail 0' in contents['docs/build436/tests.tap']
manifest={'build':436,'version':'3.1.115','baseline_build':424,'kind':'cumulative-overwrite','save_schema':84,'data_files_included':False,'removed':[],
 'previous_archive_sha256':hashlib.sha256(previous.read_bytes()).hexdigest(),'source_base_commit':subprocess.check_output(['git','rev-parse','HEAD'],cwd=root,text=True).strip(),
 'updated_in_436':sorted(changed),'validation':{'targeted_tests':149,'passed':149,'browser_checks':15,'production_deployed':False,'real_safari_tested':False},
 'files':[{'path':n,'bytes':len(b),'sha256':hashlib.sha256(b).hexdigest()} for n,b in sorted(contents.items())]}
contents[manifest_name]=(json.dumps(manifest,ensure_ascii=False,indent=2)+'\n').encode();(root/manifest_name).write_bytes(contents[manifest_name])
out.parent.mkdir(parents=True,exist_ok=True)
with zipfile.ZipFile(out,'w',zipfile.ZIP_DEFLATED,compresslevel=9) as z:
 for n,b in sorted(contents.items()):z.writestr(n,b)
with zipfile.ZipFile(out) as z:
 assert z.testzip() is None and len(z.namelist())==len(set(z.namelist()))
 for entry in manifest['files']:assert hashlib.sha256(z.read(entry['path'])).hexdigest()==entry['sha256']
 for n in changed:assert z.read(n)==(root/n).read_bytes(),n
 for n,h in old_hashes.items():
  if n not in changed:assert hashlib.sha256(z.read(n)).hexdigest()==h,n
 # Every boot-cache entry must exist in the update or the user's base game.
 for n in json.loads(z.read('world-raid-offline435-assets.json')):
  assert n.removeprefix('./') in contents or (root/n.removeprefix('./')).is_file(),n
print(json.dumps({'file':str(out),'files':len(contents),'updated_in_436':len(changed),'bytes':out.stat().st_size,'sha256':hashlib.sha256(out.read_bytes()).hexdigest()},ensure_ascii=False))
