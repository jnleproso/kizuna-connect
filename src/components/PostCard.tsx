import { Link } from "@tanstack/react-router";
import { Heart, MessageCircle } from "lucide-react";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { Avatar } from "./Avatar";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { splitPostImage } from "@/lib/mockData";

export interface FeedPost {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
  group_id: string | null;
  author: { username: string; display_name: string | null; avatar_url: string | null; country: string | null } | null;
  group: { name: string; slug: string } | null;
  like_count: number;
  comment_count: number;
  liked_by_me: boolean;
}

export function PostCard({ post, onChange }: { post: FeedPost; onChange?: () => void }) {
  const { user } = useAuth();
  const [liked, setLiked] = useState(post.liked_by_me);
  const [count, setCount] = useState(post.like_count);
  const [showComments, setShowComments] = useState(false);
  const { text, image } = splitPostImage(post.content);

  const toggleLike = async () => {
    if (!user) return;
    if (liked) {
      setLiked(false);
      setCount((c) => c - 1);
      await supabase.from("likes").delete().eq("post_id", post.id).eq("user_id", user.id);
    } else {
      setLiked(true);
      setCount((c) => c + 1);
      await supabase.from("likes").insert({ post_id: post.id, user_id: user.id });
    }
  };

  return (
    <article className="rounded-2xl glass p-5 shadow-card">
      <div className="flex items-start gap-3">
        <Link
          to="/profile/$username"
          params={{ username: post.author?.username ?? "" }}
        >
          <Avatar name={post.author?.display_name || post.author?.username} src={post.author?.avatar_url} />
        </Link>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-baseline gap-x-2 text-sm">
            <Link
              to="/profile/$username"
              params={{ username: post.author?.username ?? "" }}
              className="font-semibold hover:underline"
            >
              {post.author?.display_name || post.author?.username}
            </Link>
            <span className="text-muted-foreground">@{post.author?.username}</span>
            {post.author?.country && (
              <span className="text-xs text-muted-foreground">· {post.author.country}</span>
            )}
            <span className="text-xs text-muted-foreground">
              · {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
            </span>
          </div>
          {post.group && (
            <Link
              to="/groups/$slug"
              params={{ slug: post.group.slug }}
              className="mt-1 inline-block text-xs font-medium text-primary"
            >
              in {post.group.name}
            </Link>
          )}
          <p className="mt-2 whitespace-pre-wrap text-[15px] leading-relaxed">{text}</p>
          {image && (
            <img src={image} alt="" loading="lazy" className="mt-3 max-h-96 w-full rounded-xl object-cover" />
          )}

          <div className="mt-3 flex items-center gap-1 text-sm text-muted-foreground">
            <button
              onClick={toggleLike}
              className={cn(
                "flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 transition-colors hover:bg-secondary",
                liked && "text-primary",
              )}
            >
              <Heart className={cn("h-4 w-4", liked && "fill-current")} />
              {count}
            </button>
            <button
              onClick={() => setShowComments((s) => !s)}
              className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 hover:bg-secondary"
            >
              <MessageCircle className="h-4 w-4" />
              {post.comment_count}
            </button>
          </div>
          {showComments && <Comments postId={post.id} onChange={onChange} />}
        </div>
      </div>
    </article>
  );
}

function Comments({ postId, onChange }: { postId: string; onChange?: () => void }) {
  const { user } = useAuth();
  const [items, setItems] = useState<any[] | null>(null);
  const [text, setText] = useState("");

  const load = async () => {
    const { data } = await supabase
      .from("comments")
      .select("id, content, created_at, user_id, author:profiles!comments_user_id_fkey(username,display_name,avatar_url)")
      .eq("post_id", postId)
      .order("created_at", { ascending: true });
    setItems(data || []);
  };

  if (items === null) load();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !text.trim()) return;
    const t = text.trim();
    setText("");
    await supabase.from("comments").insert({ post_id: postId, user_id: user.id, content: t });
    await load();
    onChange?.();
  };

  return (
    <div className="mt-3 space-y-3 border-t pt-3">
      {items?.map((c) => (
        <div key={c.id} className="flex gap-2">
          <Avatar name={c.author?.display_name || c.author?.username} src={c.author?.avatar_url} size={28} />
          <div className="flex-1 rounded-xl bg-secondary px-3 py-2 text-sm">
            <div className="text-xs font-semibold">{c.author?.display_name || c.author?.username}</div>
            <div>{c.content}</div>
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
        <button className="rounded-xl gradient-primary px-3 text-sm font-medium text-primary-foreground">
          Send
        </button>
      </form>
    </div>
  );
}