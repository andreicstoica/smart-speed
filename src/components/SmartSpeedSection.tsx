import { useState, useEffect } from "react";
import type { VoiceStyle } from "@/constants/voice-presets";
import { AudioPlayer } from "./audio/AudioPlayer";
import { useSmartSpeed } from "@/hooks/useSmartSpeed";
import { Button } from "./ui/button";
import { SAMPLE_TEXT } from "@/constants/sample";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";
import { ManualSpeedAdjustmentSection } from "./ManualSpeedAdjustmentSection";

type ModelVersion = "v2" | "v3";

interface SmartSpeedSectionProps {
  text: string;
  modelVersion: ModelVersion;
  setModelVersion: (version: ModelVersion) => void;
  manual: import("@/hooks/useManualSpeedAdjustment").ManualHookReturn;
}

export function SmartSpeedSection({
  text,
  modelVersion,
  setModelVersion,
  manual,
}: SmartSpeedSectionProps) {
  const [selectedStyle, setSelectedStyle] = useState<VoiceStyle | null>(null);

  // Always call hooks in the same order
  const smartSpeed = useSmartSpeed(text);

  // Auto-select energetic style for V3 mode (gives us 2x speed)
  useEffect(() => {
    if (modelVersion === "v3" && !smartSpeed.selectedStyle && text.trim()) {
      smartSpeed.selectStyle("energetic");
    }
  }, [modelVersion, smartSpeed.selectedStyle, text, smartSpeed]);

  // Preloaded audio URL for the 2x sped up example
  const preloadedAudioUrl = "/audio/smart-audio-example-2x.mp3";

  // Render V2 mode if selected
  if (modelVersion === "v2") {
    return (
      <ManualSpeedAdjustmentSection
        text={text}
        modelVersion={modelVersion}
        setModelVersion={setModelVersion}
        manual={manual}
      />
    );
  }

  const handleGenerateAudio = () => {
    smartSpeed.generateSmartAudio();
  };

  const hasText = text.trim().length > 0;

  // Check if we can use preloaded audio: must be sample text AND 2x speed
  const canUsePreloadedAudio =
    text === SAMPLE_TEXT && smartSpeed.transformResult?.params.speed === 2.0;

  // Determine which audio to show and its properties
  const currentAudioUrl =
    smartSpeed.smartAudioUrl ||
    (canUsePreloadedAudio ? preloadedAudioUrl : undefined);
  const currentSubtitle = smartSpeed.smartAudioUrl
    ? "Enhanced with timing and expression tags"
    : canUsePreloadedAudio
    ? "Preloaded 2x speed example audio"
    : `Generate new audio for ${
        smartSpeed.transformResult?.params.speed?.toFixed(2) || "auto"
      }x`;
  const currentInitialRate = smartSpeed.smartAudioUrl
    ? smartSpeed.transformResult?.params.speed
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
              disabled={!hasText || smartSpeed.loading}
              onClick={handleGenerateAudio}
              size="lg"
              variant="outline"
            >
              {smartSpeed.loading ? (
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

      {smartSpeed.error && (
        <div className="mt-4 rounded-lg bg-red-50 p-3 dark:bg-red-900/20">
          <div className="font-medium text-red-700 text-sm dark:text-red-300">
            {smartSpeed.error}
          </div>
          <Button
            className="mt-2"
            onClick={handleGenerateAudio}
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
