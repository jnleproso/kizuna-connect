import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { fetchPosts } from "@/lib/feed";
import { PostCard, type FeedPost } from "@/components/PostCard";
import { Avatar } from "@/components/Avatar";
import { MapPin, Languages, Settings } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authed/profile/$username")({
  component: Profile,
});

function Profile() {
  const { username } = Route.useParams();
  const { user } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [stats, setStats] = useState({ followers: 0, following: 0 });
  const [isFollowing, setIsFollowing] = useState(false);

  const load = async () => {
    const { data: p } = await supabase.from("profiles").select("*").eq("username", username).maybeSingle();
    setProfile(p);
    if (!p) return;
    setPosts(await fetchPosts({ userId: p.id, viewerId: user?.id }));
    const [{ count: followers }, { count: following }] = await Promise.all([
      supabase.from("follows").select("*", { count: "exact", head: true }).eq("following_id", p.id),
      supabase.from("follows").select("*", { count: "exact", head: true }).eq("follower_id", p.id),
    ]);
    setStats({ followers: followers || 0, following: following || 0 });
    if (user) {
      const { data: f } = await supabase.from("follows").select("*").eq("follower_id", user.id).eq("following_id", p.id).maybeSingle();
      setIsFollowing(!!f);
    }
  };

  useEffect(() => {
    load();
  }, [username, user?.id]);

  const toggle = async () => {
    if (!user || !profile) return;
    if (isFollowing) {
      await supabase.from("follows").delete().eq("follower_id", user.id).eq("following_id", profile.id);
    } else {
      const { error } = await supabase.from("follows").insert({ follower_id: user.id, following_id: profile.id });
      if (error) return toast.error(error.message);
    }
    load();
  };

  if (!profile) return <div className="py-12 text-center text-sm text-muted-foreground">Loading…</div>;

  const isMe = user?.id === profile.id;

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <div className="rounded-2xl glass p-6 shadow-card">
        <div className="flex items-start gap-4">
          <Avatar name={profile.display_name || profile.username} src={profile.avatar_url} size={80} />
          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <h1 className="truncate text-xl font-bold">{profile.display_name || profile.username}</h1>
                <div className="text-sm text-muted-foreground">@{profile.username}</div>
              </div>
              {isMe ? (
                <Link
                  to="/settings"
                  className="inline-flex items-center gap-1 rounded-xl border px-3 py-1.5 text-xs font-medium"
                >
                  <Settings className="h-3.5 w-3.5" /> Edit
                </Link>
              ) : (
                <button
                  onClick={toggle}
                  className={
                    isFollowing
                      ? "rounded-xl border px-3 py-1.5 text-xs font-medium"
                      : "rounded-xl gradient-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground shadow-glow"
                  }
                >
                  {isFollowing ? "Following" : "Follow"}
                </button>
              )}
            </div>
            {profile.bio && <p className="mt-2 text-sm">{profile.bio}</p>}
            <div className="mt-3 flex flex-wrap gap-3 text-xs text-muted-foreground">
              {profile.country && (
                <span className="inline-flex items-center gap-1">
                  <MapPin className="h-3 w-3" /> {profile.country}
                </span>
              )}
              {(profile.native_language || profile.learning_language) && (
                <span className="inline-flex items-center gap-1">
                  <Languages className="h-3 w-3" />
                  {profile.native_language || "—"} → <span className="text-primary">{profile.learning_language || "—"}</span>
                </span>
              )}
            </div>
            <div className="mt-3 flex gap-4 text-sm">
              <span><b>{stats.followers}</b> <span className="text-muted-foreground">followers</span></span>
              <span><b>{stats.following}</b> <span className="text-muted-foreground">following</span></span>
            </div>
            {profile.interests?.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-1.5">
                {profile.interests.map((i: string) => (
                  <span key={i} className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">
                    {i}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {posts.length === 0 ? (
        <div className="rounded-2xl glass p-10 text-center text-sm text-muted-foreground shadow-card">
          No posts yet.
        </div>
      ) : (
        posts.map((p) => <PostCard key={p.id} post={p} onChange={load} />)
      )}
    </div>
  );
}