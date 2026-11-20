// grade.js: Color grade overlays and mood effects for canvas rendering

export function drawGrade(ctx, width, height, gradeName) {
  ctx.save();
  ctx.globalCompositeOperation = 'overlay';

  if (gradeName === 'Sunset') {
    // Warm orange/magenta sunset gradient
    const grad = ctx.createLinearGradient(0, 0, width, height);
    grad.addColorStop(0, 'rgba(255, 100, 50, 0.35)');
    grad.addColorStop(0.5, 'rgba(255, 46, 136, 0.2)');
    grad.addColorStop(1, 'rgba(100, 20, 100, 0.4)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);

    // Warm glow top
    ctx.globalCompositeOperation = 'screen';
    const topGlow = ctx.createRadialGradient(width * 0.5, 0, 10, width * 0.5, 0, width * 0.8);
    topGlow.addColorStop(0, 'rgba(255, 230, 0, 0.3)');
    topGlow.addColorStop(1, 'rgba(255, 46, 136, 0)');
    ctx.fillStyle = topGlow;
    ctx.fillRect(0, 0, width, height);
  } else if (gradeName === 'Neon Nights') {
    // Pink/cyan duotone vibe
    const grad = ctx.createLinearGradient(0, height, width, 0);
    grad.addColorStop(0, 'rgba(0, 229, 255, 0.3)');
    grad.addColorStop(1, 'rgba(255, 46, 136, 0.35)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);

    ctx.globalCompositeOperation = 'color';
    ctx.fillStyle = 'rgba(255, 0, 128, 0.15)';
    ctx.fillRect(0, 0, width, height);
  } else if (gradeName === 'Palm Dusk') {
    // Purple/teal twilight
    const grad = ctx.createRadialGradient(width * 0.8, height * 0.2, 50, width * 0.5, height * 0.5, width);
    grad.addColorStop(0, 'rgba(0, 200, 200, 0.3)');
    grad.addColorStop(0.5, 'rgba(120, 40, 180, 0.35)');
    grad.addColorStop(1, 'rgba(30, 10, 50, 0.6)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);
  } else if (gradeName === 'Mono Noir') {
    // High contrast cinematic mono with cyan touch
    ctx.globalCompositeOperation = 'color';
    ctx.fillStyle = 'rgba(20, 30, 40, 0.85)';
    ctx.fillRect(0, 0, width, height);

    ctx.globalCompositeOperation = 'overlay';
    const grad = ctx.createLinearGradient(0, 0, 0, height);
    grad.addColorStop(0, 'rgba(0, 229, 255, 0.2)');
    grad.addColorStop(1, 'rgba(255, 46, 136, 0.2)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);
  }

  // Vignette overlay for all grades
  ctx.globalCompositeOperation = 'multiply';
  const vig = ctx.createRadialGradient(width / 2, height / 2, width * 0.3, width / 2, height / 2, width * 0.85);
  vig.addColorStop(0, 'rgba(0, 0, 0, 0)');
  vig.addColorStop(1, 'rgba(10, 5, 20, 0.65)');
  ctx.fillStyle = vig;
  ctx.fillRect(0, 0, width, height);

  ctx.restore();
}
