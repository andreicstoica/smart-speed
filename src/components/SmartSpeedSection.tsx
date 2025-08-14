import { useState } from "react";
import type { VoiceStyle } from "@/constants/voice-presets";
import { AudioPlayer } from "./audio/AudioPlayer";
import { useSmartSpeed } from "@/hooks/useSmartSpeed";
import { Button } from "./ui/button";
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

  return (
    <>
      {/* Preloaded Audio Player */}
      <AudioPlayer
        audioUrl={preloadedAudioUrl}
        subtitle="Preloaded 2x speed example audio"
        title="Smart Speed Example Audio"
        initialRate={2}
        lockRate
        hideSkipButtons
      />

      {/* Generate Button for new audio (optional) */}
      {smartSpeed.smartAudioUrl ? (
        <div className="mt-4">
          <AudioPlayer
            audioUrl={smartSpeed.smartAudioUrl}
            subtitle="Enhanced with timing and expression tags"
            title="Smart Speed Generated Audio"
            initialRate={smartSpeed.transformResult?.params.speed}
            lockRate
            hideSkipButtons
          />
        </div>
      ) : (
        <div className="mt-4 flex justify-center">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div>
                  <Button
                    className="px-8"
                    disabled={!hasText || smartSpeed.loading}
                    onClick={handleGenerateAudio}
                    size="lg"
                    variant="outline"
                  >
                    {smartSpeed.loading ? (
                      <div className="flex items-center gap-2">
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                        Generating...
                      </div>
                    ) : (
                      "Generate New Audio"
                    )}
                  </Button>
                </div>
              </TooltipTrigger>
              {!hasText && (
                <TooltipContent>
                  <p>Please enter some text first</p>
                </TooltipContent>
              )}
            </Tooltip>
          </TooltipProvider>
        </div>
      )}

      {/* Error Display */}
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
