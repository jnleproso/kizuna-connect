import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Avatar } from "@/components/Avatar";
import { getThreads, subscribe, getPeerInfo } from "@/lib/messages";
import { formatDistanceToNow } from "date-fns";
import { MessageSquare } from "lucide-react";

export const Route = createFileRoute("/_authed/messages/")({
  component: MessagesIndex,
});

function MessagesIndex() {
  const [threads, setThreads] = useState(getThreads());
  useEffect(() => subscribe(() => setThreads(getThreads())), []);

  return (
    <div className="mx-auto max-w-2xl space-y-3">
      <div className="flex items-center gap-2">
        <MessageSquare className="h-5 w-5 text-primary" />
        <h1 className="text-2xl font-bold">Messages</h1>
      </div>
      <div className="overflow-hidden rounded-2xl glass shadow-card">
        {threads.length === 0 && (
          <div className="p-10 text-center text-sm text-muted-foreground">No conversations yet. Say hi to someone from Discover!</div>
        )}
        {threads.map((t) => {
          const peer = getPeerInfo(t.peerId);
          const last = t.messages[t.messages.length - 1];
          return (
            <Link
              key={t.peerId}
              to="/messages/$peerId"
              params={{ peerId: t.peerId }}
              className="flex items-center gap-3 border-b px-4 py-3 last:border-b-0 hover:bg-secondary/60"
            >
              <Avatar name={peer.display_name} src={peer.avatar_url} size={44} />
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline justify-between gap-2">
                  <span className="truncate font-semibold">{peer.display_name}</span>
                  {last && (
                    <span className="shrink-0 text-[11px] text-muted-foreground">
                      {formatDistanceToNow(new Date(last.at), { addSuffix: true })}
                    </span>
                  )}
                </div>
                <div className="truncate text-sm text-muted-foreground">
                  {last ? (last.from === "me" ? "You: " : "") + last.text : "No messages yet"}
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}