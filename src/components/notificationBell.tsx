"use client";

import { useQuery, useMutation, useConvexAuth } from "convex/react";
import { api } from "@convex/_generated/api";
import { Bell, X, Minus } from "lucide-react";
import { useState, useEffect } from "react";
import { getRelativeTime } from "@/lib/date";
import Link from "next/link";

const notificationIcon: Record<string, string> = {
  new_comment: "💬",
  new_reply: "↩️",
  new_like: "✅",
  new_comment_like: "✅",
  new_reply_like: "✅",
};

export function NotificationWidget() {
  const { isAuthenticated } = useConvexAuth();
  const [isOpen, setIsOpen] = useState(false);

  const notifications = useQuery(
    api.notifications.getMyNotifications,
    isAuthenticated ? {} : "skip",
  );

  const unreadCount = useQuery(
    api.notifications.getUnreadCount,
    isAuthenticated ? {} : "skip",
  );

  const markAllRead = useMutation(api.notifications.markAllRead);
  const markOneRead = useMutation(api.notifications.markOneRead);

  // Échap pour fermer
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) setIsOpen(false);
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  // Marquer tout lu à l'ouverture
  const handleOpen = () => {
    setIsOpen(true);
    // if (unreadCount && unreadCount > 0) markAllRead();
  };

  if (!isAuthenticated) return null;

  return (
    <div className="fixed bottom-4 right-20 z-50 flex flex-col items-end gap-2">
      {/* Widget ouvert */}
      {isOpen && (
        <div className="w-80 bg-background border border-border rounded-xl shadow-xl overflow-hidden flex flex-col max-h-96">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-card shrink-0">
            <div className="flex items-center gap-2">
              <Bell size={15} className="text-foreground" />
              <span className="text-sm font-semibold text-foreground">
                Notifications
              </span>
              {unreadCount != null && unreadCount > 0 && (
                <span className="bg-primary text-primary-foreground text-xs px-1.5 py-0.5 rounded-full font-medium">
                  {unreadCount}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              {notifications && notifications.length > 0 && (
                <button
                  onClick={() => markAllRead()}
                  className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  Tout lu
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <Minus size={14} />
              </button>
            </div>
          </div>

          {/* Liste */}
          <div className="overflow-y-auto overscroll-contain">
            {!notifications || notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                <Bell size={24} className="mb-2 opacity-40" />
                <p className="text-sm">Aucune notification</p>
              </div>
            ) : (
              notifications.map((notif) => {
                const href =
                  notif.communitySlug && notif.postSlug
                    ? `/communities/${notif.communitySlug}/${notif.postSlug}`
                    : "/communities";

                return (
                  <Link
                    key={notif._id}
                    href={href}
                    onClick={() => {
                      if (!notif.read)
                        markOneRead({ notificationId: notif._id });
                      setIsOpen(false);
                    }}
                    className={`flex items-start gap-3 px-4 py-3 hover:bg-muted/50 transition-colors border-b border-border last:border-0 ${
                      !notif.read ? "bg-primary/5" : ""
                    }`}
                  >
                    <span className="text-base mt-0.5 shrink-0">
                      {notificationIcon[notif.type] ?? "🔔"}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-foreground leading-snug">
                        {notif.message}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {getRelativeTime(notif._creationTime)}
                      </p>
                    </div>
                    {!notif.read && (
                      <div className="w-2 h-2 rounded-full bg-primary shrink-0 mt-1.5" />
                    )}
                  </Link>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* Bouton flottant */}
      <button
        onClick={isOpen ? () => setIsOpen(false) : handleOpen}
        className="relative w-12 h-12 rounded-full bg-card border border-border text-foreground flex items-center justify-center shadow-lg hover:bg-muted transition-colors"
      >
        {isOpen ? <X size={18} /> : <Bell size={18} />}
        {!isOpen && unreadCount != null && unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary text-primary-foreground text-xs rounded-full flex items-center justify-center font-medium">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>
    </div>
  );
}
