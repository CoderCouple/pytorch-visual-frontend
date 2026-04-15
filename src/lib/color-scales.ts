import * as d3 from "d3";

export function getTensorColorScale(values: number[]) {
  const min = Math.min(...values);
  const max = Math.max(...values);
  const absMax = Math.max(Math.abs(min), Math.abs(max), 0.001);

  return d3
    .scaleLinear<string>()
    .domain([-absMax, 0, absMax])
    .range(["#3b82f6", "#ffffff", "#ef4444"])
    .clamp(true);
}

export function getValueColor(value: number, allValues: number[]): string {
  const scale = getTensorColorScale(allValues);
  return scale(value);
}

export function getTextColor(bgColor: string): string {
  const rgb = d3.color(bgColor)?.rgb();
  if (!rgb) return "#000";
  const luminance = (0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b) / 255;
  return luminance > 0.5 ? "#000" : "#fff";
}
