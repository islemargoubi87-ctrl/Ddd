import { useEffect } from 'react';

const FOCUSABLE_SELECTOR =
  'a[href]:not([disabled]), button:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

function getVisibleFocusableElements(): HTMLElement[] {
  return Array.from(document.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)).filter((el) => {
    const style = window.getComputedStyle(el);
    if (style.display === 'none' || style.visibility === 'hidden') return false;
    const rect = el.getBoundingClientRect();
    return rect.width > 0 && rect.height > 0;
  });
}

function findNextSpatialElement(
  current: HTMLElement | null,
  direction: 'up' | 'down' | 'left' | 'right',
  candidates: HTMLElement[]
): HTMLElement | null {
  if (!current) return candidates[0] ?? null;
  const curRect = current.getBoundingClientRect();
  const curCx = curRect.left + curRect.width / 2;
  const curCy = curRect.top + curRect.height / 2;

  let best: HTMLElement | null = null;
  let bestScore = Infinity;

  for (const el of candidates) {
    if (el === current) continue;
    const r = el.getBoundingClientRect();
    const cx = r.left + r.width / 2;
    const cy = r.top + r.height / 2;
    const dx = cx - curCx;
    const dy = cy - curCy;

    const inDirection =
      (direction === 'right' && dx > 12) ||
      (direction === 'left' && dx < -12) ||
      (direction === 'down' && dy > 12) ||
      (direction === 'up' && dy < -12);

    if (!inDirection) continue;

    const primary = direction === 'left' || direction === 'right' ? Math.abs(dx) : Math.abs(dy);
    const orthogonal = direction === 'left' || direction === 'right' ? Math.abs(dy) : Math.abs(dx);
    const score = primary + orthogonal * 2.5;

    if (score < bestScore) {
      bestScore = score;
      best = el;
    }
  }

  return best;
}

export function useTvRemoteNavigation(enabled: boolean) {
  useEffect(() => {
    document.documentElement.setAttribute('data-tv-mode', enabled ? 'true' : 'false');
    if (!enabled) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const isTextInput =
        target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA');

      if (isTextInput && (e.key === 'ArrowLeft' || e.key === 'ArrowRight')) {
        return;
      }

      const directionMap: Record<string, 'up' | 'down' | 'left' | 'right'> = {
        ArrowUp: 'up',
        ArrowDown: 'down',
        ArrowLeft: 'left',
        ArrowRight: 'right',
      };

      const direction = directionMap[e.key];
      if (!direction) return;

      const candidates = getVisibleFocusableElements();
      const active = document.activeElement instanceof HTMLElement ? document.activeElement : null;
      const next = findNextSpatialElement(active, direction, candidates);

      if (next) {
        e.preventDefault();
        next.focus({ preventScroll: false });
        next.scrollIntoView({ block: 'nearest', inline: 'nearest', behavior: 'smooth' });
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [enabled]);
}
