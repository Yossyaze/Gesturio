import React from "react";

interface DeviceFrameProps {
  children: React.ReactNode;
  category: "iPhone" | "iPad";
  modelId: string;
  modelName: string;
  width: number;
  height: number;
  scale: number;
  orientation: "portrait" | "landscape";
  showFrame: boolean;
}

export const DeviceFrame: React.FC<DeviceFrameProps> = ({
  children,
  category,
  modelId,
  width,
  height,
  scale,
  orientation,
  showFrame,
}) => {
  if (!showFrame) {
    return <>{children}</>;
  }

  const isIpad = category === "iPad" || modelId.toLowerCase().includes("ipad");
  const isLandscape = orientation === "landscape";

  // Dynamic Island を持つ機種の判定 (iPhone 14 Pro, 14 Pro Max, 15シリーズ全般, 16シリーズ全般)
  const hasDynamicIsland =
    !isIpad &&
    (modelId.includes("14_pro") ||
      modelId.includes("15") ||
      modelId.includes("16"));

  // ノッチを持つ機種の判定 (X, 11, 12, 13, 14 non-pro)
  const hasNotch =
    !isIpad &&
    !hasDynamicIsland &&
    (modelId.includes("11") ||
      modelId.includes("12") ||
      modelId.includes("13") ||
      modelId.includes("14") ||
      modelId.includes("x"));

  // ベゼル幅と角丸の計算 (scaleに連動)
  const bezelThickness = isIpad ? 16 * scale : 12 * scale;
  const outerBorderRadius = isIpad ? 36 * scale : 50 * scale;
  const innerBorderRadius = isIpad ? 24 * scale : 42 * scale;

  return (
    <div
      className="relative transition-all duration-200 select-none"
      style={{
        padding: `${bezelThickness}px`,
        borderRadius: `${outerBorderRadius}px`,
        background: "linear-gradient(145deg, #2a2d32 0%, #151719 100%)",
        boxShadow:
          "0 25px 60px -15px rgba(0, 0, 0, 0.35), 0 10px 25px -5px rgba(0, 0, 0, 0.2), inset 0 0 0 1px rgba(255, 255, 255, 0.15), inset 0 2px 4px rgba(255, 255, 255, 0.2)",
      }}
    >
      {/* メタリック外枠ハイライト */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          borderRadius: `${outerBorderRadius}px`,
          border: "1px solid rgba(255, 255, 255, 0.08)",
        }}
      />

      {/* 画面コンテンツエリア (Canvas) */}
      <div
        className="relative overflow-hidden bg-black"
        style={{
          borderRadius: `${innerBorderRadius}px`,
          width: `${width * scale}px`,
          height: `${height * scale}px`,
          boxShadow: "inset 0 0 0 1px rgba(0, 0, 0, 0.5)",
        }}
      >
        {children}

        {/* Dynamic Island (iPhone) */}
        {hasDynamicIsland && !isLandscape && (
          <div
            className="absolute top-0 left-1/2 -translate-x-1/2 pointer-events-none z-20 flex items-center justify-center"
            style={{
              marginTop: `${11 * scale}px`,
              width: `${110 * scale}px`,
              height: `${28 * scale}px`,
              borderRadius: `${20 * scale}px`,
              backgroundColor: "#000000",
              boxShadow: "0 0 1px 1px rgba(255, 255, 255, 0.05)",
            }}
          >
            {/* インカメラレンズ反射 */}
            <div
              className="absolute right-3 rounded-full"
              style={{
                width: `${9 * scale}px`,
                height: `${9 * scale}px`,
                backgroundColor: "#080c18",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                boxShadow: "inset 0 0 2px rgba(66, 133, 244, 0.3)",
              }}
            />
          </div>
        )}

        {/* ノッチ (iPhone) */}
        {hasNotch && !isLandscape && (
          <div
            className="absolute top-0 left-1/2 -translate-x-1/2 pointer-events-none z-20 flex items-center justify-center"
            style={{
              width: `${140 * scale}px`,
              height: `${24 * scale}px`,
              backgroundColor: "#000000",
              borderBottomLeftRadius: `${16 * scale}px`,
              borderBottomRightRadius: `${16 * scale}px`,
            }}
          >
            {/* スピーカーバー */}
            <div
              className="rounded-full"
              style={{
                width: `${40 * scale}px`,
                height: `${3 * scale}px`,
                backgroundColor: "#1f2428",
              }}
            />
          </div>
        )}

        {/* iPadのカメラパンチホール */}
        {isIpad && (
          <div
            className={`absolute pointer-events-none z-20 rounded-full ${
              isLandscape
                ? "left-1/2 -translate-x-1/2 top-1.5"
                : "top-1/2 -translate-y-1/2 right-1.5"
            }`}
            style={{
              width: `${6 * scale}px`,
              height: `${6 * scale}px`,
              backgroundColor: "#05070a",
              border: "1px solid rgba(255, 255, 255, 0.15)",
            }}
          />
        )}

        {/* ホームインジケーターバー (Home Bar) */}
        <div
          className={`absolute pointer-events-none z-20 left-1/2 -translate-x-1/2 ${
            isLandscape ? "bottom-1.5" : "bottom-2"
          }`}
          style={{
            width: isIpad ? `${160 * scale}px` : `${120 * scale}px`,
            height: `${4 * scale}px`,
            borderRadius: `${3 * scale}px`,
            backgroundColor: "rgba(0, 0, 0, 0.4)",
            backdropFilter: "blur(4px)",
            boxShadow: "0 0 1px rgba(255, 255, 255, 0.3)",
          }}
        />
      </div>
    </div>
  );
};

export default DeviceFrame;
