# 旅行内容填写

只需在 `travel-data.js` 中填写地图、照片和行程；首页和详情页共用这些数据。
图片路径相对于网站根目录，建议把旅行照片放在 `assets/travel/` 下。

## 制县等级地图

将 `map: ""` 改为实际图片路径，例如 `map: "assets/travel/japan-map.png"`。
地图会完整显示，不裁切。未填写时保留空白图框。

## 每次旅行的照片

通过 `id` 找到对应旅行：`kii`、`izu`、`kyushu`、`sanyo`、`hokkaido`。
在该旅行的 `photos` 数组中填写全部图片；详情页显示全部照片。
可以用 `featuredPhotos: [1, 3, 8]` 指定首页精选，数字对应 `photos` 中从 1 开始的位置。
精选数量不限，例如 `featuredPhotos: [1, 3, 6, 8]` 会在首页按此顺序展示四张。
没有设置精选时，首页默认显示前三张。
照片左右两侧的箭头可首尾循环翻页，底部显示当前张数。

纪伊行保留了原图，并在 `assets/travel/kii/preview/` 生成网页预览。
原图与预览图按 `01.jpg`、`02.jpg`、`03.jpg` 连续编号。纪伊行会自动检测照片数量，新增 `16.jpg`、`17.jpg` 后刷新即可，不需要修改代码。
编号中间不能断开：如果缺少 `16.jpg`，检测会在 15 张停止，即使存在 `17.jpg` 也不会加入。
详情页使用统一尺寸的相框，以原图比例完整显示，空余部分透明；首页仍居中裁剪。
`src` 指向原图，可选的 `preview` 指向较小的显示版本。新增照片时无需强制生成预览，直接填写 `src` 也能显示。

## 每张照片的说明

每次旅行使用同一个模板：在对应旅行中添加 `photoDescriptions`，顺序与照片编号一致。说明只在详情页显示，切换照片时自动更新。

```js
photoDescriptions: [
  { zh: "第1张说明", ja: "1枚目の説明", en: "Description for photo 1" },
  { zh: "第2张说明", ja: "2枚目の説明", en: "Description for photo 2" }
],
```

可以先只写中文：`photoDescriptions: ["第1张说明", "第2张说明"]`。没有说明的照片不会显示空白文字区。

```js
photos: [
  {
    src: "assets/travel/kii/01.jpg",
    alt: { zh: "照片描述", ja: "写真の説明", en: "Photo description" }
  },
  {
    src: "assets/travel/kii/02.jpg",
    alt: { zh: "第二张照片", ja: "2枚目の写真", en: "Second photo" }
  }
],
```

未填照片时显示三个空白相框，便于预览左右切换。填好后只显示实际照片。
首页点击照片或行程文字进入详情页，左右箭头只切换照片。

## 每日行程

在对应旅行的 `days` 数组中按顺序添加每天的记录，天数自动编号。
下面只是字段格式，不是预先填写的实际行程：

```js
days: [
  {
    title: { zh: "当天标题", ja: "その日のタイトル", en: "Day title" },
    route: { zh: "地点 A → 地点 B", ja: "場所 A → 場所 B", en: "Place A → Place B" },
    text: { zh: "当天的记录。\n另一段记录。", ja: "旅の記録。", en: "Travel notes." },
    photos: [
      { src: "assets/travel/kii/day1.jpg", alt: { zh: "照片描述", ja: "写真の説明", en: "Photo description" } }
    ]
  }
]
```

没有内容时详情页显示“待更新”，不生成虚构行程。文字可先写中文，缺少的翻译会回退到中文。
详情链接示例：`trip.html?trip=kii&lang=zh`。
# Online photo previews

To refresh previews for all site images, including music covers and maps, run:

```powershell
./prepare-event-images.ps1 -AssetRoot 'assets'
```

Publish `image-previews.js` together with the generated previews. Small UI icons
keep their original files. Run the travel command below as well after adding or
renaming travel photos, to refresh the gallery file list.

After adding or replacing numbered travel photos, run this from the site folder:

```powershell
./prepare-event-images.ps1 -AssetRoot 'assets/travel'
```

Publish the updated `travel-photo-manifest.js` and `assets/travel/**/previews/`
along with the original photos. The manifest lets the website list photos without
downloading every original first. Originals remain available for enlarged viewing.
