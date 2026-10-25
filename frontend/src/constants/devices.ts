/**
 * デバイスモデル定義およびコマンド用カラーパレット定数。
 */

export interface DeviceModel {
  id: string;
  name: string;
  width: number;
  height: number;
  category: "iPhone" | "iPad";
}

// Apple デバイスモデル一覧（論理ポイント解像度）
export const DEVICE_MODELS: DeviceModel[] = [
  // iPhone 16 シリーズ
  {
    id: "iphone_16_pro_max",
    name: "iPhone 16 Pro Max",
    width: 440,
    height: 956,
    category: "iPhone",
  },
  {
    id: "iphone_16_pro",
    name: "iPhone 16 Pro",
    width: 402,
    height: 874,
    category: "iPhone",
  },
  {
    id: "iphone_16_plus",
    name: "iPhone 16 Plus",
    width: 430,
    height: 932,
    category: "iPhone",
  },
  {
    id: "iphone_16",
    name: "iPhone 16",
    width: 393,
    height: 852,
    category: "iPhone",
  },

  // iPhone 15 シリーズ
  {
    id: "iphone_15_pro_max",
    name: "iPhone 15 Pro Max",
    width: 430,
    height: 932,
    category: "iPhone",
  },
  {
    id: "iphone_15_pro",
    name: "iPhone 15 Pro",
    width: 393,
    height: 852,
    category: "iPhone",
  },
  {
    id: "iphone_15_plus",
    name: "iPhone 15 Plus",
    width: 430,
    height: 932,
    category: "iPhone",
  },
  {
    id: "iphone_15",
    name: "iPhone 15",
    width: 393,
    height: 852,
    category: "iPhone",
  },

  // iPhone 14 シリーズ
  {
    id: "iphone_14_pro_max",
    name: "iPhone 14 Pro Max",
    width: 430,
    height: 932,
    category: "iPhone",
  },
  {
    id: "iphone_14_pro",
    name: "iPhone 14 Pro",
    width: 393,
    height: 852,
    category: "iPhone",
  },
  {
    id: "iphone_14_plus",
    name: "iPhone 14 Plus",
    width: 428,
    height: 926,
    category: "iPhone",
  },
  {
    id: "iphone_14",
    name: "iPhone 14",
    width: 390,
    height: 844,
    category: "iPhone",
  },

  // iPhone 13 シリーズ
  {
    id: "iphone_13_pro_max",
    name: "iPhone 13 Pro Max",
    width: 428,
    height: 926,
    category: "iPhone",
  },
  {
    id: "iphone_13_pro",
    name: "iPhone 13 Pro",
    width: 390,
    height: 844,
    category: "iPhone",
  },
  {
    id: "iphone_13",
    name: "iPhone 13",
    width: 390,
    height: 844,
    category: "iPhone",
  },
  {
    id: "iphone_13_mini",
    name: "iPhone 13 mini",
    width: 375,
    height: 812,
    category: "iPhone",
  },

  // iPhone 12 シリーズ
  {
    id: "iphone_12_pro_max",
    name: "iPhone 12 Pro Max",
    width: 428,
    height: 926,
    category: "iPhone",
  },
  {
    id: "iphone_12_pro",
    name: "iPhone 12 Pro",
    width: 390,
    height: 844,
    category: "iPhone",
  },
  {
    id: "iphone_12",
    name: "iPhone 12",
    width: 390,
    height: 844,
    category: "iPhone",
  },
  {
    id: "iphone_12_mini",
    name: "iPhone 12 mini",
    width: 375,
    height: 812,
    category: "iPhone",
  },

  // iPhone 11 シリーズ
  {
    id: "iphone_11_pro_max",
    name: "iPhone 11 Pro Max",
    width: 414,
    height: 896,
    category: "iPhone",
  },
  {
    id: "iphone_11_pro",
    name: "iPhone 11 Pro",
    width: 375,
    height: 812,
    category: "iPhone",
  },
  {
    id: "iphone_11",
    name: "iPhone 11",
    width: 414,
    height: 896,
    category: "iPhone",
  },

  // iPhone XS / XR / X
  {
    id: "iphone_xs_max",
    name: "iPhone XS Max",
    width: 414,
    height: 896,
    category: "iPhone",
  },
  {
    id: "iphone_xs",
    name: "iPhone XS",
    width: 375,
    height: 812,
    category: "iPhone",
  },
  {
    id: "iphone_xr",
    name: "iPhone XR",
    width: 414,
    height: 896,
    category: "iPhone",
  },
  {
    id: "iphone_x",
    name: "iPhone X",
    width: 375,
    height: 812,
    category: "iPhone",
  },

  // iPhone 8 / 7 / SE
  {
    id: "iphone_8_plus",
    name: "iPhone 8 Plus",
    width: 414,
    height: 736,
    category: "iPhone",
  },
  {
    id: "iphone_8",
    name: "iPhone 8",
    width: 375,
    height: 667,
    category: "iPhone",
  },
  {
    id: "iphone_7_plus",
    name: "iPhone 7 Plus",
    width: 414,
    height: 736,
    category: "iPhone",
  },
  {
    id: "iphone_7",
    name: "iPhone 7",
    width: 375,
    height: 667,
    category: "iPhone",
  },
  {
    id: "iphone_se_3",
    name: "iPhone SE (3rd gen)",
    width: 375,
    height: 667,
    category: "iPhone",
  },
  {
    id: "iphone_se_2",
    name: "iPhone SE (2nd gen)",
    width: 375,
    height: 667,
    category: "iPhone",
  },

  // iPad Pro
  {
    id: "ipad_pro_13_m4",
    name: 'iPad Pro 13" (M4)',
    width: 1032,
    height: 1376,
    category: "iPad",
  },
  {
    id: "ipad_pro_12_9_6",
    name: 'iPad Pro 12.9" (3rd-6th gen)',
    width: 1024,
    height: 1366,
    category: "iPad",
  },
  {
    id: "ipad_pro_12_9_2",
    name: 'iPad Pro 12.9" (1st-2nd gen)',
    width: 1024,
    height: 1366,
    category: "iPad",
  },
  {
    id: "ipad_pro_11_m4",
    name: 'iPad Pro 11" (M4)',
    width: 834,
    height: 1210,
    category: "iPad",
  },
  {
    id: "ipad_pro_11_4",
    name: 'iPad Pro 11" (1st-4th gen)',
    width: 834,
    height: 1194,
    category: "iPad",
  },
  {
    id: "ipad_pro_10_5",
    name: 'iPad Pro 10.5"',
    width: 834,
    height: 1112,
    category: "iPad",
  },
  {
    id: "ipad_pro_9_7",
    name: 'iPad Pro 9.7"',
    width: 768,
    height: 1024,
    category: "iPad",
  },

  // iPad Air
  {
    id: "ipad_air_13_m2",
    name: 'iPad Air 13" (M2)',
    width: 1032,
    height: 1376,
    category: "iPad",
  },
  {
    id: "ipad_air_11_m2",
    name: 'iPad Air 11" (M2)',
    width: 820,
    height: 1180,
    category: "iPad",
  },
  {
    id: "ipad_air_5",
    name: "iPad Air (5th gen)",
    width: 820,
    height: 1180,
    category: "iPad",
  },
  {
    id: "ipad_air_4",
    name: "iPad Air (4th gen)",
    width: 820,
    height: 1180,
    category: "iPad",
  },
  {
    id: "ipad_air_3",
    name: "iPad Air (3rd gen)",
    width: 834,
    height: 1112,
    category: "iPad",
  },

  // iPad
  {
    id: "ipad_10",
    name: "iPad (10th gen)",
    width: 820,
    height: 1180,
    category: "iPad",
  },
  {
    id: "ipad_9",
    name: "iPad (9th gen)",
    width: 810,
    height: 1080,
    category: "iPad",
  },
  {
    id: "ipad_8",
    name: "iPad (8th gen)",
    width: 810,
    height: 1080,
    category: "iPad",
  },
  {
    id: "ipad_7",
    name: "iPad (7th gen)",
    width: 810,
    height: 1080,
    category: "iPad",
  },
  {
    id: "ipad_6",
    name: "iPad (6th gen)",
    width: 768,
    height: 1024,
    category: "iPad",
  },
  {
    id: "ipad_5",
    name: "iPad (5th gen)",
    width: 768,
    height: 1024,
    category: "iPad",
  },

  // iPad mini
  {
    id: "ipad_mini_6",
    name: "iPad mini (6th gen)",
    width: 744,
    height: 1133,
    category: "iPad",
  },
  {
    id: "ipad_mini_5",
    name: "iPad mini (5th gen)",
    width: 768,
    height: 1024,
    category: "iPad",
  },
];

// コマンドごとに自動で割り当てるカラーパレット
export const COMMAND_COLORS = [
  "#ef4444", // Red 500
  "#f97316", // Orange 500
  "#f59e0b", // Amber 500
  "#84cc16", // Lime 500
  "#10b981", // Emerald 500
  "#06b6d4", // Cyan 500
  "#3b82f6", // Blue 500
  "#6366f1", // Indigo 500
  "#8b5cf6", // Violet 500
  "#d946ef", // Fuchsia 500
  "#f43f5e", // Rose 500
  "#dc2626", // Red 600
  "#ea580c", // Orange 600
  "#d97706", // Amber 600
  "#65a30d", // Lime 600
  "#059669", // Emerald 600
  "#0891b2", // Cyan 600
  "#2563eb", // Blue 600
  "#4f46e5", // Indigo 600
  "#7c3aed", // Violet 600
  "#c026d3", // Fuchsia 600
  "#e11d48", // Rose 600
];

/**
 * 既存のコマンド一覧と重複しない次の色を返すヘルパー関数。
 */
export function getNextColor(currentCommands: { color?: string }[]): string {
  const usedColors = new Set(currentCommands.map((c) => c.color));
  for (const color of COMMAND_COLORS) {
    if (!usedColors.has(color)) return color;
  }
  return COMMAND_COLORS[currentCommands.length % COMMAND_COLORS.length];
}
