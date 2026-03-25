"use client";

import { getMascot, getMascotName, type MascotPose } from "@/lib/mascots";
import { useCurrentLocale } from "@/lib/locale-context";

interface Props {
  pose?: MascotPose;
  size?: number;
  className?: string;
  showName?: boolean;
  locale?: string;
}

export default function Mascot({ pose = "happy", size = 120, className = "", showName = false, locale: overrideLocale }: Props) {
  const contextLocale = useCurrentLocale();
  const locale = overrideLocale ?? contextLocale;
  const src = getMascot(locale, pose);
  const name = getMascotName(locale);

  return (
    <div className={`flex flex-col items-center ${className}`}>
      <img
        src={src}
        alt={`${name} the mascot`}
        width={size}
        height={size}
        className="object-contain"
      />
      {showName && (
        <p className="text-xs text-brown-400 mt-1 font-medium">{name}</p>
      )}
    </div>
  );
}
