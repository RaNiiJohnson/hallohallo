import Image from "next/image";
import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
}

export function Logo({ className }: LogoProps) {
  return (
    <Image
      src="/logo.png"
      alt="Hallo Logo"
      width={32}
      height={32}
      className={cn("object-contain", className)}
      priority
    />
  );
}
