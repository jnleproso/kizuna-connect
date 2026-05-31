import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Users, Plus } from "lucide-react";

export const Route = createFileRoute("/_authed/groups/")({
  component: Groups,
});

function Groups() {
  const [groups, setGroups] = useState<any[]>([]);
  const [counts, setCounts] = useState<Record<string, number>>({});

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

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {groups.map((g) => (
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
        {groups.length === 0 && (
          <div className="col-span-full rounded-2xl glass p-10 text-center text-sm text-muted-foreground shadow-card">
            No groups yet. Create the first one!
          </div>
        )}
      </div>
    </div>
  );
}