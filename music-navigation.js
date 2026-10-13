(() => {
  const button = document.getElementById("musicNavButton");
  const menu = document.createElement("div");
  menu.id = "musicNavMenu";
  menu.className = "music-nav-menu";
  menu.hidden = true;
  document.body.append(menu);
  const targets = ["vocaloidHeading", "originalMusicHeading", "coversHeading", "translationsHeading", "doujinHeading"];
  function close(restoreFocus = false) {
    menu.hidden = true;
    button.setAttribute("aria-expanded", "false");
    if (restoreFocus) button.focus({preventScroll: true});
  }
  function position() {
    const bounds = button.parentElement.getBoundingClientRect();
    menu.style.left = Math.max(12, Math.min(bounds.left, innerWidth - menu.offsetWidth - 12)) + "px";
    menu.style.top = bounds.bottom + 14 + "px";
  }
  targets.forEach(id => {
    const link = document.createElement("a");
    link.href = "#" + id;
    link.textContent = document.getElementById(id).textContent;
    link.addEventListener("click", event => {
      event.preventDefault();
      close();
      const heading = document.getElementById(id);
      heading.tabIndex = -1;
      heading.focus({preventScroll: true});
      window.scrollToSection(heading);
    });
    menu.append(link);
  });
  function open(focus = false) {
    [...menu.children].forEach((link, i) => { link.textContent = document.getElementById(targets[i]).textContent; });
    menu.hidden = false;
    button.setAttribute("aria-expanded", "true");
    position();
    if (focus) menu.firstElementChild.focus({preventScroll: true});
  }
  button.addEventListener("click", () => {
    if (!menu.hidden) return close();
    open(true);
  });
  document.addEventListener("pointerdown", event => {
    if (!menu.contains(event.target) && !button.contains(event.target)) close();
  });
  document.addEventListener("keydown", event => {
    if (event.key === "Escape" && !menu.hidden) { event.preventDefault(); close(true); }
  });
  document.addEventListener("focusin", event => {
    if (!menu.hidden && !menu.contains(event.target) && event.target !== button) close();
  });
  window.addEventListener("resize", () => { if (!menu.hidden) position(); });
  window.addEventListener("scroll", () => close(), {passive: true});
  function updateLabel() {
    const labels = { ja: "Vocaloid サブメニュー", en: "Vocaloid submenu" };
    button.title = labels[document.documentElement.lang] || "Vocaloid 子菜单";
    button.setAttribute("aria-label", button.title);
  }
  window.addEventListener("site-language-change", () => { close(); updateLabel(); });
  updateLabel();
})();
