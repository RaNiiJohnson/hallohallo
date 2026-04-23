"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Share2,
  Facebook,
  Twitter,
  Linkedin,
  MessageCircle,
  Send,
} from "lucide-react";
import { Link } from "@/i18n/navigation";

interface ShareButtonProps {
  url?: string;
  text: string;
  variant?:
    | "default"
    | "destructive"
    | "outline"
    | "secondary"
    | "ghost"
    | "link";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
}

const SHARE_LINKS = (url: string, text: string) => ({
  facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
  twitter: `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`,
  linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
  whatsapp: `https://api.whatsapp.com/send?text=${encodeURIComponent(`${text} ${url}`)}`,
  telegram: `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`,
});

const NETWORKS = [
  { key: "facebook", label: "Facebook", Icon: Facebook },
  { key: "twitter", label: "Twitter", Icon: Twitter },
  { key: "linkedin", label: "LinkedIn", Icon: Linkedin },
  { key: "whatsapp", label: "WhatsApp", Icon: MessageCircle },
  { key: "telegram", label: "Telegram", Icon: Send },
] as const;

export function ShareButton({
  url,
  text,
  variant = "outline",
  size = "sm",
  className = "gap-2",
}: ShareButtonProps) {
  const currentUrl =
    url ?? (typeof window !== "undefined" ? window.location.href : "");

  const trigger = (
    <Button variant={variant} size={size} className={className}>
      <Share2 className="w-4 h-4" />
    </Button>
  );

  // Mobile ou navigateur supporté → menu natif
  if (navigator?.share) {
    return (
      <Button
        variant={variant}
        size={size}
        className={className}
        onClick={() => navigator.share({ title: text, text, url: currentUrl })}
      >
        <Share2 className="w-4 h-4" />
      </Button>
    );
  }

  const links = SHARE_LINKS(currentUrl, text);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>{trigger}</DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {NETWORKS.map(({ key, label, Icon }) => (
          <DropdownMenuItem key={key} asChild>
            <Link
              href={links[key]}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 cursor-pointer"
            >
              <Icon className="w-4 h-4" />
              {label}
            </Link>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
