import {createServer as createPrevious} from '../build571/preview.mjs';

// Use the production view/rules and the actual ordered stylesheet links from index.html.
// The isolated screen fixture still stubs the unrelated party lounge.
export function createServer(links){
  const server=createPrevious(),previous=server.listeners('request')[0];
  server.removeAllListeners('request');
  server.on('request',(req,res)=>{
    const url=new URL(req.url,'http://local');
    if(url.pathname==='/'){
      const end=res.end;
      res.end=function(body,...args){
        if(typeof body==='string'&&!url.searchParams.has('before'))body=body.replace('</style>','</style>'+links);
        return end.call(this,body,...args);
      };
    }
    return previous(req,res);
  });
  return server;
}
