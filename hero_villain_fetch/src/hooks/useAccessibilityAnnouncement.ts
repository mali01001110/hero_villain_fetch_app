import { useEffect } from 'react';
import { AccessibilityInfo } from 'react-native';

/**
 * Announces a short status message to screen readers when it changes.
 */
export function useAccessibilityAnnouncement(message: string | null): void {
  useEffect(() => {
    if (!message) {
      return;
    }
    try {
      AccessibilityInfo.announceForAccessibility(message);
    } catch {
      // Accessibility announcements are best-effort.
    }
  }, [message]);
}
