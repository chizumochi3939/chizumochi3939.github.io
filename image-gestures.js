(() => {
  window.attachImageGestures = (dialog, image) => {
    const viewport = document.createElement('div');
    viewport.className = 'image-zoom-viewport';
    image.replaceWith(viewport);
    viewport.append(image);
    image.classList.add('image-zoom-image');
    image.draggable = false;
    dialog.classList.add('image-zoom-dialog');
    const pointers = new Map();
    let scale = 1, x = 0, y = 0, start = null, moved = false;
    const clamp = (n, min, max) => Math.max(min, Math.min(max, n));
    function geometry() {
      const rect = viewport.getBoundingClientRect();
      const fit = Math.min(rect.width / (image.naturalWidth || 1), rect.height / (image.naturalHeight || 1));
      return {rect, width: image.naturalWidth * fit * scale, height: image.naturalHeight * fit * scale};
    }
    function render() {
      const {rect, width, height} = geometry();
      const limitX = Math.max(0, (width - rect.width) / 2);
      const limitY = Math.max(0, (height - rect.height) / 2);
      x = clamp(x, -limitX, limitX);
      y = clamp(y, -limitY, limitY);
      image.style.transform = `translate(${x}px, ${y}px) scale(${scale})`;
      viewport.classList.toggle('is-zoomed', scale > 1);
    }
    function reset() {
      for (const id of pointers.keys()) {
        if (viewport.hasPointerCapture(id)) viewport.releasePointerCapture(id);
      }
      pointers.clear();
      scale = 1; x = y = 0; start = null; moved = false;
      render();
    }
    function outside(clientX, clientY) {
      if (!image.naturalWidth || image.style.visibility === 'hidden') return true;
      const {rect, width, height} = geometry();
      return Math.abs(clientX - rect.left - rect.width / 2 - x) > width / 2 ||
        Math.abs(clientY - rect.top - rect.height / 2 - y) > height / 2;
    }
    function zoom(next, clientX, clientY) {
      const rect = viewport.getBoundingClientRect();
      const px = clientX - rect.left - rect.width / 2;
      const py = clientY - rect.top - rect.height / 2;
      next = clamp(next, 1, 6);
      x = px - (px - x) * next / scale;
      y = py - (py - y) * next / scale;
      scale = next;
      render();
    }
    viewport.addEventListener('wheel', event => {
      event.preventDefault();
      const delta = event.deltaY * (event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? viewport.clientHeight : 1);
      zoom(scale * Math.exp(-delta * .002), event.clientX, event.clientY);
    }, {passive: false});
    viewport.addEventListener('dblclick', event => {
      if (scale > 1) reset();
      else zoom(2.5, event.clientX, event.clientY);
    });
    viewport.addEventListener('pointerdown', event => {
      if (event.button !== 0) return;
      if (!pointers.size) {
        start = {x: event.clientX, y: event.clientY, outside: outside(event.clientX, event.clientY)};
        moved = false;
      } else moved = true;
      pointers.set(event.pointerId, {x: event.clientX, y: event.clientY});
      viewport.setPointerCapture(event.pointerId);
    });
    viewport.addEventListener('pointermove', event => {
      if (!pointers.has(event.pointerId)) return;
      const previous = pointers.get(event.pointerId);
      const before = [...pointers.values()];
      pointers.set(event.pointerId, {x: event.clientX, y: event.clientY});
      if (start && Math.hypot(event.clientX - start.x, event.clientY - start.y) > 6) moved = true;
      if (pointers.size === 2) {
        const after = [...pointers.values()];
        const distance = points => Math.hypot(points[0].x - points[1].x, points[0].y - points[1].y);
        const midX = (before[0].x + before[1].x) / 2;
        const midY = (before[0].y + before[1].y) / 2;
        zoom(scale * distance(after) / Math.max(1, distance(before)), midX, midY);
        x += (after[0].x + after[1].x) / 2 - midX;
        y += (after[0].y + after[1].y) / 2 - midY;
      } else if (scale > 1) {
        x += event.clientX - previous.x;
        y += event.clientY - previous.y;
      }
      render();
    });
    for (const type of ['pointerup', 'pointercancel', 'lostpointercapture']) {
      viewport.addEventListener(type, event => {
        const closeOnRelease = type === 'pointerup' && pointers.size === 1 && !moved &&
          start?.outside && outside(event.clientX, event.clientY);
        pointers.delete(event.pointerId);
        if (type === 'pointercancel') moved = true;
        if (closeOnRelease) {
          event.preventDefault();
          // Consume this gesture's synthetic click so it cannot hit the page behind the dialog.
          let timer;
          const cleanup = () => {
            clearTimeout(timer);
            document.removeEventListener('click', consumeClick, true);
            document.removeEventListener('pointerdown', cleanup, true);
          };
          const consumeClick = click => {
            if (Math.hypot(click.clientX - event.clientX, click.clientY - event.clientY) < 8) {
              click.preventDefault();
              click.stopImmediatePropagation();
            }
            cleanup();
          };
          document.addEventListener('click', consumeClick, true);
          document.addEventListener('pointerdown', cleanup, true);
          timer = setTimeout(cleanup, 500);
          dialog.close();
        }
      });
    }
    viewport.addEventListener('click', event => {
      if (!moved && start?.outside && outside(event.clientX, event.clientY)) dialog.close();
    });
    dialog.addEventListener('click', event => { if (event.target === dialog) dialog.close(); });
    dialog.addEventListener('keydown', event => {
      if (!['+', '=', '-', '0'].includes(event.key)) return;
      event.preventDefault();
      const rect = viewport.getBoundingClientRect();
      if (event.key === '0') reset();
      else zoom(scale * (event.key === '-' ? .8 : 1.25), rect.left + rect.width / 2, rect.top + rect.height / 2);
    });
    image.addEventListener('load', render);
    dialog.addEventListener('close', reset);
    window.addEventListener('resize', () => { if (dialog.open) render(); });
    return {reset, render};
  };
})();
