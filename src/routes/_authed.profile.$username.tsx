import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { fetchPosts } from "@/lib/feed";
import { PostCard, type FeedPost } from "@/components/PostCard";
import { Avatar } from "@/components/Avatar";
import { MapPin, Languages, Settings, MessageSquare, Users as UsersIcon, LogOut, Camera } from "lucide-react";
import { toast } from "sonner";
import { registerPeer } from "@/lib/messages";
import { cn } from "@/lib/utils";
import { getMockPerson } from "@/lib/mockData";
import {
  followerPeople,
  followingPeople,
  isFollowingMock,
  myFollowing,
  removeFollower,
  subscribeFollows,
  toggleFollowMock,
} from "@/lib/follows";

export const Route = createFileRoute("/_authed/profile/$username")({
  component: Profile,
});

function Profile() {
  const { username } = Route.useParams();
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<any>(null);
  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [stats, setStats] = useState({ followers: 0, following: 0 });
  const [isFollowing, setIsFollowing] = useState(false);
  const [userGroups, setUserGroups] = useState<any[]>([]);
  const [tab, setTab] = useState<"posts" | "followers" | "following">("posts");
  const [followers, setFollowers] = useState<any[]>([]);
  const [followingList, setFollowingList] = useState<any[]>([]);
  const [isMock, setIsMock] = useState(false);
  const [, setTick] = useState(0);

  useEffect(() => {
    const unsub = subscribeFollows(() => setTick((t) => t + 1));
    return () => { unsub; };
  }, []);

  const load = async () => {
    const { data: p } = await supabase.from("profiles").select("*").eq("username", username).maybeSingle();
    if (!p) {
      const m = getMockPerson(username);
      if (m) {
        setProfile({ ...m, interests: m.interests });
        setIsMock(true);
        setStats({ followers: 128, following: 86 });
        setUserGroups([]);
        setFollowers([]);
        setFollowingList([]);
        setIsFollowing(isFollowingMock(m.id));
        setPosts([]);
      }
      return;
    }
    setIsMock(false);
    setProfile(p);
    setPosts(await fetchPosts({ userId: p.id, viewerId: user?.id }));
    const [{ count: followersCount }, { count: followingCount }] = await Promise.all([
      supabase.from("follows").select("*", { count: "exact", head: true }).eq("following_id", p.id),
      supabase.from("follows").select("*", { count: "exact", head: true }).eq("follower_id", p.id),
    ]);
    const isMe = user?.id === p.id;
    const mockFollowers = isMe ? followerPeople().length : 0;
    const mockFollowing = isMe ? followingPeople().length : 0;
    setStats({
      followers: (followersCount || 0) + mockFollowers,
      following: (followingCount || 0) + mockFollowing,
    });
    if (user) {
      const { data: f } = await supabase.from("follows").select("*").eq("follower_id", user.id).eq("following_id", p.id).maybeSingle();
      setIsFollowing(!!f);
    }
    const { data: gm } = await supabase
      .from("group_members")
      .select("group_id, groups(id,name,slug,category)")
      .eq("user_id", p.id);
    setUserGroups((gm || []).map((m: any) => m.groups).filter(Boolean));
    // Followers & following lists (two-step fetch — no FK reliance)
    const [{ data: frIds }, { data: fgIds }] = await Promise.all([
      supabase.from("follows").select("follower_id").eq("following_id", p.id),
      supabase.from("follows").select("following_id").eq("follower_id", p.id),
    ]);
    const frUserIds = (frIds || []).map((r: any) => r.follower_id);
    const fgUserIds = (fgIds || []).map((r: any) => r.following_id);
    const [realFollowers, realFollowing] = await Promise.all([
      frUserIds.length
        ? supabase.from("profiles").select("id,username,display_name,avatar_url,country").in("id", frUserIds)
        : Promise.resolve({ data: [] as any[] }),
      fgUserIds.length
        ? supabase.from("profiles").select("id,username,display_name,avatar_url,country").in("id", fgUserIds)
        : Promise.resolve({ data: [] as any[] }),
    ]);
    setFollowers([...(isMe ? followerPeople() : []), ...((realFollowers.data || []) as any[])]);
    setFollowingList([...(isMe ? followingPeople() : []), ...((realFollowing.data || []) as any[])]);
  };

  useEffect(() => {
    load();
  }, [username, user?.id]);

  const toggle = async () => {
    if (!user || !profile) return;
    if (isMock) {
      toggleFollowMock(profile.id);
      setIsFollowing(isFollowingMock(profile.id));
      return;
    }
    if (isFollowing) {
      await supabase.from("follows").delete().eq("follower_id", user.id).eq("following_id", profile.id);
    } else {
      const { error } = await supabase.from("follows").insert({ follower_id: user.id, following_id: profile.id });
      if (error) return toast.error(error.message);
    }
    load();
  };

  const changePhoto = async () => {
    if (!user) return;
    const url = window.prompt(
      "Paste an image URL for your profile photo (leave blank to use a random avatar):",
      profile?.avatar_url || "",
    );
    if (url === null) return;
    const next = url.trim() || `https://api.dicebear.com/7.x/thumbs/svg?seed=${encodeURIComponent(user.id + Date.now())}`;
    const { error } = await supabase.from("profiles").update({ avatar_url: next }).eq("id", user.id);
    if (error) return toast.error(error.message);
    toast.success("Profile photo updated");
    load();
  };

  const unfollow = (id: string, kind: "following" | "followers") => {
    if (id.startsWith("mock-")) {
      if (kind === "following") toggleFollowMock(id);
      else removeFollower(id);
      load();
      return;
    }
    if (kind === "following" && user) {
      supabase.from("follows").delete().eq("follower_id", user.id).eq("following_id", id).then(() => load());
    }
  };

  if (!profile) return <div className="py-12 text-center text-sm text-muted-foreground">Loading…</div>;

  const isMe = user?.id === profile.id;

  const messagePeer = (p: { id: string; username: string; display_name: string | null; avatar_url: string | null; country?: string | null }) => {
    registerPeer({
      id: p.id,
      username: p.username,
      display_name: p.display_name || p.username,
      avatar_url: p.avatar_url,
      country: p.country ?? null,
    });
    navigate({ to: "/messages/$peerId", params: { peerId: p.id } });
  };

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <div className="rounded-2xl glass p-6 shadow-card">
        <div className="flex items-start gap-4">
          <div className="relative">
            <Avatar name={profile.display_name || profile.username} src={profile.avatar_url} size={80} />
            {isMe && (
              <button
                onClick={changePhoto}
                className="absolute -bottom-1 -right-1 grid h-7 w-7 place-items-center rounded-full gradient-primary text-primary-foreground shadow-glow"
                aria-label="Change photo"
              >
                <Camera className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <h1 className="truncate text-xl font-bold">{profile.display_name || profile.username}</h1>
                <div className="text-sm text-muted-foreground">@{profile.username}</div>
              </div>
              <div className="flex flex-wrap items-center gap-1.5">
                {isMe ? (
                  <>
                    <Link to="/settings" className="inline-flex items-center gap-1 rounded-xl border px-3 py-1.5 text-xs font-medium hover:bg-secondary">
                      <Settings className="h-3.5 w-3.5" /> Edit
                    </Link>
                    <button
                      onClick={async () => { await signOut(); navigate({ to: "/login" }); }}
                      className="inline-flex items-center gap-1 rounded-xl border px-3 py-1.5 text-xs font-medium hover:bg-destructive/10 hover:text-destructive"
                    >
                      <LogOut className="h-3.5 w-3.5" /> Logout
                    </button>
                  </>
                ) : (
                  <>
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
                    <button
                      onClick={() => messagePeer(profile)}
                      className="inline-flex items-center gap-1 rounded-xl border px-3 py-1.5 text-xs font-medium hover:bg-secondary"
                    >
                      <MessageSquare className="h-3.5 w-3.5" /> Message
                    </button>
                  </>
                )}
              </div>
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
              <button onClick={() => setTab("followers")} className="hover:text-primary"><b>{stats.followers}</b> <span className="text-muted-foreground">followers</span></button>
              <button onClick={() => setTab("following")} className="hover:text-primary"><b>{stats.following}</b> <span className="text-muted-foreground">following</span></button>
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

      {/* Groups */}
      {userGroups.length > 0 && (
        <div className="rounded-2xl glass p-5 shadow-card">
          <div className="mb-3 flex items-center gap-2">
            <UsersIcon className="h-4 w-4 text-primary" />
            <h2 className="text-sm font-semibold">Groups</h2>
            <span className="text-xs text-muted-foreground">· {userGroups.length}</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {userGroups.map((g) => (
              <Link
                key={g.id}
                to="/groups/$slug"
                params={{ slug: g.slug }}
                className="rounded-full border bg-background/60 px-3 py-1 text-xs font-medium hover:bg-secondary"
              >
                {g.name}
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 rounded-xl glass p-1 shadow-card">
        {(["posts", "followers", "following"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn(
              "flex-1 rounded-lg px-3 py-2 text-xs font-semibold capitalize transition-colors",
              tab === t ? "bg-primary text-primary-foreground shadow-glow" : "text-muted-foreground hover:bg-secondary",
            )}
          >
            {t} {t === "followers" ? `· ${stats.followers}` : t === "following" ? `· ${stats.following}` : `· ${posts.length}`}
          </button>
        ))}
      </div>

      {tab === "posts" && (
        posts.length === 0 ? (
          <div className="rounded-2xl glass p-10 text-center text-sm text-muted-foreground shadow-card">No posts yet.</div>
        ) : (
          posts.map((p) => <PostCard key={p.id} post={p} onChange={load} />)
        )
      )}
      {(tab === "followers" || tab === "following") && (
        <PeopleList
          people={tab === "followers" ? followers : followingList}
          onMessage={messagePeer}
          emptyText={tab === "followers" ? "No followers yet." : "Not following anyone yet."}
          showMessage={isMe}
          onUnfollow={isMe ? (id) => unfollow(id, tab as "following" | "followers") : undefined}
          unfollowLabel={tab === "following" ? "Unfollow" : "Remove"}
        />
      )}
    </div>
  );
}

function PeopleList({
  people,
  onMessage,
  emptyText,
  showMessage,
  onUnfollow,
  unfollowLabel,
}: {
  people: any[];
  onMessage: (p: any) => void;
  emptyText: string;
  showMessage: boolean;
  onUnfollow?: (id: string) => void;
  unfollowLabel?: string;
}) {
  if (people.length === 0) {
    return <div className="rounded-2xl glass p-10 text-center text-sm text-muted-foreground shadow-card">{emptyText}</div>;
  }
  return (
    <div className="grid gap-2 sm:grid-cols-2">
      {people.map((p) => (
        <div key={p.id} className="flex items-center gap-3 rounded-2xl glass p-3 shadow-card">
          <Link to="/profile/$username" params={{ username: p.username }}>
            <Avatar name={p.display_name || p.username} src={p.avatar_url} size={40} />
          </Link>
          <div className="min-w-0 flex-1">
            <Link to="/profile/$username" params={{ username: p.username }} className="block truncate text-sm font-semibold hover:underline">
              {p.display_name || p.username}
            </Link>
            <div className="truncate text-xs text-muted-foreground">@{p.username}{p.country ? ` · ${p.country}` : ""}</div>
          </div>
          <div className="flex flex-col gap-1">
            {showMessage && (
              <button
                onClick={() => onMessage(p)}
                className="inline-flex items-center gap-1 rounded-lg border px-2.5 py-1.5 text-xs font-medium hover:bg-secondary"
              >
                <MessageSquare className="h-3 w-3" /> Message
              </button>
            )}
            {onUnfollow && (
              <button
                onClick={() => onUnfollow(p.id)}
                className="rounded-lg border px-2.5 py-1.5 text-xs font-medium hover:bg-destructive/10 hover:text-destructive"
              >
                {unfollowLabel || "Unfollow"}
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}