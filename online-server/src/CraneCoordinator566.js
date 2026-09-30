import {realtime563} from './Realtime563.js';
import {makeCrane566,startCrane566,advanceCrane566,publicCrane566,validCast566} from '../../src/crane566/Rules566.js';
const api=realtime563({rooms:'craneRooms566',runtime:'craneRuntime566',prefix:'cr566',op:'crane566',state:'crane',frame:'craneFrame566',versionKey:'craneVersion566',rulesKey:'rules566',version:1,build:566,array:false,frameMs:50,make:makeCrane566,start:startCrane566,advance:advanceCrane566,public:publicCrane566,valid:validCast566});
export const craneFor566=api.find,liveCrane566=api.live,craneSnapshot566=api.snapshot,createCrane566=api.create,handleCrane566=api.handle,queueCrane566=api.queue,advanceCranes566=api.advance;
