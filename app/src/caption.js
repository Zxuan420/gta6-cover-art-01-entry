// caption.js: Renders main caption and sub-caption directly onto canvas with crisp outline and neon glow

export function drawCaption(ctx, width, height, captionState) {
  const { text, subText, font, size, color, outline, glow, bottomPos } = captionState;
  if (!text && !subText) return;

  ctx.save();
  const pad = Math.round(width * 0.05);
  const x = pad + Math.round(width * 0.02);
  let y = bottomPos ? height - pad - Math.round(size * 1.6) : pad + Math.round(size * 0.1);

  // Configure font for main caption
  ctx.font = `bold ${size}px "${font}", sans-serif`;
  ctx.textBaseline = bottomPos ? 'bottom' : 'top';
  ctx.textAlign = 'left';

  // Glow effect
  if (glow) {
    ctx.shadowColor = color === '#ffffff' ? '#ff2e88' : color;
    ctx.shadowBlur = Math.round(size * 0.4);
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
  }

  // Outline (stroke)
  if (outline) {
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = Math.max(4, Math.round(size * 0.14));
    ctx.lineJoin = 'round';
    ctx.strokeText(text, x, y);
  }

  // Main fill
  ctx.fillStyle = color;
  ctx.fillText(text, x, y);

  // Reset shadow for subtext
  ctx.shadowBlur = 0;

  // Sub-caption
  if (subText) {
    const subSize = Math.max(16, Math.round(size * 0.38));
    ctx.font = `bold ${subSize}px "${font}", sans-serif`;
    const subY = bottomPos ? y - Math.round(subSize * 1.5) : y + Math.round(size * 1.05);

    if (outline) {
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = Math.max(3, Math.round(subSize * 0.14));
      ctx.strokeText(subText, x, subY);
    }
    ctx.fillStyle = '#ffe600'; // Neon yellow accent for sub-caption
    ctx.fillText(subText, x, subY);
  }

  ctx.restore();
}
