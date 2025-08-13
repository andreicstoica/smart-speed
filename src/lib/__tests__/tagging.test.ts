import { transformTextForStyle, extractTagsFromText } from '../tagging';

describe('transformTextForStyle', () => {
    const sampleText = "Hello world, this is a test. How are you doing today? (This is in parentheses). Let's continue with more text.";

    test('bedtime style should have slower speed and gentle tone', () => {
        const result = transformTextForStyle(sampleText, 'bedtime');

        expect(result.params.speed).toBe(0.90);
        expect(result.taggedText).toContain('[gentle tone]');
        expect(result.tagStats.styleTags).toBeGreaterThan(0);
    });

    test('energetic style should have faster speed', () => {
        const result = transformTextForStyle(sampleText, 'energetic');

        expect(result.params.speed).toBe(1.12);
        // Should add rushed tags to parentheticals
        if (result.taggedText.includes('(')) {
            expect(result.taggedText).toContain('[rushed]');
        }
    });

    test('should sanitize existing tags', () => {
        const textWithTags = "Hello [existing tag] world <break time=\"100ms\" /> more text.";
        const result = transformTextForStyle(textWithTags, 'bedtime');

        // Should not contain the original tags in a nested way
        expect(result.taggedText).not.toContain('[existing tag]');
        expect(result.taggedText).not.toContain('<break time="100ms" />');
    });

    test('should limit break tags to prevent instability', () => {
        const longText = "This is a very long text. ".repeat(50); // ~300 words
        const result = transformTextForStyle(longText, 'bedtime');

        // Should not exceed reasonable limits
        expect(result.tagStats.breaks).toBeLessThanOrEqual(9); // 3 per 100 words max
    });
});

describe('extractTagsFromText', () => {
    test('should extract break tags', () => {
        const text = 'Hello <break time="200ms" /> world';
        const tags = extractTagsFromText(text);

        expect(tags).toHaveLength(1);
        expect(tags[0].type).toBe('break');
        expect(tags[0].content).toBe('<break time="200ms" />');
    });

    test('should extract style tags', () => {
        const text = '[gentle tone] Hello world';
        const tags = extractTagsFromText(text);

        expect(tags).toHaveLength(1);
        expect(tags[0].type).toBe('style');
        expect(tags[0].content).toBe('[gentle tone]');
    });

    test('should extract multiple tags in order', () => {
        const text = '[gentle tone] Hello <break time="150ms" /> world [rushed] more text';
        const tags = extractTagsFromText(text);

        expect(tags).toHaveLength(3);
        expect(tags[0].content).toBe('[gentle tone]');
        expect(tags[1].content).toBe('<break time="150ms" />');
        expect(tags[2].content).toBe('[rushed]');
    });
});
