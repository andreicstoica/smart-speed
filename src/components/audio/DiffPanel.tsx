import { Card } from "../ui/card";
import { TaggedText } from "./TagBadge";
import type { TransformResult } from "@/lib/tagging";

export interface DiffPanelProps {
  originalText: string;
  transformResult: TransformResult;
  className?: string;
}

export function DiffPanel({
  originalText,
  transformResult,
  className,
}: DiffPanelProps) {
  const { taggedText, tagStats, params } = transformResult;

  return (
    <div className={className}>
      <div className="mb-4">
        <h3 className="text-lg font-semibold mb-2">
          Text Transformation Preview
        </h3>
        <div className="text-sm text-muted-foreground mb-4">
          How the text will be processed
        </div>
      </div>

      <Card className="p-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <h4 className="font-medium text-sm text-muted-foreground">
            Original Text
          </h4>
          <h4 className="font-medium text-sm text-muted-foreground">
            Enhanced Text
          </h4>
        </div>

        <div className="max-h-64 overflow-y-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="text-sm leading-relaxed whitespace-pre-wrap break-words">
              {originalText}
            </div>
            <div className="text-sm leading-relaxed">
              <TaggedText text={taggedText} originalText={originalText} />
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
