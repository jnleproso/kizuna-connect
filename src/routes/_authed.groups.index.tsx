import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Users, Plus, Search, X } from "lucide-react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authed/groups/")({
  component: Groups,
});

function Groups() {
  const [groups, setGroups] = useState<any[]>([]);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [q, setQ] = useState("");
  const [cats, setCats] = useState<Set<string>>(new Set());
  const [sort, setSort] = useState<"new" | "popular">("new");

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("groups")
        .select("id,name,slug,description,category")
        .order("created_at", { ascending: false });
      setGroups(data || []);
      const { data: members } = await supabase.from("group_members").select("group_id");
      const c: Record<string, number> = {};
      members?.forEach((m) => (c[m.group_id] = (c[m.group_id] || 0) + 1));
      setCounts(c);
    })();
  }, []);

  const categories = useMemo(
    () => Array.from(new Set(groups.map((g) => g.category).filter(Boolean))).sort(),
    [groups],
  );

  const filtered = useMemo(() => {
    const ql = q.trim().toLowerCase();
    let arr = groups.filter((g) => {
      const matchesQ = !ql ||
        g.name?.toLowerCase().includes(ql) ||
        g.description?.toLowerCase().includes(ql) ||
        g.category?.toLowerCase().includes(ql);
      const matchesCat = cats.size === 0 || (g.category && cats.has(g.category));
      return matchesQ && matchesCat;
    });
    if (sort === "popular") arr = [...arr].sort((a, b) => (counts[b.id] || 0) - (counts[a.id] || 0));
    return arr;
  }, [groups, q, cats, sort, counts]);

  const toggleCat = (c: string) =>
    setCats((s) => {
      const n = new Set(s);
      n.has(c) ? n.delete(c) : n.add(c);
      return n;
    });

  return (
    <div className="mx-auto max-w-4xl space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Groups</h1>
          <p className="text-sm text-muted-foreground">Find your circle. Practice with others.</p>
        </div>
        <Link
          to="/groups/new"
          className="inline-flex items-center gap-1.5 rounded-xl gradient-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-glow"
        >
          <Plus className="h-4 w-4" />
          New group
        </Link>
      </div>

      <div className="space-y-3 rounded-2xl glass p-4 shadow-card">
        <div className="flex items-center gap-2 rounded-xl border bg-background/60 px-3">
          <Search className="h-4 w-4 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search groups by name, topic, category…"
            className="flex-1 bg-transparent py-3 text-sm outline-none"
          />
          {q && (
            <button onClick={() => setQ("")} className="rounded p-1 text-muted-foreground hover:bg-secondary">
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
        {categories.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {categories.map((c) => (
              <button
                key={c}
                onClick={() => toggleCat(c)}
                className={cn(
                  "rounded-full px-3 py-1 text-xs font-medium transition-colors",
                  cats.has(c)
                    ? "bg-primary text-primary-foreground shadow-glow"
                    : "border bg-background/60 text-muted-foreground hover:text-foreground",
                )}
              >
                {c}
              </button>
            ))}
            {cats.size > 0 && (
              <button onClick={() => setCats(new Set())} className="rounded-full border px-3 py-1 text-xs text-muted-foreground hover:bg-secondary">
                Clear
              </button>
            )}
          </div>
        )}
        <div className="flex items-center gap-2 text-xs">
          <span className="text-muted-foreground">Sort:</span>
          {(["new", "popular"] as const).map((s) => (
            <button
              key={s}
              onClick={() => setSort(s)}
              className={cn("rounded-lg px-2.5 py-1 font-medium", sort === s ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-secondary")}
            >
              {s === "new" ? "Newest" : "Most members"}
            </button>
          ))}
          <span className="ml-auto text-muted-foreground">{filtered.length} of {groups.length}</span>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((g) => (
          <Link
            key={g.id}
            to="/groups/$slug"
            params={{ slug: g.slug }}
            className="group rounded-2xl glass p-5 shadow-card transition-all hover:-translate-y-0.5 hover:shadow-glow"
          >
            <div className="mb-3 grid h-10 w-10 place-items-center rounded-xl bg-primary/10 text-primary">
              <Users className="h-5 w-5" />
            </div>
            <h3 className="font-semibold group-hover:text-primary">{g.name}</h3>
            {g.category && <div className="text-xs text-primary">{g.category}</div>}
            <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{g.description}</p>
            <div className="mt-3 text-xs text-muted-foreground">{counts[g.id] || 0} members</div>
          </Link>
        ))}
        {filtered.length === 0 && (
          <div className="col-span-full rounded-2xl glass p-10 text-center text-sm text-muted-foreground shadow-card">
            No groups match your filters.
          </div>
        )}
      </div>
    </div>
  );
}