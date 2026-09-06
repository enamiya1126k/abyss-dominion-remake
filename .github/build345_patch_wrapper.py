from pathlib import Path
import runpy

p=Path('src/core/CampaignHeroBranchStorySystem.js')
s=p.read_text(encoding='utf-8')
old_hide='["myth_hide","重量配分が変わる。だが……ありがとう。帰り道の分まであるのか。"],'
new_hide='["myth_hide","いやいやいや笑、食料まで入ってる。計算表にない荷物が一番役立ちそうです。"],'
old_enami='["myth_enami","計算どおり行かへん時もあるやろ。そういう時は、帰ってきてから考えよ。"],'
new_enami='["myth_enami","計算外れたら帰ってきて会議な。議題は『ひで、また何忘れた？』で。"],'
for old,new in [(old_hide,new_hide),(old_enami,new_enami)]:
    if old not in s:
        raise SystemExit(f'prepatch marker missing: {old}')
    s=s.replace(old,new,1)
marker='''\n/* BUILD345_TEMP_MARKERS\nline("myth_hide","重量配分が変わる。だが……ありがとう。帰り道の分まであるのか。","quiet")\nline("myth_enami","計算どおり行かへん時もあるやろ。そういう時は、帰ってきてから考えよ。","normal")\nEND_BUILD345_TEMP_MARKERS */\n'''
p.write_text(s+marker,encoding='utf-8')
try:
    runpy.run_path('.github/build345_patch.py',run_name='__main__')
finally:
    text=p.read_text(encoding='utf-8')
    start=text.find('/* BUILD345_TEMP_MARKERS')
    if start>=0:
        end=text.find('END_BUILD345_TEMP_MARKERS */',start)
        if end>=0:
            end+=len('END_BUILD345_TEMP_MARKERS */')
            text=(text[:start]+text[end:]).rstrip()+"\n"
            p.write_text(text,encoding='utf-8')
