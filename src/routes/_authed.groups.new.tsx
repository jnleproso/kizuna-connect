import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { toast } from "sonner";

export const Route = createFileRoute("/_authed/groups/new")({
  component: NewGroup,
});

const slugify = (s: string) =>
  s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 60);

function NewGroup() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [category, setCategory] = useState("Language");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);
    const slug = slugify(name) + "-" + Math.random().toString(36).slice(2, 6);
    const { data, error } = await supabase
      .from("groups")
      .insert({ name, slug, category, description, created_by: user.id })
      .select("slug")
      .single();
    if (error) {
      setLoading(false);
      return toast.error(error.message);
    }
    await supabase.from("group_members").insert({ group_id: (await supabase.from("groups").select("id").eq("slug", data.slug).single()).data!.id, user_id: user.id });
    toast.success("Group created!");
    navigate({ to: "/groups/$slug", params: { slug: data.slug } });
  };

  return (
    <div className="mx-auto max-w-lg">
      <div className="rounded-2xl glass p-6 shadow-card">
        <h1 className="text-2xl font-bold">Create a group</h1>
        <p className="mt-1 text-sm text-muted-foreground">Build a circle around a language, country, or interest.</p>
        <form onSubmit={submit} className="mt-6 space-y-3">
          <input
            required
            placeholder="Group name (e.g. JLPT Study Room)"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-xl border bg-background/60 px-4 py-3 text-sm outline-none ring-primary/20 focus:ring-2"
          />
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full rounded-xl border bg-background/60 px-4 py-3 text-sm outline-none"
          >
            <option>Language</option>
            <option>Country</option>
            <option>Interest</option>
          </select>
          <textarea
            placeholder="What is this group about?"
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full resize-none rounded-xl border bg-background/60 px-4 py-3 text-sm outline-none ring-primary/20 focus:ring-2"
          />
          <button
            disabled={loading || !name.trim()}
            className="w-full rounded-xl gradient-primary py-3 text-sm font-semibold text-primary-foreground shadow-glow disabled:opacity-40"
          >
            {loading ? "Creating…" : "Create group"}
          </button>
        </form>
      </div>
    </div>
  );
}