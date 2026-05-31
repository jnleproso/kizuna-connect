import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { fetchPosts } from "@/lib/feed";
import { PostCard, type FeedPost } from "@/components/PostCard";
import { Avatar } from "@/components/Avatar";
import { Users, ArrowLeft } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authed/groups/$slug")({
  component: GroupDetail,
});

function GroupDetail() {
  const { slug } = Route.useParams();
  const { user } = useAuth();
  const [group, setGroup] = useState<any>(null);
  const [members, setMembers] = useState<any[]>([]);
  const [joined, setJoined] = useState(false);
  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [text, setText] = useState("");

  const load = async () => {
    const { data: g } = await supabase.from("groups").select("*").eq("slug", slug).maybeSingle();
    setGroup(g);
    if (!g) return;
    const { data: m } = await supabase
      .from("group_members")
      .select("user_id, profile:profiles!group_members_user_id_fkey(username,display_name,avatar_url)")
      .eq("group_id", g.id);
    setMembers(m || []);
    setJoined(!!m?.find((x) => x.user_id === user?.id));
    setPosts(await fetchPosts({ groupId: g.id, viewerId: user?.id }));
  };

  useEffect(() => {
    load();
  }, [slug, user?.id]);

  const toggleJoin = async () => {
    if (!user || !group) return;
    if (joined) {
      await supabase.from("group_members").delete().eq("group_id", group.id).eq("user_id", user.id);
    } else {
      const { error } = await supabase.from("group_members").insert({ group_id: group.id, user_id: user.id });
      if (error) return toast.error(error.message);
    }
    load();
  };

  const post = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !group || !text.trim()) return;
    const { error } = await supabase.from("posts").insert({ user_id: user.id, group_id: group.id, content: text.trim() });
    if (error) return toast.error(error.message);
    setText("");
    load();
  };

  if (!group) return <div className="py-12 text-center text-sm text-muted-foreground">Loading group…</div>;

  return (
    <div className="mx-auto grid max-w-5xl gap-6 lg:grid-cols-[1fr_280px]">
      <div className="space-y-4">
        <Link to="/groups" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> All groups
        </Link>
        <div className="rounded-2xl glass p-6 shadow-card">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="text-xs font-medium text-primary">{group.category}</div>
              <h1 className="mt-1 text-2xl font-bold">{group.name}</h1>
              <p className="mt-2 text-sm text-muted-foreground">{group.description}</p>
            </div>
            <button
              onClick={toggleJoin}
              className={
                joined
                  ? "rounded-xl border px-4 py-2 text-sm font-medium"
                  : "rounded-xl gradient-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-glow"
              }
            >
              {joined ? "Leave" : "Join"}
            </button>
          </div>
        </div>

        {joined && (
          <form onSubmit={post} className="rounded-2xl glass p-4 shadow-card">
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={3}
              maxLength={2000}
              placeholder={`Post to ${group.name}…`}
              className="w-full resize-none rounded-xl border bg-background/60 px-4 py-3 text-sm outline-none ring-primary/20 focus:ring-2"
            />
            <div className="mt-2 flex justify-end">
              <button
                disabled={!text.trim()}
                className="rounded-xl gradient-primary px-5 py-2 text-sm font-semibold text-primary-foreground shadow-glow disabled:opacity-40"
              >
                Share
              </button>
            </div>
          </form>
        )}

        {posts.length === 0 ? (
          <div className="rounded-2xl glass p-10 text-center text-sm text-muted-foreground shadow-card">
            No posts in this group yet.
          </div>
        ) : (
          posts.map((p) => <PostCard key={p.id} post={p} onChange={load} />)
        )}
      </div>

      <aside className="space-y-3">
        <div className="rounded-2xl glass p-4 shadow-card">
          <div className="mb-3 flex items-center gap-2 text-sm font-semibold">
            <Users className="h-4 w-4 text-primary" /> Members ({members.length})
          </div>
          <div className="space-y-2">
            {members.slice(0, 12).map((m) => (
              <Link
                key={m.user_id}
                to="/profile/$username"
                params={{ username: m.profile?.username ?? "" }}
                className="flex items-center gap-2 rounded-lg p-1.5 hover:bg-secondary"
              >
                <Avatar name={m.profile?.display_name || m.profile?.username} src={m.profile?.avatar_url} size={28} />
                <span className="truncate text-sm">{m.profile?.display_name || m.profile?.username}</span>
              </Link>
            ))}
          </div>
        </div>
      </aside>
    </div>
  );
}