
import { useState, useCallback } from "react";
import { speak, stopSpeaking } from "@/lib/voice/speak";

export function useVoiceOutput() {
  const [isSpeaking, setIsSpeaking] = useState(false);

  const sayText = useCallback(async (text: string, voice: "female" | "male" = "female") => {
    setIsSpeaking(true);
    await speak(text, voice);
    setIsSpeaking(false);
  }, []);

  const stopTalking = useCallback(() => {
    stopSpeaking();
    setIsSpeaking(false);
  }, []);

  return {
    sayText,
    stopTalking,
    isSpeaking
  };
}
