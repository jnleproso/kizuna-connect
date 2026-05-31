import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth";
import { fetchPosts } from "@/lib/feed";
import { PostCard, type FeedPost } from "@/components/PostCard";
import { Avatar } from "@/components/Avatar";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/_authed/feed")({
  component: Feed,
});

function Feed() {
  const { user } = useAuth();
  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);

  const load = async () => {
    const p = await fetchPosts({ viewerId: user?.id });
    setPosts(p);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, [user?.id]);

  const post = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !text.trim()) return;
    const { error } = await supabase.from("posts").insert({ user_id: user.id, content: text.trim() });
    if (error) return toast.error(error.message);
    setText("");
    toast.success("Posted");
    load();
  };

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <div className="rounded-2xl glass p-5 shadow-card">
        <form onSubmit={post} className="flex gap-3">
          <Avatar name={user?.email} />
          <div className="flex-1 space-y-2">
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="What are you practicing today? 今日は何を練習していますか？"
              rows={3}
              maxLength={2000}
              className="w-full resize-none rounded-xl border bg-background/60 px-4 py-3 text-sm outline-none ring-primary/20 focus:ring-2"
            />
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>{text.length}/2000</span>
              <button
                disabled={!text.trim()}
                className="rounded-xl gradient-primary px-5 py-2 text-sm font-semibold text-primary-foreground shadow-glow disabled:opacity-40"
              >
                Share
              </button>
            </div>
          </div>
        </form>
      </div>

      {loading ? (
        <div className="py-12 text-center text-sm text-muted-foreground">Loading feed…</div>
      ) : posts.length === 0 ? (
        <div className="rounded-2xl glass p-10 text-center text-sm text-muted-foreground shadow-card">
          Be the first to share something with the community.
        </div>
      ) : (
        posts.map((p) => <PostCard key={p.id} post={p} onChange={load} />)
      )}
    </div>
  );
}