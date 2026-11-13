import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Folder,
  FolderPlus,
  Image as ImageIcon,
  Upload,
  Trash2,
  Edit2,
  Check,
  X,
  Ban,
} from "lucide-react";
import type { BackgroundImage } from "../api";
import { useDialog } from "../contexts/DialogContext";
import {
  buildBackgroundFolderItems,
  filterBackgroundsByFolder,
  getFolderGroupNameFromKey,
} from "../utils/backgroundFolders";

interface BackgroundLibraryModalProps {
  isOpen: boolean;
  onClose: () => void;
  backgroundsList: BackgroundImage[];
  backgroundFolders: string[];
  selectedBackgroundImageUrl?: string | null;
  onBackgroundImageUpload: (
    files: FileList,
    groupName?: string | null,
  ) => void;
  onBackgroundImageSelect: (url: string) => void;
  onClearBackgroundImage: () => void;
  onDeleteBackground: (id: string) => void;
  onUpdateBackgroundGroup: (id: string, groupName: string | null) => void;
  onCreateBackgroundFolder: (folderName: string) => void;
  onRenameBackgroundFolder: (currentName: string, nextName: string) => void;
  onDeleteBackgroundFolder: (folderName: string) => void;
}

/**
 * 広い画面で背景スクリーンショットの確認・アップロード・フォルダー整理を行えるライブラリモーダル。
 */
export const BackgroundLibraryModal: React.FC<BackgroundLibraryModalProps> = ({
  isOpen,
  onClose,
  backgroundsList,
  backgroundFolders,
  selectedBackgroundImageUrl,
  onBackgroundImageUpload,
  onBackgroundImageSelect,
  onClearBackgroundImage,
  onDeleteBackground,
  onUpdateBackgroundGroup,
  onCreateBackgroundFolder,
  onRenameBackgroundFolder,
  onDeleteBackgroundFolder,
}) => {
  const { confirm, prompt } = useDialog();
  const [selectedFolderKey, setSelectedFolderKey] = useState<string>("__all__");
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const folderItems = useMemo(
    () => buildBackgroundFolderItems(backgroundFolders, backgroundsList),
    [backgroundFolders, backgroundsList],
  );

  // 表示中のフォルダーが削除された場合は「すべて」へ戻す
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

  const selectedFolder = folderItems.find(
    (item) => item.key === selectedFolderKey,
  );
  const activeUploadGroup = getFolderGroupNameFromKey(selectedFolderKey);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleDropFiles = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onBackgroundImageUpload(e.dataTransfer.files, activeUploadGroup);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[99980] flex items-center justify-center bg-black/50 backdrop-blur-sm p-3 sm:p-6"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl border border-gray-200 max-w-5xl w-full h-[85vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-gray-200 bg-gray-50 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2 min-w-0">
            <ImageIcon className="w-5 h-5 text-blue-600 shrink-0" />
            <div className="min-w-0">
              <h2 className="text-sm font-bold text-gray-800 truncate">
                背景画像ライブラリ
              </h2>
              <p className="text-[11px] text-gray-500 truncate">
                クリックで背景に設定・ドラッグ＆ドロップで「
                {activeUploadGroup ?? "未分類"}」に追加できます
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {selectedBackgroundImageUrl && (
              <button
                type="button"
                onClick={onClearBackgroundImage}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-gray-300 bg-white text-xs font-medium text-gray-600 hover:text-red-600 hover:border-red-300 hover:bg-red-50 transition-colors"
              >
                <Ban className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">背景を解除</span>
              </button>
            )}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 transition-colors shadow-sm"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>画像を追加</span>
            </button>
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
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-200/70 rounded-lg transition-colors"
              title="閉じる (Esc)"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 min-h-0 flex flex-col md:flex-row overflow-hidden">
          {/* Left Folder Sidebar */}
          <div className="w-full md:w-56 border-b md:border-b-0 md:border-r border-gray-200 bg-gray-50/70 p-3 flex flex-col shrink-0">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                フォルダー
              </span>
              <button
                type="button"
                onClick={async () => {
                  const name = await prompt("新しいフォルダー名を入力してください:");
                  if (name && name.trim()) {
                    onCreateBackgroundFolder(name.trim());
                    setSelectedFolderKey(`folder:${name.trim()}`);
                  }
                }}
                className="inline-flex items-center gap-1 rounded-md border border-gray-200 bg-white px-2 py-1 text-[11px] font-medium text-gray-600 hover:border-blue-300 hover:text-blue-600 transition-colors"
                title="新しいフォルダーを作成"
              >
                <FolderPlus className="w-3.5 h-3.5" />
                <span>新規</span>
              </button>
            </div>

            <div className="flex md:flex-col gap-1 overflow-x-auto md:overflow-y-auto md:flex-1 pb-1 md:pb-0">
              {folderItems.map((folder) => {
                const isSelected = selectedFolderKey === folder.key;
                return (
                  <button
                    key={folder.key}
                    type="button"
                    onClick={() => setSelectedFolderKey(folder.key)}
                    className={`flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-lg text-xs transition-colors shrink-0 md:w-full ${
                      isSelected
                        ? "bg-blue-600 text-white font-semibold shadow-sm"
                        : "text-gray-700 hover:bg-gray-200/60"
                    }`}
                  >
                    <span className="flex items-center gap-1.5 min-w-0">
                      <Folder
                        className={`w-3.5 h-3.5 shrink-0 ${
                          isSelected ? "text-blue-100" : "text-gray-400"
                        }`}
                      />
                      <span className="truncate">{folder.label}</span>
                    </span>
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded-full font-mono ${
                        isSelected
                          ? "bg-blue-500 text-white"
                          : "bg-gray-200/80 text-gray-600"
                      }`}
                    >
                      {folder.count}
                    </span>
                  </button>
                );
              })}
            </div>

            {selectedFolder?.name && (
              <div className="mt-2 pt-2 border-t border-gray-200 flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={async () => {
                    if (!selectedFolder.name) return;
                    const name = await prompt(
                      "新しいフォルダー名を入力してください:",
                      selectedFolder.name,
                    );
                    if (!name || !name.trim()) return;
                    await onRenameBackgroundFolder(
                      selectedFolder.name,
                      name.trim(),
                    );
                    setSelectedFolderKey(`folder:${name.trim()}`);
                  }}
                  className="flex-1 flex items-center justify-center gap-1 rounded-md border border-gray-200 bg-white py-1.5 text-[11px] text-gray-600 hover:border-amber-300 hover:text-amber-600 transition-colors"
                >
                  <Edit2 className="w-3 h-3" />
                  <span>名前変更</span>
                </button>
                <button
                  type="button"
                  onClick={async () => {
                    if (!selectedFolder.name) return;
                    const confirmed = await confirm(
                      `フォルダー「${selectedFolder.name}」を削除しますか？\n画像は未分類に移動されます。`,
                    );
                    if (!confirmed) return;
                    await onDeleteBackgroundFolder(selectedFolder.name);
                    setSelectedFolderKey("__ungrouped__");
                  }}
                  className="flex-1 flex items-center justify-center gap-1 rounded-md border border-gray-200 bg-white py-1.5 text-[11px] text-gray-600 hover:border-red-300 hover:text-red-600 transition-colors"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>削除</span>
                </button>
              </div>
            )}
          </div>

          {/* Right Image Grid & Drop Area */}
          <div
            className={`flex-1 min-h-0 overflow-y-auto p-4 sm:p-5 transition-colors ${
              isDragOver ? "bg-blue-50/70 ring-2 ring-inset ring-blue-400" : "bg-white"
            }`}
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragOver(true);
            }}
            onDragLeave={(e) => {
              e.preventDefault();
              setIsDragOver(false);
            }}
            onDrop={handleDropFiles}
          >
            {visibleBackgrounds.length === 0 ? (
              <div className="h-full min-h-[240px] border-2 border-dashed border-gray-200 rounded-xl flex flex-col items-center justify-center text-center p-6 bg-gray-50/50">
                <ImageIcon className="w-10 h-10 text-gray-300 mb-3" />
                <p className="text-sm font-medium text-gray-600 mb-1">
                  このフォルダーに背景画像はありません
                </p>
                <p className="text-xs text-gray-400 mb-4">
                  スクリーンショットをここへドラッグ＆ドロップ、またはボタンから追加できます
                </p>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-blue-200 bg-blue-50 text-xs font-semibold text-blue-700 hover:bg-blue-100 transition-colors"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>画像を選択して追加</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {visibleBackgrounds.map((bg) => {
                  const isActive = selectedBackgroundImageUrl === bg.url;
                  return (
                    <div
                      key={bg.id}
                      className={`group rounded-xl border overflow-hidden flex flex-col transition-all bg-white shadow-sm ${
                        isActive
                          ? "border-blue-500 ring-2 ring-blue-200 shadow-md"
                          : "border-gray-200 hover:border-blue-300 hover:shadow"
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() => onBackgroundImageSelect(bg.url)}
                        className="relative aspect-[3/4] w-full bg-slate-100 p-2 flex items-center justify-center overflow-hidden"
                        title="クリックしてキャンバスの背景に設定"
                      >
                        <img
                          src={bg.url}
                          alt="背景画像"
                          className="max-w-full max-h-full object-contain rounded shadow-xs"
                        />
                        {isActive && (
                          <span className="absolute left-2 top-2 inline-flex items-center gap-1 rounded-full bg-blue-600 px-2 py-0.5 text-[10px] font-bold text-white shadow">
                            <Check className="w-3 h-3" />
                            適用中
                          </span>
                        )}
                      </button>

                      {/* Card Footer: Folder Move & Delete */}
                      <div className="p-2 border-t border-gray-100 bg-gray-50/70 flex items-center gap-1.5">
                        <select
                          value={bg.groupName?.trim() || ""}
                          onChange={(e) =>
                            onUpdateBackgroundGroup(
                              bg.id,
                              e.target.value || null,
                            )
                          }
                          className="flex-1 min-w-0 rounded border border-gray-200 bg-white px-1.5 py-1 text-[11px] text-gray-700 focus:border-blue-400 focus:outline-none"
                          title="フォルダーを移動"
                        >
                          <option value="">未分類</option>
                          {folderNameOptions.map((name) => (
                            <option key={name} value={name}>
                              {name}
                            </option>
                          ))}
                        </select>
                        <button
                          type="button"
                          onClick={async () => {
                            const confirmed = await confirm(
                              "この背景画像を削除しますか？",
                            );
                            if (confirmed) {
                              onDeleteBackground(bg.id);
                            }
                          }}
                          className="p-1.5 rounded border border-gray-200 bg-white text-gray-400 hover:text-red-600 hover:border-red-200 hover:bg-red-50 transition-colors shrink-0"
                          title="画像を削除"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-gray-200 bg-gray-50 flex items-center justify-between shrink-0 text-xs">
          <span className="text-gray-500">
            表示中: {visibleBackgrounds.length} 件（全 {backgroundsList.length}{" "}
            件）
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-gray-800 text-white font-semibold hover:bg-gray-900 transition-colors"
          >
            閉じる
          </button>
        </div>
      </div>
    </div>
  );
};

export default BackgroundLibraryModal;

