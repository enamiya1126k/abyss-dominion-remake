import fs from 'node:fs';import vm from 'node:vm';import {createHash} from 'node:crypto';
const exported={};vm.runInNewContext(process.binding('natives')['internal/deps/acorn/acorn/dist/acorn'],{exports:exported,module:{exports:exported}});
const source=fs.readFileSync('src/main.js','utf8'),ast=exported.parse(source,{ecmaVersion:'latest',sourceType:'module'});
const constants=new Set(['POSITIVE_ENEMY_EFFECTS','RANDOM_SKILL_ELEMENTS','ENEMY_EQUIPMENT_SUBSLOTS','INVERTED_BATTLE_EFFECTS']);
const map={imports:[],functions:[],constants:[]};
for(const n of ast.body){if(n.type==='ImportDeclaration')map.imports.push({source:n.source.value,specifiers:n.specifiers.map(s=>({local:s.local.name,imported:s.type==='ImportNamespaceSpecifier'?'*':s.type==='ImportDefaultSpecifier'?'default':s.imported.name}))});
if(n.type==='FunctionDeclaration')map.functions.push({name:n.id.name,start:n.start,end:n.end});
if(n.type==='VariableDeclaration')for(const d of n.declarations)if(constants.has(d.id.name))map.constants.push(source.slice(d.start,d.end));}
fs.writeFileSync('tools/build419/native-source-map.json',JSON.stringify(map));fs.writeFileSync('tools/build419/source-identity.json',JSON.stringify({main_sha256:createHash('sha256').update(source).digest('hex')}));
console.log({functions:map.functions.length,imports:map.imports.length});
