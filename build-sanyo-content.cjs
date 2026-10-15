const fs = require('node:fs');
const path = require('node:path');
const folder = path.join(__dirname, 'assets/travel/sanyou');
const names = {
  '名古屋': ['名古屋', 'Nagoya'],
  '绿洲21': ['オアシス21', 'Oasis 21'],
  '犬山城': ['犬山城', 'Inuyama Castle'],
  '名古屋水族馆': ['名古屋港水族館', 'Port of Nagoya Public Aquarium'],
  '出町柳': ['出町柳', 'Demachiyanagi'],
  '下鸭神社': ['下鴨神社', 'Shimogamo Shrine'],
  '平安神宫': ['平安神宮', 'Heian Jingu Shrine'],
  '花见小道': ['花見小路', 'Hanamikoji Street'],
  '京都': ['京都', 'Kyoto'],
  '鸭川': ['鴨川', 'Kamo River'],
  '贵船神社': ['貴船神社', 'Kifune Shrine'],
  '伏见稻荷大社': ['伏見稲荷大社', 'Fushimi Inari Taisha'],
  '三十三间堂': ['三十三間堂', 'Sanjusangen-do Temple'],
  '八坂神社': ['八坂神社', 'Yasaka Shrine'],
  '宇治': ['宇治', 'Uji'],
  '京都河原町站': ['京都河原町駅', 'Kyoto-kawaramachi Station'],
  '建仁寺': ['建仁寺', 'Kenninji Temple'],
  '平等院': ['平等院', 'Byodoin Temple'],
  '千光寺': ['千光寺', 'Senkoji Temple'],
  '尾道': ['尾道', 'Onomichi'],
  '向岛骑行': ['向島サイクリング', 'Cycling on Mukaishima'],
  '耕三寺': ['耕三寺', 'Kosanji Temple'],
  '严岛神社': ['嚴島神社', 'Itsukushima Shrine'],
  '广岛和平纪念资料馆': ['広島平和記念資料館', 'Hiroshima Peace Memorial Museum'],
  '原爆遗址': ['原爆ドーム', 'Atomic Bomb Dome'],
  '博多': ['博多', 'Hakata'],
  '舞鹤公园': ['舞鶴公園', 'Maizuru Park'],
  '中洲': ['中洲', 'Nakasu'],
  '栉田神社': ['櫛田神社', 'Kushida Shrine'],
  '南藏院': ['南蔵院', 'Nanzoin Temple']
};
const captions = [];
for (const line of fs.readFileSync(path.join(folder, '介绍.txt'), 'utf8').split(/\r?\n/)) {
  if (!line.trim()) continue;
  const match = line.trim().match(/^(\d+)(?:-(\d+))?\s+(.+)$/);
  if (!match) throw Error('Invalid caption: ' + line);
  const [, start, end, label] = match;
  const zh = label === '男藏院' ? '南藏院' : label;
  if (!names[zh]) throw Error('Unknown caption: ' + zh);
  for (let n = +start; n <= +(end || start); n++) captions[n - 1] = { zh, ja: names[zh][0], en: names[zh][1] };
}
const source = fs.readFileSync(path.join(folder, '行程.txt'), 'utf8').replace(/\r/g, '');
const headings = [...source.matchAll(/^Day(\d+)\s+([^\n]+)\n(?=[\t ]+\S)/gm)];
if (!headings.length) throw Error('No journal entries found');
const days = headings.map((m, i) => ({
  number: +m[1],
  title: { zh: m[2].trim() },
  text: { zh: source.slice(m.index + m[0].length, headings[i + 1]?.index ?? source.length).split('\n').map(s => s.trim()).join('\n').trim() }
}));
const intro = {
  zh: source.slice(0, headings[0].index).trim(),
  ja: 'ルート：\n名古屋 → 京都 → 宇治 → 京都 → 大阪 → 尾道 → 広島 → 福岡\n\n宿泊：\nDay 0 名古屋\nDay 1～4 京都\nDay 5 尾道\nDay 6～7 広島\nDay 8～10 福岡\n\n初めての一人旅だったこともあり、今振り返ると旅程の組み方にはまだ不慣れなところがありました。名古屋から西へと向かい、山陽新幹線沿線の主な街を巡ったことから「山陽行」と名付けました。昔訪れた場所をもう一度歩きながら、まだ行ったことのない日本の大きな街にも足を運んでみたい、そんな思いで出かけた旅です。\n\n以下は日ごとの旅行記です。長文ですので、気になるところからお読みください。\n（以下の内容は中国語版のみです）',
  en: 'Route:\nNagoya → Kyoto → Uji → Kyoto → Osaka → Onomichi → Hiroshima → Fukuoka\n\nAccommodation:\nDay 0 Nagoya\nDays 1–4 Kyoto\nDay 5 Onomichi\nDays 6–7 Hiroshima\nDays 8–10 Fukuoka\n\nThis was my first solo trip, and looking back, I was still finding my feet when it came to planning an itinerary. I travelled west from Nagoya, calling the trip my “San\'yo Journey” after the Sanyo Shinkansen corridor and the major cities I visited along it. I wanted to revisit places I had been to long ago while also getting to know some of Japan\'s other major cities.\n\nBelow is my day-by-day travel journal. It is quite long, so feel free to browse the parts that interest you.\n(The following content is available in Chinese only.)'
};
const photos = fs.readdirSync(folder).filter(name => /^\d+\.(jpg|jpeg|png)$/i.test(name));
if (photos.some(name => !captions[Number(path.parse(name).name) - 1])) throw Error('Missing photo caption');
for (const language of Object.keys(intro)) {
  intro[language] = intro[language].replace(/((?:路线|ルート|Route)[:：])\n/, '$1 ');
}
fs.writeFileSync(path.join(__dirname, 'sanyo-travel-content.js'), 'window.sanyoTravelContent = ' + JSON.stringify({ captions, itinerary: { intro, days } }, null, 2) + ';\n');
console.log(`${captions.length} captions; ${days.length} journal entries`);
