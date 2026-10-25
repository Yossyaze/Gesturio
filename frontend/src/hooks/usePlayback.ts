/**
 * ジェスチャー再生プレビューのアニメーションループを管理するカスタムフック。
 */

import { useState, useRef, useEffect, useCallback } from "react";
import type { Command, Point } from "../api";
import { isTapStroke } from "../utils/parser";

export interface PlaybackProgress {
  elapsed: number;
  totalDuration: number;
  activeStrokeIndex: number;
  totalStrokes: number;
  percent: number;
}

export function usePlayback(selectedCommand: Command | undefined) {
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [playbackProgress, setPlaybackProgress] =
    useState<PlaybackProgress | null>(null);
  const [markerPositions, setMarkerPositions] = useState<Point[]>([]);

  const animationRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);

  useEffect(() => {
    if (isPlaying && selectedCommand) {
      // groupId に基づいて同時実行ブロックのタイムラインを構築
      const timeline: {
        startTime: number;
        duration: number;
        items: {
          strokeIndex: number;
          duration: number;
        }[];
      }[] = [];

      let currentTime = 0;
      const waitTime =
        selectedCommand.waitDuration !== undefined
          ? selectedCommand.waitDuration
          : 0.1;

      for (let i = 0; i < selectedCommand.strokes.length; i++) {
        const metadata = selectedCommand.strokeMetadata?.[i];
        const currentGroupId = metadata?.groupId;

        const s = selectedCommand.strokes[i];
        const strokeTapDuration =
          metadata?.tapDuration !== undefined
            ? metadata.tapDuration
            : selectedCommand.tapDuration || 0.05;

        const strokeDuration = isTapStroke(s)
          ? strokeTapDuration
          : Math.max(0.1, (s.length - 1) / 60);

        if (
          currentGroupId &&
          i > 0 &&
          selectedCommand.strokeMetadata?.[i - 1]?.groupId === currentGroupId
        ) {
          // 直前のストロークと同じグループ（同時実行）
          const lastBlock = timeline[timeline.length - 1];
          lastBlock.items.push({ strokeIndex: i, duration: strokeDuration });
          lastBlock.duration = Math.max(lastBlock.duration, strokeDuration);
        } else {
          // 新しいグループまたは順次アクション（前のブロックからの待機時間を加算）
          if (i > 0) {
            const prevWait = selectedCommand.strokeMetadata?.[i - 1]?.waitAfter;
            currentTime += prevWait !== undefined ? prevWait : waitTime;
          }

          timeline.push({
            startTime: currentTime,
            duration: strokeDuration,
            items: [{ strokeIndex: i, duration: strokeDuration }],
          });
        }

        const nextGroupId = selectedCommand.strokeMetadata?.[i + 1]?.groupId;
        if (!currentGroupId || currentGroupId !== nextGroupId) {
          currentTime += timeline[timeline.length - 1].duration;
        }
      }

      const totalDuration = Math.max(0.1, currentTime);

      const animate = (time: number) => {
        if (startTimeRef.current === null) {
          startTimeRef.current = time;
        }

        const elapsed = (time - startTimeRef.current) / 1000;

        if (elapsed >= totalDuration) {
          setIsPlaying(false);
          setMarkerPositions([]);
          setPlaybackProgress(null);
          startTimeRef.current = null;
          return;
        }

        const currentMarkers: Point[] = [];
        let currentActiveStrokeIdx = 0;

        for (const block of timeline) {
          if (
            elapsed >= block.startTime &&
            elapsed < block.startTime + block.duration
          ) {
            if (block.items.length > 0) {
              currentActiveStrokeIdx = block.items[0].strokeIndex;
            }
            block.items.forEach((item) => {
              const localElapsed = elapsed - block.startTime;
              if (localElapsed < item.duration) {
                const stroke = selectedCommand.strokes[item.strokeIndex];
                const progress = localElapsed / item.duration;
                if (stroke.length > 0) {
                  const exactIndex = progress * (stroke.length - 1);
                  const idx = Math.floor(exactIndex);
                  const nextIdx = Math.min(idx + 1, stroke.length - 1);
                  const t = exactIndex - idx;
                  const p1 = stroke[idx];
                  const p2 = stroke[nextIdx];
                  currentMarkers.push({
                    x: p1.x + (p2.x - p1.x) * t,
                    y: p1.y + (p2.y - p1.y) * t,
                  });
                }
              }
            });
            break;
          }
        }

        setMarkerPositions(currentMarkers);
        setPlaybackProgress({
          elapsed: Math.min(elapsed, totalDuration),
          totalDuration,
          activeStrokeIndex: currentActiveStrokeIdx + 1,
          totalStrokes: selectedCommand.strokes.length,
          percent: Math.min(100, Math.max(0, (elapsed / totalDuration) * 100)),
        });

        animationRef.current = requestAnimationFrame(animate);
      };

      animationRef.current = requestAnimationFrame(animate);
    } else {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      setTimeout(() => {
        setMarkerPositions([]);
        setPlaybackProgress(null);
      }, 0);
      startTimeRef.current = null;
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isPlaying, selectedCommand]);

  const togglePlay = useCallback(() => {
    setIsPlaying((prev) => !prev);
  }, []);

  return {
    isPlaying,
    playbackProgress,
    markerPositions,
    togglePlay,
  };
}
