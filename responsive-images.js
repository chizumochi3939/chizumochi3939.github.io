(() => {
  const mobile = matchMedia('(max-width: 800px)');
  const desktopSource = window.previewImageSource;
  window.mobilePreviewSource = src => mobile.matches ? window.mobileImagePreviews?.[src] || src : src;
  window.previewImageSource = src => window.mobilePreviewSource(desktopSource(src));
})();
