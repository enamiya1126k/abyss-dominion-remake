from pathlib import Path
import json
from lxml import html

root=Path(__file__).resolve().parents[2]
out=root/'docs/build420'
cls=lambda name:f"contains(concat(' ',normalize-space(@class),' '),' {name} ')"
results=[]
for mode in ['home','chapterTwoField','explore','empty']:
 tree=html.fromstring((out/f'formation-{mode}.html').read_text())
 cards=tree.xpath(f'//*[{cls("formation-member")}]')
 assert len(cards)==4
 edits=tree.xpath('//*[@data-formation-skills or @data-formation-replace or @data-formation-remove]')
 assert len(edits)==(12 if mode in ['home','chapterTwoField'] else 0)
 details=tree.xpath(f'//details[{cls("relic394-loadout")}]')
 assert len(details)==(0 if mode=='empty' else 3)
 for detail in details:
  assert detail.xpath('./summary')
  previous=detail.getprevious()
  assert previous is not None and ('formation-actions' in previous.get('class','') or 'formation-readonly-note' in previous.get('class',''))
  assert not detail.xpath('.//button[@data-formation-remove]')
 assert len(tree.xpath('//button[@data-formation-circle]'))==(0 if mode=='empty' else 4)
 results.append({'screen':'formation','origin':mode,'cards':len(cards),'edit_buttons':len(edits),'growing_descriptions':len(details),'passed':True})

def enemy_info(chapter):
 tree=html.fromstring((out/f'battle-{chapter}.html').read_text())
 units=tree.xpath(f'//button[{cls("enemy-combatant")}]');assert len(units)==4
 result=[]
 for unit in units:
  floating=unit.xpath(f'./span[{cls("battle-unit-floating-name")}]');assert len(floating)==1
  assert floating[0].xpath(f'./span[{cls("combat-rank-badge")}]') and floating[0].xpath('./b')
  name=unit.xpath(f'.//b[{cls("enemy-card-name")}]');assert len(name)==1
  card=unit.xpath(f'./div[{cls("enemy-info")}]');assert len(card)==1
  result.append(html.tostring(card[0],encoding='unicode'))
 return result
assert enemy_info('first')==enemy_info('second')
results.append({'screen':'battle','enemy_cards':4,'chapter1_and_chapter2_information_identical':True,'passed':True})
(out/'display-structure.json').write_text(json.dumps(results,ensure_ascii=False,indent=2)+'\n')
print(json.dumps(results,ensure_ascii=False,indent=2))
