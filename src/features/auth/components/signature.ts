export type SignaturePoint = { x: number; y: number; start: boolean };

export function createSignature(points: SignaturePoint[], width: number) {
  if (!points.some((point) => !point.start)) {
    return null;
  }

  const path = points.map((point, index) => {
    return `${index === 0 || point.start ? "M" : "L"} ${point.x} ${point.y}`;
  }).join(" ");
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="160" viewBox="0 0 ${width} 160"><path d="${path}" fill="none" stroke="#172033" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
  return `data:image/svg+xml;base64,${btoa(svg)}`;
}
