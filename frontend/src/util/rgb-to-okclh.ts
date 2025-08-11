/*
 * Copyright (C) 2025 Sohan Basak (iamsohan.in)
 *
 * This program is free software; you can redistribute it and/or modify
 * it under the terms of the WTFPL, Version 2, as published by
 * Sam Hocevar. See http://www.wtfpl.net/ for more details.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.
 */
/** biome-ignore-all lint/nursery/noMagicNumbers: Not my code*/
export function rgbToOklch(rgb: { r: number; g: number; b: number }): {
  l: number;
  c: number;
  h: number;
} {
  // Step 1: Convert RGB to Linear RGB
  const r = rgb.r / 255;
  const g = rgb.g / 255;
  const b = rgb.b / 255;
  const linearRgb = {
    r: r <= 0.04045 ? r / 12.92 : ((r + 0.055) / 1.055) ** 2.4,
    g: g <= 0.04045 ? g / 12.92 : ((g + 0.055) / 1.055) ** 2.4,
    b: b <= 0.04045 ? b / 12.92 : ((b + 0.055) / 1.055) ** 2.4,
  };
  // Step 2: Linear RGB to XYZ
  const x = 0.4124 * linearRgb.r + 0.3576 * linearRgb.g + 0.1805 * linearRgb.b;
  const y = 0.2126 * linearRgb.r + 0.7152 * linearRgb.g + 0.0722 * linearRgb.b;
  const z = 0.0193 * linearRgb.r + 0.1192 * linearRgb.g + 0.9505 * linearRgb.b;
  // Step 3: XYZ to Lab
  const xn = 0.95047;
  const yn = 1.0;
  const zn = 1.08883;
  const xNorm = x / xn;
  const yNorm = y / yn;
  const zNorm = z / zn;
  const fx = xNorm > 0.008856 ? xNorm ** (1 / 3) : 7.787 * xNorm + 16 / 116;
  const fy = yNorm > 0.008856 ? yNorm ** (1 / 3) : 7.787 * yNorm + 16 / 116;
  const fz = zNorm > 0.008856 ? zNorm ** (1 / 3) : 7.787 * zNorm + 16 / 116;
  const l = 116 * fy - 16;
  const a = 500 * (fx - fy);
  const bLab = 200 * (fy - fz);
  // Step 4: Lab to LCH
  const c = Math.sqrt(a ** 2 + bLab ** 2);
  let h = Math.atan2(bLab, a) * (180 / Math.PI);
  if (h < 0) {
    h += 360;
  }
  return {
    l: l / 100, // Normalized to 0-1 range
    c: c / 100, // Normalized to 0-1 range (though max varies)
    h: h, // Hue in degrees (0-360)
  };
}

/**
 * Converts a normalized CIELCH color back to RGB.
 * The input L and C should be in the range [0, 1], and H should be in [0, 360].
 * Returns RGB values in the range [0, 255].
 */
export function oklchToRgb(oklch: { l: number; c: number; h: number }): {
  r: number;
  g: number;
  b: number;
} {
  // Denormalize L and C to 0-100 range and convert H to radians
  const l = oklch.l * 100;
  const cValue = oklch.c * 100;
  const hRad = oklch.h * (Math.PI / 180);

  // Convert CIELCH to CIELAB
  const a = cValue * Math.cos(hRad);
  const bLab = cValue * Math.sin(hRad); // Renamed to avoid conflict

  // Convert CIELAB to XYZ
  const delta = 6 / 29;
  const factor = 3 * delta * delta; // 108/841 ≈ 0.1284
  const fy = (l + 16) / 116;
  const fx = a / 500 + fy;
  const fz = fy - bLab / 200; // Use renamed variable

  // Inverse transformation for f
  const fInv = (t: number) => {
    if (t > delta) return t ** 3;
    return (t - 4 / 29) * factor;
  };

  const xNorm = fInv(fx);
  const yNorm = fInv(fy);
  const zNorm = fInv(fz);

  // Apply white point (D65)
  const xn = 0.95047;
  const yn = 1.0;
  const zn = 1.08883;
  const x = xNorm * xn;
  const y = yNorm * yn;
  const z = zNorm * zn;

  // Convert XYZ to linear RGB using inverse sRGB matrix
  const rLinear = 3.2404542 * x + -1.5371385 * y + -0.4985314 * z;
  const gLinear = -0.969266 * x + 1.8760108 * y + 0.041556 * z;
  const bLinear = 0.0556434 * x + -0.2040259 * y + 1.0572252 * z;

  // Clamp to [0, 1] range
  const clamp = (val: number) => Math.max(0, Math.min(1, val));
  const rClamped = clamp(rLinear);
  const gClamped = clamp(gLinear);
  const bClamped = clamp(bLinear);

  // Apply gamma correction to convert to sRGB
  const gammaCorrect = (val: number) => {
    if (val <= 0.0031308) return 12.92 * val;
    return 1.055 * val ** (1 / 2.4) - 0.055;
  };

  const rGamma = gammaCorrect(rClamped);
  const gGamma = gammaCorrect(gClamped);
  const bGamma = gammaCorrect(bClamped);

  // Convert to 0-255 range and return directly
  const to255 = (val: number) => Math.round(val * 255);
  return {
    r: to255(rGamma),
    g: to255(gGamma),
    b: to255(bGamma),
  };
}
