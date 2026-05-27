"use client";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
} from "@/components/ui/sheet";
import { useWidget } from "@/components/WidgetContext";
import { useIsMobile } from "@/hooks/use-mobile";
import { useTimeTranslations } from "@/hooks/use-time-translations";
import { Link } from "@/i18n/navigation";
import { getRelativeTime } from "@/lib/date";
import { api } from "@convex/_generated/api";
import { useConvexAuth, useMutation, useQuery } from "convex/react";
import { Bell, X } from "lucide-react";
import { useEffect } from "react";

const notificationIcon: Record<string, string> = {
  new_comment: "💬",
  new_reply: "↩️",
  new_like: "✅",
  new_comment_like: "✅",
  new_reply_like: "✅",
  new_member: "👥",
  leave_community: "❌",
};

export function NotificationWidget() {
  const { isAuthenticated } = useConvexAuth();
  const { activeWidget, openWidget, closeWidget } = useWidget();
  const timeT = useTimeTranslations();
  const isMobile = useIsMobile();

  const isOpen = activeWidget === "notifications";

  const notifications = useQuery(
    api.notifications.queries.getMyNotifications,
    isAuthenticated ? {} : "skip",
  );

  const unreadCount = useQuery(
    api.notifications.queries.getUnreadCount,
    isAuthenticated ? {} : "skip",
  );

  const markAllRead = useMutation(api.notifications.mutations.markAllRead);
  const markOneRead = useMutation(api.notifications.mutations.markOneRead);

  // History back to close on mobile
  useEffect(() => {
    if (isOpen && isMobile)
      window.history.pushState({ notificationsOpen: true }, "");
    const handlePopState = () => {
      if (isOpen && isMobile) {
        closeWidget("notifications");
      }
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [isOpen, isMobile, closeWidget]);

  if (!isAuthenticated) return null;

  const handleOpenChange = (open: boolean) => {
    if (open) {
      openWidget("notifications");
    } else {
      closeWidget("notifications");
    }
  };

  const notificationListContent = (
    <div className="flex-1 overflow-y-auto overscroll-contain">
      {!notifications || notifications.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
          <Bell size={32} className="mb-2 opacity-40" />
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
                if (!notif.read) markOneRead({ notificationId: notif._id });
                closeWidget("notifications");
              }}
              className={`flex items-start gap-3.5 px-4 py-3.5 hover:bg-muted/50 transition-colors border-b border-border last:border-0 ${
                !notif.read ? "bg-primary/5" : ""
              }`}
            >
              <span className="text-lg mt-0.5 shrink-0">
                {notificationIcon[notif.type] ?? "🔔"}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-foreground leading-snug wrap-break-word">
                  {notif.message}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {getRelativeTime(notif._creationTime, timeT)}
                </p>
              </div>
              {!notif.read && (
                <div className="w-2 h-2 rounded-full bg-primary shrink-0 mt-2" />
              )}
            </Link>
          );
        })
      )}
    </div>
  );

  return (
    <div className="fixed bottom-4 right-20 z-50">
      {isMobile ? (
        <>
          {!isOpen && (
            <button
              onClick={() => openWidget("notifications")}
              className="relative w-12 h-12 rounded-full bg-card border border-border text-foreground flex items-center justify-center shadow-lg hover:bg-muted transition-colors"
            >
              <Bell size={18} />
              {unreadCount != null && unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary text-primary-foreground text-xs rounded-full flex items-center justify-center font-medium">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </button>
          )}

          <Sheet
            open={isOpen}
            onOpenChange={(open) => !open && closeWidget("notifications")}
          >
            <SheetContent
              side="bottom"
              className="h-[85vh] p-0 flex flex-col rounded-t-2xl overflow-hidden border-t border-border bg-background"
              showCloseButton={false}
            >
              <SheetTitle className="sr-only">Notifications</SheetTitle>
              <SheetDescription className="sr-only">
                Notifications
              </SheetDescription>
              {/* Header */}
              <div className="flex items-center justify-between px-4 py-3.5 border-b border-border bg-card shrink-0">
                <div className="flex items-center gap-2">
                  <Bell size={16} className="text-foreground" />
                  <span className="text-sm font-semibold text-foreground">
                    Notifications
                  </span>
                  {unreadCount != null && unreadCount > 0 && (
                    <span className="bg-primary text-primary-foreground text-xs px-1.5 py-0.5 rounded-full font-medium">
                      {unreadCount}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  {notifications && notifications.length > 0 && (
                    <button
                      onClick={() => markAllRead()}
                      className="text-xs text-muted-foreground hover:text-foreground transition-colors py-1 px-2 hover:bg-muted rounded-md"
                    >
                      Tout lu
                    </button>
                  )}
                  <button
                    onClick={() => closeWidget("notifications")}
                    className="text-muted-foreground hover:text-foreground transition-colors p-1 hover:bg-muted rounded-md"
                  >
                    <X className="size-5" />
                  </button>
                </div>
              </div>
              {notificationListContent}
            </SheetContent>
          </Sheet>
        </>
      ) : (
        <Popover open={isOpen} onOpenChange={handleOpenChange}>
          <PopoverTrigger asChild>
            <button className="relative w-12 h-12 rounded-full bg-card border border-border text-foreground flex items-center justify-center shadow-lg hover:bg-muted transition-colors">
              <Bell size={18} />
              {!isOpen && unreadCount != null && unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary text-primary-foreground text-xs rounded-full flex items-center justify-center font-medium">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </button>
          </PopoverTrigger>

          <PopoverContent
            side="top"
            align="end"
            sideOffset={8}
            className="w-80 p-0 rounded-xl border border-border shadow-xl overflow-hidden max-h-96 flex flex-col"
          >
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
              {notifications && notifications.length > 0 && (
                <button
                  onClick={() => markAllRead()}
                  className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  Tout lu
                </button>
              )}
            </div>
            {notificationListContent}
          </PopoverContent>
        </Popover>
      )}
    </div>
  );
}
