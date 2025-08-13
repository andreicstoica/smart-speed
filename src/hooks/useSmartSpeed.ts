import { useCallback, useEffect, useRef, useState } from "react";
import type { VoiceStyle } from "@/constants/voice-presets";
import type { TransformResult } from "@/lib/tagging";
import { transformTextForStyle } from "@/lib/tagging";

export type SmartSpeedState = "IDLE" | "PROCESSING" | "READY" | "ERROR";

export interface SmartSpeedConfig {
    text: string;
    selectedStyle: VoiceStyle;
    voiceId?: string;
}

export interface SmartSpeedHookReturn {
    state: SmartSpeedState;
    transformResult: TransformResult | null;
    smartAudioUrl: string | null;
    error: string | null;
    loading: boolean;

    // Actions
    selectStyle: (style: VoiceStyle) => void;
    generateSmartAudio: () => Promise<void>;
    reset: () => void;

    // Current config
    selectedStyle: VoiceStyle | null;
}

// TTS API call function
async function fetchSmartTts(
    taggedText: string,
    params: {
        speed: number;
        apply_text_normalization: boolean;
        model_id: string;
        voice_id: string;
    },
    voiceId?: string
): Promise<ArrayBuffer> {
    const res = await fetch("/api/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            text: taggedText,
            voice_id: params.voice_id || voiceId,
            model_id: params.model_id,
            speed: params.speed,
            apply_text_normalization: params.apply_text_normalization ? "on" : "off",
        }),
    });

    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Smart TTS failed");
    }

    return await res.arrayBuffer();
}

// Helper to create audio URL from buffer
function createAudioUrl(buffer: ArrayBuffer): string {
    const blob = new Blob([buffer], { type: "audio/mpeg" });
    return URL.createObjectURL(blob);
}

export function useSmartSpeed(
    text: string,
    voiceId?: string
): SmartSpeedHookReturn {
    const [state, setState] = useState<SmartSpeedState>("IDLE");
    const [selectedStyle, setSelectedStyle] = useState<VoiceStyle | null>(null);
    const [transformResult, setTransformResult] =
        useState<TransformResult | null>(null);
    const [smartAudioUrl, setSmartAudioUrl] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    // Track current request to enable cancellation
    const abortControllerRef = useRef<AbortController | null>(null);
    const currentRequestIdRef = useRef(0);

    // Cleanup audio URLs
    useEffect(() => {
        return () => {
            if (smartAudioUrl) {
                URL.revokeObjectURL(smartAudioUrl);
            }
        };
    }, [smartAudioUrl]);

    // Reset state when text changes significantly
    useEffect(() => {
        if (state !== "IDLE") {
            setState("IDLE");
            setError(null);
            if (smartAudioUrl) {
                URL.revokeObjectURL(smartAudioUrl);
                setSmartAudioUrl(null);
            }
        }
    }, [text]);

    const selectStyle = useCallback(
        (style: VoiceStyle) => {
            // Cancel any in-flight request
            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
            }

            setSelectedStyle(style);
            setError(null);

            // Immediately compute transform result for diff view
            if (text.trim()) {
                const result = transformTextForStyle(text, style);
                setTransformResult(result);
                setState("IDLE"); // Don't auto-generate, wait for user to click button
            }
        },
        [text]
    );

    const generateSmartAudioInternal = useCallback(
        async (result: TransformResult, style: VoiceStyle) => {
            if (!text.trim()) return;

            // Cancel previous request
            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
            }

            const requestId = ++currentRequestIdRef.current;
            const abortController = new AbortController();
            abortControllerRef.current = abortController;

            try {
                setLoading(true);
                setError(null);

                const buffer = await fetchSmartTts(
                    result.taggedText,
                    result.params,
                    voiceId
                );

                // Check if this request is still current
                if (
                    requestId === currentRequestIdRef.current &&
                    !abortController.signal.aborted
                ) {
                    // Clean up previous audio URL
                    if (smartAudioUrl) {
                        URL.revokeObjectURL(smartAudioUrl);
                    }

                    const url = createAudioUrl(buffer);
                    setSmartAudioUrl(url);
                    setState("READY");
                }
            } catch (err: any) {
                if (
                    requestId === currentRequestIdRef.current &&
                    !abortController.signal.aborted
                ) {
                    const errorMessage = err?.message || "Failed to generate smart audio";
                    setError(errorMessage);
                    setState("ERROR");
                }
            } finally {
                if (requestId === currentRequestIdRef.current) {
                    setLoading(false);
                }
            }
        },
        [text, voiceId, smartAudioUrl]
    );

    const generateSmartAudio = useCallback(async () => {
        if (!(transformResult && selectedStyle)) return;
        await generateSmartAudioInternal(transformResult, selectedStyle);
    }, [transformResult, selectedStyle, generateSmartAudioInternal]);

    const reset = useCallback(() => {
        // Cancel any in-flight request
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }

        setState("IDLE");
        setSelectedStyle(null);
        setTransformResult(null);
        setError(null);
        setLoading(false);

        if (smartAudioUrl) {
            URL.revokeObjectURL(smartAudioUrl);
            setSmartAudioUrl(null);
        }
    }, [smartAudioUrl]);

    return {
        state,
        transformResult,
        smartAudioUrl,
        error,
        loading,
        selectedStyle,
        selectStyle,
        generateSmartAudio,
        reset,
    };
}
