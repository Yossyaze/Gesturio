import React from "react";
import { ZoomIn, ZoomOut, Maximize2, Smartphone } from "lucide-react";

interface CanvasHUDProps {
  scale: number;
  onScaleChange: (scale: number) => void;
  onFitToScreen: () => void;
  showDeviceFrame: boolean;
  onToggleDeviceFrame: () => void;
}

export const CanvasHUD: React.FC<CanvasHUDProps> = ({
  scale,
  onScaleChange,
  onFitToScreen,
  showDeviceFrame,
  onToggleDeviceFrame,
}) => {
  const handleZoomIn = () => {
    onScaleChange(Math.min(3.0, Math.round((scale + 0.1) * 10) / 10));
  };

  const handleZoomOut = () => {
    onScaleChange(Math.max(0.2, Math.round((scale - 0.1) * 10) / 10));
  };

  const handleResetZoom = () => {
    onScaleChange(1.0);
  };

  const percentText = `${Math.round(scale * 100)}%`;

  return (
    <div className="absolute bottom-6 right-6 z-30 flex items-center space-x-1 bg-white/90 backdrop-blur-md border border-gray-200/80 shadow-lg rounded-full px-2.5 py-1.5 text-xs select-none transition-all duration-200 hover:shadow-xl">
      {/* ズームアウト */}
      <button
        type="button"
        onClick={handleZoomOut}
        className="p-1 text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded-full transition-colors active:scale-95"
        title="縮小 (ズームアウト)"
      >
        <ZoomOut className="w-3.5 h-3.5" />
      </button>

      {/* 倍率パーセンテージ（クリックで100%リセット） */}
      <button
        type="button"
        onClick={handleResetZoom}
        className="px-1.5 py-0.5 min-w-[42px] text-center font-semibold text-gray-700 hover:text-blue-600 hover:bg-blue-50/60 rounded transition-colors text-[11px]"
        title="100% にリセット"
      >
        {percentText}
      </button>

      {/* ズームイン */}
      <button
        type="button"
        onClick={handleZoomIn}
        className="p-1 text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded-full transition-colors active:scale-95"
        title="拡大 (ズームイン)"
      >
        <ZoomIn className="w-3.5 h-3.5" />
      </button>

      {/* セパレーター */}
      <div className="h-3.5 w-px bg-gray-200 mx-0.5" />

      {/* 画面全体に合わせる (Fit to Screen) */}
      <button
        type="button"
        onClick={onFitToScreen}
        className="p-1 text-gray-500 hover:text-blue-600 hover:bg-blue-50/60 rounded-full transition-colors active:scale-95 flex items-center gap-1 px-1.5"
        title="画面全体に合わせる (Fit to Screen)"
      >
        <Maximize2 className="w-3.5 h-3.5" />
        <span className="text-[11px] font-medium hidden sm:inline">Fit</span>
      </button>

      {/* セパレーター */}
      <div className="h-3.5 w-px bg-gray-200 mx-0.5" />

      {/* デバイスフレーム表示切替 */}
      <button
        type="button"
        onClick={onToggleDeviceFrame}
        className={`p-1 rounded-full transition-colors active:scale-95 flex items-center gap-1 px-1.5 ${
          showDeviceFrame
            ? "text-blue-600 bg-blue-50/80 font-semibold"
            : "text-gray-400 hover:text-gray-700 hover:bg-gray-100"
        }`}
        title={showDeviceFrame ? "実機フレームを非表示にする" : "実機フレームを表示する"}
      >
        <Smartphone className="w-3.5 h-3.5" />
        <span className="text-[11px] font-medium hidden sm:inline">枠</span>
      </button>
    </div>
  );
};

export default CanvasHUD;
