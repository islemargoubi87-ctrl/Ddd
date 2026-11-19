import {
  Clapperboard,
  Film,
  Flame,
  LayoutGrid,
  MonitorPlay,
  Package,
  PlayCircle,
  Radio,
  Send,
  ShieldCheck,
  Tv,
  Youtube,
} from 'lucide-react';

interface AppIconProps {
  appId: string;
  accentHex: string;
  glyph: string;
  size?: 'sm' | 'md' | 'lg';
}

const ICON_MAP: Record<string, typeof Tv> = {
  netmirror: MonitorPlay,
  netfly: Radio,
  reezn: Clapperboard,
  anikentv: Flame,
  fdroid: Package,
  castle: Tv,
  kodi: PlayCircle,
  vlc: Film,
  'moviebox-tv': Tv,
  'blu-movies': Clapperboard,
  localsend: Send,
  newpipe: Youtube,
  'atv-launcher-pro': LayoutGrid,
  'mpv-android': PlayCircle,
};

export function AppIcon({ appId, accentHex, glyph, size = 'md' }: AppIconProps) {
  const IconComponent = ICON_MAP[appId] ?? ShieldCheck;

  const dimensions =
    size === 'sm'
      ? 'h-10 w-10 rounded-xl'
      : size === 'lg'
        ? 'h-16 w-16 rounded-2xl'
        : 'h-13 w-13 rounded-2xl';

  const iconSize = size === 'sm' ? 'h-5 w-5' : size === 'lg' ? 'h-7 w-7' : 'h-6 w-6';

  return (
    <div
      className={`relative flex shrink-0 items-center justify-center overflow-hidden border ${dimensions}`}
      style={{
        backgroundColor: `${accentHex}14`,
        borderColor: `${accentHex}38`,
      }}
      aria-hidden="true"
    >
      {IconComponent ? (
        <IconComponent className={`relative z-10 ${iconSize}`} style={{ color: accentHex }} />
      ) : (
        <span className="relative z-10 font-display text-sm font-bold text-slate-900">{glyph}</span>
      )}
    </div>
  );
}
