"use client";

import { AudioPlayer, SmartSpeedPlayer, useTts } from "./audio";

export function Players({ text }: { text: string }) {
  const {
    audioUrl,
    loading,
    error,
    isUsingSampleText,
    canRequest,
    hasAudio,
    requestAudio,
  } = useTts(text);

  return (
    <div className="grid gap-4">
      <AudioPlayer
        audioUrl={audioUrl}
        text={text}
        isUsingSampleText={isUsingSampleText}
        canRequest={canRequest}
        loading={loading}
        onRequestAudio={requestAudio}
      />

      <SmartSpeedPlayer audioUrl={audioUrl} text={text} />

      {error ? <div className="text-sm text-red-500">{error}</div> : null}
    </div>
  );
}
