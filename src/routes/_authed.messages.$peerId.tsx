import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Avatar } from "@/components/Avatar";
import { getThread, sendMessage, subscribe, getPeerInfo } from "@/lib/messages";
import { ArrowLeft, Send } from "lucide-react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authed/messages/$peerId")({
  component: Thread,
});

function Thread() {
  const { peerId } = Route.useParams();
  const peer = getPeerInfo(peerId);
  const [thread, setThread] = useState(getThread(peerId));
  const [text, setText] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setThread(getThread(peerId));
    return subscribe(() => setThread(getThread(peerId)));
  }, [peerId]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [thread.messages.length]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    sendMessage(peerId, text.trim());
    setText("");
  };

  return (
    <div className="mx-auto flex h-[calc(100vh-9rem)] max-w-2xl flex-col rounded-2xl glass shadow-card">
      <header className="flex items-center gap-3 border-b px-4 py-3">
        <Link to="/messages" className="rounded-lg p-1.5 hover:bg-secondary">
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <Link to="/profile/$username" params={{ username: peer.username }} className="flex items-center gap-3">
          <Avatar name={peer.display_name} src={peer.avatar_url} size={36} />
          <div>
            <div className="text-sm font-semibold">{peer.display_name}</div>
            <div className="text-xs text-muted-foreground">@{peer.username} · {peer.country}</div>
          </div>
        </Link>
      </header>
      <div ref={scrollRef} className="flex-1 space-y-2 overflow-y-auto p-4">
        {thread.messages.map((m) => {
          const mine = m.from === "me";
          return (
            <div key={m.id} className={cn("flex", mine ? "justify-end" : "justify-start")}>
              <div className={cn(
                "max-w-[75%] rounded-2xl px-4 py-2 text-sm",
                mine ? "gradient-primary text-primary-foreground" : "bg-secondary",
              )}>
                {m.text}
              </div>
            </div>
          );
        })}
      </div>
      <form onSubmit={submit} className="flex gap-2 border-t p-3">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={`Message ${peer.display_name}…`}
          className="flex-1 rounded-xl border bg-background/60 px-4 py-2 text-sm outline-none focus:ring-2 ring-primary/20"
        />
        <button className="inline-flex items-center gap-1 rounded-xl gradient-primary px-4 text-sm font-semibold text-primary-foreground shadow-glow">
          <Send className="h-4 w-4" /> Send
        </button>
      </form>
    </div>
  );
}