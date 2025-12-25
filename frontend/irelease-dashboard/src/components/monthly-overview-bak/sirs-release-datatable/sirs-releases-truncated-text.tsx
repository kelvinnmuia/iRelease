import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface TruncatedTextProps {
  text: string;
  maxLength?: number;
  className?: string;
}

export const SirsReleasesTruncatedText = ({ 
  text, 
  maxLength = 30,
  className = ""
}: TruncatedTextProps) => {
  const shouldTruncate = text.length > maxLength;
  const displayText = shouldTruncate ? `${text.substring(0, maxLength)}...` : text;

  if (!shouldTruncate) {
    return <span className={`text-gray-600 ${className}`}>{displayText}</span>;
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <span className={`text-gray-600 cursor-default ${className}`}>
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