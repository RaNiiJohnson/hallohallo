import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTimeTranslations } from "@/hooks/use-time-translations";
import { getRelativeTime } from "@/lib/date";
import { Doc, Id } from "@convex/_generated/dataModel";
import { Edit2, MoreVertical, Send, Trash, X } from "lucide-react";
import { useCallback, useState } from "react";
import { useLongPress } from "./useLongPress";

export function MessageBubble({
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
