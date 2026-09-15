// Version 4 is a frozen graph, so later balance updates cannot change issued tickets.
import {WorldRaidBattle428} from './runtime443/online-server/src/WorldRaidBattle428.js';
import {RaidCoordinator,raidSnapshot} from './runtime443/online-server/src/RaidCoordinator.js';
import {withWorldRaidRules432} from './runtime443/src/worldRaid/WorldRaidRules432.js';
import {withWorldRaidLimit437} from './runtime443/src/worldRaid/WorldRaidLimit437.js';
import {withWorldRaidSpeed438} from './runtime443/src/worldRaid/WorldRaidSpeed438.js';
export const WorldRaidEngine443=withWorldRaidSpeed438(withWorldRaidRules432(withWorldRaidLimit437(WorldRaidBattle428,RaidCoordinator),raidSnapshot,{maxRounds:99}),raidSnapshot);
