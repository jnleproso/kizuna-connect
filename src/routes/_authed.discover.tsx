import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { Avatar } from "@/components/Avatar";
import { toast } from "sonner";
import { Search, MessageSquare } from "lucide-react";
import { MOCK_PEOPLE } from "@/lib/mockData";

export const Route = createFileRoute("/_authed/discover")({
  component: Discover,
});

function Discover() {
  const { user } = useAuth();
  const [people, setPeople] = useState<any[]>([]);
  const [following, setFollowing] = useState<Set<string>>(new Set());
  const [q, setQ] = useState("");

  const load = async () => {
    let query = supabase.from("profiles").select("id,username,display_name,avatar_url,country,native_language,learning_language,bio").limit(50);
    if (q.trim()) query = query.or(`username.ilike.%${q}%,display_name.ilike.%${q}%,country.ilike.%${q}%`);
    const { data } = await query;
    const real = (data || []).filter((p) => p.id !== user?.id);
    const ql = q.trim().toLowerCase();
    const mocks = MOCK_PEOPLE.filter((p) =>
      !ql ||
      p.username.toLowerCase().includes(ql) ||
      p.display_name.toLowerCase().includes(ql) ||
      p.country.toLowerCase().includes(ql) ||
      p.interests.some((i) => i.toLowerCase().includes(ql)),
    );
    setPeople([...real, ...mocks]);
    if (user) {
      const { data: f } = await supabase.from("follows").select("following_id").eq("follower_id", user.id);
      setFollowing(new Set(f?.map((x) => x.following_id) || []));
    }
  };

  useEffect(() => {
    load();
  }, [user?.id]);

  const toggle = async (id: string) => {
    if (!user) return;
    if (id.startsWith("mock-")) {
      setFollowing((s) => {
        const n = new Set(s);
        n.has(id) ? n.delete(id) : n.add(id);
        return n;
      });
      return;
    }
    if (following.has(id)) {
      await supabase.from("follows").delete().eq("follower_id", user.id).eq("following_id", id);
      setFollowing((s) => {
        const n = new Set(s);
        n.delete(id);
        return n;
      });
    } else {
      const { error } = await supabase.from("follows").insert({ follower_id: user.id, following_id: id });
      if (error) return toast.error(error.message);
      setFollowing((s) => new Set(s).add(id));
    }
  };

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <div className="rounded-2xl glass p-4 shadow-card">
        <div className="flex items-center gap-2 rounded-xl border bg-background/60 px-3">
          <Search className="h-4 w-4 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && load()}
            placeholder="Search by name, country, language…"
            className="flex-1 bg-transparent py-3 text-sm outline-none"
          />
          <button onClick={load} className="rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground">
            Search
          </button>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {people.map((p) => (
          <div key={p.id} className="flex items-start gap-3 rounded-2xl glass p-4 shadow-card">
            <Link to="/profile/$username" params={{ username: p.username }}>
              <Avatar name={p.display_name || p.username} src={p.avatar_url} size={48} />
            </Link>
            <div className="min-w-0 flex-1">
              <Link to="/profile/$username" params={{ username: p.username }} className="block font-semibold hover:underline">
                {p.display_name || p.username}
              </Link>
              <div className="text-xs text-muted-foreground">
                @{p.username}
                {p.country && ` · ${p.country}`}
              </div>
              {(p.native_language || p.learning_language) && (
                <div className="mt-1 text-xs">
                  <span className="text-muted-foreground">Speaks </span>
                  <span className="font-medium">{p.native_language || "—"}</span>
                  <span className="text-muted-foreground"> · Learning </span>
                  <span className="font-medium text-primary">{p.learning_language || "—"}</span>
                </div>
              )}
              {p.bio && <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{p.bio}</p>}
              {p.interests?.length > 0 && (
                <div className="mt-1.5 flex flex-wrap gap-1">
                  {p.interests.slice(0, 3).map((i: string) => (
                    <span key={i} className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">
                      {i}
                    </span>
                  ))}
                </div>
              )}
            </div>
            <div className="flex flex-col gap-1.5">
              <button
                onClick={() => toggle(p.id)}
                className={
                  following.has(p.id)
                    ? "rounded-lg border px-3 py-1.5 text-xs font-medium"
                    : "rounded-lg gradient-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground shadow-glow"
                }
              >
                {following.has(p.id) ? "Following" : "Follow"}
              </button>
              {p.id.startsWith("mock-") && (
                <Link
                  to="/messages/$peerId"
                  params={{ peerId: p.id }}
                  className="inline-flex items-center justify-center gap-1 rounded-lg border px-3 py-1.5 text-xs font-medium hover:bg-secondary"
                >
                  <MessageSquare className="h-3 w-3" /> Message
                </Link>
              )}
            </div>
          </div>
        ))}
        {people.length === 0 && (
          <div className="col-span-full rounded-2xl glass p-10 text-center text-sm text-muted-foreground shadow-card">
            No people found. Invite friends to join!
          </div>
        )}
      </div>
    </div>
  );
}