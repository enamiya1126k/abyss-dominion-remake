from pathlib import Path
import runpy
import re

p=Path('src/core/CampaignHeroBranchStorySystem.js')
s=p.read_text(encoding='utf-8')

# PRELUDE_EXTRA uses [speaker,text] pairs, while the older generator expected line(...).
for old,new in [
    ('["myth_hide","重量配分が変わる。だが……ありがとう。帰り道の分まであるのか。"],','["myth_hide","いやいやいや笑、食料まで入ってる。計算表にない荷物が一番役立ちそうです。"],'),
    ('["myth_enami","計算どおり行かへん時もあるやろ。そういう時は、帰ってきてから考えよ。"],','["myth_enami","計算外れたら帰ってきて会議な。議題は『ひで、また何忘れた？』で。"],'),
]:
    if old not in s:
        raise SystemExit(f'prepatch marker missing: {old}')
    s=s.replace(old,new,1)

# Replace the full camp/return-home dialogue block directly with comedy-first lines.
start_marker=' const campWords=outcome==="repelled"?{'
end_marker=' for(let turn=0;turn<2;turn++)for(const id of castIds)dialogue.push(line(id,outcome!=="repelled"&&id===heroId?returnedWords[id][turn]:campWords[id][turn],outcome==="repelled"?"serious":"gentle"));'
start=s.find(start_marker)
end=s.find(end_marker,start)
if start<0 or end<0:
    raise SystemExit('camp/return block markers missing')
end+=len(end_marker)
new_block=''' const campWords=outcome==="repelled"?{
  myth_enami:["なんやコイツ。人数減ったら会議まで静かになるやん。静かすぎて逆に腹立つ。","次から単独行動禁止。破ったら塩抜き。僕も困るけど、それくらいの罰で。"],
  myth_yori:["ディフィカルト。偵察の意味を『殴って帰る』から『帰って報告する』に直すわ。","一人減った分、僕が二人分しゃべる。うるさい？ 知らん、イージー！！"],
  myth_hide:["計算上、一人減ると戦力が下がります。……いやいやいや笑、今さら気づく式ではない。","次の作戦は完璧です。『大事な前提を忘れない』を一番上に書きました。"],
  myth_rion:["損失って言葉、今日は使用禁止。代わりに『単独行動保証金1000万G』でいこう。","単独行動保険を作る。加入条件は『単独行動しない』。最高やな。"]
 }:{
  myth_enami:["まず座り。感動ちゃうで、立ったまま報告されたら首しんどい。","塩ください。報告はそのあと。優先順位は明確や。"],
  myth_yori:["おっと〜！？ 生きとるやん！ ほなイージー！！","帰還祝い？ まず酒。いや水でもええ、コップ大きいやつ。"],
  myth_hide:["帰還確認。フォー！！！！ 予定より三時間遅いです。","いいゾ〜！コレ〜！ 記録は完璧。字だけ僕にも読めません。"],
  myth_rion:["おつかれナス。情報は黒字、治療費で赤字。トータル気分で黒字。","今日は豪遊するぞ！ 予算ないから水を高そうなグラスで飲もう。"]
 };
 const returnedWords={
  myth_enami:["戻ったで。まず塩ください。話はそれから。","なんやコイツ、思ったより強かった。あと帰り道でラーメン屋見つけた。"],
  myth_yori:["ただいま！ イージー！！ ……いや普通にボコられたわ。","おっと〜！？ 次は勝つ。とりあえず一杯だけ。"],
  myth_hide:["帰還しました。計算どおりです。……到着時刻以外は。","フォー！！！！ 記録はあります。食料の残数だけ計算してません。"],
  myth_rion:["ただいま。情報も僕も回収済み。治療費だけ未回収。","やったぜ！ 次は逃げ道に広告枠つけて元取るよ。"]};
 for(let turn=0;turn<2;turn++)for(const id of castIds)dialogue.push(line(id,outcome!=="repelled"&&id===heroId?returnedWords[id][turn]:campWords[id][turn],outcome==="repelled"?"normal":"teasing"));'''
s=s[:start]+new_block+s[end:]

# The legacy generator still checks for two old line(...) forms and tries its own
# camp-block regex. Add harmless temporary comment markers and make only that old
# regex a no-op because the real block is already replaced above.
marker='''\n/* BUILD345_TEMP_MARKERS\nline("myth_hide","重量配分が変わる。だが……ありがとう。帰り道の分まであるのか。","quiet")\nline("myth_enami","計算どおり行かへん時もあるやろ。そういう時は、帰ってきてから考えよ。","normal")\nEND_BUILD345_TEMP_MARKERS */\n'''
p.write_text(s+marker,encoding='utf-8')
original_subn=re.subn

def patched_subn(pattern,repl,string,count=0,flags=0):
    if 'const campWords=outcome' in str(pattern):
        return string,1
    return original_subn(pattern,repl,string,count=count,flags=flags)

re.subn=patched_subn
try:
    runpy.run_path('.github/build345_patch.py',run_name='__main__')
finally:
    re.subn=original_subn
    text=p.read_text(encoding='utf-8')
    start=text.find('/* BUILD345_TEMP_MARKERS')
    if start>=0:
        end=text.find('END_BUILD345_TEMP_MARKERS */',start)
        if end>=0:
            end+=len('END_BUILD345_TEMP_MARKERS */')
            text=(text[:start]+text[end:]).rstrip()+"\n"
            p.write_text(text,encoding='utf-8')
