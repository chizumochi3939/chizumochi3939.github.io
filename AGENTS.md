# Performance Requirements

- Preserve the site's existing image preview and responsive-image pipeline. Use lightweight previews in galleries; load originals only when requested. Do not preload entire galleries or playlists.
- Give images stable dimensions and use lazy loading for below-the-fold media. Keep QR images on-demand and preserve their scan quality.
- Prefer transform and opacity animations. Avoid continuously animating large gradients through background-position, blur, or layout properties.
- Pause decorative animations when offscreen or when the document is hidden. Respect prefers-reduced-motion and avoid unnecessary work on touch devices.
- Coalesce pointer updates with requestAnimationFrame; read layout at most once per frame before writes. Reuse dialogs and avoid duplicate event listeners or translation keys.
- For UI changes, check desktop and mobile rendering, overflow, navigation, and interactions. For animation changes, verify visible motion and offscreen pausing in a browser; distinguish local checks from deployed-site performance.
- Keep changes scoped and preserve the user's current content. Never commit or push unless requested.
