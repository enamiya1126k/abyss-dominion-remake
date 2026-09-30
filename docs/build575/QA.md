# Build575 QA

29 Node tests pass: new progression and cache tests, current protocol/migration tests, and Build571 buff regressions. Includes 20 seeded 8/16-round AI matches and 4 actual WebSocket clients. Rules use exact BigInt factors and post-attack ranks/distances. Each gear stores its own medals575/awake575/claimed575, preserving state across JSON restart and resonance stacking. Leader requires unique first; podium includes tied ranks. Threshold is inclusive 10,000m. Rewards begin influencing future rounds and stop accumulating after the halfway point. Sun rewards cannot retrigger.

Client/server flag luckVersion575, room itemRules575. Old live rooms reset to lobby while preserving choices and rounds; results remain. New client blocks old server in party selection and start. Old clients are blocked at ready/start/action. Runtime save blobs preserved when publishing to PR.

Browser fixture: production rules/view/CSS and generated sprite atlas, with unrelated party lounge stubbed. 390×740 and 320×568, all four chest and hand choices. Opening sprites match actual hand, no pointer blocking, no repeated opening on render, low-motion fallback, no horizontal overflow, no JS errors or failed responses. Achievement notice and all 56 catalogue entries verified. Native Safari/iPhone and long-term player balance are not verified.

```
NODE_PATH="$CODEX_PRIMARY_RUNTIME_NODE_MODULES" node --test --test-reporter=tap tests/build575-progress.test.mjs tests/build575-network.test.mjs tests/build571-buffs.test.mjs
NODE_PATH="$CODEX_PRIMARY_RUNTIME_NODE_MODULES" node tools/build575/browser.mjs
```

Built-in image generation produced assets/luck575/items.webp, a 2×2 atlas. Four briefs: emerald/gold royal command banner; gold trophy with laurel wings and rubies; blue celestial map with a luminous star and gold compass; gold solar coronet with orange sun orb. Uniform emerald background, no text, coherent light, detailed fantasy inventory art. Original square PNG converted to WebP quality86. Atlas tiles use 0,1,4,5 in the existing 4-column coordinate convention, CSS scales this atlas at 200% × 200%.
