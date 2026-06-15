/**
 * Keyboard-aware scrolling helpers.
 *
 * Expo SDK 56 forces Android edge-to-edge, so the window no longer resizes when
 * the soft keyboard opens — it just overlays the bottom of the screen. To keep a
 * focused input visible we (1) pad the scroll content by the keyboard's height so
 * there is room to scroll the last field above it, and (2) scroll to the end on
 * every focus.
 */
import { useCallback, useEffect, useState } from 'react';
import { Keyboard, type ScrollView } from 'react-native';

/** Current soft-keyboard height in dp (0 when hidden). */
export function useKeyboardHeight() {
  const [height, setHeight] = useState(0);
  useEffect(() => {
    const show = Keyboard.addListener('keyboardDidShow', (e) =>
      setHeight(e.endCoordinates.height),
    );
    const hide = Keyboard.addListener('keyboardDidHide', () => setHeight(0));
    return () => {
      show.remove();
      hide.remove();
    };
  }, []);
  return height;
}

/**
 * Returns an onFocus handler that scrolls a ScrollView's focused input above
 * the keyboard. Scrolls on EVERY focus (not just the first): immediately for the
 * keyboard-already-open case (switching inputs), and again on a short delay and
 * on `keyboardDidShow` to cover the keyboard opening and the padding growing.
 */
export function useScrollToEnd(ref: { current: ScrollView | null }) {
  return useCallback(() => {
    const scroll = () => ref.current?.scrollToEnd({ animated: true });
    scroll();
    const t1 = setTimeout(scroll, 150);
    const t2 = setTimeout(scroll, 400);
    const sub = Keyboard.addListener('keyboardDidShow', scroll);
    setTimeout(() => {
      clearTimeout(t1);
      clearTimeout(t2);
      sub.remove();
    }, 1500);
  }, [ref]);
}
