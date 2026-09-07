import {readFileSync} from 'node:fs';
import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
const html=readFileSync(new URL('../index.html',import.meta.url),'utf8');
const code=html.match(/<script>\s*([\s\S]*?)<\/script>/)[1];
function fixture(){
 const handlers={},app={innerHTML:'<game>running</game>'},logs=[];
 const window={addEventListener:(key,fn)=>handlers[key]=fn};
 vm.runInNewContext(code,{window,document:{getElementById:()=>app},console:{warn:(...args)=>logs.push(args)}});
 return {window,handlers,app,logs};
}
const opaque={message:'Script error.',filename:'',lineno:0,colno:0,error:null};
test('redacted share-style notification keeps the live DOM and bounded diagnostics',()=>{
 const f=fixture();f.window.__abyssBootComplete=true;
 for(let i=0;i<25;i++)f.handlers.error(opaque);
 assert.equal(f.app.innerHTML,'<game>running</game>');assert.equal(f.window.__abyssOpaqueErrors.length,20);assert.equal(f.logs.length,25);
});
test('boot-time errors still display a failure screen',()=>{const f=fixture();f.handlers.error(opaque);assert.match(f.app.innerHTML,/起動エラー/)});
test('real errors with message, source, location, or error object are not suppressed',()=>{
 for(const patch of [{message:'TypeError: broken'},{filename:'main.js'},{lineno:7},{colno:3},{error:new Error('broken')}]){
  const f=fixture();f.window.__abyssBootComplete=true;f.handlers.error({...opaque,...patch});assert.match(f.app.innerHTML,/起動エラー/);
 }
});
test('promise rejections stay visible and error text is escaped',()=>{
 const f=fixture();f.window.__abyssBootComplete=true;f.handlers.unhandledrejection({reason:new Error('<img src=x onerror=bad()>')});assert.match(f.app.innerHTML,/処理エラー/);assert.match(f.app.innerHTML,/&lt;img/);assert.doesNotMatch(f.app.innerHTML,/<img/);
});
test('readiness is set only after a successful main import',()=>{
 const module=html.match(/<script type="module">([\s\S]*?)<\/script>/)[1];
 const declaration=module.indexOf('await import('),ready=module.indexOf('window.__abyssBootComplete = true');assert.ok(declaration>=0&&ready>declaration);
});
