"use client";

import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation, useConvexAuth } from "convex/react";
import { usePaginatedQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { Id } from "@convex/_generated/dataModel";
import { MessageCircle, X, Minus, Send, ChevronLeft } from "lucide-react";
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
}: {
  community: Community;
  onBack: () => void;
  onClose: () => void;
}) {
  const [content, setContent] = useState("");
  const sendMessage = useMutation(api.messages.sendMessage);
  const me = useQuery(api.communities.getMe);
  const bottomRef = useRef<HTMLDivElement>(null);

  const { results, loadMore, status } = usePaginatedQuery(
    api.messages.getMessages,
    { communityId: community._id },
    { initialNumItems: 20 },
  );

  const messages = [...results].reverse();

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
      {/* Header */}
      <div className="flex items-center gap-2 px-3 py-2 border-b border-border bg-card shrink-0">
        <button
          onClick={onBack}
          className="text-muted-foreground hover:text-foreground transition-colors"
        >
          <ChevronLeft size={16} />
        </button>
        <div className="flex items-center gap-2 flex-1">
          <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-xs font-bold">
            r/
          </div>
          <span className="text-sm font-semibold text-foreground truncate">
            {community.name}
          </span>
        </div>
        <button
          onClick={onClose}
          className="text-muted-foreground hover:text-foreground transition-colors"
        >
          <X size={14} />
        </button>
      </div>

      {/* Messages — seul scroll ici */}
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

      {/* Input */}
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
}: {
  communities: Community[];
  onSelect: (c: Community) => void;
  onClose: () => void;
}) {
  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-3 py-2 border-b border-border bg-card shrink-0">
        <span className="text-sm font-semibold text-foreground">
          Mes communautés
        </span>
        <button
          onClick={onClose}
          className="text-muted-foreground hover:text-foreground transition-colors"
        >
          <X size={14} />
        </button>
      </div>
      <div className="flex-1 overflow-y-auto overscroll-contain">
        {communities.length === 0 ? (
          <p className="text-xs text-muted-foreground text-center p-4">
            Rejoignez une communauté pour accéder au chat.
          </p>
        ) : (
          communities.map((community) => (
            <button
              key={community._id}
              onClick={() => onSelect(community)}
              className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-muted transition-colors text-left"
            >
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-xs font-bold shrink-0">
                r/
              </div>
              <span className="text-sm text-foreground truncate">
                {community.name}
              </span>
            </button>
          ))
        )}
      </div>
    </div>
  );
}

// ─── Chat Widget ──────────────────────────────────────────

export function ChatWidget() {
  const { isAuthenticated } = useConvexAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedCommunity, setSelectedCommunity] = useState<Community | null>(
    null,
  );

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const communities = useQuery(
    api.communities.getMyCommunities,
    isAuthenticated ? {} : "skip",
  );

  if (!isAuthenticated || !communities || communities.length === 0) return null;

  const content = selectedCommunity ? (
    <ChatWindow
      community={selectedCommunity}
      onBack={() => setSelectedCommunity(null)}
      onClose={() => {
        setIsOpen(false);
        setSelectedCommunity(null);
      }}
    />
  ) : (
    <CommunityList
      communities={communities as Community[]}
      onSelect={setSelectedCommunity}
      onClose={() => setIsOpen(false)}
    />
  );

  return (
    <>
      {/* Mobile fullscreen — complètement séparé du container flottant */}
      {isOpen && (
        <div className="sm:hidden fixed inset-0 z-50 bg-background flex flex-col">
          {content}
        </div>
      )}

      {/* Desktop + bouton flottant */}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end gap-2">
        {isOpen && (
          <div className="hidden sm:flex w-80 h-96 bg-background border border-border rounded-xl shadow-xl overflow-hidden flex-col">
            {content}
          </div>
        )}

        {/* Bouton — caché sur mobile quand ouvert */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`w-12 h-12 rounded-full bg-primary text-primary-foreground items-center justify-center shadow-lg hover:bg-primary/90 transition-colors ${isOpen ? "hidden sm:flex" : "flex"}`}
        >
          {isOpen ? <Minus size={18} /> : <MessageCircle size={18} />}
        </button>
      </div>
    </>
  );
}
