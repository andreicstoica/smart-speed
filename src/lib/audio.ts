"use client";

export function createObjectUrlFromBuffer(
    arrayBuffer: ArrayBuffer,
    mime = "audio/mpeg"
): string {
    const blob = new Blob([arrayBuffer], { type: mime });
    return URL.createObjectURL(blob);
}

export function revokeObjectUrl(url?: string) {
    if (!url) return;
    try {
        URL.revokeObjectURL(url);
    } catch { }
}
