// Add image paths relative to index.html. See TRAVEL.md for photo and day examples.
window.travelData = {
  map: {
    zh: "assets/travel/制县等级_cn.png",
    ja: "assets/travel/制县等级_jp.png",
    en: "assets/travel/制县等级_en.png"
  },
  trips: [
    {
      id: "kii", date: "2026.07",
      title: { zh: "纪伊行", ja: "紀伊行", en: "Kii Journey" },
      route: {
        zh: "大阪 → 伊势 → 鸟羽 → 志摩 → 纪伊胜浦 → 新宫 → 串本 → 白滨 → 和歌山",
        ja: "大阪 → 伊勢 → 鳥羽 → 志摩 → 紀伊勝浦 → 新宮 → 串本 → 白浜 → 和歌山",
        en: "Osaka → Ise → Toba → Shima → Kii-Katsuura → Shingu → Kushimoto → Shirahama → Wakayama"
      },
      featuredPhotos: [1, 3, 6, 8, 16, 18, 21],
      photoDescriptions: [
        { zh: "孤独鸟居", ja: "海中の鳥居", en: "Torii Gate in the Sea" },
        { zh: "飞泷神社", ja: "飛瀧神社", en: "Hirou Shrine" },
        { zh: "熊野古道", ja: "熊野古道", en: "Kumano Kodo Pilgrimage Routes" },
        { zh: "潮岬 - 本州最南端", ja: "潮岬・本州最南端", en: "Cape Shionomisaki - Southernmost Point of Honshu" },
        { zh: "纪伊胜浦", ja: "紀伊勝浦", en: "Kii-Katsuura" },
        { zh: "熊野那智大社", ja: "熊野那智大社", en: "Kumano Nachi Taisha Grand Shrine" },
        { zh: "那智瀑布 - 日本落差最大的瀑布", ja: "那智の滝・日本一の落差を誇る一段滝", en: "Nachi Waterfall - Japan's Tallest Single-Drop Waterfall" },
        { zh: "千叠敷", ja: "千畳敷", en: "Senjojiki Rock Plateau" },
        { zh: "白滨", ja: "白浜", en: "Shirahama" },
        { zh: "青岸渡寺三重塔", ja: "青岸渡寺三重塔", en: "Three-Story Pagoda of Seiganto-ji Temple" },
        { zh: "小玉电车", ja: "たま電車", en: "Tama Train" },
        { zh: "纪三井寺", ja: "紀三井寺", en: "Kimiidera Temple" },
        { zh: "伊势神宫周边", ja: "伊勢神宮周辺", en: "Near Ise Jingu" },
        { zh: "和歌山城", ja: "和歌山城", en: "Wakayama Castle" },
        { zh: "伊势", ja: "伊勢", en: "Ise" },
        { zh: "伊势神宫", ja: "伊勢神宮", en: "Ise Jingu" },
        { zh: "伊势", ja: "伊勢", en: "Ise" },
        { zh: "熊野本宫大社", ja: "熊野本宮大社", en: "Kumano Hongu Taisha Grand Shrine" },
        { zh: "大王崎灯台", ja: "大王埼灯台", en: "Daiosaki Lighthouse" },
        { zh: "神仓神社", ja: "神倉神社", en: "Kamikura-jinja Shrine" },
        { zh: "大斋原大鸟居", ja: "大斎原大鳥居", en: "Oyunohara Grand Torii Gate" },
        { zh: "熊野古道", ja: "熊野古道", en: "Kumano Kodo Pilgrimage Routes" },
        { zh: "鸟羽水族馆", ja: "鳥羽水族館", en: "Toba Aquarium" },
        { zh: "鸟羽", ja: "鳥羽", en: "Toba" },
        { zh: "志摩", ja: "志摩", en: "Shima" },
        { zh: "三段壁", ja: "三段壁", en: "Sandanbeki Cliffs" }
      ],
      autoPhotos: {
        folder: "assets/travel/kii",
        extension: "jpg"
      },
      itineraryData: window.kiiItineraryData,
      photos: [],
      days: []
    },
    {
      id: "izu", date: "2026.01",
      title: { zh: "伊豆行", ja: "伊豆行", en: "Izu Journey" },
      itineraryMap: "assets/travel/izu/行程图.jpg",
      featuredPhotos: [24, 11, 15, 8, 23, 27],
      autoPhotos: {
        folder: "assets/travel/izu",
        extension: "jpg"
      },
      photoDescriptions: [
        { zh: "箱根", ja: "箱根", en: "Hakone" },
        { zh: "箱根旧街道", ja: "箱根旧街道", en: "Old Tokaido Road in Hakone" },
        { zh: "云须川自然步道", ja: "須雲川自然探勝歩道", en: "Sukumogawa Nature Trail" },
        { zh: "成川美术馆", ja: "成川美術館", en: "Narukawa Art Museum" },
        { zh: "元箱根港", ja: "元箱根港", en: "Motohakone Port" },
        { zh: "甘酒茶屋", ja: "甘酒茶屋", en: "Amazake Chaya" },
        { zh: "雕刻之森美术馆", ja: "彫刻の森美術館", en: "The Hakone Open-Air Museum" },
        { zh: "来宫神社", ja: "來宮神社", en: "Kinomiya Shrine" },
        { zh: "来宫神社大樟", ja: "來宮神社の大楠", en: "The Great Camphor Tree at Kinomiya Shrine" },
        { zh: "伊东海岸", ja: "伊東の海岸", en: "Ito Coast" },
        { zh: "伊东海岸", ja: "伊東の海岸", en: "Ito Coast" },
        { zh: "MOA美术馆", ja: "MOA美術館", en: "MOA Museum of Art" },
        { zh: "伊豆名物-金目鲷", ja: "伊豆名物・金目鯛", en: "Kinmedai (Splendid Alfonsino), an Izu Specialty" },
        { zh: "伊东海岸", ja: "伊東の海岸", en: "Ito Coast" },
        { zh: "伊东海岸", ja: "伊東の海岸", en: "Ito Coast" },
        { zh: "小室山", ja: "小室山", en: "Mount Komuro" },
        { zh: "东海馆", ja: "東海館", en: "Tokaikan" },
        { zh: "大室山", ja: "大室山", en: "Mount Omuro" },
        { zh: "伊豆仙人掌动物园", ja: "伊豆シャボテン動物公園", en: "Izu Shaboten Zoo" },
        { zh: "城崎海岸", ja: "城ヶ崎海岸", en: "Jogasaki Coast" },
        { zh: "城崎海岸", ja: "城ヶ崎海岸", en: "Jogasaki Coast" },
        { zh: "大室山", ja: "大室山", en: "Mount Omuro" },
        { zh: "城崎海岸", ja: "城ヶ崎海岸", en: "Jogasaki Coast" },
        { zh: "白滨神社", ja: "白濱神社", en: "Shirahama Shrine" },
        { zh: "石廊崎", ja: "石廊崎", en: "Cape Irozaki" },
        { zh: "爪木崎", ja: "爪木崎", en: "Cape Tsumekizaki" },
        { zh: "爪木崎", ja: "爪木崎", en: "Cape Tsumekizaki" },
        { zh: "石室神社", ja: "石室神社", en: "Iro Shrine" },
        { zh: "石廊崎", ja: "石廊崎", en: "Cape Irozaki" }
      ],
      route: {
        zh: "东京 → 箱根 → 热海 → 伊东 → 南伊豆 → 横滨 → 东京",
        ja: "東京 → 箱根 → 熱海 → 伊東 → 南伊豆 → 横浜 → 東京",
        en: "Tokyo → Hakone → Atami → Ito → Minami-Izu → Yokohama → Tokyo"
      },
      photos: [], days: []
    },
    {
      id: "kyushu", date: "2025.07",
      title: { zh: "九州行", ja: "九州行", en: "Kyushu Journey" },
      route: {
        zh: "福冈 → 熊本 → 大分 → 宫崎 → 鹿儿岛 → 神户 → 姬路 → 大阪",
        ja: "福岡 → 熊本 → 大分 → 宮崎 → 鹿児島 → 神戸 → 姫路 → 大阪",
        en: "Fukuoka → Kumamoto → Oita → Miyazaki → Kagoshima → Kobe → Himeji → Osaka"
      },
      photos: [], days: []
    },
    {
      id: "sanyo", date: "2024.08",
      title: { zh: "山阳行", ja: "山陽行", en: "San'yo Journey" },
      route: {
        zh: "名古屋 → 京都 → 大阪 → 尾道 → 广岛 → 福冈",
        ja: "名古屋 → 京都 → 大阪 → 尾道 → 広島 → 福岡",
        en: "Nagoya → Kyoto → Osaka → Onomichi → Hiroshima → Fukuoka"
      },
      photos: [], days: []
    },
    {
      id: "hokkaido", date: "2024.01",
      title: { zh: "北海道行", ja: "北海道行", en: "Hokkaido Journey" },
      route: {
        zh: "东京 → 富士山 → 东京 → 札幌 → 小樽 → 旭川 → 网走 → 知床 → 钏路 → 札幌 → 东京",
        ja: "東京 → 富士山 → 東京 → 札幌 → 小樽 → 旭川 → 網走 → 知床 → 釧路 → 札幌 → 東京",
        en: "Tokyo → Mt. Fuji → Tokyo → Sapporo → Otaru → Asahikawa → Abashiri → Shiretoko → Kushiro → Sapporo → Tokyo"
      },
      photos: [], days: []
    }
  ]
};
