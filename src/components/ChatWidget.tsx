"use client";

import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation, useConvexAuth } from "convex/react";
import { usePaginatedQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { Id } from "@convex/_generated/dataModel";
import {
  MessageCircle,
  X,
  Minus,
  Send,
  ChevronLeft,
  Maximize2,
  Minimize2,
} from "lucide-react";
import { getRelativeTime } from "@/lib/date";
import { toast } from "sonner";

type Community = {
  _id: Id<"communities">;
  name: string;
};

// ─── Chat Window ──────────────────────────────────────────

function ChatWindow({
  community,
  onBack,
  onClose,
  isFullscreen,
  onToggleFullscreen,
}: {
  community: Community;
  onBack: () => void;
  onClose: () => void;
  isFullscreen: boolean;
  onToggleFullscreen: () => void;
}) {
  const [content, setContent] = useState("");
  const sendMessage = useMutation(api.messages.sendMessage);
  const markAsRead = useMutation(api.messages.markAsRead);
  const me = useQuery(api.communities.getMe);
  const bottomRef = useRef<HTMLDivElement>(null);

  const { results, loadMore, status } = usePaginatedQuery(
    api.messages.getMessages,
    { communityId: community._id },
    { initialNumItems: 10 },
  );

  const messages = [...results].reverse();

  // Marquer comme lu à l'ouverture
  useEffect(() => {
    markAsRead({ communityId: community._id });
  }, [community._id, markAsRead]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  const handleSend = async () => {
    if (!content.trim()) return;
    try {
      await sendMessage({ communityId: community._id, content });
      setContent("");
    } catch {
      toast.error("Erreur lors de l'envoi");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 px-3 py-2 border-b border-border bg-card shrink-0">
        <button
          onClick={onBack}
          className="text-muted-foreground hover:text-foreground transition-colors"
        >
          <ChevronLeft size={16} />
        </button>
        <div className="flex items-center gap-2 flex-1">
          <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-xs font-bold">
            {community.name[0]}
          </div>
          <span className="text-sm font-semibold text-foreground truncate">
            {community.name}
          </span>
        </div>
        <button
          onClick={onToggleFullscreen}
          className="hidden sm:block text-muted-foreground hover:text-foreground transition-colors mr-1"
        >
          {isFullscreen ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
        </button>
        <button
          onClick={onClose}
          className="text-muted-foreground hover:text-foreground transition-colors"
        >
          <X size={14} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-2 overscroll-contain">
        {status === "CanLoadMore" && (
          <button
            onClick={() => loadMore(20)}
            className="text-xs text-primary hover:underline text-center w-full mb-2"
          >
            Charger plus
          </button>
        )}
        {messages.map((msg) => {
          const isMe = me?._id === msg.authorId;
          return (
            <div
              key={msg._id}
              className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}
            >
              {!isMe && (
                <span className="text-xs font-medium text-muted-foreground mb-0.5 ml-1">
                  {msg.authorName ?? "Anonyme"}
                </span>
              )}
              <div
                className={`max-w-[75%] px-3 py-2 rounded-2xl text-sm wrap-break-word ${
                  isMe
                    ? "bg-primary text-primary-foreground rounded-br-none"
                    : "bg-muted text-foreground rounded-bl-none"
                }`}
              >
                {msg.content}
              </div>
              <span className="text-xs text-muted-foreground mt-0.5 mx-1">
                {getRelativeTime(msg._creationTime)}
              </span>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      <div className="p-2 border-t border-border bg-card shrink-0">
        <div className="flex items-center gap-2 bg-muted rounded-full px-3 py-1.5">
          <input
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Écrire un message..."
            className="flex-1 text-sm bg-transparent outline-none text-foreground placeholder:text-muted-foreground"
          />
          <button
            onClick={handleSend}
            disabled={!content.trim()}
            className="text-primary hover:text-primary/80 disabled:text-muted-foreground transition-colors"
          >
            <Send size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Community List ───────────────────────────────────────

function CommunityList({
  communities,
  onSelect,
  onClose,
  isFullscreen,
  onToggleFullscreen,
  unreadIds,
}: {
  communities: Community[];
  onSelect: (c: Community) => void;
  onClose: () => void;
  isFullscreen: boolean;
  onToggleFullscreen: () => void;
  unreadIds: string[];
}) {
  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-3 py-2 border-b border-border bg-card shrink-0">
        <span className="text-sm font-semibold text-foreground">
          Mes communautés
        </span>
        <div className="flex items-center gap-2">
          <button
            onClick={onToggleFullscreen}
            className="hidden sm:block text-muted-foreground hover:text-foreground transition-colors"
          >
            {isFullscreen ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
          </button>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <X size={14} />
          </button>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto overscroll-contain">
        {communities.length === 0 ? (
          <p className="text-xs text-muted-foreground text-center p-4">
            Rejoignez une communauté pour accéder au chat.
          </p>
        ) : (
          communities.map((community) => {
            const hasUnread = unreadIds.includes(community._id);
            return (
              <button
                key={community._id}
                onClick={() => onSelect(community)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 hover:bg-muted transition-colors text-left ${
                  hasUnread ? "bg-primary/5" : ""
                }`}
              >
                <div className="relative shrink-0">
                  <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-xs font-bold">
                    {community.name[0]}
                  </div>
                  {/* Point rouge si non lu */}
                  {hasUnread && (
                    <span className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-destructive rounded-full border-2 border-background" />
                  )}
                </div>
                <span
                  className={`text-sm truncate flex-1 ${hasUnread ? "font-semibold text-foreground" : "text-foreground"}`}
                >
                  {community.name}
                </span>
                {hasUnread && (
                  <span className="text-xs text-destructive font-medium shrink-0">
                    nouveau
                  </span>
                )}
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}

// ─── Chat Widget ──────────────────────────────────────────

export function ChatWidget() {
  const { isAuthenticated } = useConvexAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [selectedCommunity, setSelectedCommunity] = useState<Community | null>(
    null,
  );

  const communities = useQuery(
    api.communities.getMyCommunities,
    isAuthenticated ? {} : "skip",
  );
  const unreadIds =
    useQuery(
      api.messages.getCommunitiesWithUnread,
      isAuthenticated ? {} : "skip",
    ) ?? [];

  const hasAnyUnread = unreadIds.length > 0;

  useEffect(() => {
    if (isOpen) {
      const isMobile = window.matchMedia("(max-width: 639px)").matches;
      if (isMobile) document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        setIsOpen(false);
        setIsFullscreen(false);
        setSelectedCommunity(null);
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) window.history.pushState({ chatOpen: true }, "");
    const handlePopState = () => {
      if (isOpen) {
        setIsOpen(false);
        setIsFullscreen(false);
        setSelectedCommunity(null);
      }
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [isOpen]);

  if (!isAuthenticated || !communities || communities.length === 0) return null;

  const handleClose = () => {
    setIsOpen(false);
    setIsFullscreen(false);
    setSelectedCommunity(null);
  };

  const content = selectedCommunity ? (
    <ChatWindow
      community={selectedCommunity}
      onBack={() => setSelectedCommunity(null)}
      onClose={handleClose}
      isFullscreen={isFullscreen}
      onToggleFullscreen={() => setIsFullscreen(!isFullscreen)}
    />
  ) : (
    <CommunityList
      communities={communities as Community[]}
      onSelect={setSelectedCommunity}
      onClose={handleClose}
      isFullscreen={isFullscreen}
      onToggleFullscreen={() => setIsFullscreen(!isFullscreen)}
      unreadIds={unreadIds}
    />
  );

  const floatingBtn = (onClick: () => void) => (
    <button
      onClick={onClick}
      className="relative w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-lg hover:bg-primary/90 transition-colors"
    >
      {isOpen ? <Minus size={18} /> : <MessageCircle size={18} />}
      {!isOpen && hasAnyUnread && (
        <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 bg-destructive rounded-full border-2 border-background" />
      )}
    </button>
  );

  return (
    <>
      {/* Mobile fullscreen */}
      {isOpen && (
        <div className="sm:hidden fixed inset-0 z-50 bg-background flex flex-col">
          {content}
        </div>
      )}

      {/* Desktop */}
      <div className="fixed bottom-4 right-4 z-50 flex-col items-end gap-2 hidden sm:flex">
        {isOpen && (
          <div
            className={`bg-background border border-border rounded-xl shadow-xl overflow-hidden flex flex-col transition-all duration-200 ${
              isFullscreen
                ? "fixed top-4 bottom-4 right-4 w-full max-w-2xl h-auto"
                : "w-80 h-96"
            }`}
          >
            {content}
          </div>
        )}
        {floatingBtn(() => setIsOpen(!isOpen))}
      </div>

      {/* Bouton mobile */}
      {!isOpen && (
        <div className="sm:hidden fixed bottom-4 right-4 z-50">
          {floatingBtn(() => setIsOpen(true))}
        </div>
      )}
    </>
  );
}
