import { useEffect, useState } from "react";
import { SAMPLE_TEXT } from "@/constants/sample";
import { createObjectUrlFromBuffer, revokeObjectUrl } from "../lib/audio";

async function fetchTts(
    text: string,
    voiceId?: string,
    modelId?: string
): Promise<ArrayBuffer> {
    const res = await fetch("/api/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, voiceId, modelId }),
    });
    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "TTS failed");
    }
    return await res.arrayBuffer();
}

export function useTts(text: string) {
    const [audioUrl, setAudioUrl] = useState<string | undefined>();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isUsingSampleText, setIsUsingSampleText] = useState(false);
    const [isLoadingSample, setIsLoadingSample] = useState(false);

    const canRequest = text.trim().length > 0;
    const hasAudio = !!audioUrl;

    const requestAudio = async () => {
        if (!canRequest) return;

        // Only show loading for non-sample text
        if (text !== SAMPLE_TEXT) {
            setLoading(true);
        }

        setError(null);
        try {
            let buf: ArrayBuffer;

            if (text === SAMPLE_TEXT) {
                // Serve static file for sample text
                buf = await fetch("/audio/sample-audio.mp3").then((res) =>
                    res.arrayBuffer()
                );
            } else {
                // Use API for custom text
                buf = await fetchTts(text);
            }

            const url = createObjectUrlFromBuffer(buf);
            revokeObjectUrl(audioUrl);
            setAudioUrl(url);
        } catch (e: any) {
            setError(e?.message || "Failed");
        } finally {
            if (text !== SAMPLE_TEXT) {
                setLoading(false);
            }
        }
    };

    // Auto-load sample audio on mount
    useEffect(() => {
        const isSample = text === SAMPLE_TEXT;
        setIsUsingSampleText(isSample);

        // Auto-load sample audio when using sample text and no audio exists
        if (isSample && !audioUrl) {
            setIsLoadingSample(true);
            requestAudio().finally(() => {
                setIsLoadingSample(false);
            });
        }
    }, [text]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            revokeObjectUrl(audioUrl);
        };
    }, [audioUrl]);

    return {
        audioUrl,
        loading,
        error,
        isUsingSampleText,
        isLoadingSample,
        canRequest,
        hasAudio,
        requestAudio,
    };
}
