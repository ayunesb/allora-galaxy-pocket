
/**
 * Provides haptic feedback for swipe gestures using the Vibration API if available
 */
export function swipeHapticFeedback(direction: 'left' | 'right') {
  if (!window.navigator.vibrate) {
    return; // Vibration API not supported
  }

  try {
    // Different vibration patterns based on swipe direction
    if (direction === 'right') {
      // Success/approval vibration: one short pulse
      window.navigator.vibrate(40);
    } else if (direction === 'left') {
      // Rejection vibration: two quick pulses
      window.navigator.vibrate([20, 30, 20]);
    }
  } catch (error) {
    console.warn('Haptic feedback error:', error);
    // Fail silently - haptic feedback is non-critical
  }
}

/**
 * Vibration patterns for different feedback types
 */
export const hapticPatterns = {
  success: 80,
  error: [30, 20, 30, 20, 30],
  warning: [20, 40, 60],
  notification: [10, 20, 10],
  buttonPress: 30
};

/**
 * General haptic feedback function
 */
export function triggerHapticFeedback(pattern: number | number[]) {
  if (window.navigator.vibrate) {
    try {
      window.navigator.vibrate(pattern);
    } catch (error) {
      console.warn('Haptic feedback error:', error);
    }
  }
}
