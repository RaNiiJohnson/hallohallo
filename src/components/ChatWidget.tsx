"use client";

import { useWidget } from "@/components/WidgetContext";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { useIsMobile } from "@/hooks/use-mobile";
import { useTimeTranslations } from "@/hooks/use-time-translations";
import { getRelativeTime } from "@/lib/date";
import { api } from "@convex/_generated/api";
import { Doc, Id } from "@convex/_generated/dataModel";
import {
  useConvexAuth,
  useMutation,
  usePaginatedQuery,
  useQuery,
} from "convex/react";
import {
  ChevronLeft,
  Edit2,
  Maximize2,
  MessageCircle,
  Minimize2,
  Minus,
  MoreVertical,
  Send,
  Trash,
  X,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";

type Community = {
  _id: Id<"communities">;
  name: string;
};

// ─── Long Press Hook ──────────────────────────────────────

function useLongPress(onLongPress: () => void, ms = 500) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const movedRef = useRef(false);

  const start = useCallback(() => {
    movedRef.current = false;
    timerRef.current = setTimeout(() => {
      if (!movedRef.current) onLongPress();
    }, ms);
  }, [onLongPress, ms]);

  const cancel = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const move = useCallback(() => {
    movedRef.current = true;
    cancel();
  }, [cancel]);

  useEffect(() => cancel, [cancel]);

  return {
    onTouchStart: start,
    onTouchEnd: cancel,
    onTouchMove: move,
  };
}

// ─── Delete Confirmation Dialog ───────────────────────────

function DeleteConfirmDialog({
  open,
  onOpenChange,
  onConfirm,
  isDeleting,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  isDeleting: boolean;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xs rounded-xl" showCloseButton={false}>
        <DialogHeader>
          <DialogTitle className="text-base">
            Supprimer le message ?
          </DialogTitle>
          <DialogDescription>
            Cette action est irréversible. Le message sera supprimé pour tout le
            monde.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex-row gap-2 sm:flex-row">
          <button
            onClick={() => onOpenChange(false)}
            className="flex-1 rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-muted transition-colors"
          >
            Annuler
          </button>
          <button
            onClick={onConfirm}
            disabled={isDeleting}
            className="flex-1 rounded-lg bg-destructive px-4 py-2 text-sm font-medium text-destructive-foreground hover:bg-destructive/90 transition-colors disabled:opacity-50"
          >
            {isDeleting ? "..." : "Supprimer"}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Message Bubble ───────────────────────────────────────

function MessageBubble({
  msg,
  isMe,
  editingMessageId,
  editContent,
  setEditingMessageId,
  setEditContent,
  handleEditSend,
  handleEditKeyDown,
  onDeleteRequest,
  timeT,
}: {
  msg: Doc<"communityMessages">;
  isMe: boolean;
  editingMessageId: Id<"communityMessages"> | null;
  editContent: string;
  setEditingMessageId: (id: Id<"communityMessages"> | null) => void;
  setEditContent: (content: string) => void;
  handleEditSend: () => void;
  handleEditKeyDown: (e: React.KeyboardEvent) => void;
  onDeleteRequest: (id: Id<"communityMessages">) => void;
  timeT: ReturnType<typeof useTimeTranslations>;
}) {
  const isEditing = editingMessageId === msg._id;
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // Long press for mobile — open the dropdown
  const longPressHandlers = useLongPress(
    useCallback(() => {
      if (isMe && !isEditing) setDropdownOpen(true);
    }, [isMe, isEditing]),
  );

  return (
    <div className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}>
      {!isMe && (
        <span className="text-xs font-medium text-muted-foreground mb-0.5 ml-1">
          {msg.authorName ?? "Anonyme"}
        </span>
      )}

      <div
        className={`group flex items-center gap-1.5 ${isMe ? "flex-row-reverse" : "flex-row"} max-w-[90%]`}
        {...(isMe && !isEditing ? longPressHandlers : {})}
      >
        <div
          className={`px-3 py-2 rounded-2xl text-sm wrap-break-word ${
            isMe
              ? "bg-primary text-primary-foreground rounded-br-none"
              : "bg-muted text-foreground rounded-bl-none"
          }`}
        >
          {isEditing ? (
            <div className="flex items-center gap-2 min-w-[200px]">
              <input
                autoFocus
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                onKeyDown={handleEditKeyDown}
                className="flex-1 text-sm bg-background text-foreground rounded px-2 py-1 outline-none"
              />
              <button
                onClick={handleEditSend}
                className="text-primary-foreground hover:opacity-80 shrink-0"
              >
                <Send size={14} />
              </button>
              <button
                onClick={() => setEditingMessageId(null)}
                className="text-primary-foreground hover:opacity-80 shrink-0"
              >
                <X size={14} />
              </button>
            </div>
          ) : (
            <span>{msg.content}</span>
          )}
        </div>

        {isMe && !isEditing && (
          <div className="opacity-0 group-hover:opacity-100 transition-opacity shrink-0 sm:block">
            <DropdownMenu open={dropdownOpen} onOpenChange={setDropdownOpen}>
              <DropdownMenuTrigger asChild>
                <button className="p-1 text-muted-foreground hover:text-foreground rounded-full hover:bg-muted">
                  <MoreVertical size={14} />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onClick={() => {
                    setEditingMessageId(msg._id);
                    setEditContent(msg.content);
                  }}
                >
                  <Edit2 size={14} className="mr-2" />
                  Modifier
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="text-destructive focus:text-destructive"
                  onClick={() => onDeleteRequest(msg._id)}
                >
                  <Trash size={14} className="mr-2" />
                  Supprimer
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
      </div>

      <div className="flex items-center gap-1.5 mt-0.5 mx-1">
        <span className="text-xs text-muted-foreground">
          {getRelativeTime(msg._creationTime, timeT)}
        </span>
        {msg.editedAt && (
          <span className="text-xs text-muted-foreground/70 italic">
            (modifié)
          </span>
        )}
      </div>
    </div>
  );
}

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
  const [editingMessageId, setEditingMessageId] =
    useState<Id<"communityMessages"> | null>(null);
  const [editContent, setEditContent] = useState("");
  const [deleteTarget, setDeleteTarget] =
    useState<Id<"communityMessages"> | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const sendMessage = useMutation(api.chat.mutations.sendMessage);
  const editMessage = useMutation(api.chat.mutations.editMessage);
  const deleteMessage = useMutation(api.chat.mutations.deleteMessage);
  const markAsRead = useMutation(api.chat.mutations.markAsRead);
  const me = useQuery(api.communities.queries.getMe);
  const bottomRef = useRef<HTMLDivElement>(null);

  const timeT = useTimeTranslations();

  const { results, loadMore, status } = usePaginatedQuery(
    api.chat.queries.getMessages,
    { communityId: community._id },
    { initialNumItems: 10 },
  );

  const messages = useMemo(() => [...results].reverse(), [results]);

  const containerRef = useRef<HTMLDivElement>(null);
  const [isAtBottom, setIsAtBottom] = useState(true);
  const [newCount, setNewCount] = useState(0);

  const handleScroll = () => {
    const el = containerRef.current;
    if (!el) return;
    const atBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 100;
    setIsAtBottom(atBottom);
    if (atBottom) setNewCount(0);
  };

  const lastMessageId = messages[messages.length - 1]?._id;

  // Marquer comme lu à l'ouverture
  useEffect(() => {
    markAsRead({ communityId: community._id });
  }, [community._id, markAsRead]);

  useEffect(() => {
    if (!lastMessageId) return;

    const lastMsg = messages[messages.length - 1];
    const isMe = me?._id === lastMsg.authorId;

    if (isAtBottom || isMe) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
      if (isMe) setNewCount(0);
    } else {
      setNewCount((c) => c + 1);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lastMessageId]);

  // ─── Send ───────────────────────────────────────────────

  const handleSend = async () => {
    if (!content.trim()) return;
    const text = content;
    setContent("");

    try {
      await sendMessage({ communityId: community._id, content: text });
    } catch {
      setContent(text); // Restore on error
      toast.error("Erreur lors de l'envoi");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // ─── Edit ───────────────────────────────────────────────

  const handleEditSend = async () => {
    if (!editContent.trim() || !editingMessageId) return;
    const prevId = editingMessageId;
    const prevContent = editContent;

    setEditingMessageId(null);
    setEditContent("");

    try {
      await editMessage({
        id: prevId,
        communityId: community._id,
        content: prevContent,
      });
    } catch {
      setEditingMessageId(prevId);
      setEditContent(prevContent);
      toast.error("Erreur lors de la modification");
    }
  };

  const handleEditKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleEditSend();
    }
    if (e.key === "Escape") {
      setEditingMessageId(null);
      setEditContent("");
    }
  };

  // ─── Delete ─────────────────────────────────────────────

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);

    try {
      await deleteMessage({ id: deleteTarget, communityId: community._id });
      setDeleteTarget(null);
    } catch {
      toast.error("Erreur lors de la suppression");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="flex flex-col h-full relative">
      <div className="flex items-center gap-2 px-4 py-3 sm:px-3 sm:py-2 border-b border-border bg-card shrink-0 z-20">
        <button
          onClick={onBack}
          className="text-muted-foreground hover:text-foreground transition-colors p-1 -ml-1 sm:p-0 sm:ml-0"
        >
          <ChevronLeft className="size-5 sm:size-4" />
        </button>
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <div className="w-7 h-7 sm:w-6 sm:h-6 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-xs font-bold shrink-0">
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
          className="text-muted-foreground hover:text-foreground transition-colors p-1 -mr-1 sm:p-0 sm:mr-0"
        >
          <X className="size-5 sm:size-4" />
        </button>
      </div>

      <div
        ref={containerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto p-3 space-y-2 overscroll-contain"
      >
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
            <MessageBubble
              key={msg._id}
              msg={msg}
              isMe={isMe}
              editingMessageId={editingMessageId}
              editContent={editContent}
              setEditingMessageId={setEditingMessageId}
              setEditContent={setEditContent}
              handleEditSend={handleEditSend}
              handleEditKeyDown={handleEditKeyDown}
              onDeleteRequest={setDeleteTarget}
              timeT={timeT}
            />
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Badge nouveau message */}
      {!isAtBottom && newCount > 0 && (
        <button
          onClick={() => {
            bottomRef.current?.scrollIntoView({ behavior: "smooth" });
            setNewCount(0);
          }}
          className="absolute bottom-16 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-xs font-medium px-3 py-1.5 rounded-full shadow-lg z-10 animate-in fade-in slide-in-from-bottom-2 flex items-center gap-1.5"
        >
          ↓ {newCount} nouveau{newCount > 1 ? "x" : ""}
        </button>
      )}

      <div className="p-2 border-t border-border bg-card shrink-0 relative z-20">
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

      {/* Delete confirmation dialog */}
      <DeleteConfirmDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
        onConfirm={handleDeleteConfirm}
        isDeleting={isDeleting}
      />
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
      <div className="flex items-center justify-between px-4 py-3 sm:px-3 sm:py-2 border-b border-border bg-card shrink-0">
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
            className="text-muted-foreground hover:text-foreground transition-colors p-1 -mr-1 sm:p-0 sm:mr-0"
          >
            <X className="size-5 sm:size-4" />
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
                className={`w-full flex items-center gap-3.5 px-4 py-3.5 sm:px-3 sm:py-2.5 hover:bg-muted transition-colors text-left ${
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
  const { activeWidget, openWidget, closeWidget } = useWidget();
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [selectedCommunity, setSelectedCommunity] = useState<Community | null>(
    null,
  );
  const isMobile = useIsMobile();

  const isOpen = activeWidget === "chat";

  const communities = useQuery(
    api.communities.queries.getMyCommunities,
    isAuthenticated ? {} : "skip",
  );
  const unreadIds =
    useQuery(
      api.chat.queries.getCommunitiesWithUnread,
      isAuthenticated ? {} : "skip",
    ) ?? [];

  const hasAnyUnread = unreadIds.length > 0;

  const handleClose = useCallback(() => {
    closeWidget("chat");
    setIsFullscreen(false);
    setSelectedCommunity(null);
  }, [closeWidget]);

  // History back to close on mobile
  useEffect(() => {
    if (isOpen && isMobile) window.history.pushState({ chatOpen: true }, "");
    const handlePopState = () => {
      if (isOpen && isMobile) {
        handleClose();
      }
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [isOpen, isMobile, handleClose]);

  if (!isAuthenticated || !communities) return null;

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

  const handleOpenChange = (open: boolean) => {
    if (open) {
      openWidget("chat");
    } else {
      handleClose();
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {isMobile ? (
        <>
          {!isOpen && (
            <button
              onClick={() => openWidget("chat")}
              className="relative w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-lg hover:bg-primary/90 transition-colors"
            >
              <MessageCircle size={18} />
              {hasAnyUnread && (
                <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 bg-destructive rounded-full border-2 border-background" />
              )}
            </button>
          )}

          <Sheet open={isOpen} onOpenChange={(open) => !open && handleClose()}>
            <SheetContent
              side="bottom"
              className="h-[85vh] p-0 flex flex-col rounded-t-2xl overflow-hidden border-t border-border bg-background"
              showCloseButton={false}
            >
              <SheetTitle className="sr-only">Chat</SheetTitle>
              <SheetDescription className="sr-only">
                Messagerie des communautés
              </SheetDescription>
              {content}
            </SheetContent>
          </Sheet>
        </>
      ) : (
        <Popover open={isOpen} onOpenChange={handleOpenChange}>
          <PopoverTrigger asChild>
            <button className="relative w-12 h-12 rounded-full text-primary-foreground flex items-center justify-center shadow-lg transition-colors sm:flex bg-primary hover:bg-primary/90">
              <MessageCircle size={18} />
              {hasAnyUnread && (
                <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 bg-destructive rounded-full border-2 border-background" />
              )}
            </button>
          </PopoverTrigger>

          {/* Dummy element for the minus button when open to maintain layout identical to what PopoverTrigger does */}
          {isOpen && (
            <button
              onClick={handleClose}
              className="relative w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-lg hover:bg-primary/90 transition-colors sm:hidden"
            >
              <Minus size={18} />
            </button>
          )}

          <PopoverContent
            side="top"
            align="end"
            sideOffset={8}
            className="hidden sm:flex p-0 rounded-xl border border-border shadow-xl overflow-hidden max-h-[85vh] flex-col w-80 h-96"
          >
            {content}
          </PopoverContent>
        </Popover>
      )}
    </div>
  );
}
