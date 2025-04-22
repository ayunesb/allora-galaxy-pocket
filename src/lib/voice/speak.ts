
export async function speak(text: string, voice: "female" | "male" = "female") {
  if ("speechSynthesis" in window) {
    const utterance = new SpeechSynthesisUtterance(text);
    
    // Get voices and find the requested gender
    let voices = speechSynthesis.getVoices();
    if (voices.length === 0) {
      // If voices aren't loaded yet, wait for them
      await new Promise<void>(resolve => {
        speechSynthesis.onvoiceschanged = () => resolve();
      });
      voices = speechSynthesis.getVoices();
    }
    
    // Try to find a voice matching the requested gender
    utterance.voice = voices.find(v => 
      voice === "female" 
        ? v.name.includes("Female") || v.name.includes("Samantha") || v.name.includes("Google UK English Female")
        : v.name.includes("Male") || v.name.includes("Daniel") || v.name.includes("Google UK English Male")
    ) || null;
    
    utterance.pitch = 1;
    utterance.rate = 1;
    
    // Cancel any ongoing speech
    speechSynthesis.cancel();
    
    // Speak the new utterance
    speechSynthesis.speak(utterance);
    
    return new Promise<void>((resolve) => {
      utterance.onend = () => resolve();
    });
  } else {
    console.warn("❌ Speech synthesis not supported in this browser");
    return Promise.resolve();
  }
}

export function stopSpeaking() {
  if ("speechSynthesis" in window) {
    speechSynthesis.cancel();
  }
}
