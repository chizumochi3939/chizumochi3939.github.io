(() => {
  const works = window.translationData;
  const labels = {
    zh: ["歌词翻译", "全文阅读", "返回主页", "作曲", "演唱", "翻译"],
    ja: ["歌詞翻訳", "全文を読む", "ホームページに戻る", "作曲", "歌唱", "翻訳"],
    en: ["Lyric Translations", "Read translation", "Back to Homepage", "Music", "Vocals", "Translation"]
  };
  let language = document.querySelector('body > .nav .lang.active')?.dataset.lang || "zh";
  const grid = document.getElementById("translationWorks");
  const dialog = document.createElement("dialog");
  dialog.className = "translation-dialog";
  dialog.innerHTML = '<header class="translation-toolbar"><button type="button" class="translation-back"></button><div class="translation-languages nav-tools"></div></header><article class="translation-reading"></article>';
  document.body.append(dialog);
  const back = dialog.querySelector(".translation-back");
  const reading = dialog.querySelector(".translation-reading");
  const player = document.getElementById("navPlayer");
  const playerMarker = document.createComment("navigation player position");
  player.before(playerMarker);
  const playlist = document.getElementById("playlistPanel");
  const playlistMarker = document.createComment("playlist position");
  playlist.before(playlistMarker);
  let selected = null;
  let trigger = null;
  let previousOverflow = "";
  const node = (tag, className, text) => {
    const element = document.createElement(tag);
    element.className = className;
    if (text !== undefined) element.textContent = text;
    return element;
  };
  const languageButtons = [ ["zh", "中"], ["ja", "日"], ["en", "EN"] ].map(([code, text]) => {
    const button = node("button", "lang", text);
    button.type = "button";
    button.addEventListener("click", () => document.querySelector('body > .nav .lang[data-lang="' + code + '"]').click());
    dialog.querySelector(".translation-languages").append(button);
    return [code, button];
  });
  function refresh() {
    const text = labels[language];
    document.getElementById("translationsHeading").textContent = ({zh: "歌词翻译", ja: "歌詞翻訳", en: "Lyric Translations"})[language];
    back.textContent = "← " + text[2];
    grid.querySelectorAll(".translation-read").forEach(link => { link.textContent = text[1] + " ↗"; });
    languageButtons.forEach(([code, button]) => button.classList.toggle("active", code === language));
    reading.querySelectorAll("[data-credit]").forEach(label => { label.textContent = text[Number(label.dataset.credit)]; });
    reading.querySelector("audio")?.dispatchEvent(new Event("translation-labels"));
  }
  function open(work, source) {
    selected = work;
    trigger = source;
    reading.replaceChildren();
    const heading = node("header", "translation-heading");
    const cover = node("img", "translation-cover");
    cover.src = window.previewImageSource(work.cover);
    cover.alt = work.title;
    const info = node("div", "translation-info");
    const title = node("h1", "", work.title);
    title.id = "translationTitle";
    dialog.setAttribute("aria-labelledby", title.id);
    const titleRow = node("div", "translation-title-row");
    const titleGroup = node("div", "translation-title-group");
    titleGroup.append(title);
    titleRow.append(titleGroup);
    info.append(titleRow);
    const credits = node("dl", "translation-credits");
    [work.music, work.vocal, work.translator].forEach((value, index) => {
      const term = node("dt", "");
      term.dataset.credit = index + 3;
      credits.append(term, node("dd", "", value));
    });
    titleGroup.append(credits);
    heading.append(cover, info);
    const audio = node("audio", "translation-audio");
    audio.preload = "none";
    audio.src = work.audio || ("assets/translation/" + (work.title === "Summering" ? "Summering.mp3" : "サマーモーメント.mp3"));
    audio.setAttribute("aria-label", work.title);
    const controls = node("div", "translation-song-player");
    const playerCover = node("img", "translation-song-cover");
    playerCover.src = window.previewImageSource(work.cover);
    playerCover.alt = "";
    const playerInfo = node("div", "translation-song-info");
    playerInfo.append(node("strong", "", work.title), node("span", "", work.music + " / " + work.vocal));
    const play = node("button", "translation-song-play", "▶");
    play.type = "button";
    const timeline = node("div", "translation-song-timeline");
    const seek = node("input", "translation-song-seek");
    seek.type = "range";
    seek.min = "0"; seek.max = "100"; seek.step = "0.1"; seek.value = "0";
    seek.disabled = true;
    const elapsedTime = node("span", "translation-song-time", "0:00");
    const totalTime = node("span", "translation-song-time", "0:00");
    timeline.append(elapsedTime, seek, totalTime);
    controls.append(playerCover, playerInfo, play, timeline, audio);
    titleRow.append(controls);
    let seeking = false;
    const duration = () => Number.isFinite(audio.duration) ? audio.duration : 0;
    const format = seconds => Math.floor(seconds / 60) + ":" + String(Math.floor(seconds % 60)).padStart(2, "0");
    const syncAudio = () => {
      const text = {zh: ["播放", "暂停", "播放进度", "音频无法加载"], ja: ["再生", "一時停止", "再生位置", "音声を読み込めません"], en: ["Play", "Pause", "Playback position", "Audio unavailable"]}[language];
      play.textContent = audio.paused ? "▶" : "Ⅱ";
      play.title = audio.error ? text[3] : text[audio.paused ? 0 : 1];
      play.setAttribute("aria-label", play.title);
      play.disabled = !!audio.error;
      seek.disabled = !duration() || !!audio.error;
      seek.setAttribute("aria-label", text[2]);
      if (!seeking) seek.value = duration() ? String(audio.currentTime / duration() * 100) : "0";
      seek.style.setProperty("--progress", seek.value + "%");
      const position = seeking ? Number(seek.value) / 100 * duration() : audio.currentTime;
      elapsedTime.textContent = format(position);
      totalTime.textContent = format(duration());
      seek.setAttribute("aria-valuetext", elapsedTime.textContent + " / " + totalTime.textContent);
    };
    play.addEventListener("click", () => {
      if (audio.paused) audio.play().catch(syncAudio);
      else audio.pause();
    });
    seek.addEventListener("input", () => { seeking = true; syncAudio(); });
    seek.addEventListener("change", () => {
      if (duration()) audio.currentTime = Number(seek.value) / 100 * duration();
      seeking = false;
      syncAudio();
    });
    seek.addEventListener("pointercancel", () => { seeking = false; syncAudio(); });
    ["play", "pause", "ended", "timeupdate", "loadedmetadata", "durationchange", "error", "translation-labels"].forEach(event => audio.addEventListener(event, syncAudio));
    syncAudio();
    reading.append(heading);
    const lyrics = node("div", "translation-lyrics");
    work.blocks.forEach(block => {
      const stanza = node("section", "translation-stanza");
      for (let i = 0; i < block.length; i += 2) {
        const pair = node("div", "translation-pair");
        const original = node("p", "translation-original", block[i]);
        const translated = node("p", "translation-chinese", block[i + 1]);
        original.lang = "ja";
        translated.lang = "zh-CN";
        pair.append(original, translated);
        stanza.append(pair);
      }
      lyrics.append(stanza);
    });
    reading.append(lyrics);
    refresh();
    previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.getElementById("playlistClose").click();
    dialog.querySelector(".translation-toolbar").insertBefore(player, dialog.querySelector(".translation-languages"));
    dialog.append(playlist);
    dialog.showModal();
    dialog.scrollTop = 0;
    if (!matchMedia("(prefers-reduced-motion: reduce)").matches) dialog.animate([{opacity: 0}, {opacity: 1}], {duration: 240});
  }
  back.addEventListener("click", () => dialog.close());
  dialog.addEventListener("close", () => {
    reading.querySelector("audio")?.pause();
    document.getElementById("playlistClose").click();
    playerMarker.after(player);
    playlistMarker.after(playlist);
    document.body.style.overflow = previousOverflow;
    trigger?.focus({preventScroll: true});
    selected = null;
  });
  works.forEach(work => {
    const card = node("article", "translation-work");
    const coverButton = node("button", "translation-cover-button song-preview-cover");
    coverButton.type = "button";
    coverButton.setAttribute("aria-label", work.title);
    const cover = node("img", "");
    cover.src = window.previewImageSource(work.cover);
    cover.alt = work.title;
    cover.loading = "lazy";
    coverButton.append(cover);
    const link = node("button", "translation-read song-preview-link");
    link.type = "button";
    const excerpt = node("button", "translation-excerpt", work.blocks[0]?.[0] || "");
    excerpt.type = "button";
    const title = node("h4", "");
    const titleButton = node("button", "translation-text-link", work.title);
    titleButton.type = "button";
    title.append(titleButton);
    const author = node("p", "translation-author");
    const authorButton = node("button", "translation-text-link", work.music + " / " + work.vocal);
    authorButton.type = "button";
    author.append(authorButton);
    [coverButton, link, excerpt, titleButton, authorButton].forEach(button => button.addEventListener("click", () => open(work, button)));
    card.append(coverButton, title, author, excerpt, link);
    grid.append(card);
  });
  window.addEventListener("site-language-change", event => { language = event.detail; refresh(); });
  refresh();
})();
