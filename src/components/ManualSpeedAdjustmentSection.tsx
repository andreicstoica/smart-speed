"use client";

import { useMemo } from "react";
import { AudioPlayer } from "./audio/AudioPlayer";
import { Button } from "./ui/button";
import { useManualSpeedAdjustment } from "@/hooks/useManualSpeedAdjustment";

type ModelVersion = "v2" | "v3";

interface Props {
  text: string;
  modelVersion: ModelVersion;
  setModelVersion: (version: ModelVersion) => void;
}

export function ManualSpeedAdjustmentSection({
  text,
  modelVersion,
  setModelVersion,
}: Props) {
  const manual = useManualSpeedAdjustment(text);

  const hasText = useMemo(() => text.trim().length > 0, [text]);

  return (
    <>
      {manual.smartAudioUrl ? (
        <AudioPlayer
          audioUrl={manual.smartAudioUrl}
          title="Smart Speed Generated Audio"
          subtitle="Enhanced with timing and expression tags"
          initialRate={manual.transformResult?.params.speed}
          lockRate
          hideSkipButtons
        />
      ) : (
        <div className="flex justify-center">
          <Button
            className="px-8"
            disabled={!hasText || manual.loading}
            onClick={manual.generateSmartAudio}
            size="lg"
          >
            {manual.loading ? (
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Generating...
              </div>
            ) : (
              "Generate New Audio"
            )}
          </Button>
        </div>
      )}

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
