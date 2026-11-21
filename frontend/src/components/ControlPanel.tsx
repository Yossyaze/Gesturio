import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import {
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Smartphone,
  Image as ImageIcon,
  Star,
  FileOutput,
  FolderOpen,
  FolderPlus,
  Upload,
  Trash2,
  Edit2,
  Check,
  X,
  Plus,
} from "lucide-react";
import { type BackgroundImage } from "../api";
import { type DeviceModel } from "../constants/devices";
import { useDialog } from "../contexts/DialogContext";
import {
  buildBackgroundFolderItems,
  filterBackgroundsByFolder,
  getFolderGroupNameFromKey,
} from "../utils/backgroundFolders";

interface ControlPanelProps {
  onNudge: (x: number, y: number, saveHistory?: boolean) => void;
  onExport: () => void;
  models: DeviceModel[];
  selectedModelId: string;
  onSelectModel: (id: string) => void;
  orientation: "portrait" | "landscape";
  onSelectOrientation: (orientation: "portrait" | "landscape") => void;
  onBackgroundImageUpload: (
    files: FileList,
    groupName?: string | null,
  ) => void;
  onBackgroundImageSelect?: (url: string) => void;
  selectedBackgroundImageUrl?: string | null;
  onClearBackgroundImage: () => void;
  backgroundOpacity?: number;
  onBackgroundOpacityChange?: (opacity: number) => void;
  onOpenBackgroundLibrary?: () => void;
  backgroundsList?: BackgroundImage[];
  backgroundFolders?: string[];
  onDeleteBackground?: (id: string) => void;
  onUpdateBackgroundGroup?: (id: string, groupName: string | null) => void;
  onCreateBackgroundFolder?: (folderName: string) => void;
  showGrid: boolean;
  onToggleGrid: (show: boolean) => void;
  showPoints: boolean;
  onTogglePoints: (show: boolean) => void;
  selectedCommandShowPoints?: boolean; // <-- 追加: 選択中アクション個別の設定
  onToggleCommandPoints?: (show: boolean) => void; // <-- 追加: 選択中アクション個別の設定変更
  duration: number;
  onDurationChange: (duration: number, saveHistory?: boolean) => void;
  angle: number;
  onAngleChange: (angle: number, saveHistory?: boolean) => void;
  length: number;
  onLengthChange: (length: number, saveHistory?: boolean) => void;
  curveRatio?: number;
  onCurveChange?: (ratio: number, saveHistory?: boolean) => void;
  startX?: number;
  startY?: number;
  endX?: number;
  endY?: number;
  onCoordinateChange?: (
    pointType: "start" | "end",
    axis: "x" | "y",
    value: number,
  ) => void;
  onCurve: () => void;
  onStraight: () => void;
  isActionSelected?: boolean;
  waitDuration?: number;
  onWaitDurationChange?: (duration: number, saveHistory?: boolean) => void;
  onApplyWaitToAll?: (duration: number) => void;
  selectedStrokeWait?: number;
  onSelectedStrokeWaitChange?: (duration: number, saveHistory?: boolean) => void;
  selectionType?: "stroke" | "wait";
  onDeleteSelectedAction?: () => void;
  onFlipAngle?: () => void;
  onFlip?: (direction: "horizontal" | "vertical") => void;
  isTap?: boolean;
  tapDuration?: number;
  onTapDurationChange?: (duration: number, saveHistory?: boolean) => void;

  // お気に入り環境設定
  favoriteEnvironments?: import("../api").EnvironmentSettings[];
  onSaveEnvironment?: (name: string) => void;
  onLoadEnvironment?: (env: import("../api").EnvironmentSettings) => void;
  onRenameEnvironment?: (id: string, newName: string) => void;
  onOverwriteEnvironment?: (id: string) => void;
  onDeleteEnvironment?: (id: string) => void;

  // 書き出し拡張子
  exportExtension?: string;
  onExportExtensionChange?: (ext: string) => void;
}

interface BufferedNumberInputProps extends Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "value" | "onChange"
> {
  value: number;
  onChange: (val: number) => void;
  minVal?: number;
  maxVal?: number;
  format?: (val: number) => string;
}

const BufferedNumberInput: React.FC<BufferedNumberInputProps> = ({
  value,
  onChange,
  minVal = -Infinity,
  maxVal = Infinity,
  format = (v) => v.toString(),
  ...props
}) => {
  const [localValue, setLocalValue] = useState<string>(format(value));
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    if (!isFocused) {
      setLocalValue(format(value));
    }
  }, [value, format, isFocused]);

  const commitValue = (strVal: string) => {
    if (strVal.trim() === "") {
      onChange(minVal !== -Infinity ? minVal : 0);
      setLocalValue(format(minVal !== -Infinity ? minVal : 0));
      return;
    }
    let num = parseFloat(strVal);
    if (isNaN(num)) {
      num = minVal !== -Infinity ? minVal : 0;
    }
    num = Math.max(minVal, Math.min(maxVal, num));
    onChange(num);
    setLocalValue(format(num));
  };

  return (
    <input
      {...props}
      type="number"
      value={localValue}
      onChange={(e) => setLocalValue(e.target.value)}
      onFocus={(e) => {
        setIsFocused(true);
        props.onFocus?.(e);
      }}
      onBlur={(e) => {
        setIsFocused(false);
        commitValue(localValue);
        props.onBlur?.(e);
      }}
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          e.currentTarget.blur();
        }
        props.onKeyDown?.(e);
      }}
    />
  );
};

const ControlPanel: React.FC<ControlPanelProps> = ({
  models,
  selectedModelId,
  // ... other props ... (wait, let's just make sure I don't delete props, I should insert inside the component body, not the props)
  onSelectModel,
  orientation,
  onSelectOrientation,
  onNudge,
  onExport,
  onBackgroundImageUpload,
  onBackgroundImageSelect,
  selectedBackgroundImageUrl,
  onClearBackgroundImage,
  backgroundOpacity = 1.0,
  onBackgroundOpacityChange,
  onOpenBackgroundLibrary,
  backgroundsList = [],
  backgroundFolders = [],
  onDeleteBackground,
  onUpdateBackgroundGroup,
  onCreateBackgroundFolder,
  showGrid,
  onToggleGrid,
  showPoints,
  onTogglePoints,
  selectedCommandShowPoints,
  onToggleCommandPoints,
  duration,
  onDurationChange,
  angle,
  onAngleChange,
  length,
  onLengthChange,
  curveRatio = 0,
  onCurveChange,
  onCurve,
  onStraight,
  startX,
  startY,
  endX,
  endY,
  onCoordinateChange,
  isActionSelected,
  waitDuration,
  onWaitDurationChange,
  onApplyWaitToAll,
  selectedStrokeWait,
  onSelectedStrokeWaitChange,
  selectionType = "stroke",
  onDeleteSelectedAction,
  onFlipAngle,
  onFlip,
  favoriteEnvironments = [],
  onSaveEnvironment,
  onLoadEnvironment,
  onRenameEnvironment,
  onOverwriteEnvironment,
  onDeleteEnvironment,
  exportExtension = ".voicecontrolcom",
  onExportExtensionChange,
  isTap,
  tapDuration,
  onTapDurationChange,
}) => {
  const { confirm, prompt } = useDialog();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // スライダードラッグ中は初回変更時のみ Undo 履歴を保存する
  const isSliderDraggingRef = useRef(false);
  const hasSavedSliderHistoryRef = useRef(false);

  const handleSliderPointerDown = useCallback(() => {
    isSliderDraggingRef.current = true;
    hasSavedSliderHistoryRef.current = false;
  }, []);

  const consumeSliderSaveHistory = useCallback((): boolean => {
    if (!isSliderDraggingRef.current) return true;
    if (!hasSavedSliderHistoryRef.current) {
      hasSavedSliderHistoryRef.current = true;
      return true;
    }
    return false;
  }, []);

  useEffect(() => {
    const resetSliderDrag = () => {
      isSliderDraggingRef.current = false;
      hasSavedSliderHistoryRef.current = false;
    };
    window.addEventListener("pointerup", resetSliderDrag);
    window.addEventListener("pointercancel", resetSliderDrag);
    return () => {
      window.removeEventListener("pointerup", resetSliderDrag);
      window.removeEventListener("pointercancel", resetSliderDrag);
    };
  }, []);

  const formatCoord = (n: number) => Math.round(n);

  // --- Long Press Logic for Angle ---
  const currentAngleRef = useRef(angle);
  useEffect(() => {
    currentAngleRef.current = angle;
  }, [angle]);

  const pressTimerRef = useRef<number | null>(null);
  const pressIntervalRef = useRef<number | null>(null);
  const [activeTab, setActiveTab] = useState<"action" | "environment">(
    "action",
  );
  const [selectedFolderKey, setSelectedFolderKey] = useState<string>("__all__");
  const [isFavoritesOpen, setIsFavoritesOpen] = useState<boolean>(false);
  const [isBgDragOver, setIsBgDragOver] = useState<boolean>(false);

  const stopPress = useCallback(() => {
    if (pressTimerRef.current !== null)
      window.clearTimeout(pressTimerRef.current);
    if (pressIntervalRef.current !== null)
      window.clearInterval(pressIntervalRef.current);
  }, []);

  const startPress = useCallback(
    (delta: number) => {
      // 初回押下時はUndo履歴を保存
      let nextAngle = (currentAngleRef.current + delta + 1024) % 1024;
      onAngleChange(nextAngle, true);

      // 長押し時の連続リピート（履歴の重複保存を抑制）
      pressTimerRef.current = window.setTimeout(() => {
        pressIntervalRef.current = window.setInterval(() => {
          nextAngle = (currentAngleRef.current + delta + 1024) % 1024;
          onAngleChange(nextAngle, false);
        }, 50); // Fast repeat rate (50ms)
      }, 300);
    },
    [onAngleChange],
  );

  useEffect(() => {
    return stopPress;
  }, [stopPress]);
  // ------------------------------------

  // --- Long Press Logic for Nudge ---
  const nudgeTimerRef = useRef<number | null>(null);
  const nudgeIntervalRef = useRef<number | null>(null);

  const stopNudgePress = useCallback(() => {
    if (nudgeTimerRef.current !== null)
      window.clearTimeout(nudgeTimerRef.current);
    if (nudgeIntervalRef.current !== null)
      window.clearInterval(nudgeIntervalRef.current);
  }, []);

  const startNudgePress = useCallback(
    (dx: number, dy: number) => {
      // 初回押下時はUndo履歴を保存
      onNudge(dx, dy, true);

      // 長押し時の連続リピート（履歴の重複保存を抑制）
      nudgeTimerRef.current = window.setTimeout(() => {
        nudgeIntervalRef.current = window.setInterval(() => {
          onNudge(dx, dy, false);
        }, 50); // Fast repeat rate (50ms)
      }, 300);
    },
    [onNudge],
  );

  useEffect(() => {
    return stopNudgePress;
  }, [stopNudgePress]);
  // ------------------------------------

  const folderItems = useMemo(
    () => buildBackgroundFolderItems(backgroundFolders, backgroundsList),
    [backgroundFolders, backgroundsList],
  );

  // folderItemsが変更され、現在の選択キーが無効になった場合にリセットする（Effectを使わないパターン）
  const [prevFolderItems, setPrevFolderItems] = useState(folderItems);
  if (folderItems !== prevFolderItems) {
    setPrevFolderItems(folderItems);
    if (!folderItems.some((item) => item.key === selectedFolderKey)) {
      setSelectedFolderKey("__all__");
    }
  }

  const visibleBackgrounds = useMemo(
    () => filterBackgroundsByFolder(backgroundsList, selectedFolderKey),
    [backgroundsList, selectedFolderKey],
  );

  const folderNameOptions = useMemo(
    () =>
      folderItems
        .filter((item) => item.key.startsWith("folder:") && item.name)
        .map((item) => item.name as string),
    [folderItems],
  );

  const activeUploadGroup = getFolderGroupNameFromKey(selectedFolderKey);
  const selectedBackground = useMemo(() => {
    if (!selectedBackgroundImageUrl) return null;
    return (
      backgroundsList.find((bg) => bg.url === selectedBackgroundImageUrl) || null
    );
  }, [backgroundsList, selectedBackgroundImageUrl]);

  const matchingFavorite = useMemo(
    () =>
      favoriteEnvironments.find(
        (env) =>
          env.modelId === selectedModelId && env.orientation === orientation,
      ) || null,
    [favoriteEnvironments, selectedModelId, orientation],
  );

  return (
    <div className="w-full min-w-0 bg-white flex flex-col h-full min-h-0 font-sans z-20 overflow-hidden">
      {/* Header */}
      <div className="h-12 px-4 border-b border-gray-200 bg-white flex justify-between items-center shrink-0">
        <h2 className="text-xs font-bold text-gray-500 tracking-wider uppercase">
          プロパティ
        </h2>
      </div>

      <div className="flex border-b border-gray-200 bg-gray-50 shrink-0">
        <button
          className={`flex-1 text-xs py-3 font-bold transition-colors text-center border-b-2 ${activeTab === "action" ? "border-blue-500 text-blue-600 bg-white" : "border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-100"}`}
          onClick={() => setActiveTab("action")}
        >
          アクション設定
        </button>
        <button
          className={`flex-1 text-xs py-3 font-bold transition-colors text-center border-b-2 ${activeTab === "environment" ? "border-blue-500 text-blue-600 bg-white" : "border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-100"}`}
          onClick={() => setActiveTab("environment")}
        >
          環境設定
        </button>
      </div>

      <div className="flex-1 min-h-0 min-w-0 overflow-hidden">
        {/* Environment Settings Tab */}
        <div
          className={
            activeTab === "environment"
              ? "h-full overflow-y-auto overflow-x-hidden px-3 py-3 space-y-3"
              : "hidden"
          }
        >
          {/* 1. 端末・画面表示カード */}
          <section className="rounded-lg border border-gray-200 bg-white p-3 space-y-2.5 shadow-2xs">
            <div className="flex items-center gap-1.5 text-[11px] font-bold text-gray-500 uppercase tracking-wider">
              <Smartphone className="w-3.5 h-3.5 text-blue-600" />
              <span>端末・画面表示</span>
            </div>

            <div className="relative">
              <select
                className="w-full text-xs border border-gray-300 rounded-md shadow-xs focus:border-blue-500 focus:ring-blue-500 appearance-none py-2 pl-2.5 pr-8 bg-white text-gray-800"
                value={selectedModelId}
                onChange={(e) => onSelectModel(e.target.value)}
              >
                <optgroup label="iPhone">
                  {models
                    .filter((m) => m.category === "iPhone")
                    .map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.name}
                      </option>
                    ))}
                </optgroup>
                <optgroup label="iPad">
                  {models
                    .filter((m) => m.category === "iPad")
                    .map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.name}
                      </option>
                    ))}
                </optgroup>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-400">
                <ChevronDown className="h-4 w-4" />
              </div>
            </div>

            <div className="flex bg-gray-100 rounded-md p-0.5">
              <button
                type="button"
                className={`flex-1 text-xs py-1.5 rounded transition-all ${orientation === "portrait" ? "bg-white shadow-xs font-semibold text-gray-800" : "text-gray-500 hover:text-gray-700"}`}
                onClick={() => onSelectOrientation("portrait")}
              >
                縦画面
              </button>
              <button
                type="button"
                className={`flex-1 text-xs py-1.5 rounded transition-all ${orientation === "landscape" ? "bg-white shadow-xs font-semibold text-gray-800" : "text-gray-500 hover:text-gray-700"}`}
                onClick={() => onSelectOrientation("landscape")}
              >
                横画面
              </button>
            </div>

            <div className="grid grid-cols-2 gap-1.5">
              <button
                type="button"
                onClick={() => onToggleGrid(!showGrid)}
                className={`px-2 py-1.5 rounded-md text-[11px] font-medium border transition-colors ${showGrid ? "bg-blue-50 border-blue-200 text-blue-700" : "bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100"}`}
              >
                グリッド: {showGrid ? "ON" : "OFF"}
              </button>
              <button
                type="button"
                onClick={() => onTogglePoints(!showPoints)}
                className={`px-2 py-1.5 rounded-md text-[11px] font-medium border transition-colors ${showPoints ? "bg-blue-50 border-blue-200 text-blue-700" : "bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100"}`}
              >
                開始/終了点: {showPoints ? "ON" : "OFF"}
              </button>
            </div>
          </section>

          {/* 2. 背景画像カード */}
          <section className="rounded-lg border border-gray-200 bg-white p-3 space-y-2.5 shadow-2xs">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5 text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                <ImageIcon className="w-3.5 h-3.5 text-emerald-600" />
                <span>背景画像</span>
              </div>
              {onOpenBackgroundLibrary && (
                <button
                  type="button"
                  onClick={onOpenBackgroundLibrary}
                  className="inline-flex items-center gap-1 rounded-md border border-blue-200 bg-blue-50 px-2 py-1 text-[10px] font-semibold text-blue-700 hover:bg-blue-100 transition-colors"
                  title="広いウィンドウで画像一覧・フォルダー整理を開く"
                >
                  <FolderOpen className="w-3 h-3" />
                  <span>ライブラリ</span>
                </button>
              )}
            </div>

            {/* ドラッグ＆ドロップ対応アップロード枠 ＆ 適用中プレビュー */}
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsBgDragOver(true);
              }}
              onDragLeave={(e) => {
                e.preventDefault();
                setIsBgDragOver(false);
              }}
              onDrop={(e) => {
                e.preventDefault();
                setIsBgDragOver(false);
                if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                  onBackgroundImageUpload(
                    e.dataTransfer.files,
                    activeUploadGroup,
                  );
                }
              }}
              className={`rounded-lg border transition-colors p-2 ${
                isBgDragOver
                  ? "border-blue-400 bg-blue-50/70"
                  : selectedBackgroundImageUrl
                    ? "border-blue-200 bg-blue-50/30"
                    : "border-dashed border-gray-300 bg-gray-50/70 hover:border-gray-400"
              }`}
            >
              {selectedBackgroundImageUrl ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-11 h-14 rounded bg-slate-100 border border-gray-200 flex items-center justify-center overflow-hidden shrink-0">
                      <img
                        src={selectedBackgroundImageUrl}
                        alt="適用中の背景"
                        className="max-w-full max-h-full object-contain"
                      />
                    </div>
                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-center justify-between gap-1">
                        <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-blue-700">
                          <Check className="w-3 h-3" />
                          背景を適用中
                        </span>
                        <button
                          type="button"
                          onClick={onClearBackgroundImage}
                          className="inline-flex items-center gap-0.5 text-[10px] text-gray-500 hover:text-red-600 transition-colors"
                          title="背景画像を解除"
                        >
                          <X className="w-3 h-3" />
                          <span>解除</span>
                        </button>
                      </div>
                      {selectedBackground && (
                        <select
                          value={selectedBackground.groupName?.trim() || ""}
                          onChange={(e) =>
                            onUpdateBackgroundGroup?.(
                              selectedBackground.id,
                              e.target.value || null,
                            )
                          }
                          className="w-full rounded border border-gray-200 bg-white px-1.5 py-1 text-[10px] text-gray-700 focus:border-blue-400 focus:outline-none"
                          title="適用中画像の登録先フォルダー"
                        >
                          <option value="">未分類</option>
                          {folderNameOptions.map((name) => (
                            <option key={name} value={name}>
                              {name}
                            </option>
                          ))}
                        </select>
                      )}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full flex items-center justify-center gap-1.5 py-1.5 rounded border border-dashed border-gray-300 bg-white text-[11px] text-gray-600 hover:border-blue-400 hover:text-blue-600 transition-colors"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>別の画像を追加・ドロップ</span>
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full py-3 flex flex-col items-center justify-center text-center gap-1 text-gray-500 hover:text-blue-600 transition-colors"
                >
                  <Upload className="w-5 h-5 text-gray-400" />
                  <span className="text-xs font-medium">
                    画像を選択またはドロップ
                  </span>
                  <span className="text-[10px] text-gray-400">
                    追加先: {activeUploadGroup ?? "未分類"}
                  </span>
                </button>
              )}
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                multiple
                onChange={(e) => {
                  if (e.target.files && e.target.files.length > 0) {
                    onBackgroundImageUpload(e.target.files, activeUploadGroup);
                    e.target.value = "";
                  }
                }}
              />
            </div>

            {/* 背景の濃さ（不透明度） */}
            {onBackgroundOpacityChange && (
              <div className="pt-0.5">
                <div className="flex items-center justify-between text-[11px] mb-1">
                  <span className="text-gray-600 font-medium">
                    背景の濃さ（不透明度）
                  </span>
                  <span className="font-mono text-gray-500">
                    {Math.round(backgroundOpacity * 100)}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0.15"
                  max="1"
                  step="0.05"
                  value={backgroundOpacity}
                  onChange={(e) =>
                    onBackgroundOpacityChange(parseFloat(e.target.value))
                  }
                  className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                />
              </div>
            )}

            {/* フォルダー切り替え ＋ 見切れなしの2列プレビュー */}
            <div className="pt-1 border-t border-gray-100 space-y-2">
              <div className="flex items-center gap-1.5">
                <select
                  value={selectedFolderKey}
                  onChange={(e) => setSelectedFolderKey(e.target.value)}
                  className="flex-1 min-w-0 rounded border border-gray-200 bg-gray-50 px-2 py-1 text-[11px] text-gray-700 focus:border-blue-400 focus:bg-white focus:outline-none"
                  title="表示する背景フォルダーを絞り込む"
                >
                  {folderItems.map((folder) => (
                    <option key={folder.key} value={folder.key}>
                      {folder.label} ({folder.count})
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={async () => {
                    if (!onCreateBackgroundFolder) return;
                    const name = await prompt(
                      "新しいフォルダー名を入力してください:",
                    );
                    if (name && name.trim()) {
                      onCreateBackgroundFolder(name.trim());
                      setSelectedFolderKey(`folder:${name.trim()}`);
                    }
                  }}
                  className="p-1.5 rounded border border-gray-200 bg-white text-gray-500 hover:border-blue-300 hover:text-blue-600 transition-colors shrink-0"
                  title="フォルダーを新規作成"
                >
                  <FolderPlus className="w-3.5 h-3.5" />
                </button>
              </div>

              {visibleBackgrounds.length > 0 ? (
                <div className="grid grid-cols-2 gap-2 max-h-60 overflow-y-auto pr-0.5">
                  {visibleBackgrounds.map((bg) => {
                    const isActive = selectedBackgroundImageUrl === bg.url;
                    return (
                      <div
                        key={bg.id}
                        className={`relative group cursor-pointer rounded-lg overflow-hidden border transition-all bg-slate-100 ${
                          isActive
                            ? "border-blue-500 ring-2 ring-blue-200"
                            : "border-gray-200 hover:border-blue-400"
                        }`}
                        onClick={() => onBackgroundImageSelect?.(bg.url)}
                      >
                        <div className="aspect-[4/5] p-1 flex items-center justify-center">
                          <img
                            src={bg.url}
                            alt="背景サムネイル"
                            className="max-w-full max-h-full object-contain rounded-xs"
                          />
                        </div>
                        {isActive && (
                          <span className="absolute left-1 top-1 rounded bg-blue-600 px-1.5 py-0.5 text-[9px] font-bold text-white shadow">
                            適用中
                          </span>
                        )}
                        <button
                          type="button"
                          onClick={async (e) => {
                            e.stopPropagation();
                            if (!onDeleteBackground) return;
                            const confirmed =
                              await confirm("この背景画像を削除しますか？");
                            if (confirmed) {
                              onDeleteBackground(bg.id);
                            }
                          }}
                          className="absolute top-1 right-1 p-1 rounded bg-white/90 text-gray-500 hover:bg-red-500 hover:text-white opacity-70 group-hover:opacity-100 transition-all shadow-xs"
                          title="画像を削除"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="rounded border border-dashed border-gray-200 bg-gray-50 px-3 py-4 text-center text-[10px] text-gray-400">
                  このフォルダーに画像はありません
                </div>
              )}
            </div>
          </section>

          {/* 3. お気に入り環境カード（折りたたみ対応） */}
          <section className="rounded-lg border border-gray-200 bg-white overflow-hidden shadow-2xs">
            <div className="p-3 flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => setIsFavoritesOpen((prev) => !prev)}
                className="flex-1 flex items-center gap-1.5 text-left min-w-0"
              >
                <Star className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider truncate">
                  お気に入り ({favoriteEnvironments.length})
                </span>
                {matchingFavorite && (
                  <span className="text-[9px] font-semibold bg-blue-50 text-blue-700 border border-blue-200 px-1.5 py-0.5 rounded-full truncate max-w-[80px]">
                    {matchingFavorite.name}
                  </span>
                )}
                {isFavoritesOpen ? (
                  <ChevronUp className="w-3.5 h-3.5 text-gray-400 ml-auto shrink-0" />
                ) : (
                  <ChevronDown className="w-3.5 h-3.5 text-gray-400 ml-auto shrink-0" />
                )}
              </button>
              <button
                type="button"
                onClick={async () => {
                  const name = await prompt(
                    "現在の環境設定（端末・縦横）に名前を付けて保存します。",
                  );
                  if (name && name.trim() && onSaveEnvironment) {
                    onSaveEnvironment(name.trim());
                    setIsFavoritesOpen(true);
                  }
                }}
                className="inline-flex items-center gap-0.5 px-2 py-1 rounded border border-blue-200 bg-blue-50 text-[10px] font-semibold text-blue-700 hover:bg-blue-100 transition-colors shrink-0"
                title="現在の設定をお気に入りに保存"
              >
                <Plus className="w-3 h-3" />
                <span>保存</span>
              </button>
            </div>

            {isFavoritesOpen && (
              <div className="px-3 pb-3 pt-1 border-t border-gray-100">
                {favoriteEnvironments.length > 0 ? (
                  <div className="space-y-1 max-h-44 overflow-y-auto">
                    {favoriteEnvironments.map((env) => {
                      const isCurrentEnv =
                        env.modelId === selectedModelId &&
                        env.orientation === orientation;
                      return (
                        <div
                          key={env.id}
                          className={`flex items-center justify-between rounded border px-2 py-1.5 group transition-colors ${
                            isCurrentEnv
                              ? "bg-blue-50/70 border-blue-300"
                              : "bg-gray-50/60 border-gray-200 hover:border-blue-300 hover:bg-white"
                          }`}
                        >
                          <button
                            type="button"
                            className="flex-1 text-left text-xs text-gray-700 hover:text-blue-600 truncate flex items-center gap-1"
                            onClick={() => onLoadEnvironment?.(env)}
                            title={`読み込む: ${env.name}`}
                          >
                            {isCurrentEnv && (
                              <Check className="w-3 h-3 text-blue-600 shrink-0" />
                            )}
                            <span className="font-medium truncate">
                              {env.name}
                            </span>
                            <span className="text-[9px] text-gray-400 shrink-0">
                              ({env.orientation === "portrait" ? "縦" : "横"})
                            </span>
                          </button>
                          <div className="flex items-center space-x-0.5 opacity-60 group-hover:opacity-100 transition-opacity shrink-0 ml-1">
                            <button
                              type="button"
                              onClick={() => onOverwriteEnvironment?.(env.id)}
                              className="p-1 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                              title="現在の設定で上書き保存"
                            >
                              <Upload className="w-3 h-3" />
                            </button>
                            <button
                              type="button"
                              onClick={async () => {
                                const newName = await prompt(
                                  "新しい名前を入力してください:",
                                  env.name,
                                );
                                if (
                                  newName &&
                                  newName.trim() &&
                                  newName.trim() !== env.name &&
                                  onRenameEnvironment
                                ) {
                                  onRenameEnvironment(env.id, newName.trim());
                                }
                              }}
                              className="p-1 text-gray-500 hover:text-amber-600 hover:bg-amber-50 rounded transition-colors"
                              title="名前を変更"
                            >
                              <Edit2 className="w-3 h-3" />
                            </button>
                            <button
                              type="button"
                              onClick={async () => {
                                const confirmed = await confirm(
                                  `「${env.name}」を削除しますか？`,
                                );
                                if (confirmed && onDeleteEnvironment) {
                                  onDeleteEnvironment(env.id);
                                }
                              }}
                              className="p-1 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                              title="削除"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-[10px] text-gray-400 text-center py-2">
                    まだお気に入りがありません
                  </p>
                )}
              </div>
            )}
          </section>

          {/* 4. 書き出し設定カード */}
          <section className="rounded-lg border border-gray-200 bg-white p-3 space-y-2 shadow-2xs">
            <div className="flex items-center gap-1.5 text-[11px] font-bold text-gray-500 uppercase tracking-wider">
              <FileOutput className="w-3.5 h-3.5 text-gray-500" />
              <span>書き出し設定</span>
            </div>
            <div className="flex items-center justify-between gap-2">
              <label className="text-[11px] text-gray-600 font-medium whitespace-nowrap">
                拡張子
              </label>
              <select
                className="flex-1 min-w-0 text-xs border border-gray-300 rounded shadow-2xs focus:border-blue-500 py-1.5 pl-2 pr-6 bg-white"
                value={exportExtension}
                onChange={(e) => onExportExtensionChange?.(e.target.value)}
              >
                <option value=".voicecontrolcom">
                  .voicecontrolcom（短縮版）
                </option>
                <option value=".voicecontrolcommands">
                  .voicecontrolcommands（正式）
                </option>
              </select>
            </div>
          </section>
        </div>
        {/* End Environment Settings Tab */}
        {/* Action Settings Tab */}
        <div
          className={
            activeTab === "action"
              ? "h-full overflow-y-auto overflow-x-hidden px-4 py-3 space-y-6"
              : "hidden"
          }
        >
          {/* Selected Item Properties (Contextual) */}
          {(!selectionType || selectionType === "stroke") && (
            <div
              className={`space-y-4 ${!isActionSelected ? "opacity-50 pointer-events-none grayscale" : ""}`}
            >
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                  アクション設定
                </label>
                {isActionSelected && (
                  <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                )}
              </div>

              <div className="space-y-4">
                {/* Position and Nudge Controls */}
                <div className="flex items-center bg-gray-50 p-2 rounded border border-gray-200">
                  {/* Left: Position Info (直接数値入力対応) */}
                  <div className="flex flex-col justify-center space-y-2 pr-3 border-r border-gray-200 mr-3 w-[140px] shrink-0">
                    <div className="grid grid-cols-2 gap-x-2 gap-y-2">
                      <div className="min-w-0">
                        <span className="text-[10px] text-gray-400 block uppercase mb-0.5 truncate">
                          {isTap ? "タップ X" : "開始 X"}
                        </span>
                        <BufferedNumberInput
                          minVal={0}
                          maxVal={3000}
                          step="1"
                          value={startX !== undefined ? formatCoord(startX) : 0}
                          onChange={(val) =>
                            onCoordinateChange?.("start", "x", val)
                          }
                          format={(v) => Math.round(v).toString()}
                          className="w-14 text-xs font-mono text-gray-700 bg-white px-1.5 py-0.5 rounded border border-gray-200 focus:border-blue-500 outline-none transition-colors"
                        />
                      </div>
                      <div className={`min-w-0 ${isTap ? "opacity-40 pointer-events-none" : ""}`}>
                        <span className="text-[10px] text-gray-400 block uppercase mb-0.5 truncate">
                          終了 X
                        </span>
                        <BufferedNumberInput
                          minVal={0}
                          maxVal={3000}
                          step="1"
                          value={endX !== undefined ? formatCoord(endX) : 0}
                          onChange={(val) =>
                            onCoordinateChange?.("end", "x", val)
                          }
                          format={(v) => Math.round(v).toString()}
                          disabled={Boolean(isTap)}
                          className="w-14 text-xs font-mono text-gray-700 bg-white px-1.5 py-0.5 rounded border border-gray-200 focus:border-blue-500 outline-none transition-colors disabled:bg-gray-100"
                        />
                      </div>
                      <div className="min-w-0">
                        <span className="text-[10px] text-gray-400 block uppercase mb-0.5 truncate">
                          {isTap ? "タップ Y" : "開始 Y"}
                        </span>
                        <BufferedNumberInput
                          minVal={0}
                          maxVal={3000}
                          step="1"
                          value={startY !== undefined ? formatCoord(startY) : 0}
                          onChange={(val) =>
                            onCoordinateChange?.("start", "y", val)
                          }
                          format={(v) => Math.round(v).toString()}
                          className="w-14 text-xs font-mono text-gray-700 bg-white px-1.5 py-0.5 rounded border border-gray-200 focus:border-blue-500 outline-none transition-colors"
                        />
                      </div>
                      <div className={`min-w-0 ${isTap ? "opacity-40 pointer-events-none" : ""}`}>
                        <span className="text-[10px] text-gray-400 block uppercase mb-0.5 truncate">
                          終了 Y
                        </span>
                        <BufferedNumberInput
                          minVal={0}
                          maxVal={3000}
                          step="1"
                          value={endY !== undefined ? formatCoord(endY) : 0}
                          onChange={(val) =>
                            onCoordinateChange?.("end", "y", val)
                          }
                          format={(v) => Math.round(v).toString()}
                          disabled={Boolean(isTap)}
                          className="w-14 text-xs font-mono text-gray-700 bg-white px-1.5 py-0.5 rounded border border-gray-200 focus:border-blue-500 outline-none transition-colors disabled:bg-gray-100"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Right: Nudge Controls */}
                  <div className="flex-1 shrink-0 flex flex-col items-center justify-center">
                    <span className="text-[10px] text-gray-500 mb-1">
                      位置の微調整
                    </span>
                    <div className="grid grid-cols-3 gap-1">
                      <div />
                      <button
                        onPointerDown={() => startNudgePress(0, -1)}
                        onPointerUp={stopNudgePress}
                        onPointerLeave={stopNudgePress}
                        onContextMenu={(e) => e.preventDefault()}
                        className="p-1.5 bg-white border border-gray-300 rounded hover:bg-gray-50 active:bg-gray-100 touch-none select-none flex items-center justify-center transition-colors"
                      >
                        <ChevronUp className="w-4 h-4 text-gray-600" />
                      </button>
                      <div />
                      <button
                        onPointerDown={() => startNudgePress(-1, 0)}
                        onPointerUp={stopNudgePress}
                        onPointerLeave={stopNudgePress}
                        onContextMenu={(e) => e.preventDefault()}
                        className="p-1.5 bg-white border border-gray-300 rounded hover:bg-gray-50 active:bg-gray-100 touch-none select-none flex items-center justify-center transition-colors"
                      >
                        <ChevronLeft className="w-4 h-4 text-gray-600" />
                      </button>
                      <div className="w-7 h-7 flex items-center justify-center bg-gray-100 rounded-full text-[9px] font-bold text-gray-400 border border-gray-200 shadow-inner">
                        1px
                      </div>
                      <button
                        onPointerDown={() => startNudgePress(1, 0)}
                        onPointerUp={stopNudgePress}
                        onPointerLeave={stopNudgePress}
                        onContextMenu={(e) => e.preventDefault()}
                        className="p-1.5 bg-white border border-gray-300 rounded hover:bg-gray-50 active:bg-gray-100 touch-none select-none flex items-center justify-center transition-colors"
                      >
                        <ChevronRight className="w-4 h-4 text-gray-600" />
                      </button>
                      <div />
                      <button
                        onPointerDown={() => startNudgePress(0, 1)}
                        onPointerUp={stopNudgePress}
                        onPointerLeave={stopNudgePress}
                        onContextMenu={(e) => e.preventDefault()}
                        className="p-1.5 bg-white border border-gray-300 rounded hover:bg-gray-50 active:bg-gray-100 touch-none select-none flex items-center justify-center transition-colors"
                      >
                        <ChevronDown className="w-4 h-4 text-gray-600" />
                      </button>
                      <div />
                    </div>
                  </div>
                </div>

                {/* Action-specific Points Toggle (スワイプ線のみ表示) */}
                {!isTap && onToggleCommandPoints && (
                  <div>
                    <div className="flex justify-between mb-1 items-center">
                      <label className="text-xs font-medium text-gray-600">
                        開始/終了点 (このアクションのみ)
                      </label>
                    </div>
                    <div className="flex bg-gray-100 p-1 rounded-md">
                      <button
                        onClick={() =>
                          onToggleCommandPoints(
                            !(selectedCommandShowPoints ?? showPoints),
                          )
                        }
                        className={`w-full px-2 py-1.5 rounded-md text-[10px] font-medium border transition-colors ${(selectedCommandShowPoints ?? showPoints) ? "bg-purple-50 border-purple-200 text-purple-700" : "bg-white border-gray-300 text-gray-600"}`}
                      >
                        {(selectedCommandShowPoints ?? showPoints)
                          ? "表示中"
                          : "非表示"}
                      </button>
                    </div>
                  </div>
                )}

                {/* Duration */}
                <div>
                  <div className="flex justify-between mb-1 items-center">
                    <label className="text-xs font-medium text-gray-600">
                      {isTap ? "タップの持続時間" : "所要時間"}
                    </label>
                    <div className="flex items-center space-x-1">
                      <BufferedNumberInput
                        minVal={0.01}
                        maxVal={5.0}
                        step="0.01"
                        value={isTap ? (tapDuration ?? 0.05) : duration}
                        onChange={isTap ? (onTapDurationChange ?? onDurationChange) : onDurationChange}
                        format={(v) => Number(v).toFixed(2)}
                        className="w-16 text-xs font-mono bg-gray-100 px-1 py-0.5 rounded border border-transparent focus:border-blue-500 focus:bg-white text-right outline-none transition-colors"
                      />
                      <span className="text-xs text-gray-500">秒</span>
                    </div>
                  </div>
                  {/* --- 時間プリセット --- */}
                  <div className="flex space-x-1 mb-2">
                    {isTap ? (
                      <>
                        <button
                          onClick={() => onTapDurationChange?.(0.05)}
                          className="flex-1 py-1 px-1 border border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded text-[9px] font-medium transition-colors"
                        >
                          0.05s
                        </button>
                        <button
                          onClick={() => onTapDurationChange?.(0.1)}
                          className="flex-1 py-1 px-1 border border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded text-[9px] font-medium transition-colors"
                        >
                          0.10s
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => onDurationChange(0.2)}
                          className="flex-1 py-1 px-1 border border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded text-[9px] font-medium transition-colors"
                          title="ゲージなし"
                        >
                          0.20s
                        </button>
                        <button
                          onClick={() => onDurationChange(0.4)}
                          className="flex-1 py-1 px-1 border border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded text-[9px] font-medium transition-colors"
                        >
                          0.40s
                        </button>
                      </>
                    )}
                  </div>
                  {/* ---------------------------------- */}
                  <input
                    type="range"
                    min="0.01"
                    max={isTap ? "1.0" : "5.0"}
                    step="0.01"
                    value={isTap ? (tapDuration ?? 0.05) : duration}
                    onPointerDown={handleSliderPointerDown}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value);
                      const shouldSave = consumeSliderSaveHistory();
                      if (isTap) {
                        onTapDurationChange?.(val, shouldSave);
                      } else {
                        onDurationChange(val, shouldSave);
                      }
                    }}
                    className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                  />
                </div>

                {/* スワイプ専用プロパティ（回転・スケール・カーブ） */}
                {!isTap && (
                  <>
                    {/* Angle */}
                    <div>
                      <div className="flex justify-between mb-1 items-center">
                        <label className="text-xs font-medium text-gray-600">
                          回転
                        </label>
                        <div className="flex items-center space-x-2">
                          <div className="flex items-center space-x-1">
                            <BufferedNumberInput
                              minVal={0}
                              maxVal={1024}
                              step="1"
                              value={angle}
                              onChange={onAngleChange}
                              format={(v) => Math.round(v).toString()}
                              className="w-12 text-xs font-mono bg-gray-100 px-1 py-0.5 rounded border border-transparent focus:border-purple-500 focus:bg-white text-right outline-none transition-colors"
                            />
                            <span className="text-[10px] text-gray-400">/1024</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <BufferedNumberInput
                              minVal={0}
                              maxVal={360}
                              step="0.1"
                              value={(angle / 1024) * 360}
                              onChange={(deg) => onAngleChange((deg / 360) * 1024)}
                              format={(v) => Number(v).toFixed(1)}
                              className="w-20 text-xs font-mono bg-gray-100 px-1 py-0.5 rounded border border-transparent focus:border-purple-500 focus:bg-white text-right outline-none transition-colors"
                            />
                            <span className="text-xs text-gray-500">°</span>
                          </div>
                        </div>
                      </div>

                      {/* 回転方向の微調整ボタン */}
                      <div className="flex justify-between items-center mb-1 mt-1">
                        <button
                          onPointerDown={() => startPress(-1)}
                          onPointerUp={stopPress}
                          onPointerLeave={stopPress}
                          onContextMenu={(e) => e.preventDefault()}
                          className="p-1 px-2 flex items-center bg-white border border-gray-300 rounded hover:bg-gray-50 active:bg-gray-100 text-[10px] text-gray-600 transition-colors shadow-sm select-none"
                          title="時計回り (-1)"
                        >
                          <svg
                            className="w-3.5 h-3.5 mr-1 text-purple-500"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M21 10h-10a8 8 0 00-8 8v2M21 10l-6 6m6-6l-6-6"
                            />
                          </svg>
                          -1
                        </button>
                        <button
                          onPointerDown={() => startPress(1)}
                          onPointerUp={stopPress}
                          onPointerLeave={stopPress}
                          onContextMenu={(e) => e.preventDefault()}
                          className="p-1 px-2 flex items-center bg-white border border-gray-300 rounded hover:bg-gray-50 active:bg-gray-100 text-[10px] text-gray-600 transition-colors shadow-sm select-none"
                          title="反時計回り (+1)"
                        >
                          +1
                          <svg
                            className="w-3.5 h-3.5 ml-1 text-purple-500"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"
                            />
                          </svg>
                        </button>
                      </div>

                      {/* 角度プリセット */}
                      <div className="grid grid-cols-4 gap-1 mb-2">
                        <button
                          onClick={() => onAngleChange(256)}
                          className="py-1 border border-purple-200 bg-purple-50 text-purple-700 hover:bg-purple-100 rounded text-[10px] font-medium flex items-center justify-center transition-colors"
                        >
                          ↑ (256)
                        </button>
                        <button
                          onClick={() => onAngleChange(768)}
                          className="py-1 border border-purple-200 bg-purple-50 text-purple-700 hover:bg-purple-100 rounded text-[10px] font-medium flex items-center justify-center transition-colors"
                        >
                          ↓ (768)
                        </button>
                        <button
                          onClick={() => onAngleChange(512)}
                          className="py-1 border border-purple-200 bg-purple-50 text-purple-700 hover:bg-purple-100 rounded text-[10px] font-medium flex items-center justify-center transition-colors"
                        >
                          ← (512)
                        </button>
                        <button
                          onClick={() => onAngleChange(0)}
                          className="py-1 border border-purple-200 bg-purple-50 text-purple-700 hover:bg-purple-100 rounded text-[10px] font-medium flex items-center justify-center transition-colors"
                        >
                          → (0)
                        </button>
                      </div>

                      <input
                        type="range"
                        min="0"
                        max="1024"
                        step="1"
                        value={angle}
                        onPointerDown={handleSliderPointerDown}
                        onChange={(e) =>
                          onAngleChange(
                            parseFloat(e.target.value),
                            consumeSliderSaveHistory(),
                          )
                        }
                        className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
                      />
                      {/* 左右反転 / 上下反転 ボタン */}
                      <div className="flex space-x-2 mt-2">
                        <button
                          onClick={() => onFlip?.("horizontal")}
                          className="w-full flex items-center justify-center py-2 border border-blue-200 shadow-sm text-[10px] font-medium rounded-md text-blue-700 bg-blue-50 hover:bg-blue-100 transition-colors"
                        >
                          <svg
                            className="w-3.5 h-3.5 mr-1"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
                            />
                          </svg>
                          左右反転
                        </button>
                        <button
                          onClick={() => onFlip?.("vertical")}
                          className="w-full flex items-center justify-center py-2 border border-blue-200 shadow-sm text-[10px] font-medium rounded-md text-blue-700 bg-blue-50 hover:bg-blue-100 transition-colors"
                        >
                          <svg
                            className="w-3.5 h-3.5 mr-1"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"
                            />
                          </svg>
                          上下反転
                        </button>
                      </div>

                      {onFlipAngle && (
                        <button
                          onClick={onFlipAngle}
                          className="w-full mt-2 flex items-center justify-center px-4 py-1.5 border border-purple-200 shadow-sm text-[10px] font-medium rounded-md text-purple-700 bg-purple-50 hover:bg-purple-100 transition-colors"
                        >
                          ↑↓ 角度を反転する
                        </button>
                      )}
                    </div>

                    {/* Length (Scale) */}
                    <div>
                      <div className="flex justify-between mb-1 items-center">
                        <label className="text-xs font-medium text-gray-600">
                          スケール / 長さ
                        </label>
                        <div className="flex items-center space-x-1">
                          <BufferedNumberInput
                            minVal={10}
                            maxVal={1000}
                            step="1"
                            value={length}
                            onChange={onLengthChange}
                            format={(v) => Math.round(v).toString()}
                            className="w-14 text-xs font-mono bg-gray-100 px-1 py-0.5 rounded border border-transparent focus:border-green-500 focus:bg-white text-right outline-none transition-colors"
                          />
                          <span className="text-xs text-gray-500">px</span>
                        </div>
                      </div>
                      <div className="flex space-x-2 mb-2">
                        <button
                          onClick={() => onLengthChange(170)}
                          className="flex-1 py-1 px-2 border border-green-200 bg-green-50 text-green-700 hover:bg-green-100 rounded text-[10px] font-medium transition-colors"
                        >
                          170px に揃える
                        </button>
                      </div>
                      <input
                        type="range"
                        min="10"
                        max="1000"
                        step="10"
                        value={length || 100}
                        onPointerDown={handleSliderPointerDown}
                        onChange={(e) =>
                          onLengthChange(
                            parseFloat(e.target.value),
                            consumeSliderSaveHistory(),
                          )
                        }
                        className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-green-600"
                      />
                    </div>

                    {/* Curve Adjustment Slider & Shape Presets */}
                    <div>
                      <div className="flex justify-between mb-1 items-center">
                        <label className="text-xs font-medium text-gray-600">
                          カーブ（曲線）
                        </label>
                        <span className="text-xs font-mono text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded">
                          {Math.round((curveRatio ?? 0) * 100)}%
                        </span>
                      </div>
                      <input
                        type="range"
                        min="-0.6"
                        max="0.6"
                        step="0.02"
                        value={curveRatio ?? 0}
                        onPointerDown={handleSliderPointerDown}
                        onChange={(e) =>
                          onCurveChange?.(
                            parseFloat(e.target.value),
                            consumeSliderSaveHistory(),
                          )
                        }
                        className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                      />
                      <div className="flex justify-between text-[9px] text-gray-400 font-mono mt-0.5 mb-2">
                        <span>左カーブ</span>
                        <span>直線 (0%)</span>
                        <span>右カーブ</span>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={onStraight}
                          className="flex items-center justify-center px-2 py-1.5 border border-gray-300 shadow-sm text-[11px] font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                        >
                          直線に戻す
                        </button>
                        <button
                          onClick={onCurve}
                          className="flex items-center justify-center px-2 py-1.5 border border-indigo-200 shadow-sm text-[11px] font-medium rounded-md text-indigo-700 bg-indigo-50 hover:bg-indigo-100 transition-colors"
                        >
                          ランダムカーブ
                        </button>
                      </div>
                    </div>
                  </>
                )}

                {/* Delete Action */}
                <div className="pt-2">
                  <button
                    onClick={onDeleteSelectedAction}
                    className="w-full flex items-center justify-center px-4 py-2 border border-red-200 shadow-sm text-xs font-medium rounded-md text-red-600 bg-white hover:bg-red-50 transition-colors"
                  >
                    <svg
                      className="w-4 h-4 mr-2"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                    アクションを削除
                  </button>
                </div>
              </div>
            </div>
            )}

          {selectionType === "wait" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                  待機設定
                </label>
                <span className="text-[10px] text-white bg-blue-500 px-2 py-0.5 rounded-full font-bold">
                  選択中
                </span>
              </div>
              <div className="bg-blue-50 p-4 rounded-md border border-blue-100">
                <label className="block text-xs font-semibold text-blue-900 mb-2">
                  待機時間
                </label>
                <div className="flex items-center space-x-2">
                  <BufferedNumberInput
                    minVal={0.0}
                    step="0.01"
                    value={selectedStrokeWait ?? waitDuration ?? 0.1}
                    onChange={(val) => {
                      if (selectionType === "wait") {
                        onSelectedStrokeWaitChange?.(val);
                      } else {
                        onWaitDurationChange?.(val);
                      }
                    }}
                    format={(v) => Number(v).toFixed(2)}
                    className="w-full text-sm border-blue-200 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                  <span className="text-xs text-blue-700 font-medium whitespace-nowrap">
                    秒
                  </span>
                </div>
                {/* 待機時間スライダーを追加 */}
                <div className="mt-4">
                  <input
                    type="range"
                    min="0.00"
                    max="5.00"
                    step="0.05"
                    value={selectedStrokeWait ?? waitDuration ?? 0.1}
                    onPointerDown={handleSliderPointerDown}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value);
                      const shouldSave = consumeSliderSaveHistory();
                      if (selectionType === "wait") {
                        onSelectedStrokeWaitChange?.(val, shouldSave);
                      } else {
                        onWaitDurationChange?.(val, shouldSave);
                      }
                    }}
                    className="w-full h-1.5 bg-blue-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                  />
                  <div className="flex justify-between mt-1">
                    <span className="text-[9px] text-blue-400 font-mono">0.0s</span>
                    <span className="text-[9px] text-blue-400 font-mono">5.0s</span>
                  </div>
                </div>
                <div className="flex justify-end space-x-1 mt-2">
                  <button
                    onClick={() => {
                      const val = 0.05;
                      if (selectionType === "wait")
                        onSelectedStrokeWaitChange?.(val);
                      else onWaitDurationChange?.(val);
                    }}
                    className="px-2 py-1 text-[10px] bg-white hover:bg-blue-100 rounded text-blue-600 border border-blue-200"
                  >
                    0.05秒
                  </button>
                  <button
                    onClick={() => {
                      const val = 0.1;
                      if (selectionType === "wait")
                        onSelectedStrokeWaitChange?.(val);
                      else onWaitDurationChange?.(val);
                    }}
                    className="px-2 py-1 text-[10px] bg-white hover:bg-blue-100 rounded text-blue-600 border border-blue-200"
                  >
                    デフォルト (0.1秒)
                  </button>
                </div>

                <div className="mt-4 pt-4 border-t border-blue-100">
                  <button
                    onClick={() => {
                      const currentVal = selectedStrokeWait ?? waitDuration ?? 0.1;
                      onApplyWaitToAll?.(currentVal);
                    }}
                    className="w-full flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-md text-xs font-bold hover:bg-blue-700 transition shadow-sm"
                    title="このコマンド内のすべての待機時間を現在の値に揃えます"
                  >
                    🚀 このコマンド内すべてに適用
                  </button>
                  <p className="text-[10px] text-blue-500 mt-2 text-center leading-relaxed">
                    ※ コマンド内の全アクションの個別に設定された待機時間を上書きし、現在の値（{Number(selectedStrokeWait ?? waitDuration ?? 0.1).toFixed(2)}s）に統一します。
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
        {/* End Action Settings Tab */}
      </div>

      {/* Bottom Static Section: Export */}
      <div className="p-3 border-t border-gray-200 bg-gray-50 shrink-0">
        <button
          onClick={onExport}
          className="w-full flex items-center justify-center px-3 py-2 border border-transparent rounded shadow-sm text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4 mr-1.5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
            />
          </svg>
          このコマンドを書き出す
        </button>
      </div>
    </div>
  );
};

export default ControlPanel;
