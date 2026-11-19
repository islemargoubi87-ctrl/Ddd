import { WifiOff } from 'lucide-react';
import { useOnlineStatus } from '../hooks/useOnlineStatus';

export function OfflineIndicator() {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-4 left-4 z-50 flex items-center gap-2 rounded-xl border border-amber-300 bg-amber-50 px-3.5 py-2 text-xs font-semibold text-amber-900 shadow-lg"
    >
      <WifiOff className="h-4 w-4 text-amber-600 shrink-0" />
      <span>وضع عدم الاتصال — عرض البيانات المخزنة مؤقتاً</span>
    </div>
  );
}
