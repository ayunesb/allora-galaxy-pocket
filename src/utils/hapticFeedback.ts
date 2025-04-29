
/**
 * Utility functions for providing haptic feedback in the application
 */

/**
 * Triggers a light/subtle haptic feedback if the device supports it
 */
export function lightHapticFeedback() {
  if (navigator.vibrate) {
    navigator.vibrate(10); // 10ms vibration for subtle feedback
  }
}

/**
 * Triggers a medium haptic feedback if the device supports it
 */
export function mediumHapticFeedback() {
  if (navigator.vibrate) {
    navigator.vibrate(20); // 20ms vibration for medium feedback
  }
}

/**
 * Triggers a strong haptic feedback if the device supports it
 */
export function strongHapticFeedback() {
  if (navigator.vibrate) {
    navigator.vibrate([40, 30, 40]); // Pattern for stronger feedback
  }
}

/**
 * Triggers haptic feedback for swipe actions based on direction
 */
export function swipeHapticFeedback(direction: 'left' | 'right') {
  switch(direction) {
    case 'left':
      mediumHapticFeedback(); // Rejection gets medium feedback
      break;
    case 'right':
      strongHapticFeedback(); // Approval gets stronger feedback
      break;
    default:
      lightHapticFeedback();
  }
}
