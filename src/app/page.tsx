"use client";

import { useState } from "react";
import { BaselineAudioPlayer } from "@/components/audio/BaselineAudioPlayer";
import { Editors } from "@/components/Editors";
import { SmartSpeedSection } from "@/components/SmartSpeedSection";
import { ModelDetailsSection } from "@/components/ModelDetailsSection";
import { IntroModal } from "@/components/IntroModal";
import { useSampleText } from "@/lib/utils";
import { useSmartSpeed } from "@/hooks/useSmartSpeed";
import { useManualSpeedAdjustment } from "@/hooks/useManualSpeedAdjustment";
import { Card } from "../components/ui/card";

type ModelVersion = "v2" | "v3";

export default function Home() {
  const sample = useSampleText();
  const [text, setText] = useState<string>(sample);
  const [modelVersion, setModelVersion] = useState<ModelVersion>("v2");

  // Initialize both hooks to get their transform results
  const smartSpeed = useSmartSpeed(text);
  const manualSpeed = useManualSpeedAdjustment(text);

  // Get the appropriate transform result based on model version
  const transformResult =
    modelVersion === "v2"
      ? manualSpeed.transformResult
      : smartSpeed.transformResult;

  return (
    <div className="container mx-auto max-w-6xl px-4 py-6">
      <IntroModal />

      {/* Text Input */}
      <Card className="mb-6 p-4">
        <div className="font-semibold text-lg">Paste some text</div>
        <div className="text-muted-foreground text-sm">
          Use less than ≤ 1k chars to keep it speedy, I also only have $5 of
          credits :D
        </div>
        <Editors
          onChange={setText}
          onUseSample={() => setText(sample)}
          value={text}
        />
      </Card>

      {/* Model Details Section */}
      <ModelDetailsSection
        modelVersion={modelVersion}
        setModelVersion={setModelVersion}
        transformResult={transformResult}
        text={text}
        manualSpeed={manualSpeed}
      />

      {/* Audio Players Side by Side */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Baseline Audio */}
        <div>
          <BaselineAudioPlayer text={text} playbackRate={manualSpeed.speed} />
        </div>

        {/* Smart Speed Audio */}
        <SmartSpeedSection
          text={text}
          modelVersion={modelVersion}
          setModelVersion={setModelVersion}
          manual={manualSpeed}
        />
      </div>
    </div>
  );
}
