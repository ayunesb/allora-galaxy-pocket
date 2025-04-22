
import { Fragment } from "react";

interface ToneIndicatorProps {
  tone?: string;
}

export function ToneIndicator({ tone }: ToneIndicatorProps) {
  if (!tone) return null;
  
  const toneMap: Record<string, { emoji: string, label: string, color: string }> = {
    confident: { emoji: "🎤", label: "Confident", color: "bg-blue-100 text-blue-800" },
    friendly: { emoji: "🤝", label: "Friendly", color: "bg-green-100 text-green-800" },
    playful: { emoji: "💡", label: "Playful", color: "bg-purple-100 text-purple-800" },
    witty: { emoji: "✨", label: "Witty", color: "bg-amber-100 text-amber-800" },
    professional: { emoji: "👔", label: "Professional", color: "bg-gray-100 text-gray-800" },
    assertive: { emoji: "💪", label: "Assertive", color: "bg-red-100 text-red-800" },
    supportive: { emoji: "🛟", label: "Supportive", color: "bg-teal-100 text-teal-800" },
    casual: { emoji: "🏄‍♂️", label: "Casual", color: "bg-orange-100 text-orange-800" }
  };
  
  const toneInfo = toneMap[tone.toLowerCase()] || { emoji: "🔍", label: tone, color: "bg-gray-100 text-gray-800" };
  
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs ${toneInfo.color}`}>
      {toneInfo.emoji} {toneInfo.label}
    </span>
  );
}
