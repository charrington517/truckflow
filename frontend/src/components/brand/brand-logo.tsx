import Image from "next/image";
import { cn } from "@/lib/utils";

type BrandLogoProps = {
  className?: string;
  markClassName?: string;
  wordmarkClassName?: string;
  compact?: boolean;
  priority?: boolean;
};

export function BrandLogo({ className, markClassName, wordmarkClassName, compact = false, priority = false }: BrandLogoProps) {
  if (compact) {
    return (
      <Image
        src="/brand/TruckFlowIcon.png"
        alt="TruckFlow"
        width={44}
        height={44}
        priority={priority}
        className={cn("h-10 w-10 rounded-lg object-contain shadow-glow", markClassName, className)}
      />
    );
  }

  return (
    <Image
      src="/brand/TruckFlowLogo.png"
      alt="TruckFlow"
      width={320}
      height={120}
      priority={priority}
      className={cn("h-14 w-auto object-contain", wordmarkClassName, className)}
    />
  );
}
