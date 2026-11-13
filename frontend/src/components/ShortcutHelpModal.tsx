import React, { useEffect } from "react";
import { X, Keyboard, MousePointerClick } from "lucide-react";

interface ShortcutHelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const KEYBOARD_SHORTCUTS = [
  { keys: ["Cmd / Ctrl", "S"], desc: "プロジェクトを上書き保存" },
  { keys: ["Cmd / Ctrl", "Z"], desc: "直前の操作を元に戻す (Undo)" },
  { keys: ["Cmd / Ctrl", "Shift", "Z"], desc: "操作をやり直す (Redo)" },
  { keys: ["Cmd / Ctrl", "C"], desc: "選択中のアクション／コマンドをコピー" },
  { keys: ["Cmd / Ctrl", "V"], desc: "コピーしたアクション／コマンドを貼り付け" },
  { keys: ["Cmd / Ctrl", "D"], desc: "選択中のアクション／コマンドを複製" },
  { keys: ["Delete / Backspace"], desc: "選択中のアクションを削除" },
  { keys: ["Space"], desc: "ジェスチャーを再生 / 停止" },
  { keys: ["↑ ↓ ← →"], desc: "位置を 1px ずつ微調整" },
  { keys: ["Shift", "↑ ↓ ← →"], desc: "位置を 10px ずつ移動" },
  { keys: ["?"], desc: "この操作ガイドを開く" },
];

const CANVAS_OPERATIONS = [
  { keys: ["Shift", "クリック"], desc: "クリック位置にタップを直接追加" },
  { keys: ["Shift", "ドラッグ"], desc: "始点から終点へスワイプ線を直接描画" },
  { keys: ["点線バッジをクリック"], desc: "アクション間の待機時間を編集" },
  { keys: ["ドラッグ（空白部分）"], desc: "キャンバス表示位置を移動（パン）" },
  { keys: ["ピンチ / Ctrl + ホイール"], desc: "カーソル位置を中心に拡大・縮小" },
];

/**
 * キーボードショートカットおよびキャンバス操作のヘルプモーダル。
 */
export const ShortcutHelpModal: React.FC<ShortcutHelpModalProps> = ({
  isOpen,
  onClose,
}) => {
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

  return (
    <div
      className="fixed inset-0 z-[99990] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl shadow-2xl border border-gray-200 max-w-2xl w-full max-h-[85vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-5 py-3.5 border-b border-gray-200 flex items-center justify-between bg-gray-50">
          <div className="flex items-center space-x-2">
            <Keyboard className="w-4 h-4 text-blue-600" />
            <h2 className="text-sm font-bold text-gray-800">
              ショートカット＆操作ガイド
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-200/70 rounded-md transition-colors"
            title="閉じる"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 overflow-y-auto grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
          <div>
            <h3 className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <Keyboard className="w-3.5 h-3.5 text-blue-500" />
              キーボードショートカット
            </h3>
            <div className="space-y-2">
              {KEYBOARD_SHORTCUTS.map((item) => (
                <div
                  key={item.desc}
                  className="flex items-center justify-between gap-2 py-1.5 border-b border-gray-100 last:border-b-0"
                >
                  <span className="text-gray-700">{item.desc}</span>
                  <div className="flex items-center gap-1 shrink-0">
                    {item.keys.map((k) => (
                      <kbd
                        key={k}
                        className="px-1.5 py-0.5 bg-gray-100 border border-gray-300 rounded text-[10px] font-mono text-gray-700 shadow-[0_1px_0_rgba(0,0,0,0.08)]"
                      >
                        {k}
                      </kbd>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <MousePointerClick className="w-3.5 h-3.5 text-purple-500" />
              キャンバス操作
            </h3>
            <div className="space-y-2">
              {CANVAS_OPERATIONS.map((item) => (
                <div
                  key={item.desc}
                  className="flex items-center justify-between gap-2 py-1.5 border-b border-gray-100 last:border-b-0"
                >
                  <span className="text-gray-700">{item.desc}</span>
                  <div className="flex items-center gap-1 shrink-0">
                    {item.keys.map((k) => (
                      <kbd
                        key={k}
                        className="px-1.5 py-0.5 bg-blue-50 border border-blue-200 rounded text-[10px] font-mono text-blue-700"
                      >
                        {k}
                      </kbd>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShortcutHelpModal;

