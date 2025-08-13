"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { TransformResult } from "@/lib/tagging";
import { transformTextForStyle } from "@/lib/tagging";
import { V1_PRESETS } from "@/constants/voice-presets";

export type ManualState = "IDLE" | "PROCESSING" | "READY" | "ERROR";

export interface ManualHookReturn {
    state: ManualState;
    transformResult: TransformResult | null;
    smartAudioUrl: string | null;
    error: string | null;
    loading: boolean;

    // Controls
    speed: number;
    normalization: boolean;
    setSpeed: (v: number) => void;
    setNormalization: (v: boolean) => void;

    // Actions
    generateSmartAudio: () => Promise<void>;
    reset: () => void;
}

async function postTts(
    taggedText: string,
    params: {
        speed: number;
        apply_text_normalization: boolean;
        model_id: string;
        voice_id: string;
    }
): Promise<ArrayBuffer> {
    const res = await fetch("/api/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            text: taggedText,
            voice_id: params.voice_id,
            model_id: params.model_id,
            speed: params.speed,
            apply_text_normalization: params.apply_text_normalization ? "on" : "off",
        }),
    });
    if (!res.ok) {
        const err = await res.json().catch(() => ({} as any));
        throw new Error((err as any).error || "TTS failed");
    }
    return await res.arrayBuffer();
}

function createAudioUrl(buffer: ArrayBuffer): string {
    const blob = new Blob([buffer], { type: "audio/mpeg" });
    return URL.createObjectURL(blob);
}

export function useManualSpeedAdjustment(text: string): ManualHookReturn {
    const [state, setState] = useState<ManualState>("IDLE");
    const [speed, setSpeedState] = useState<number>(1.0);
    const [normalization, setNormalizationState] = useState<boolean>(false); // V2 doesn't support normalization
    const [transformResult, setTransformResult] = useState<TransformResult | null>(
        null
    );
    const [smartAudioUrl, setSmartAudioUrl] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const abortControllerRef = useRef<AbortController | null>(null);
    const currentRequestIdRef = useRef(0);

    // Derived style for tagging heuristics: <1 => bedtime; >1 => energetic
    const derivedStyle = useMemo(() => (speed <= 1 ? "bedtime" : "energetic"), [
        speed,
    ]);

    // Update transform when controls or text change
    useEffect(() => {
        if (!text.trim()) {
            setTransformResult(null);
            setState("IDLE");
            return;
        }

        // Use V2 presets for manual mode (voice only)
        const v2Preset = V1_PRESETS[derivedStyle as "bedtime" | "energetic"];

        const cleanText = text.trim();
        const wordCount = cleanText.split(/\s+/).length;
        const maxBreaks = Math.floor((wordCount / 100) * 3); // keep conservative

        // Overcast-like Smart Speed: shorten silences at natural boundaries
        // 1) Prioritize sentence endings, then clauses, then paragraph breaks
        const sentenceMatches = [...cleanText.matchAll(/[.!?]+\"?/g)];
        const clauseMatches = [...cleanText.matchAll(/[,;:]/g)];
        const newlineMatches = [...cleanText.matchAll(/\n+/g)];

        // Build candidate positions ordered by priority
        const candidates: Array<{ index: number; kind: "sentence" | "clause" | "para" }> = [];
        sentenceMatches.forEach((m) => m.index !== undefined && candidates.push({ index: m.index + m[0].length, kind: "sentence" }));
        clauseMatches.forEach((m) => m.index !== undefined && candidates.push({ index: m.index + m[0].length, kind: "clause" }));
        newlineMatches.forEach((m) => m.index !== undefined && candidates.push({ index: m.index + m[0].length, kind: "para" }));

        // Determine break windows based on speed
        const ranges = (() => {
            if (speed >= 2.0) {
                return { sentence: [80, 120] as const, clause: [40, 80] as const, para: [140, 200] as const };
            }
            if (speed >= 1.5) {
                return { sentence: [100, 150] as const, clause: [60, 100] as const, para: [160, 220] as const };
            }
            if (speed >= 1.1) {
                return { sentence: [140, 200] as const, clause: [90, 140] as const, para: [200, 260] as const };
            }
            return { sentence: [200, 260] as const, clause: [120, 180] as const, para: [240, 300] as const };
        })();

        function randIn([min, max]: readonly [number, number]) {
            return Math.floor(min + Math.random() * (max - min));
        }

        // Sort by priority and position; then choose up to maxBreaks
        const priority = { sentence: 0, para: 1, clause: 2 } as const;
        candidates.sort((a, b) => (priority[a.kind] - priority[b.kind]) || (a.index - b.index));
        const selected = candidates.slice(0, Math.max(0, maxBreaks));

        // Insert from end to preserve indices
        selected.sort((a, b) => b.index - a.index);

        let taggedText = cleanText;
        let breakCount = 0;
        for (const c of selected) {
            const breakTime = c.kind === "sentence" ? randIn(ranges.sentence) : c.kind === "para" ? randIn(ranges.para) : randIn(ranges.clause);
            taggedText = taggedText.slice(0, c.index) + ` <break time="${breakTime}ms" />` + taggedText.slice(c.index);
            breakCount++;
        }

        const updated: TransformResult = {
            taggedText,
            tagStats: {
                breaks: breakCount,
                styleTags: 0,
                totalTags: breakCount,
            },
            params: {
                speed,
                apply_text_normalization: false,
                model_id: "eleven_multilingual_v2",
                voice_id: v2Preset.voice_id,
            },
        };
        setTransformResult(updated);
        setState("IDLE");
        setError(null);
    }, [text, speed, normalization, derivedStyle]);

    // Cleanup on unmount or url change
    useEffect(() => {
        return () => {
            if (smartAudioUrl) URL.revokeObjectURL(smartAudioUrl);
            if (abortControllerRef.current) abortControllerRef.current.abort();
        };
    }, [smartAudioUrl]);

    const setSpeed = useCallback((v: number) => {
        const clamped = Math.max(0.75, Math.min(3.0, v));
        setSpeedState(clamped);
    }, []);

    const setNormalization = useCallback((v: boolean) => {
        setNormalizationState(Boolean(v));
    }, []);

    const generateSmartAudio = useCallback(async () => {
        if (!transformResult || !text.trim()) return;

        if (abortControllerRef.current) abortControllerRef.current.abort();
        const requestId = ++currentRequestIdRef.current;
        const abortController = new AbortController();
        abortControllerRef.current = abortController;

        try {
            setLoading(true);
            setError(null);
            const buffer = await postTts(
                transformResult.taggedText,
                transformResult.params
            );
            if (
                requestId === currentRequestIdRef.current &&
                !abortController.signal.aborted
            ) {
                if (smartAudioUrl) URL.revokeObjectURL(smartAudioUrl);
                const url = createAudioUrl(buffer);
                setSmartAudioUrl(url);
                setState("READY");
            }
        } catch (err: any) {
            if (
                requestId === currentRequestIdRef.current &&
                !abortController.signal.aborted
            ) {
                setError(err?.message || "Failed to generate audio");
                setState("ERROR");
            }
        } finally {
            if (requestId === currentRequestIdRef.current) setLoading(false);
        }
    }, [transformResult, text, smartAudioUrl]);

    const reset = useCallback(() => {
        if (abortControllerRef.current) abortControllerRef.current.abort();
        setState("IDLE");
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
        speed,
        normalization,
        setSpeed,
        setNormalization,
        generateSmartAudio,
        reset,
    };
}
