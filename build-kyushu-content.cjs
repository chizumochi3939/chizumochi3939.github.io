const fs = require('node:fs');
const path = require('node:path');
const folder = path.join(__dirname, 'assets/travel/kyushu');
const names = {
  '高森': ['高森', 'Takamori'],
  '上色见熊野座神社': ['上色見熊野座神社', 'Kamishikimi Kumanoimasu Shrine'],
  '阿苏火山': ['阿蘇山', 'Mount Aso'],
  '阿苏': ['阿蘇', 'Aso'],
  '熊本城': ['熊本城', 'Kumamoto Castle'],
  '樱之小路': ['桜の小路', 'Sakura-no-koji'],
  '熊本熊': ['くまモン', 'Kumamon'],
  '成趣园': ['水前寺成趣園', 'Suizenji Jojuen Garden'],
  '加藤神社': ['加藤神社', 'Kato Shrine'],
  '别府塔': ['別府タワー', 'Beppu Tower'],
  '别府地狱温泉': ['べっぷ地獄めぐり', 'Hells of Beppu'],
  '由布院': ['由布院', 'Yufuin'],
  '别府站': ['別府駅', 'Beppu Station'],
  'SunMesse 日南': ['サンメッセ日南', 'Sun Messe Nichinan'],
  '鹈户神宫': ['鵜戸神宮', 'Udo Jingu'],
  '青岛': ['青島', 'Aoshima'],
  '仙严园': ['仙巌園', 'Sengan-en'],
  '鹿儿岛水族馆': ['いおワールドかごしま水族館', 'Kagoshima City Aquarium'],
  '樱岛': ['桜島', 'Sakurajima'],
  '神户': ['神戸', 'Kobe'],
  '北野异人馆': ['北野異人館', 'Kitano Ijinkan'],
  '生田神社': ['生田神社', 'Ikuta Shrine'],
  '姬路城': ['姫路城', 'Himeji Castle'],
  '明石大桥': ['明石海峡大橋', 'Akashi Kaikyo Bridge']
};
const captions = [];
for (const line of fs.readFileSync(path.join(folder, '介绍.txt'), 'utf8').split(/\r?\n/)) {
  if (!line.trim()) continue;
  const match = line.trim().match(/^(\d+)(?:-(\d+))?\s+(.+)$/);
  if (!match || !names[match[3]]) throw Error('Unknown caption: ' + line);
  const [, start, end, zh] = match;
  for (let n = +start; n <= +(end || start); n++) captions[n - 1] = { zh, ja: names[zh][0], en: names[zh][1] };
}
const source = fs.readFileSync(path.join(folder, '行程.txt'), 'utf8').replace(/\r/g, '');
// Overview also contains Day labels; journal entries are followed by indented prose.
const headings = [...source.matchAll(/^Day(\d+(?:-\d+)?)\s+([^\n]+)\n(?=[\t ]+\S)/gm)];
if (!headings.length) throw Error('No journal entries found');
const days = headings.map((m, i) => ({
  number: m[1].includes('-') ? m[1] : +m[1],
  title: { zh: m[2].trim() },
  text: { zh: source.slice(m.index + m[0].length, headings[i + 1]?.index ?? source.length).split('\n').map(s => s.trim()).join('\n').trim() }
}));
days.find(day => day.number === 0).asidePhoto = {
  src: 'assets/travel/kyushu/熊本站JR员工手写时刻图.jpg',
  preview: 'assets/travel/kyushu/previews/熊本站JR员工手写时刻图.jpg.jpg',
  alt: { zh: '熊本站JR员工手写路线图', ja: '熊本駅のJR駅員さんが書いてくれた乗り換え案内', en: 'Handwritten transfer guide from a JR staff member at Kumamoto Station' }
};
const intro = {
  zh: source.slice(0, headings[0].index).trim() + '\n\n以下为每日的随记，内容较长，请谨慎阅览：',
  ja: 'ルート：Day 0 福岡 → Day 1～2 熊本 → Day 3 大分 → Day 4 宮崎 → Day 5～6 鹿児島 → Day 7 神戸 → Day 8 姫路 → Day 9～11 大阪\n\n宿泊：\nDay 0～1 熊本\nDay 2 別府\nDay 3 宮崎\nDay 4～6 鹿児島\nDay 7 神戸\nDay 8～11 大阪\n\n交通：\nDay 0～4 JR九州レールパス（全九州・5日間）\n\n以下は日ごとの旅行記です。長文ですので、気になるところからお読みください。\n（以下の内容は中国語版のみです）',
  en: 'Route: Day 0 Fukuoka → Days 1–2 Kumamoto → Day 3 Oita → Day 4 Miyazaki → Days 5–6 Kagoshima → Day 7 Kobe → Day 8 Himeji → Days 9–11 Osaka\n\nAccommodation:\nDays 0–1 Kumamoto\nDay 2 Beppu\nDay 3 Miyazaki\nDays 4–6 Kagoshima\nDay 7 Kobe\nDays 8–11 Osaka\n\nTransport:\nDays 0–4 JR Kyushu Rail Pass (All Kyushu, 5 days)\n\nBelow is my day-by-day travel journal. It is quite long, so feel free to browse the parts that interest you.\n(The following content is available in Chinese only.)'
};
fs.writeFileSync(path.join(__dirname, 'kyushu-travel-content.js'), 'window.kyushuTravelContent = ' + JSON.stringify({ captions, itinerary: { intro, days } }, null, 2) + ';\n');
console.log(`${captions.length} captions; journal entries: ${days.map(day => day.number).join(', ')}`);
