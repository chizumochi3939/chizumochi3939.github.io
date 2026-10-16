(() => {
  const chapter = window.warProjectChapter;
  const labels = {
    zh: {
      title: '少年少女战争化', back: '返回主页', songs: '「少年少女战争化」系列歌曲',
      novel: '《少年少女战争化》小说部分试读', musicLink: '系列歌曲', novelLink: '小说',
      introBefore: '「少年少女战争化」是由',
      introAfter: '在2022年开始的原创企划。该企划由原创小说《少年少女战争化》与多首原创音乐共同组成，目前仍在持续进行中。',
      note: '', play: '在 Bilibili 中播放'
    },
    ja: {
      title: '少年少女戦争化', back: 'ホームページに戻る', songs: '「少年少女戦争化」シリーズ楽曲',
      novel: '小説『少年少女戦争化』', musicLink: '楽曲', novelLink: '小説',
      introBefore: '「少年少女戦争化」は、',
      introAfter: 'が2022年に始めたオリジナル企画です。オリジナル小説『少年少女戦争化』と複数のオリジナル楽曲で構成されており、現在も制作を続けています。',
      note: '小説本文は中国語版のみです。', play: 'Bilibiliで再生'
    },
    en: {
      title: 'Shonen Shojo Sensoka', back: 'Back to Homepage', songs: 'Shonen Shojo Sensoka: Songs',
      novel: 'Shonen Shojo Sensoka: The Novel', musicLink: 'Songs', novelLink: 'Novel',
      introBefore: 'Shonen Shojo Sensoka is an original project started by ',
      introAfter: ' in 2022. It brings together an original novel of the same name and a series of original songs. The project is still ongoing.',
      note: 'The novel is available in Chinese only.', play: 'Play on Bilibili'
    }
  };
  const node = (tag, className, text) => {
    const element = document.createElement(tag);
    element.className = className;
    if (text !== undefined) element.textContent = text;
    return element;
  };
  const dialog = node('dialog', 'translation-dialog project-dialog');
  dialog.id = 'war-project';
  dialog.setAttribute('aria-labelledby', 'warProjectTitle');
  const toolbar = node('header', 'translation-toolbar');
  const back = node('button', 'translation-back');
  back.type = 'button';
  const languages = node('div', 'translation-languages nav-tools');
  toolbar.append(back, languages);
  const body = node('article', 'project-reading');
  const header = node('header', 'project-heading');
  const title = node('h1', '');
  title.id = 'warProjectTitle';
  const intro = node('p', 'project-intro');
  const author = node('a', '', 'chizumochi');
  author.href = 'index.html#home';
  const sections = node('nav', 'project-sections');
  const songsLink = node('a', '');
  songsLink.href = '#warProjectSongs';
  const novelLink = node('a', '');
  novelLink.href = '#warProjectNovel';
  sections.append(songsLink, novelLink);
  header.append(node('p', 'eyebrow', 'CHIZUMOCHI / 2022 —'), title, intro, sections);
  const music = node('section', 'project-music');
  music.id = 'warProjectSongs';
  const songsTitle = node('h2', '');
  const songs = node('ol', 'project-song-list');
  music.append(songsTitle, songs);
  const novel = node('section', 'project-novel');
  novel.id = 'warProjectNovel';
  const novelTitle = node('h2', '');
  const note = node('p', 'project-language-note');
  const prose = node('div', 'project-prose');
  prose.lang = 'zh-CN';
  prose.append(node('h3', 'project-chapter-title', chapter.title), node('blockquote', 'project-epigraph', chapter.epigraph));
  chapter.sections.forEach(part => {
    const section = node('section', 'project-chapter-part');
    section.append(node('h4', 'project-part-number', String(part.number)));
    // Blank lines separate scenes; individual lines remain individual paragraphs.
    part.text.split(/\n\s*\n/).forEach(scene => {
      const block = node('div', 'project-scene');
      scene.split('\n').filter(line => line.trim()).forEach(line => block.append(node('p', '', line.trim())));
      section.append(block);
    });
    prose.append(section);
  });
  novel.append(novelTitle, note, prose);
  body.append(header, music, novel);
  dialog.append(toolbar, body);
  document.body.append(dialog);
  let language = document.querySelector('body > .nav .lang.active')?.dataset.lang || 'zh';
  let trigger, previousOverflow;
  let movedNodes = [];
  const languageButtons = ['zh', 'ja', 'en'].map((code, i) => {
    const button = node('button', 'lang', ['中', '日', 'EN'][i]);
    button.type = 'button';
    button.addEventListener('click', () => document.querySelector(`body > .nav .lang[data-lang="${code}"]`).click());
    languages.append(button);
    return {code, button};
  });
  function refresh() {
    const text = labels[language];
    dialog.lang = language === 'zh' ? 'zh-CN' : language;
    title.textContent = text.title;
    back.textContent = '← ' + text.back;
    intro.replaceChildren(text.introBefore, author, text.introAfter);
    songsTitle.textContent = text.songs;
    novelTitle.textContent = text.novel;
    note.textContent = text.note;
    note.hidden = !text.note;
    songsLink.textContent = text.musicLink;
    novelLink.textContent = text.novelLink;
    languageButtons.forEach(({code, button}) => button.classList.toggle('active', code === language));
    songs.replaceChildren();
    // Keep names, ordering and dates in sync with the existing 0th album.
    document.querySelectorAll('.album:first-child li').forEach((source, i) => {
      const row = node('li', 'project-song');
      const number = node('span', 'project-song-number', String(i + 1).padStart(2, '0'));
      number.setAttribute('aria-hidden', 'true');
      const name = node(i === 3 ? 'a' : 'span', 'project-song-name', source.querySelector('span').textContent);
      if (i === 3) {
        name.href = 'https://www.bilibili.com/video/BV1Q6Jt67EMh';
        name.target = '_blank';
        name.rel = 'noopener noreferrer';
        name.title = text.play;
        name.append(node('span', 'project-song-arrow', '↗'));
      }
      row.append(number, name, node('span', 'project-song-date', source.querySelector('small').textContent));
      songs.append(row);
    });
  }
  function open(source) {
    if (dialog.open) return;
    trigger = source;
    refresh();
    previousOverflow = document.body.style.overflow;
    document.getElementById('playlistClose').click();
    movedNodes = ['navPlayer', 'playlistPanel'].map(id => {
      const element = document.getElementById(id);
      const marker = document.createComment('project: ' + id);
      element.before(marker);
      if (id === 'navPlayer') toolbar.insertBefore(element, languages);
      else dialog.append(element);
      return {element, marker};
    });
    document.body.style.overflow = 'hidden';
    dialog.showModal();
    dialog.scrollTop = 0;
    back.focus({preventScroll: true});
    if (!matchMedia('(prefers-reduced-motion: reduce)').matches) dialog.animate([{opacity: 0}, {opacity: 1}], {duration: 220});
  }
  dialog.addEventListener('close', () => {
    document.getElementById('playlistClose').click();
    movedNodes.forEach(({element, marker}) => marker.replaceWith(element));
    movedNodes = [];
    document.body.style.overflow = previousOverflow;
    (trigger?.isConnected ? trigger : document.querySelector('[data-war-project]'))?.focus({preventScroll: true});
  });
  back.addEventListener('click', () => dialog.close());
  author.addEventListener('click', event => {
    if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    dialog.close();
    window.scrollTo({top: 0, behavior: 'instant'});
  });
  for (const link of [songsLink, novelLink]) link.addEventListener('click', event => {
    event.preventDefault();
    dialog.querySelector(link.hash).scrollIntoView({behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth'});
  });
  document.addEventListener('click', event => {
    const link = event.target.closest('[data-war-project]');
    if (!link || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    open(link);
  });
  window.addEventListener('site-language-change', event => {
    language = event.detail;
    if (dialog.open) refresh();
  });
})();
