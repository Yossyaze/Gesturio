/**
 * ジェスチャー軌跡（ストローク座標群）の幾何学計算・変形ユーティリティ。
 */

import type { Point } from "../api";
import { isTapStroke } from "./parser";

/**
 * 所要時間（秒）に合わせてパスを60fps基準のポイント数にリサンプリング（再分割）する。
 */
export function resamplePath(points: Point[], dur: number): Point[] {
  if (points.length === 0) return [];
  // targetCount = (所要時間 * 60フレーム) + 1 (始点分)
  // これにより、最後の点がちょうど dur 秒の地点になる
  const targetCount = Math.max(2, Math.round(dur * 60) + 1);
  if (points.length === 1 || isTapStroke(points)) {
    return Array(targetCount).fill(points[0]);
  }
  if (points.length === 2) {
    const start = points[0];
    const end = points[1];
    const newPoints: Point[] = [];
    for (let i = 0; i < targetCount; i++) {
      const t = i / (targetCount - 1);
      newPoints.push({
        x: start.x + (end.x - start.x) * t,
        y: start.y + (end.y - start.y) * t,
      });
    }
    return newPoints;
  }

  // 3点以上の複雑なパスの距離ベース再分割
  let totalLength = 0;
  const segmentLengths: number[] = [];
  for (let i = 0; i < points.length - 1; i++) {
    const dx = points[i + 1].x - points[i].x;
    const dy = points[i + 1].y - points[i].y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    segmentLengths.push(dist);
    totalLength += dist;
  }
  if (totalLength === 0) return Array(targetCount).fill(points[0]);

  const newPoints: Point[] = [points[0]];
  const step = totalLength / (targetCount - 1);
  let currentDist = 0;
  let currentSegmentIndex = 0;

  for (let i = 1; i < targetCount - 1; i++) {
    const targetDist = i * step;
    while (
      currentSegmentIndex < segmentLengths.length &&
      currentDist + segmentLengths[currentSegmentIndex] < targetDist
    ) {
      currentDist += segmentLengths[currentSegmentIndex];
      currentSegmentIndex++;
    }
    if (currentSegmentIndex >= segmentLengths.length) {
      newPoints.push(points[points.length - 1]);
      continue;
    }
    const segmentStart = points[currentSegmentIndex];
    const segmentEnd = points[currentSegmentIndex + 1];
    const segmentLen = segmentLengths[currentSegmentIndex];
    const distInSegment = targetDist - currentDist;
    const t = segmentLen > 0 ? distInSegment / segmentLen : 0;
    newPoints.push({
      x: segmentStart.x + (segmentEnd.x - segmentStart.x) * t,
      y: segmentStart.y + (segmentEnd.y - segmentStart.y) * t,
    });
  }
  // 最後に必ず終点を追加
  newPoints.push(points[points.length - 1]);
  return newPoints;
}

/**
 * 始点から終点への角度を 0〜1023（1024分割）の整数値で計算する。
 */
export function calculateAngle(points: Point[]): number {
  if (points.length < 2) return 0;
  const start = points[0];
  const end = points[points.length - 1];
  const dx = end.x - start.x;
  const dy = end.y - start.y;
  let angleRad = Math.atan2(dy, dx);
  if (angleRad < 0) angleRad += 2 * Math.PI;
  return Math.round((angleRad / (2 * Math.PI)) * 1024) % 1024;
}

/**
 * 始点と終点の直線距離（px）を計算する。
 */
export function calculateLength(points: Point[]): number {
  if (points.length < 2) return 0;
  const start = points[0];
  const end = points[points.length - 1];
  return Math.sqrt(
    Math.pow(end.x - start.x, 2) + Math.pow(end.y - start.y, 2),
  );
}

/**
 * 終点を軸（ピボット）として、ストローク全体を指定した角度（0〜1024）へ回転させる。
 */
export function rotateStrokePoints(points: Point[], newAngleRaw: number): Point[] {
  if (points.length < 2) return points;

  const currentAngleRaw = calculateAngle(points);
  const diffRaw = newAngleRaw - currentAngleRaw;
  const diffRad = (diffRaw / 1024) * 2 * Math.PI;

  const end = points[points.length - 1];
  const pivot = { x: end.x, y: end.y };

  const cos = Math.cos(diffRad);
  const sin = Math.sin(diffRad);

  return points.map((p) => {
    const dx = p.x - pivot.x;
    const dy = p.y - pivot.y;
    return {
      x: pivot.x + (dx * cos - dy * sin),
      y: pivot.y + (dx * sin + dy * cos),
    };
  });
}

/**
 * 始点と終点の中点を中心に、指定した長さ（px）になるようストローク全体を拡縮する。
 */
export function scaleStrokePoints(points: Point[], newLen: number): Point[] {
  if (points.length < 2) return points;
  const currentLen = calculateLength(points);
  if (currentLen === 0) return points;

  const scaleFactor = newLen / currentLen;
  const start = points[0];
  const end = points[points.length - 1];
  const mid = {
    x: (start.x + end.x) / 2,
    y: (start.y + end.y) / 2,
  };

  return points.map((p) => ({
    x: mid.x + (p.x - mid.x) * scaleFactor,
    y: mid.y + (p.y - mid.y) * scaleFactor,
  }));
}

/**
 * 始点と終点を維持したまま、ランダムな二次ベジェ曲線カーブを適用する。
 */
export function curveStrokePoints(stroke: Point[]): Point[] {
  if (stroke.length < 2) return stroke;

  const start = stroke[0];
  const end = stroke[stroke.length - 1];
  const pointCount = stroke.length;

  const dx = end.x - start.x;
  const dy = end.y - start.y;
  const dist = Math.sqrt(dx * dx + dy * dy);

  if (dist < 1) return stroke;

  // 長さの約30%分、法線方向のランダムな向きに制御点をオフセット
  const offset = dist * 0.3;
  const angle = Math.atan2(dy, dx);
  const perpAngle =
    angle + (Math.random() > 0.5 ? Math.PI / 2 : -Math.PI / 2);

  const midX = (start.x + end.x) / 2;
  const midY = (start.y + end.y) / 2;

  const controlX = midX + Math.cos(perpAngle) * offset;
  const controlY = midY + Math.sin(perpAngle) * offset;

  const newPoints: Point[] = [];
  for (let i = 0; i < pointCount; i++) {
    const t = i / (pointCount - 1);
    const x =
      (1 - t) * (1 - t) * start.x +
      2 * (1 - t) * t * controlX +
      t * t * end.x;
    const y =
      (1 - t) * (1 - t) * start.y +
      2 * (1 - t) * t * controlY +
      t * t * end.y;
    newPoints.push({ x, y });
  }
  return newPoints;
}

/**
 * 始点と終点を結ぶ直線に変換する（ポイント数は維持）。
 */
export function straightenStrokePoints(stroke: Point[]): Point[] {
  if (stroke.length < 2) return stroke;

  const start = stroke[0];
  const end = stroke[stroke.length - 1];
  const pointCount = Math.max(2, stroke.length);

  const newPoints: Point[] = [];
  for (let i = 0; i < pointCount; i++) {
    const t = i / (pointCount - 1);
    newPoints.push({
      x: start.x + (end.x - start.x) * t,
      y: start.y + (end.y - start.y) * t,
    });
  }
  return newPoints;
}

/**
 * バウンディングボックスの中心を基準に、ストロークを水平または垂直に反転させる。
 */
export function flipStrokePoints(
  stroke: Point[],
  direction: "horizontal" | "vertical",
): Point[] {
  if (stroke.length === 0) return stroke;

  let minX = Infinity,
    maxX = -Infinity,
    minY = Infinity,
    maxY = -Infinity;
  for (const p of stroke) {
    if (p.x < minX) minX = p.x;
    if (p.x > maxX) maxX = p.x;
    if (p.y < minY) minY = p.y;
    if (p.y > maxY) maxY = p.y;
  }
  const centerX = (minX + maxX) / 2;
  const centerY = (minY + maxY) / 2;

  return stroke.map((p) => ({
    x: direction === "horizontal" ? centerX - (p.x - centerX) : p.x,
    y: direction === "vertical" ? centerY - (p.y - centerY) : p.y,
  }));
}

/**
 * バウンディングボックスの中心に対する点対称移動（180度回転）を行う。
 */
export function flipStrokeAnglePoints(stroke: Point[]): Point[] {
  if (stroke.length < 1) return stroke;

  let minX = Infinity,
    maxX = -Infinity,
    minY = Infinity,
    maxY = -Infinity;
  for (const p of stroke) {
    if (p.x < minX) minX = p.x;
    if (p.x > maxX) maxX = p.x;
    if (p.y < minY) minY = p.y;
    if (p.y > maxY) maxY = p.y;
  }
  const centerX = (minX + maxX) / 2;
  const centerY = (minY + maxY) / 2;

  return stroke.map((p) => ({
    x: 2 * centerX - p.x,
    y: 2 * centerY - p.y,
  }));
}

/**
 * ストローク全体、または始点・終点の変位（ドラッグや座標指定）を適用する。
 * 始点・終点のみを動かす場合は、反対側の端点に向かって線形に変位を減衰させることで
 * 既存のカーブ形状やポイント数（所要時間）を自然に保持する。
 */
export function displaceStrokePoints(
  stroke: Point[],
  deltaX: number,
  deltaY: number,
  type: "move" | "start" | "end",
): Point[] {
  if (stroke.length === 0) return stroke;

  // 全体移動またはタップ（単一座標）の場合は全点を平行移動
  if (type === "move" || stroke.length === 1 || isTapStroke(stroke)) {
    return stroke.map((p) => ({
      x: p.x + deltaX,
      y: p.y + deltaY,
    }));
  }

  const count = stroke.length;
  if (type === "start") {
    return stroke.map((p, i) => {
      const factor = 1 - i / (count - 1);
      return {
        x: p.x + deltaX * factor,
        y: p.y + deltaY * factor,
      };
    });
  }

  // type === "end"
  return stroke.map((p, i) => {
    const factor = i / (count - 1);
    return {
      x: p.x + deltaX * factor,
      y: p.y + deltaY * factor,
    };
  });
}
