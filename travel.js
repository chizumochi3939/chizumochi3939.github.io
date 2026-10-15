(() => {
  const data = window.travelData;
  const params = new URLSearchParams(location.search);
  const detail = document.getElementById("tripDetail");
  let language = detail && ["zh", "ja", "en"].includes(params.get("lang")) ? params.get("lang") : "zh";
  let galleries = [];
  const words = {
    zh: { map: "制县等级", routeMap: "纪伊行路线图", back: "← 返回主页", featured: "精选照片", itinerary: "行程记录", journal: "旅行随记", pending: "待更新", previous: "上一张", next: "下一张", photos: "旅行照片", day: "第 {n} 天", missing: "未找到这次旅行" },
    ja: { map: "制県レベル", routeMap: "紀伊旅行ルートマップ", back: "← ホームページに戻る", featured: "おすすめ写真", itinerary: "旅の記録", journal: "旅行日記", pending: "更新予定", previous: "前の写真", next: "次の曲", photos: "旅の写真", day: "{n}日目", missing: "旅行が見つかりません" },
    en: { map: "JP Level", routeMap: "Kii Journey Route Map", back: "← Back to Homepage", featured: "Featured Photos", itinerary: "Itinerary", journal: "Travel Journal", pending: "Coming soon", previous: "Previous photo", next: "Next photo", photos: "Travel photos", day: "Day {n}", missing: "Trip not found" }
  };
  const local = value => typeof value === "string" ? value : value?.[language] || value?.zh || "";
  const urlFor = id => "trip.html?trip=" + encodeURIComponent(id) + "&lang=" + language;
  const make = (tag, className, text) => {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  };
  function emptyIcon() {
    const icon = make("img", "travel-empty-icon");
    icon.src = "assets/icons/image.svg";
    icon.alt = "";
    return icon;
  }
  function textWithLinks(value, className = "", tag = "div") {
    const container = make(tag, className);
    const pattern = /(https?:\/\/[^\s，。]+)/g;
    let position = 0;
    for (const match of value.matchAll(pattern)) {
      container.append(document.createTextNode(value.slice(position, match.index)));
      const link = make("a", "", match[0]);
      link.href = match[0];
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      container.append(link);
      position = match.index + match[0].length;
    }
    container.append(document.createTextNode(value.slice(position)));
    return container;
  }
  function paragraphsWithLinks(value, className = "") {
    const container = make("div", className);
    value.split(/\n+/).filter(paragraph => paragraph.trim()).forEach(paragraph => {
      container.append(textWithLinks(paragraph.trim(), "", "p"));
    });
    return container;
  }
  function itinerarySummaryText(value) {
    const container = make("div", "trip-itinerary-summary-text");
    value.split("\n").forEach(line => {
      if (!line.trim()) {
        container.append(make("div", "trip-itinerary-summary-gap"));
        return;
      }
      const routePrefix = /^\s*(?:🗺️?\s*)?(?:路线|ルート|route)\s*[:：]\s*/i;
      const isRoute = routePrefix.test(line) || line.includes("→");
      if (isRoute) {
        const label = { zh: "🗺️路线:", ja: "🗺️ルート:", en: "🗺️Route:" }[language];
        container.append(make("div", "trip-itinerary-route", label));
        const route = line.replace(routePrefix, "").trim();
        if (route) container.append(textWithLinks(route, "trip-itinerary-route", "div"));
      } else {
        container.append(textWithLinks(line, "", "div"));
      }
    });
    return container;
  }
  function photoImage(photo, fallback, deferred = false, highQuality = false) {
    if (!photo?.src) return emptyIcon();
    const preview = photo.preview || window.imagePreviews?.[photo.src] || photo.src;
    photo = { ...photo, preview: highQuality ? preview : window.mobilePreviewSource(preview) };
    const image = make("img");
    image.alt = local(photo.alt) || fallback;
    image.loading = "lazy";
    image.decoding = "async";
    image.draggable = false;
    image.addEventListener("error", () => {
      if (photo.preview && image.getAttribute("src") !== photo.src) image.src = photo.src;
      else image.replaceWith(emptyIcon());
    });
    if (deferred) image.dataset.source = photo.preview || photo.src;
    else image.src = photo.preview || photo.src;
    return image;
  }
  function imageExists(src) {
    return new Promise(resolve => {
      const image = new Image();
      image.onload = () => resolve(true);
      image.onerror = () => resolve(false);
      image.src = src;
    });
  }
  async function discoverPhotos(trip) {
    const config = trip.autoPhotos;
    if (!config) return;
    const files = window.travelPhotoManifest?.[trip.id] || window.travelPhotoManifest?.[config.folder.split("/").pop()];
    if (files) {
      trip.photos = files.map(filename => ({
        src: config.folder + "/" + filename,
        preview: config.folder + "/previews/" + filename + ".jpg",
        caption: trip.photoDescriptions?.[parseInt(filename, 10) - 1] || "",
        alt: trip.title
      }));
      return;
    }
    const photos = [];
    const extension = config.extension || "jpg";
    const limit = config.max || 200;
    for (let number = 1; number <= limit; number++) {
      const filename = String(number).padStart(2, "0") + "." + extension;
      const src = config.folder + "/" + filename;
      const previewPath = config.previewFolder ? config.previewFolder + "/" + filename : "";
      const preview = previewPath && config.previewVersion ? previewPath + "?v=" + encodeURIComponent(config.previewVersion) : previewPath;
      const previewExists = preview ? await imageExists(preview) : false;
      const generated = previewExists ? null : await createDisplayPhoto(src);
      if (!previewExists && !generated) break;
      photos.push({
        src,
        preview: previewExists ? preview : generated.preview,
        backdrop: generated?.backdrop || "",
        caption: trip.photoDescriptions?.[number - 1] || "",
        alt: {
          zh: localNumber(trip.title.zh + "照片 ", number),
          ja: localNumber(trip.title.ja + "の写真 ", number),
          en: localNumber(trip.title.en + " photo ", number)
        }
      });
    }
    trip.photos = photos;
  }
  function createDisplayPhoto(src) {
    return new Promise(resolve => {
      const image = new Image();
      image.onerror = () => resolve(null);
      image.onload = () => {
        const canvas = document.createElement("canvas");
        const scale = Math.min(1, 1600 / Math.max(image.naturalWidth, image.naturalHeight));
        canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
        canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
        try {
          canvas.getContext("2d").drawImage(image, 0, 0, canvas.width, canvas.height);
          canvas.toBlob(blob => {
            const preview = blob ? URL.createObjectURL(blob) : "";
            const background = document.createElement("canvas");
            background.width = 96;
            background.height = Math.max(1, Math.round(96 * canvas.height / canvas.width));
            background.getContext("2d").drawImage(canvas, 0, 0, background.width, background.height);
            background.toBlob(small => {
              resolve({ preview, backdrop: small ? URL.createObjectURL(small) : preview });
              canvas.width = canvas.height = background.width = background.height = 0;
            }, "image/jpeg", 0.7);
          }, "image/jpeg", 0.84);
        } catch (_) {
          // Local file security can prevent exporting canvas pixels.
          canvas.width = canvas.height = 0;
          resolve({ preview: "" });
        }
      };
      image.src = src;
    });
  }
  function loadItinerary(trip) {
    if (trip.id === "izu" && window.izuItineraryData) trip.itineraryData = window.izuItineraryData;
    if (trip.itineraryData?.intro.ja && trip.itineraryData?.intro.en) {
      trip.itineraryIntro = trip.itineraryData.intro;
      trip.days = trip.itineraryData.days;
      return;
    }
    if (trip.itineraryData) {
      trip.itineraryIntro = {
        zh: trip.itineraryData.intro.zh,
        ja: `紀伊行の概要は、レッドブックに投稿したこちらの記事でもご覧いただけます：
https://xhslink.cn/o/6dkBEGLyvuu

🗺️ルート：関西空港 → Day 0 大阪 → Day 1 伊勢 → Day 2 鳥羽 → Day 3 志摩 → Day 4 紀伊勝浦 → Day 5 新宮 → Day 6 串本 → Day 7 白浜 → Day 8 和歌山 → 関西空港

🏨宿泊：
Day 0 大阪
Day 1～Day 3 伊勢
Day 4～Day 6 紀伊勝浦
Day 7～Day 8 和歌山

🚎交通：
Day 1～Day 3 まわりゃんせ
Day 4～Day 8 JR伊勢・熊野・和歌山エリア周遊きっぷ（5日間）

以下は日ごとの旅行記です。長文のため、気になる部分だけ気軽に読み飛ばしてください。
（以下の内容は中国語版のみです）`,
        en: `You can also find an overview of my Kii journey in this Xiaohongshu post:
https://xhslink.cn/o/6dkBEGLyvuu

🗺️ Route: Kansai Airport → Day 0 Osaka → Day 1 Ise → Day 2 Toba → Day 3 Shima → Day 4 Kii-Katsuura → Day 5 Shingu → Day 6 Kushimoto → Day 7 Shirahama → Day 8 Wakayama → Kansai Airport

🏨 Accommodation:
Day 0 Osaka
Day 1–Day 3 Ise
Day 4–Day 6 Kii-Katsuura
Day 7–Day 8 Wakayama

🚎 Transportation:
Day 1–Day 3 Mawaryanse
Day 4–Day 8 JR Ise-Kumano-Wakayama Area Tourist Pass (5 days)

What follows is my day-by-day travel journal. It is fairly long, so feel free to skim through it.
(The following content is available in Chinese only.)`
      };
      trip.days = trip.itineraryData.days.map(day => ({
        number: day.number,
        title: { zh: day.title.zh },
        text: { zh: day.text.zh }
      }));
      return;
    }
    if (!trip.itineraryText) return;
    const lines = trip.itineraryText.replace(/\r/g, "").split("\n");
    const intro = [];
    const days = [];
    let current = null;
    let dailySection = false;
    for (const rawLine of lines) {
      const line = rawLine.trimEnd();
      if (line.includes("以下为每日的随记")) {
        dailySection = true;
        intro.push(line.trimStart());
        continue;
      }
      const heading = dailySection ? line.trim().match(/^Day(\d+)\s+(.+)$/i) : null;
      if (heading) {
        current = { number: Number(heading[1]), title: { zh: heading[2].trim() }, lines: [] };
        days.push(current);
      } else if (current) {
        current.lines.push(line.trimStart());
      } else {
        intro.push(line.trimStart());
      }
    }
    trip.itineraryIntro = { zh: intro.join("\n").trim() };
    trip.days = days.map(day => ({
      number: day.number,
      title: day.title,
      text: { zh: day.lines.join("\n").trim() }
    }));
  }
  function localNumber(prefix, number) {
    return prefix + number;
  }
  const photoZoomLabels = {
    zh: ["放大照片", "关闭大图"],
    ja: ["写真を拡大", "閉じる"],
    en: ["Enlarge photo", "Close image"]
  };
  let photoViewer;
  function openPhoto(photo, trigger) {
    if (!photoViewer) {
      const dialog = make("dialog", "travel-map-dialog travel-photo-dialog");
      const image = make("img");
      const close = make("button", "travel-map-close", "×");
      close.type = "button";
      dialog.append(image, close);
      document.body.append(dialog);
      window.attachImageGestures(dialog, image);
      photoViewer = { dialog, image, close, token: 0, trigger: null, overflow: "" };
      close.addEventListener("click", () => dialog.close());
      dialog.addEventListener("click", e => { if (e.target === dialog) dialog.close(); });
      dialog.addEventListener("close", () => {
        if (window.parent !== window) window.parent.postMessage({ type: "travel:image-viewer", open: false }, "*");
        photoViewer.token++;
        document.body.style.overflow = photoViewer.overflow;
        photoViewer.trigger?.focus({ preventScroll: true });
      });
    }
    const viewer = photoViewer;
    const token = ++viewer.token;
    viewer.trigger = trigger;
    viewer.overflow = document.body.style.overflow;
    viewer.image.src = photo.preview || photo.src;
    viewer.image.alt = local(photo.alt) || words[language].photos;
    viewer.dialog.setAttribute("aria-label", viewer.image.alt);
    viewer.close.title = photoZoomLabels[language][1];
    viewer.close.setAttribute("aria-label", viewer.close.title);
    viewer.dialog.showModal();
    if (window.parent !== window) window.parent.postMessage({ type: "travel:image-viewer", open: true }, "*");
    document.body.style.overflow = "hidden";
    // Keep the preview visible while the full-resolution file loads.
    if (photo.preview) {
      const original = new Image();
      original.onload = () => {
        if (viewer.token === token && viewer.dialog.open) viewer.image.src = photo.src;
      };
      original.src = photo.src;
    }
  }
  function gallery(photos, trip, linkToDetail = false, initialIndex = 0) {
    const items = photos.length ? photos : [{}, {}, {}];
    const root = make("div", "trip-gallery");
    const track = make("div", "trip-photo-track");
    track.tabIndex = 0;
    track.setAttribute("role", "region");
    const slides = items.map((photo, i) => {
      const slide = make(linkToDetail ? "a" : "div", "trip-photo-slide");
      if (linkToDetail) {
        slide.dataset.tripId = trip.id;
        slide.href = urlFor(trip.id);
      }
      const mainImage = photoImage(photo, local(trip.title) + " " + (i + 1), true, !!detail);
      if (linkToDetail) {
        mainImage.loading = "eager";
        mainImage.decode?.().catch(() => {});
      }
      slide.append(mainImage);
      if (detail && photo.src) {
        mainImage.classList.add("trip-photo-zoom");
        mainImage.tabIndex = 0;
        mainImage.setAttribute("role", "button");
        let pointerStart = null;
        mainImage.addEventListener("pointerdown", e => {
          pointerStart = { x: e.clientX, y: e.clientY, scroll: track.scrollLeft };
        });
        mainImage.addEventListener("click", e => {
          if (pointerStart && (Math.hypot(e.clientX - pointerStart.x, e.clientY - pointerStart.y) > 8 || Math.abs(track.scrollLeft - pointerStart.scroll) > 2)) return;
          openPhoto(photo, mainImage);
        });
        mainImage.addEventListener("keydown", e => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            openPhoto(photo, mainImage);
          }
        });
        const fill = make("div", "trip-photo-fill");
        fill.setAttribute("aria-hidden", "true");
        const backdrop = photoImage({ ...photo, preview: photo.backdrop || photo.preview }, "", true);
        backdrop.alt = "";
        fill.append(backdrop);
        slide.append(fill);
      }
      if (!photo.src) slide.append(make("span", "trip-placeholder-number", String(i + 1).padStart(2, "0")));
      track.append(slide);
      return slide;
    });
    // Duplicate the edge slides so wrapping travels one frame, then recenter invisibly.
    const looping = items.length > 1;
    const offset = looping ? 1 : 0;
    if (looping) {
      for (const [source, prepend] of [[slides.at(-1), true], [slides[0], false]]) {
        const clone = source.cloneNode(true);
        clone.inert = true;
        clone.setAttribute("aria-hidden", "true");
        clone.dataset.loopClone = "true";
        clone.querySelectorAll("img").forEach(image => {
          image.loading = "eager";
          if (image.getAttribute("src")) image.decode?.().catch(() => {});
        });
        if (prepend) track.prepend(clone);
        else track.append(clone);
      }
    }
    const controls = make("div", "trip-photo-controls");
    const previous = make("button");
    const next = make("button");
    [previous, next].forEach((button, i) => {
      const icon = make("img");
      icon.src = "assets/icons/chevron-" + (i ? "right" : "left") + ".svg";
      icon.alt = "";
      icon.width = icon.height = 16;
      button.append(icon);
    });
    previous.type = next.type = "button";
    const counter = make("span", "trip-photo-index");
    counter.setAttribute("aria-live", "polite");
    const caption = detail ? make("p", "trip-photo-caption") : null;
    if (caption) caption.setAttribute("aria-live", "polite");
    const stage = make("div", "trip-photo-stage");
    stage.append(track, previous, next);
    controls.append(counter);
    root.append(stage, controls);
    if (caption) root.append(caption);
    const normalize = value => (value % items.length + items.length) % items.length;
    let selected = normalize(initialIndex);
    let target = null;
    let preparing = false;
    let navigationToken = 0;
    let settleTimer;
    let preparationTimer;
    let navigationTimer;
    const queuedMoves = [];
    const imagePreparation = new WeakMap();
    function prepareImage(image) {
      if (image.dataset.source) {
        image.src = image.dataset.source;
        delete image.dataset.source;
      }
      if (!imagePreparation.has(image)) {
        image.loading = "eager";
        imagePreparation.set(image, image.decode ? image.decode().catch(() => { imagePreparation.delete(image); }) : Promise.resolve());
      }
      return imagePreparation.get(image);
    }
    let labelLanguage = null;
    let nearViewport = !!detail;
    const visibilityObserver = new IntersectionObserver(entries => {
      if (entries.some(entry => entry.isIntersecting)) {
        nearViewport = true;
        update();
        visibilityObserver.disconnect();
      }
    }, { rootMargin: "400px" });
    if (!detail) visibilityObserver.observe(root);
    let cachedWidth = 0;
    // clientWidth rounds fractional pixels; multiplying it drifts away from snap points.
    const slideWidth = () => cachedWidth || (cachedWidth = slides[0].getBoundingClientRect().width || track.clientWidth);
    function update() {
      previous.disabled = next.disabled = items.length < 2;
      counter.textContent = (selected + 1) + " / " + items.length;
      if (caption) {
        caption.textContent = local(items[selected].caption);
        caption.hidden = !caption.textContent;
      }
      for (const i of nearViewport ? [selected, normalize(selected - 1), normalize(selected + 1)] : []) {
        slides[i].querySelectorAll("img").forEach(image => {
          prepareImage(image);
        });
      }
      if (nearViewport && looping && (selected === 0 || selected === items.length - 1)) {
        track.querySelectorAll('[data-loop-clone] img').forEach(prepareImage);
      }
      if (labelLanguage === language) return;
      labelLanguage = language;
      previous.title = words[language].previous;
      next.title = words[language].next;
      previous.setAttribute("aria-label", previous.title);
      next.setAttribute("aria-label", next.title);
      track.setAttribute("aria-label", local(trip.title) + " · " + words[language].photos);
      slides.forEach((slide, i) => {
        slide.setAttribute("aria-label", local(trip.title) + " · " + (i + 1));
        if (linkToDetail) slide.href = urlFor(trip.id);
        const image = slide.querySelector("img:not(.travel-empty-icon)");
        if (image) image.alt = local(items[i].alt) || local(trip.title) + " " + (i + 1);
        if (image?.classList.contains("trip-photo-zoom")) {
          image.title = photoZoomLabels[language][0];
          image.setAttribute("aria-label", image.title + " · " + image.alt);
        }
      });
    }
    // Native touch scrolling can cross several slides without a button navigation.
    const slideObserver = new IntersectionObserver(entries => {
      for (const entry of entries) {
        if (entry.isIntersecting && nearViewport) {
          entry.target.querySelectorAll("img").forEach(prepareImage);
        }
      }
    }, { root: track, rootMargin: "0px 100%", threshold: 0 });
    [...track.children].forEach(slide => slideObserver.observe(slide));
    async function go(index) {
      const token = ++navigationToken;
      preparing = true;
      const destination = track.children[index + offset];
      // Slow downloads (including backdrops) must not lock the navigation controls.
      await Promise.race([
        Promise.all([...destination.querySelectorAll("img")].map(prepareImage)),
        new Promise(resolve => { preparationTimer = setTimeout(resolve, 800); })
      ]);
      if (token !== navigationToken) return;
      clearTimeout(preparationTimer);
      preparing = false;
      selected = normalize(index);
      target = index + offset;
      track.scrollTo({ left: target * slideWidth(), behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth" });
      update();
      // Some browsers omit scrollend or stop short of a fractional snap point.
      navigationTimer = setTimeout(() => {
        if (token !== navigationToken || target === null) return;
        track.scrollTo({ left: target * slideWidth(), behavior: "instant" });
        settle();
      }, 1500);
      if (Math.abs(track.scrollLeft - target * slideWidth()) < 2) settle();
    }
    function move(delta) {
      if (target !== null || preparing) queuedMoves.push(delta);
      else go(selected + delta);
    }
    function settle() {
      clearTimeout(settleTimer);
      if (preparing) return;
      if (!track.clientWidth) return;
      if (target !== null && Math.abs(track.scrollLeft - target * slideWidth()) >= 2) return;
      clearTimeout(navigationTimer);
      const physical = Math.round(track.scrollLeft / slideWidth());
      selected = normalize(physical - offset);
      target = null;
      if (looping && (physical === 0 || physical === items.length + 1)) {
        track.scrollTo({ left: (selected + offset) * slideWidth(), behavior: "instant" });
      }
      update();
      if (queuedMoves.length) move(queuedMoves.shift());
    }
    previous.addEventListener("click", () => move(-1));
    next.addEventListener("click", () => move(1));
    track.addEventListener("scroll", () => {
      clearTimeout(settleTimer);
      settleTimer = setTimeout(() => settle(true), 150);
      if (target === null) {
        const nextSelected = normalize(Math.round(track.scrollLeft / Math.max(1, slideWidth())) - offset);
        if (nextSelected !== selected) {
          selected = nextSelected;
          update();
        }
      }
    }, { passive: true });
    track.addEventListener("scrollend", () => settle(true));
    const interrupt = () => {
      navigationToken++;
      clearTimeout(preparationTimer);
      clearTimeout(navigationTimer);
      clearTimeout(settleTimer);
      preparing = false;
      target = null;
      queuedMoves.length = 0;
    };
    track.addEventListener("pointerdown", interrupt, { passive: true });
    track.addEventListener("wheel", interrupt, { passive: true });
    track.addEventListener("keydown", e => {
      if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(e.key)) return;
      e.preventDefault();
      if (e.key === "Home" || e.key === "End") {
        interrupt();
        go(e.key === "Home" ? 0 : items.length - 1);
      } else move(e.key === "ArrowRight" ? 1 : -1);
    });
    const observer = new ResizeObserver(() => {
      const width = slides[0].getBoundingClientRect().width;
      if (!width || Math.abs(width - cachedWidth) < .5) return;
      cachedWidth = width;
      interrupt();
      track.scrollTo({ left: (selected + offset) * slideWidth(), behavior: "instant" });
    });
    observer.observe(track);
    galleries.push({
      update,
      getSelected: () => selected,
      dispose: () => { interrupt(); observer.disconnect(); visibilityObserver.disconnect(); slideObserver.disconnect(); clearTimeout(settleTimer); }
    });
    update();
    return root;
  }
  function refreshLabels() {
    document.querySelectorAll("[data-travel-label]").forEach(node => {
      node.textContent = words[language][node.dataset.travelLabel];
    });
    document.querySelectorAll("a.trip-summary").forEach(link => {
      const trip = data.trips.find(item => item.id === link.dataset.tripId);
      link.href = urlFor(trip.id);
      link.querySelector("h3").textContent = local(trip.title);
      link.querySelector("p").textContent = local(trip.route);
    });
    galleries.forEach(item => item.update());
  }
  function createTripOverlay() {
    const overlay = make("div", "trip-overlay");
    overlay.hidden = true;
    const toolbar = make("header", "nav trip-overlay-toolbar");
    const back = make("button", "trip-overlay-back", words[language].back);
    back.type = "button";
    const leftGroup = make("div", "trip-overlay-left");
    const switcher = make("details", "trip-switcher");
    const switchLabel = make("summary", "trip-overlay-link");
    const tripList = make("div", "trip-switcher-list");
    switcher.append(switchLabel, tripList);
    leftGroup.append(switcher);
    let currentTripId = "";
    const updateTripList = () => {
      switchLabel.textContent = { zh: "切换旅程", ja: "旅を切り替え", en: "Switch trip" }[detailLanguage];
      tripList.replaceChildren(...data.trips.map(trip => {
        const link = make("a", "trip-switcher-option");
        const url = new URL("trip.html", location.href);
        url.searchParams.set("trip", trip.id);
        url.searchParams.set("lang", detailLanguage);
        link.href = url.href;
        link.append(make("span", "", trip.title[detailLanguage] || trip.title.zh), make("small", "", trip.date));
        if (trip.id === currentTripId) link.setAttribute("aria-current", "page");
        link.addEventListener("click", event => {
          if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
          event.preventDefault();
          event.stopPropagation();
          switcher.open = false;
          switchLabel.focus();
          if (trip.id === currentTripId) return;
          currentTripId = trip.id;
          url.searchParams.set("embedded", "1");
          frame.style.visibility = "hidden";
          frame.setAttribute("aria-busy", "true");
          frame.src = url.href;
          updateTripList();
        });
        return link;
      }));
    };
    switcher.addEventListener("keydown", event => {
      if (event.key !== "Escape" || !switcher.open) return;
      event.stopPropagation();
      switcher.open = false;
      switchLabel.focus();
    });
    document.addEventListener("pointerdown", event => {
      if (!switcher.contains(event.target)) switcher.open = false;
    }, true);
    const links = [["tripGallery", "featured"], ["tripItinerary", "itinerary"], ["tripDays", "journal"]].map(([target, label]) => {
      const link = make("a", "trip-overlay-link");
      link.dataset.target = target;
      link.dataset.label = label;
      link.href = "#" + target;
      leftGroup.append(link);
      return link;
    });
    const player = make("div", "trip-mini-player");
    const cover = make("img", "trip-mini-cover");
    cover.alt = "";
    const info = make("div", "trip-mini-info");
    const title = make("strong", "trip-mini-title");
    const artist = make("span", "trip-mini-artist");
    info.append(title, artist);
    const controls = make("div", "trip-mini-controls");
    const previous = make("button", "", "◀");
    const playPause = make("button", "trip-mini-play", "▶");
    const next = make("button", "", "▶");
    [previous, playPause, next].forEach(button => { button.type = "button"; });
    controls.append(previous, playPause, next);
    window.addMiniPlayerControls?.(controls);
    player.append(cover, info, controls);
    const languages = make("div", "nav-tools trip-overlay-languages");
    const languageButtons = [
      ["zh", "中"],
      ["ja", "日"],
      ["en", "EN"]
    ].map(([code, label]) => {
      const button = make("button", code === "zh" ? "lang active" : "lang", label);
      button.type = "button";
      button.dataset.lang = code;
      languages.append(button);
      return button;
    });
    toolbar.append(back, leftGroup, player, languages);
    const frame = make("iframe", "trip-overlay-frame");
    frame.title = words[language].itinerary;
    overlay.append(toolbar, frame);
    document.body.append(overlay);
    const audio = document.getElementById("audio");
    let detailLanguage = "zh";
    const setDetailLanguage = nextLanguage => {
      detailLanguage = nextLanguage;
      updateTripList();
      languageButtons.forEach(button => button.classList.toggle("active", button.dataset.lang === detailLanguage));
      back.textContent = words[detailLanguage].back;
      links.forEach(link => { link.textContent = words[detailLanguage][link.dataset.label]; });
      frame.title = words[detailLanguage].itinerary;
      frame.contentWindow?.postMessage({ type: "travel:set-language", language: detailLanguage }, "*");
    };
    const sync = () => {
      cover.src = document.getElementById("playerCover").src;
      title.textContent = document.getElementById("playerTitle").textContent;
      artist.textContent = document.getElementById("playerArtist").textContent;
      playPause.textContent = audio.paused ? "▶" : "Ⅱ";
      playPause.title = audio.paused ? "播放" : "暂停";
      back.textContent = words[detailLanguage].back;
    };
    let transition = null;
    let closing = false;
    let opening = false;
    let pendingSection = null;
    let returnFocus = null;
    const animateOverlay = opening => {
      transition?.cancel();
      transition = overlay.animate([
        { opacity: opening ? 0 : 1 },
        { opacity: opening ? 1 : 0 }
      ], {
        duration: matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : opening ? 340 : 240,
        easing: "cubic-bezier(0.22, 1, 0.36, 1)",
        fill: "forwards"
      });
      return transition;
    };
    const close = async () => {
      if (overlay.hidden || closing) return;
      if (!document.getElementById("playlistPanel")?.hidden) document.getElementById("playlistClose")?.click();
      closing = true;
      opening = false;
      pendingSection = null;
      toolbar.hidden = false;
      switcher.open = false;
      await animateOverlay(false).finished.catch(() => {});
      overlay.hidden = true;
      frame.removeAttribute("src");
      document.body.style.overflow = overlay.dataset.previousOverflow || "";
      returnFocus?.focus({ preventScroll: true });
      closing = false;
    };
    const open = href => {
      if (!overlay.hidden || closing || opening) return;
      if (!document.getElementById("playlistPanel")?.hidden) document.getElementById("playlistClose")?.click();
      returnFocus = document.activeElement;
      const url = new URL(href, location.href);
      currentTripId = url.searchParams.get("trip");
      url.searchParams.set("embedded", "1");
      const homeLanguage = document.querySelector('body > .nav .lang.active')?.dataset.lang || language;
      url.searchParams.set("lang", homeLanguage);
      opening = true;
      overlay.dataset.previousOverflow = document.body.style.overflow;
      overlay.hidden = false;
      frame.style.visibility = "hidden";
      frame.setAttribute("aria-busy", "true");
      animateOverlay(true);
      document.body.style.overflow = "hidden";
      back.focus({ preventScroll: true });
      frame.src = url.href;
      frame.title = words[language].itinerary;
      setDetailLanguage(homeLanguage);
      sync();
    };
    back.addEventListener("click", close);
    links.forEach(link => link.addEventListener("click", event => {
      event.preventDefault();
      if (frame.getAttribute("aria-busy") === "true") {
        pendingSection = link;
        return;
      }
      frame.contentWindow?.postMessage({ type: "travel:scroll", target: link.dataset.target, offset: toolbar.getBoundingClientRect().height + 20 }, "*");
    }));
    previous.addEventListener("click", () => document.getElementById("prevBtn").click());
    playPause.addEventListener("click", () => document.getElementById("playBtn").click());
    next.addEventListener("click", () => document.getElementById("nextBtn").click());
    languageButtons.forEach(button => button.addEventListener("click", () => {
      document.querySelector('body > .nav .lang[data-lang="' + button.dataset.lang + '"]')?.click();
    }));
    window.addEventListener("site-language-change", event => setDetailLanguage(event.detail));
    frame.addEventListener("load", () => setDetailLanguage(detailLanguage));
    window.addEventListener("message", event => {
      if (event.source === frame.contentWindow && event.data?.type === "travel:image-viewer" && !overlay.hidden) {
        toolbar.hidden = !!event.data.open;
      }
      if (event.source === frame.contentWindow && event.data?.type === "travel:dismiss-switcher") {
        switcher.open = false;
        if (!document.getElementById("playlistPanel")?.hidden) document.getElementById("playlistClose")?.click();
      }
      if (event.source === frame.contentWindow && event.data?.type === "travel:request-photos") {
        const trip = data.trips.find(item => item.id === event.data.trip);
        frame.contentWindow.postMessage({ type: "travel:photos", trip: trip?.id, photos: trip?.photos || [] }, "*");
      }
      if (event.source === frame.contentWindow && event.data?.type === "travel:refresh-home") {
        location.replace(new URL("index.html", location.href).href);
        return;
      }
      if (event.source === frame.contentWindow && event.data?.type === "travel:ready" && !overlay.hidden && !closing) {
        setDetailLanguage(detailLanguage);
        frame.style.visibility = "visible";
        frame.removeAttribute("aria-busy");
        opening = false;
        if (pendingSection) {
          pendingSection.click();
          pendingSection = null;
        }
      }
    });
    for (const event of ["play", "pause", "playing", "ended", "loadedmetadata"]) audio.addEventListener(event, sync);
    window.addEventListener("player-track-change", sync);
    new MutationObserver(sync).observe(document.querySelector(".player-info"), { childList: true, subtree: true, characterData: true });
    document.addEventListener("keydown", event => {
      if (event.key === "Escape" && !event.defaultPrevented && !overlay.hidden) close();
    });
    document.addEventListener("click", event => {
      const link = event.target.closest('a[href*="trip.html?trip="]');
      if (!link || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
      event.preventDefault();
      open(link.href);
    });
    return { overlay, sync };
  }
  function renderHome() {
    document.querySelectorAll("#travel .trip-card").forEach(card => {
      const title = card.querySelector("h3");
      const id = title.dataset.i18n.split(".")[1];
      const trip = data.trips.find(item => item.id === id);
      if (!trip) return;
      const summary = make("a", "trip-summary");
      summary.dataset.tripId = id;
      summary.append(card.querySelector("span"), title, card.querySelector("p"));
      card.prepend(summary);
      const featured = trip.featuredPhotos?.map(number => trip.photos[number - 1]).filter(Boolean);
      card.append(gallery(featured?.length ? featured : trip.photos.slice(0, 3), trip, true));
    });
    if (data.map) {
      const mapImage = photoImage({ src: local(data.map), alt: words[language].map }, "");
      mapImage.width = mapImage.height = 1500;
      mapImage.loading = "lazy";
      const zoomButton = make("button", "travel-map-zoom");
      zoomButton.type = "button";
      zoomButton.append(mapImage);
      document.querySelector(".travel-map-frame").replaceChildren(zoomButton);
      const dialog = make("dialog", "travel-map-dialog");
      const close = make("button", "travel-map-close", "×");
      close.type = "button";
      const fullImage = make("img");
      fullImage.loading = "eager";
      dialog.append(fullImage, close);
      document.body.append(dialog);
      window.attachImageGestures(dialog, fullImage);
      const zoomLabels = { zh: ["放大制县等级地图", "关闭大图"], ja: ["経県値マップを拡大", "閉じる"], en: ["Enlarge prefecture map", "Close image"] };
      const updateMapLabels = () => {
        const source = local(data.map);
        mapImage.loading = "lazy";
        const previewSource = window.previewImageSource(source);
        if (mapImage.getAttribute("src") !== previewSource) mapImage.src = previewSource;
        if (dialog.open && fullImage.getAttribute("src") !== source) fullImage.src = source;
        zoomButton.title = zoomLabels[language][0];
        zoomButton.setAttribute("aria-label", zoomButton.title);
        close.title = zoomLabels[language][1];
        close.setAttribute("aria-label", close.title);
        dialog.setAttribute("aria-label", words[language].map);
        mapImage.alt = fullImage.alt = words[language].map;
      };
      updateMapLabels();
      window.addEventListener("site-language-change", updateMapLabels);
      let previousOverflow = "";
      zoomButton.addEventListener("click", () => {
        previousOverflow = document.body.style.overflow;
        updateMapLabels();
        dialog.showModal();
        fullImage.src = local(data.map);
        document.body.style.overflow = "hidden";
      });
      close.addEventListener("click", () => dialog.close());
      dialog.addEventListener("click", e => { if (e.target === dialog) dialog.close(); });
      dialog.addEventListener("close", () => {
        document.body.style.overflow = previousOverflow;
        zoomButton.focus({ preventScroll: true });
      });
    }
    refreshLabels();
    createTripOverlay();
  }
  function renderDetail(galleryPositions = []) {
    galleries.forEach(item => item.dispose());
    galleries = [];
    const trip = data.trips.find(item => item.id === params.get("trip"));
    document.documentElement.lang = language === "zh" ? "zh-CN" : language;
    document.querySelectorAll(".lang").forEach(button => button.classList.toggle("active", button.dataset.lang === language));
    document.querySelector(".trip-back").href = "index.html?lang=" + language + "#travel";
    if (!trip) {
      document.getElementById("tripTitle").textContent = words[language].missing;
      document.querySelector(".trip-itinerary").hidden = true;
      refreshLabels();
      return;
    }
    document.title = local(trip.title) + " | Chizumochi";
    document.getElementById("tripDate").textContent = trip.date;
    document.getElementById("tripTitle").textContent = local(trip.title);
    document.getElementById("tripRoute").textContent = local(trip.route);
    document.getElementById("tripGallery").replaceChildren(gallery(trip.photos, trip, false, galleryPositions[0] || 0));
    const itineraryIntro = document.getElementById("tripItineraryIntro");
    itineraryIntro.replaceChildren();
    const introText = local(trip.itineraryIntro);
    if (introText) {
      const summary = make("div", "trip-itinerary-summary");
      if (trip.itineraryMap || trip.id === "kii") {
        const mapLabel = local(trip.title) + ({ zh: "路线图", ja: "ルートマップ", en: " Route Map" }[language]);
        const mapPhoto = { src: trip.itineraryMap || "assets/travel/kii/路线图.jpg", preview: trip.itineraryMapPreview, alt: mapLabel };
        const mapButton = make("button", "trip-itinerary-map");
        mapButton.type = "button";
        mapButton.title = mapLabel;
        mapButton.setAttribute("aria-label", mapLabel);
        mapButton.append(photoImage(mapPhoto, mapLabel));
        mapButton.addEventListener("click", () => openPhoto(mapPhoto, mapButton));
        summary.append(mapButton);
      }
      summary.append(itinerarySummaryText(introText));
      itineraryIntro.append(summary);
    }
    const days = document.getElementById("tripDays");
    days.replaceChildren();
    if (!trip.days.length) days.append(make("p", "trip-empty", words[language].pending));
    trip.days.forEach((day, i) => {
      const section = make("article", "trip-day");
      section.append(make("span", "eyebrow", words[language].day.replace("{n}", day.number ?? i + 1)));
      section.append(make("h3", "", local(day.title)));
      if (day.route) section.append(make("p", "trip-route", local(day.route)));
      const journal = paragraphsWithLinks(local(day.text), "trip-day-text");
      if (day.asidePhoto) {
        const layout = make("div", "trip-day-with-image");
        const figure = make("figure", "trip-day-figure");
        const button = make("button", "trip-day-image");
        button.type = "button";
        button.setAttribute("aria-label", photoZoomLabels[language][0] + " · " + local(day.asidePhoto.alt));
        button.append(photoImage(day.asidePhoto, local(day.title)));
        button.addEventListener("click", () => openPhoto(day.asidePhoto, button));
        figure.append(button, make("figcaption", "", local(day.asidePhoto.alt)));
        layout.append(journal, figure);
        section.append(layout);
      } else section.append(journal);
      if (day.photos?.length) section.append(gallery(day.photos, trip, false, galleryPositions[i + 1] || 0));
      days.append(section);
    });
    refreshLabels();
  }
  async function start() {
    data.trips.forEach(loadItinerary);
    if (detail) {
      const trip = data.trips.find(item => item.id === params.get("trip"));
      if (trip && params.get("embedded") === "1" && window.parent !== window) {
        const photos = await new Promise(resolve => {
          const receive = event => {
            if (event.source !== window.parent || event.data?.type !== "travel:photos" || event.data.trip !== trip.id) return;
            clearTimeout(timeout);
            window.removeEventListener("message", receive);
            resolve(event.data.photos);
          };
          const timeout = setTimeout(() => {
            window.removeEventListener("message", receive);
            resolve(null);
          }, 1500);
          window.addEventListener("message", receive);
          window.parent.postMessage({ type: "travel:request-photos", trip: trip.id }, "*");
        });
        if (photos) trip.photos = photos;
        else await discoverPhotos(trip);
      } else if (trip) await discoverPhotos(trip);
    } else await Promise.all(data.trips.map(discoverPhotos));
  if (detail) {
    const changeDetailLanguage = nextLanguage => {
      if (!["zh", "ja", "en"].includes(nextLanguage)) return;
      if (language === nextLanguage) return;
      language = nextLanguage;
      params.set("lang", language);
      try { history.replaceState(null, "", "?" + params); } catch (_) { /* file:// may restrict history. */ }
      const galleryPositions = galleries.map(item => item.getSelected());
      renderDetail(galleryPositions);
    };
    document.querySelectorAll(".lang").forEach(button => button.addEventListener("click", () => changeDetailLanguage(button.dataset.lang)));
    if (params.get("embedded") === "1" && window.parent !== window) {
      document.addEventListener("pointerdown", () => {
        window.parent.postMessage({ type: "travel:dismiss-switcher" }, "*");
      }, true);
      window.addEventListener("message", event => {
        if (event.source === window.parent && event.data?.type === "travel:scroll") {
          const target = document.getElementById(event.data.target);
          if (target) window.scrollTo({ top: target.getBoundingClientRect().top + window.scrollY - (Number(event.data.offset) || 92), behavior: "smooth" });
        }
        if (event.source === window.parent && event.data?.type === "travel:set-language") {
          changeDetailLanguage(event.data.language);
        }
      });
    }
    renderDetail();
    if (params.get("embedded") === "1" && window.parent !== window) {
      window.parent.postMessage({ type: "travel:ready" }, "*");
    }
  } else {
    window.addEventListener("site-language-change", e => { language = e.detail; refreshLabels(); });
    renderHome();
  }
  }
  start();
})();
