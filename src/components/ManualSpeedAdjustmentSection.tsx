"use client";

import { useMemo } from "react";
import { AudioPlayer } from "./audio/AudioPlayer";
import { Button } from "./ui/button";
import type { ManualHookReturn } from "@/hooks/useManualSpeedAdjustment";
import { SAMPLE_TEXT } from "@/constants/sample";

type ModelVersion = "v2" | "v3";

interface Props {
  text: string;
  modelVersion: ModelVersion;
  setModelVersion: (version: ModelVersion) => void;
  manual: ManualHookReturn;
}

export function ManualSpeedAdjustmentSection({
  text,
  modelVersion,
  setModelVersion,
  manual,
}: Props) {
  const hasText = useMemo(() => text.trim().length > 0, [text]);

  // Preloaded audio URL for the 2x sped up example
  const preloadedAudioUrl = "/audio/smart-audio-example-2x.mp3";

  // Check if we can use preloaded audio: must be sample text AND 2x speed
  const canUsePreloadedAudio = text === SAMPLE_TEXT && manual.speed === 2.0;

  // Determine which audio to show and its properties
  const currentAudioUrl =
    manual.smartAudioUrl ||
    (canUsePreloadedAudio ? preloadedAudioUrl : undefined);
  const currentSubtitle = manual.smartAudioUrl
    ? "Enhanced with timing and expression tags"
    : canUsePreloadedAudio
    ? "Preloaded 2x audio using v2 model"
    : `generate new audio for ${manual.speed.toFixed(2)}x`;
  const currentInitialRate = manual.smartAudioUrl
    ? manual.transformResult?.params.speed
    : 2;

  return (
    <>
      <AudioPlayer
        audioUrl={currentAudioUrl}
        subtitle={currentSubtitle}
        title="Smart Speed Generated Audio"
        initialRate={currentInitialRate}
        lockRate
        hideSkipButtons
        disabled={!currentAudioUrl}
        overlayContent={
          !currentAudioUrl ? (
            <Button
              className="px-8"
              disabled={!hasText || manual.loading}
              onClick={manual.generateSmartAudio}
              size="lg"
              variant="outline"
            >
              {manual.loading ? (
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-black border-t-transparent dark:border-white" />
                  Generating...
                </div>
              ) : (
                "Generate New Audio"
              )}
            </Button>
          ) : undefined
        }
      />

      {manual.error && (
        <div className="mt-4 rounded-lg bg-red-50 p-3 dark:bg-red-900/20">
          <div className="font-medium text-red-700 text-sm dark:text-red-300">
            {manual.error}
          </div>
          <Button
            className="mt-2"
            onClick={manual.generateSmartAudio}
            size="sm"
            variant="outline"
          >
            Retry
          </Button>
        </div>
      )}
    </>
  );
}
