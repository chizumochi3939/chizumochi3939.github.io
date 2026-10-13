(() => {
  function createEvent(config) {
  const list = document.querySelector(".doujin-list");
  const root = document.getElementById(config.id) || document.createElement("article");
  root.id = config.id;
  root.className = "doujin-event";
  const [year, month, day] = config.date.split(".").map(Number);
  root.dataset.eventDate = String(year * 10000 + month * 100 + day);
  list.append(root);
  [...list.children].sort((a, b) => Number(b.dataset.eventDate || 0) - Number(a.dataset.eventDate || 0)).forEach(item => list.append(item));
  const base = "assets/events/" + config.folder + "/";
  const photos = Array.from({ length: config.photoCount }, (_, i) => base + String(i + 1).padStart(2, "0") + ".jpg");
  const posters = config.posters.map(name => base + (config.posterFolder || "活动海报&歌单") + "/" + name);
  const preview = src => src.slice(0, src.lastIndexOf("/") + 1) + "previews/" + src.slice(src.lastIndexOf("/") + 1) + ".jpg";
  const prepared = new Map();
  function prepare(src) {
    if (!prepared.has(src)) {
      const image = new Image();
      image.src = src;
      prepared.set(src, image.decode().then(() => image).catch(error => {
        prepared.delete(src);
        throw error;
      }));
    }
    return prepared.get(src);
  }
  let viewerRequest = 0;
  const labels = {
    zh: { title: "南京大学第三届Vocaloid同人活动", info: "活动时间：2026.10.11 活动地点：南京大学鼓楼校区 馆1-105", posters: "活动海报 / 歌单", prev: "上一张", next: "下一张", close: "关闭", enlarge: "放大现场照片" },
    ja: { title: "南京大学 第3回Vocaloid同人イベント", info: "開催日：2026.10.11 会場：南京大学 鼓楼キャンパス 館1-105", posters: "イベントポスター / セットリスト", prev: "前の写真", next: "次の写真", close: "閉じる", enlarge: "会場写真を拡大" },
    en: { title: "Nanjing University 3rd Vocaloid Fan Event", info: "Date: 2026.10.11 Venue: Nanjing University, Gulou Campus, 馆1-105", posters: "Event Posters / Setlist", prev: "Previous image", next: "Next image", close: "Close", enlarge: "Enlarge event photo" }
  };
  if (config.labels) {
    for (const language of Object.keys(config.labels)) Object.assign(labels[language], config.labels[language]);
  }
  root.innerHTML = `<div class="event-gallery"><div class="event-track"></div><button class="event-arrow event-prev" type="button"><img src="assets/icons/chevron-left.svg" alt=""></button><button class="event-arrow event-next" type="button"><img src="assets/icons/chevron-right.svg" alt=""></button><span class="event-count"></span></div><div class="doujin-copy"><h4></h4><p class="event-info"></p><button class="event-posters" type="button"></button></div>`;
  const track = root.querySelector(".event-track");
  const dialog = document.createElement("dialog");
  dialog.className = "event-viewer";
  dialog.innerHTML = `<button class="event-close" type="button">×</button><button class="event-arrow event-prev" type="button"><img src="assets/icons/chevron-left.svg" alt=""></button><img class="event-full-image" alt=""><button class="event-arrow event-next" type="button"><img src="assets/icons/chevron-right.svg" alt=""></button><span class="event-count"></span>`;
  document.body.append(dialog);
  let active = 0;
  let viewerIndex = 0;
  let viewerPhotos = photos;
  let text;
  const fullImage = dialog.querySelector(".event-full-image");
  const viewport = document.createElement("div");
  viewport.className = "event-image-viewport";
  fullImage.replaceWith(viewport);
  viewport.append(fullImage);
  fullImage.draggable = false;
  let zoom = 1;
  let offsetX = 0;
  let offsetY = 0;
  let drag = null;
  let clickStart = null;
  let movedSincePress = false;
  function isOutsideImage(x, y) {
    if (!fullImage.naturalWidth || fullImage.style.visibility === "hidden") return true;
    const bounds = viewport.getBoundingClientRect();
    const fit = Math.min(bounds.width / fullImage.naturalWidth, bounds.height / fullImage.naturalHeight);
    const halfWidth = fullImage.naturalWidth * fit * zoom / 2;
    const halfHeight = fullImage.naturalHeight * fit * zoom / 2;
    const centerX = bounds.left + bounds.width / 2 + offsetX;
    const centerY = bounds.top + bounds.height / 2 + offsetY;
    return Math.abs(x - centerX) > halfWidth || Math.abs(y - centerY) > halfHeight;
  }
  function renderImage() {
    const fit = Math.min(viewport.clientWidth / (fullImage.naturalWidth || 1), viewport.clientHeight / (fullImage.naturalHeight || 1));
    const limitX = Math.max(0, ((fullImage.naturalWidth || 0) * fit * zoom - viewport.clientWidth) / 2);
    const limitY = Math.max(0, ((fullImage.naturalHeight || 0) * fit * zoom - viewport.clientHeight) / 2);
    offsetX = Math.max(-limitX, Math.min(limitX, offsetX));
    offsetY = Math.max(-limitY, Math.min(limitY, offsetY));
    fullImage.style.transform = `translate(${offsetX}px, ${offsetY}px) scale(${zoom})`;
    viewport.classList.toggle("is-zoomed", zoom > 1);
  }
  function stopDrag() {
    if (drag && viewport.hasPointerCapture(drag.id)) viewport.releasePointerCapture(drag.id);
    drag = null;
    viewport.classList.remove("is-dragging");
  }
  function resetImage() {
    stopDrag();
    zoom = 1;
    offsetX = offsetY = 0;
    renderImage();
  }
  function zoomAt(nextZoom, clientX, clientY) {
    const bounds = viewport.getBoundingClientRect();
    const x = clientX - bounds.left - bounds.width / 2;
    const y = clientY - bounds.top - bounds.height / 2;
    const next = Math.max(1, Math.min(6, nextZoom));
    offsetX = x - (x - offsetX) * next / zoom;
    offsetY = y - (y - offsetY) * next / zoom;
    zoom = next;
    renderImage();
  }
  viewport.addEventListener("wheel", event => {
    event.preventDefault();
    const delta = event.deltaY * (event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? viewport.clientHeight : 1);
    zoomAt(zoom * Math.exp(-delta * .002), event.clientX, event.clientY);
  }, { passive: false });
  viewport.addEventListener("dblclick", event => {
    if (zoom > 1) resetImage();
    else zoomAt(2.5, event.clientX, event.clientY);
  });
  viewport.addEventListener("pointerdown", event => {
    clickStart = { x: event.clientX, y: event.clientY, outside: isOutsideImage(event.clientX, event.clientY) };
    movedSincePress = false;
    if (event.button !== 0 || zoom <= 1 || drag) return;
    event.preventDefault();
    drag = { id: event.pointerId, x: event.clientX, y: event.clientY };
    viewport.setPointerCapture(event.pointerId);
    viewport.classList.add("is-dragging");
  });
  viewport.addEventListener("pointermove", event => {
    if (clickStart && Math.hypot(event.clientX - clickStart.x, event.clientY - clickStart.y) > 5) movedSincePress = true;
    if (!drag || drag.id !== event.pointerId) return;
    offsetX += event.clientX - drag.x;
    offsetY += event.clientY - drag.y;
    drag.x = event.clientX;
    drag.y = event.clientY;
    renderImage();
  });
  for (const type of ["pointerup", "pointercancel", "lostpointercapture"]) viewport.addEventListener(type, stopDrag);
  fullImage.addEventListener("load", renderImage);
  dialog.addEventListener("close", resetImage);
  window.addEventListener("resize", () => { if (dialog.open) renderImage(); });
  async function showViewer() {
    const request = ++viewerRequest;
    const src = viewerPhotos[viewerIndex];
    resetImage();
    fullImage.style.visibility = "hidden";
    fullImage.alt = `${text.title} ${viewerIndex + 1}`;
    dialog.querySelector(".event-count").textContent = `${viewerIndex + 1} / ${viewerPhotos.length}`;
    try {
      const image = await prepare(preview(src)).catch(() => prepare(src));
      if (request !== viewerRequest) return;
      fullImage.src = image.src;
      await fullImage.decode();
      if (request !== viewerRequest) return;
      fullImage.style.visibility = "visible";
      renderImage();
      for (const delta of [-1, 1]) {
        const neighbor = viewerPhotos[(viewerIndex + delta + viewerPhotos.length) % viewerPhotos.length];
        prepare(preview(neighbor)).catch(() => {});
      }
      const original = await prepare(src);
      if (request !== viewerRequest || !dialog.open) return;
      fullImage.src = original.src;
    } catch (_) { /* Keep the decoded preview if the original cannot load. */ }
  }
  dialog.addEventListener("close", () => { viewerRequest++; });
  function openViewer(items, index) {
    viewerPhotos = items;
    viewerIndex = index;
    showViewer();
    dialog.showModal();
  }
  photos.forEach((src, index) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "event-photo";
    const img = document.createElement("img");
    img.alt = "";
    img.decoding = "async";
    img.style.visibility = "hidden";
    const loadPhoto = async () => {
      try {
        const image = await prepare(preview(src)).catch(() => prepare(src));
        img.src = image.src;
        await img.decode();
        img.style.visibility = "visible";
      } catch (_) { /* Allow a later visit to retry failed requests. */ }
    };
    const observer = new IntersectionObserver(entries => {
      if (entries.some(entry => entry.isIntersecting)) {
        loadPhoto();
        observer.disconnect();
      }
    }, { rootMargin: "300px 0px" });
    observer.observe(button);
    button.append(img);
    button.addEventListener("click", () => openViewer(photos, index));
    track.append(button);
  });
  function move(delta) {
    const index = (active + delta + photos.length) % photos.length;
    track.scrollTo({ left: index * track.clientWidth, behavior: "smooth" });
  }
  track.addEventListener("scroll", () => {
    active = Math.round(track.scrollLeft / track.clientWidth);
    root.querySelector(".event-count").textContent = `${active + 1} / ${photos.length}`;
  }, { passive: true });
  root.querySelector(".event-prev").onclick = () => move(-1);
  root.querySelector(".event-next").onclick = () => move(1);
  root.querySelector(".event-posters").onclick = () => openViewer(posters, 0);
  function moveViewer(delta) {
    viewerIndex = (viewerIndex + delta + viewerPhotos.length) % viewerPhotos.length;
    showViewer();
  }
  dialog.querySelector(".event-prev").onclick = () => moveViewer(-1);
  dialog.querySelector(".event-next").onclick = () => moveViewer(1);
  dialog.querySelector(".event-close").onclick = () => dialog.close();
  dialog.addEventListener("click", event => {
    if (event.target === dialog) dialog.close();
    if (event.target === viewport && clickStart?.outside && !movedSincePress && isOutsideImage(event.clientX, event.clientY)) dialog.close();
    clickStart = null;
  });
  dialog.addEventListener("keydown", event => {
    if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
      event.preventDefault();
      moveViewer(event.key === "ArrowLeft" ? -1 : 1);
    }
  });
  function localize() {
    text = labels[document.documentElement.lang] || labels.zh;
    root.querySelector("h4").textContent = text.title;
    const info = root.querySelector(".event-info");
    const boundary = text.info.indexOf(config.date) + config.date.length;
    const date = document.createElement("span");
    const venue = document.createElement("span");
    date.textContent = text.info.slice(0, boundary);
    venue.textContent = text.info.slice(boundary).trim();
    info.replaceChildren(date, venue);
    root.querySelector(".event-posters").textContent = text.posters;
    root.querySelectorAll(".event-photo").forEach((button, i) => button.setAttribute("aria-label", `${text.enlarge} ${i + 1}`));
    for (const container of [root, dialog]) {
      for (const direction of ["prev", "next"]) {
        const button = container.querySelector(`.event-${direction}`);
        button.title = text[direction];
        button.setAttribute("aria-label", text[direction]);
      }
    }
    dialog.setAttribute("aria-label", text.title);
    dialog.querySelector(".event-close").setAttribute("aria-label", text.close);
  }
  root.querySelector(".event-count").textContent = `1 / ${photos.length}`;
  window.addEventListener("site-language-change", localize);
  localize();
  }
  createEvent({
    id: "nanjingEvent",
    folder: "南京大学第三届Vocaloid同人活动",
    date: "2026.10.11",
    photoCount: 11,
    posters: ["01.jpg", "02.png", "03.jpg", "04.jpg", "05.jpg", "06.jpg"]
  });
  createEvent({
    id: "nanjingSecondEvent",
    folder: "南京大学第二届Vocaloid同人活动(未来音旅南大站)",
    date: "2025.9.27",
    photoCount: 12,
    posters: ["01.jpg", "02.jpg", "03.jpg", "04.jpg", "05.jpg", "06.jpg"],
    labels: {
      zh: {
        title: "南京大学第二届Vocaloid同人活动（未来音旅南大站）",
        info: "活动时间：2025.9.27 活动地点：南京大学鼓楼校区 教318"
      },
      ja: {
        title: "南京大学 第2回Vocaloid同人イベント（未来音旅・南京大学会場）",
        info: "開催日：2025.9.27 会場：南京大学 鼓楼キャンパス 教318"
      },
      en: {
        title: "Nanjing University 2nd Vocaloid Fan Event (Mirai Music Journey: Nanjing University Stop)",
        info: "Date: 2025.9.27 Venue: Nanjing University, Gulou Campus, 教318"
      }
    }
  });
  createEvent({
    id: "nanjingFirstEvent",
    folder: "南京大学第一届Vocaloid同人活动(魔法未来2024观影会)",
    date: "2024.12.15",
    photoCount: 11,
    posterFolder: "活动海报",
    posters: ["01.jpg"],
    labels: {
      zh: {
        title: "南京大学第一届Vocaloid同人活动（魔法未来2024观影会）",
        info: "活动时间：2024.12.15 活动地点：南京大学仙林校区 仙I-315",
        posters: "活动海报"
      },
      ja: {
        title: "南京大学 第1回Vocaloid同人イベント（マジカルミライ2024上映会）",
        info: "開催日：2024.12.15 会場：南京大学 仙林キャンパス 仙I-315",
        posters: "イベントポスター"
      },
      en: {
        title: "Nanjing University 1st Vocaloid Fan Event (Magical Mirai 2024 Screening)",
        info: "Date: 2024.12.15 Venue: Nanjing University, Xianlin Campus, 仙I-315",
        posters: "Event Poster"
      }
    }
  });
  createEvent({
    id: "xianlinEvent",
    folder: "未来音旅仙林站",
    date: "2025.11.24",
    photoCount: 9,
    posters: ["01.jpg", "02.jpg", "03.jpg", "04.jpg"],
    labels: {
      zh: {
        title: "未来音旅仙林站",
        info: "活动时间：2025.11.24 活动地点：仙林艺术中心负二楼 可一书店"
      },
      ja: {
        title: "未来音旅・仙林会場",
        info: "開催日：2025.11.24 会場：仙林アートセンター 地下2階 可一書店"
      },
      en: {
        title: "Mirai Music Journey: Xianlin Stop",
        info: "Date: 2025.11.24 Venue: Keyi Bookstore, Level B2, Xianlin Arts Center"
      }
    }
  });
})();
