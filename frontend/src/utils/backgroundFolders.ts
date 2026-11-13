import type { BackgroundImage } from "../api";

export interface BackgroundFolderItem {
  key: string;
  name: string | null;
  label: string;
  count: number;
}

/**
 * 背景フォルダー名配列と画像一覧から、表示用のフォルダー項目（枚数付き）を生成する。
 */
export function buildBackgroundFolderItems(
  backgroundFolders: string[],
  backgroundsList: BackgroundImage[],
): BackgroundFolderItem[] {
  const normalizedFolders = Array.from(
    new Set(
      backgroundFolders
        .map((name) => name.trim())
        .filter((name) => name.length > 0),
    ),
  );

  const countMap = new Map<string, number>();
  backgroundsList.forEach((bg) => {
    const key = bg.groupName?.trim() || "";
    countMap.set(key, (countMap.get(key) || 0) + 1);
  });

  const items: BackgroundFolderItem[] = [
    {
      key: "__all__",
      name: null,
      label: "すべて",
      count: backgroundsList.length,
    },
    {
      key: "__ungrouped__",
      name: null,
      label: "未分類",
      count: countMap.get("") || 0,
    },
  ];

  normalizedFolders.forEach((name) => {
    items.push({
      key: `folder:${name}`,
      name,
      label: name,
      count: countMap.get(name) || 0,
    });
  });

  // 画像にのみ存在し、フォルダー配列にない名前も補完する
  Array.from(countMap.keys())
    .filter((key) => key.length > 0 && !normalizedFolders.includes(key))
    .forEach((name) => {
      items.push({
        key: `folder:${name}`,
        name,
        label: name,
        count: countMap.get(name) || 0,
      });
    });

  return items;
}

/**
 * 選択中のフォルダーキーに応じて背景画像一覧を絞り込む。
 */
export function filterBackgroundsByFolder(
  backgroundsList: BackgroundImage[],
  folderKey: string,
): BackgroundImage[] {
  if (folderKey === "__all__") return backgroundsList;
  if (folderKey === "__ungrouped__") {
    return backgroundsList.filter((bg) => !bg.groupName?.trim());
  }
  if (folderKey.startsWith("folder:")) {
    const folderName = folderKey.slice("folder:".length);
    return backgroundsList.filter(
      (bg) => (bg.groupName?.trim() || "") === folderName,
    );
  }
  return backgroundsList;
}

/**
 * フォルダーキーから実際のグループ名を取得する（「すべて」「未分類」の場合は null）。
 */
export function getFolderGroupNameFromKey(folderKey: string): string | null {
  if (!folderKey.startsWith("folder:")) return null;
  const name = folderKey.slice("folder:".length).trim();
  return name.length > 0 ? name : null;
}

