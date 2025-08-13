import type { VoiceStyle } from '../constants/voice-presets';
import { getPresetForStyle } from '../constants/voice-presets';

export interface TagStats {
    breaks: number;
    styleTags: number;
    totalTags: number;
}

export interface TransformResult {
    taggedText: string;
    tagStats: TagStats;
    params: {
        speed: number;
        apply_text_normalization: boolean;
        model_id: string;
        voice_id: string;
    };
}

// Maximum limits to prevent instability
const MAX_BREAKS_PER_100_WORDS = 3;
const MAX_STYLE_TAGS = 2;

// Regex patterns for sentence/clause detection
const SENTENCE_ENDINGS = /[.!?]+/g;
const CLAUSE_BREAKS = /[,;:]/g;
const PARENTHETICAL = /\([^)]*\)/g;

function countWords(text: string): number {
    return text.trim().split(/\s+/).length;
}

function sanitizeText(text: string): string {
    // Remove any existing tags to prevent nesting
    return text
        .replace(/\[[\w\s]+\]/g, '') // Remove [tag] style tags
        .replace(/<break[^>]*\/>/g, '') // Remove existing break tags
        .replace(/\s+/g, ' ') // Normalize whitespace
        .trim();
}

function addBreaks(text: string, style: VoiceStyle): { text: string; count: number } {
    const preset = getPresetForStyle(style);
    const wordCount = countWords(text);
    const maxBreaks = Math.floor((wordCount / 100) * MAX_BREAKS_PER_100_WORDS);

    if (maxBreaks === 0 || preset.tags.breaks.frequency === 'low' && wordCount < 50) {
        return { text, count: 0 };
    }

    let result = text;
    let breakCount = 0;

    // Add breaks at clause boundaries (commas, semicolons)
    if (preset.tags.breaks.frequency === 'medium' || preset.tags.breaks.frequency === 'high') {
        const clauseMatches = [...text.matchAll(CLAUSE_BREAKS)];
        const targetBreaks = Math.min(
            maxBreaks,
            preset.tags.breaks.frequency === 'high' ? clauseMatches.length : Math.floor(clauseMatches.length / 2)
        );

        // Select positions to add breaks
        const selectedIndices = clauseMatches
            .map((match, index) => ({ match, index }))
            .sort(() => Math.random() - 0.5) // Randomize selection
            .slice(0, targetBreaks);

        // Sort by position to insert from end to beginning (to preserve indices)
        selectedIndices.sort((a, b) => b.match.index! - a.match.index!);

        for (const { match } of selectedIndices) {
            const breakTime = Math.floor(
                Math.random() * (preset.tags.breaks.max - preset.tags.breaks.min) + preset.tags.breaks.min
            );
            const insertPos = match.index! + match[0].length;
            result =
                result.slice(0, insertPos) +
                ` <break time="${breakTime}ms" />` +
                result.slice(insertPos);
            breakCount++;
        }
    }

    return { text: result, count: breakCount };
}

function addStyleTags(text: string, style: VoiceStyle): { text: string; count: number } {
    const preset = getPresetForStyle(style);
    let result = text;
    let tagCount = 0;

    // Add opening style tags
    if (preset.tags.opening && preset.tags.opening.length > 0) {
        const openingTag = preset.tags.opening[0];
        result = `${openingTag} ${result}`;
        tagCount++;
    }

    // Add emphasis tags to parentheticals (for energetic style)
    if (preset.tags.emphasis && preset.tags.emphasis.length > 0) {
        const emphasisTag = preset.tags.emphasis[0];
        const parentheticals = [...result.matchAll(PARENTHETICAL)];

        // Limit emphasis tags
        const maxEmphasis = Math.min(MAX_STYLE_TAGS - tagCount, parentheticals.length);

        for (let i = 0; i < maxEmphasis; i++) {
            const match = parentheticals[i];
            if (match && match.index !== undefined) {
                const replacement = `${emphasisTag} ${match[0]}`;
                result = result.slice(0, match.index) + replacement + result.slice(match.index + match[0].length);
                tagCount++;
            }
        }
    }

    return { text: result, count: tagCount };
}

export function transformTextForStyle(text: string, style: VoiceStyle): TransformResult {
    // Sanitize input
    const cleanText = sanitizeText(text);

    // Get preset params
    const preset = getPresetForStyle(style);

    // Apply transformations
    const { text: textWithBreaks, count: breakCount } = addBreaks(cleanText, style);
    const { text: finalText, count: styleTagCount } = addStyleTags(textWithBreaks, style);

    const tagStats: TagStats = {
        breaks: breakCount,
        styleTags: styleTagCount,
        totalTags: breakCount + styleTagCount
    };

    const params = {
        speed: preset.speed,
        apply_text_normalization: preset.apply_text_normalization,
        model_id: preset.model_id,
        voice_id: preset.voice_id
    };

    return {
        taggedText: finalText,
        tagStats,
        params
    };
}

export function extractTagsFromText(text: string): Array<{ type: 'break' | 'style'; content: string; position: number }> {
    const tags: Array<{ type: 'break' | 'style'; content: string; position: number }> = [];

    // Find break tags
    const breakMatches = [...text.matchAll(/<break[^>]*\/>/g)];
    for (const match of breakMatches) {
        if (match.index !== undefined) {
            tags.push({
                type: 'break',
                content: match[0],
                position: match.index
            });
        }
    }

    // Find style tags
    const styleMatches = [...text.matchAll(/\[[\w\s]+\]/g)];
    for (const match of styleMatches) {
        if (match.index !== undefined) {
            tags.push({
                type: 'style',
                content: match[0],
                position: match.index
            });
        }
    }

    return tags.sort((a, b) => a.position - b.position);
}
