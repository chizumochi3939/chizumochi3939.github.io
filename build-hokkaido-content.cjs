const fs = require('node:fs');
const path = require('node:path');
const folder = path.join(__dirname, 'assets/travel/hokkaido');
const translatedNames = {
  '北海道神宫': ['北海道神宮', 'Hokkaido Jingu'],
  '札幌啤酒博物馆': ['サッポロビール博物館', 'Sapporo Beer Museum'],
  '白色恋人公园': ['白い恋人パーク', 'Shiroi Koibito Park'],
  '小樽': ['小樽', 'Otaru'],
  '天狗山神社': ['天狗山神社', 'Tenguyama Shrine'],
  '小樽运河': ['小樽運河', 'Otaru Canal'],
  '钱函': ['銭函', 'Zenibako'],
  '天狗山': ['天狗山', 'Mt. Tengu'],
  '旭川动物园': ['旭川市旭山動物園', 'Asahiyama Zoo'],
  '网走': ['網走', 'Abashiri'],
  '网走监狱': ['博物館 網走監獄', 'Abashiri Prison Museum'],
  '知床斜里': ['知床斜里', 'Shiretoko-Shari'],
  '知床村': ['知床の集落', 'A Village in Shiretoko'],
  '知床': ['知床', 'Shiretoko'],
  '湿原列车': ['SL冬の湿原号', 'SL Fuyu-no-Shitsugen Train'],
  '特急大雪号列车': ['特急大雪', 'Limited Express Taisetsu'],
  'またね、しれとこ': ['またね、しれとこ', 'See You Again, Shiretoko'],
  '富士山': ['富士山', 'Mt. Fuji'],
  '浅间神社': ['浅間神社', 'Asama Shrine'],
  '浅草寺': ['浅草寺', 'Senso-ji Temple'],
  '神田-春日亭': ['神田・春日亭', 'Kanda - Kasugatei'],
  '秋叶原-面屋武藏': ['秋葉原・麺屋武蔵', 'Akihabara - Menya Musashi'],
  '浅草-浅草今半': ['浅草・浅草今半', 'Asakusa - Asakusa Imahan'],
  '札幌-汤咖喱': ['札幌・スープカレー', 'Sapporo - Soup Curry'],
  '旭川-火山头': ['旭川・火山頭', 'Asahikawa - 火山头']
};
const captions = [];
for (const line of fs.readFileSync(path.join(folder, '介绍.txt'), 'utf8').split(/\r?\n/)) {
  if (!line.trim()) continue;
  const match = line.trim().match(/^(\d+)(?:-(\d+))?\s+(.+)$/);
  if (!match) throw new Error('Unrecognized caption: ' + line);
  const [, first, last, zh] = match;
  const names = translatedNames[zh];
  if (!names) throw new Error('Missing translation: ' + zh);
  for (let i = Number(first); i <= Number(last || first); i++) captions[i - 1] = { zh, ja: names[0], en: names[1] };
}
const source = fs.readFileSync(path.join(folder, '行程.txt'), 'utf8').replace(/\r/g, '');
const marker = source.indexOf('以下为每日的随记');
if (marker < 0) throw new Error('Journal marker missing');
const overview = source.slice(0, marker).trim();
const journal = source.slice(marker);
const headings = [...journal.matchAll(/^Day(\d+)\s+([^\n]+)$/gm)];
const days = headings.map((match, i) => ({
  number: Number(match[1]),
  title: { zh: match[2].trim() },
  text: { zh: journal.slice(match.index + match[0].length, headings[i + 1]?.index ?? journal.length).split('\n').map(line => line.trim()).join('\n').trim() }
}));
const intro = {
  zh: overview + '\n\n以下为每日的随记，内容较长可以快速浏览：',
  ja: 'ルート：Day 0～1 東京 → Day 2 富士山 → Day 3 東京 → Day 4 札幌 → Day 5 小樽 → 札幌 → Day 6 旭川 → Day 7 網走 → Day 8 知床 → Day 9 釧路 → Day 10 札幌 → 東京\n\n宿泊：\nDay 0 東京\nDay 1 富士山\nDay 2 東京\nDay 3～5 札幌\nDay 6 網走\nDay 7～8 知床\nDay 9 札幌\nDay 10 東京\n\n交通：\nDay 5～9 北海道レールパス（5日間）\n\n以下は日ごとの旅行記です。長文ですので、気になるところからお読みください。\n（以下の内容は中国語版のみです）',
  en: 'Route: Days 0–1 Tokyo → Day 2 Mt. Fuji → Day 3 Tokyo → Day 4 Sapporo → Day 5 Otaru → Sapporo → Day 6 Asahikawa → Day 7 Abashiri → Day 8 Shiretoko → Day 9 Kushiro → Day 10 Sapporo → Tokyo\n\nAccommodation:\nDay 0 Tokyo\nDay 1 Mt. Fuji\nDay 2 Tokyo\nDays 3–5 Sapporo\nDay 6 Abashiri\nDays 7–8 Shiretoko\nDay 9 Sapporo\nDay 10 Tokyo\n\nTransport:\nDays 5–9 Hokkaido Rail Pass (5 days)\n\nBelow is my day-by-day travel journal. It is quite long, so feel free to browse the parts that interest you.\n(The following content is available in Chinese only.)'
};
fs.writeFileSync(path.join(__dirname, 'hokkaido-travel-content.js'), 'window.hokkaidoTravelContent = ' + JSON.stringify({ captions, itinerary: { intro, days } }, null, 2) + ';\n');
console.log(`${captions.length} captions, ${days.length} journal days generated`);
