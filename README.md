# Chizumochi Personal Website v2

定位：个人生活与创作网站，而非学术主页。

栏目：
- 介绍
- 音乐
- 旅行
- 文章

支持：
- 中文 / 日本語 / English
- 深色模式
- 首页音乐播放器
- 响应式移动端布局

## 添加自己的音乐

把 mp3 文件放到：

assets/music/

然后打开 `script.js`，找到：

const playlist = [...]

按照下面的格式添加歌曲：

{title:"歌曲名", artist:"P主 / 你的名字", src:"assets/music/文件名.mp3"}

浏览器通常不允许网页在用户没有操作时自动播放有声音的音频，所以首页会显示播放器，用户点击播放即可。

## 添加照片

以后可以把旅行照片放进：

assets/travel/

然后在对应旅行页面或旅行卡片中使用。

## 本地打开

用 VS Code 打开整个文件夹，然后可以直接双击 index.html；
更推荐安装 Live Server，右键 index.html → Open with Live Server。

## 下一步

可以继续把：
1. 首页视觉做成更强的个人标识
2. 音乐改成真正的唱片 / 播放器页面
3. 每次旅行做成独立页面
4. P主做成音乐资料库
5. 文章做成真正的文章系统
6. 加入自己的头像、Logo、照片
7. 最后部署到 GitHub Pages + 自定义域名
