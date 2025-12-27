import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface TruncatedTextProps {
  text: string;
  maxLength?: number;
}

export const TruncatedText = ({ text, maxLength = 30 }: TruncatedTextProps) => {
  const shouldTruncate = text.length > maxLength;
  const displayText = shouldTruncate ? `${text.substring(0, maxLength)}...` : text;

  if (!shouldTruncate) {
    return <span className="text-gray-600">{displayText}</span>;
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <span className="text-gray-600 cursor-default">
            {displayText}
          </span>
        </TooltipTrigger>
        <TooltipContent
          side="top"
          className="bg-white text-gray-600 border border-gray-200 shadow-lg max-w-md p-3"
        >
          <p className="text-sm break-words whitespace-normal overflow-wrap-anywhere">
            {text}
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};