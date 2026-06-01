import { useState } from "react";
import { Heart, MessageCircle } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { Avatar } from "./Avatar";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import type { MockPerson } from "@/lib/mockData";

interface Props {
  post: {
    id: string;
    content: string;
    created_at: string;
    author: MockPerson;
    like_count: number;
    comment_count: number;
  };
}

interface LocalComment { id: string; name: string; text: string }

export function MockPostCard({ post }: Props) {
  const [liked, setLiked] = useState(false);
  const [count, setCount] = useState(post.like_count);
  const [open, setOpen] = useState(false);
  const [comments, setComments] = useState<LocalComment[]>([
    { id: "c1", name: "Maria Santos", text: "Love this! 💕" },
    { id: "c2", name: "David Carter", text: "Same here, keep going!" },
  ]);
  const [text, setText] = useState("");

  const toggle = () => {
    setLiked((l) => !l);
    setCount((c) => (liked ? c - 1 : c + 1));
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    setComments((cs) => [...cs, { id: crypto.randomUUID(), name: "You", text: text.trim() }]);
    setText("");
  };

  return (
    <article className="rounded-2xl glass p-5 shadow-card">
      <div className="flex items-start gap-3">
        <Link to="/profile/$username" params={{ username: post.author.username }}>
          <Avatar name={post.author.display_name} src={post.author.avatar_url} />
        </Link>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-baseline gap-x-2 text-sm">
            <Link to="/profile/$username" params={{ username: post.author.username }} className="font-semibold hover:underline">
              {post.author.display_name}
            </Link>
            <span className="text-muted-foreground">@{post.author.username}</span>
            <span className="text-xs text-muted-foreground">· {post.author.country}</span>
            <span className="text-xs text-muted-foreground">· {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}</span>
          </div>
          <p className="mt-2 whitespace-pre-wrap text-[15px] leading-relaxed">{post.content}</p>
          <div className="mt-3 flex items-center gap-1 text-sm text-muted-foreground">
            <button onClick={toggle} className={cn("flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 transition-colors hover:bg-secondary", liked && "text-primary")}>
              <Heart className={cn("h-4 w-4", liked && "fill-current")} />
              {count}
            </button>
            <button onClick={() => setOpen((s) => !s)} className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 hover:bg-secondary">
              <MessageCircle className="h-4 w-4" />
              {comments.length}
            </button>
          </div>
          {open && (
            <div className="mt-3 space-y-3 border-t pt-3">
              {comments.map((c) => (
                <div key={c.id} className="flex gap-2">
                  <Avatar name={c.name} size={28} />
                  <div className="flex-1 rounded-xl bg-secondary px-3 py-2 text-sm">
                    <div className="text-xs font-semibold">{c.name}</div>
                    <div>{c.text}</div>
                  </div>
                </div>
              ))}
              <form onSubmit={submit} className="flex gap-2">
                <input
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Write a comment…"
                  className="flex-1 rounded-xl border bg-background/60 px-3 py-2 text-sm outline-none focus:ring-2 ring-primary/20"
                />
                <button className="rounded-xl gradient-primary px-3 text-sm font-medium text-primary-foreground">Send</button>
              </form>
            </div>
          )}
        </div>
      </div>
    </article>
  );
}