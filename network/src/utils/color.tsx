// Gradient function that aaccepts two color and a value between 0 and 1
export function graidentColor(
  color1: [number, number, number],
  color2: [number, number, number],
  weight: number
): string {
  const w1 = weight;
  const w2 = 1 - w1;
  const rgb = [
    Math.round(color1[0] * w1 + color2[0] * w2),
    Math.round(color1[1] * w1 + color2[1] * w2),
    Math.round(color1[2] * w1 + color2[2] * w2),
  ];
  return `rgb(${rgb[0]}, ${rgb[1]}, ${rgb[2]})`;
}

export function componentToHex(c: number): string {
  const hex = c.toString(16);
  return hex.length == 1 ? "0" + hex : hex;
}

export function rgbToHex(r: number, g: number, b: number): string {
  return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
}

// Colors without dim
export const isVulnerableByDependencyColor = "#CDC832";
export const isNotVulnerableLibrary = "#80807F";
export const vulnerabilityColorGrad1 = [180, 2, 6] as [number, number, number];
export const vulnerabilityColorGrad2 = [255, 240, 240] as [
  number,
  number,
  number
];

// Colors when dimmed
export const dimmedIsVulnerableByDependencyColor = "#444325";
export const dimmedIsNotVulnerableLibrary = "#353535";
export const dimmedVulnerabilityColorGrad1 = [57, 18, 20] as [
  number,
  number,
  number
];
export const dimmedVulnerabilityColorGrad2 = [145, 137, 145] as [
  number,
  number,
  number
];
