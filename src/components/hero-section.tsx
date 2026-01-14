"use client";

import Image from "next/image";
import { ReactNode } from "react";

interface HeroSectionProps {
  children?: ReactNode;
  title: string;
  subtitle: string;
  backgroundImage: string;
}

export function HeroSection({
  children,
  title,
  subtitle,
  backgroundImage,
}: HeroSectionProps) {
  return (
    <div className="relative w-full bg-background text-foreground overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <Image
          src={backgroundImage}
          alt="Hero background"
          fill
          className="object-cover opacity-30"
          priority
        />
        <div className="absolute inset-0 bg-linear-to-b from-background/75 from-0% via-transparent via-60% to-background to-100%" />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-6xl mx-auto px-4 pt-32 pb-16 sm:pt-40 sm:pb-24 flex flex-col items-center text-center">
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight mb-4">
          {title}
        </h1>
        <p className="text-lg sm:text-xl text-foreground/80 max-w-2xl mb-10">
          {subtitle}
        </p>

        {/* Filters Container */}
        {children && (
          <div className="w-full max-w-4xl bg-background/95 backdrop-blur-sm rounded-lg p-4 shadow-xl text-foreground ">
            {children}
          </div>
        )}
      </div>
    </div>
  );
}
