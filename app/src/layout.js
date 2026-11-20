// layout.js: Computes panel rectangles for the three cover layouts

export function getLayoutPanels(layoutName, width, height) {
  const pad = Math.round(width * 0.025); // outer/inner gap padding
  const innerW = width - pad * 2;
  const innerH = height - pad * 2;

  if (layoutName === 'Sunset Strip') {
    // 3 vertical columns side by side
    const gap = pad;
    const colW = Math.round((innerW - gap * 2) / 3);
    return [
      { x: pad, y: pad, w: colW, h: innerH },
      { x: pad + colW + gap, y: pad, w: colW, h: innerH },
      { x: pad + (colW + gap) * 2, y: pad, w: innerW - (colW + gap) * 2, h: innerH }
    ];
  }

  if (layoutName === 'Hero Split') {
    // Big panel left, two stacked right
    const gap = pad;
    const leftW = Math.round(innerW * 0.52 - gap / 2);
    const rightW = innerW - leftW - gap;
    const rightH = Math.round((innerH - gap) / 2);
    return [
      { x: pad, y: pad, w: leftW, h: innerH },
      { x: pad + leftW + gap, y: pad, w: rightW, h: rightH },
      { x: pad + leftW + gap, y: pad + rightH + gap, w: rightW, h: innerH - rightH - gap }
    ];
  }

  // Default: "Vice Grid" (Hero top, two bottom)
  const gap = pad;
  const topH = Math.round(innerH * 0.58 - gap / 2);
  const botH = innerH - topH - gap;
  const botW = Math.round((innerW - gap) / 2);
  return [
    { x: pad, y: pad, w: innerW, h: topH },
    { x: pad, y: pad + topH + gap, w: botW, h: botH },
    { x: pad + botW + gap, y: pad + topH + gap, w: innerW - botW - gap, h: botH }
  ];
}
