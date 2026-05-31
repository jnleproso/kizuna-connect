import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { toast } from "sonner";

export const Route = createFileRoute("/_authed/settings")({
  component: Settings,
});

const COUNTRIES = ["Japan", "Philippines", "USA", "Canada", "Australia", "Singapore", "UK", "Other"];
const LANGS = ["English", "Japanese", "Filipino", "Spanish", "Chinese", "Korean", "Other"];
const INTERESTS = ["Anime", "Travel", "Gaming", "Food", "Business", "Technology", "Music", "Sports", "Art"];

function Settings() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState<any>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) return;
    supabase.from("profiles").select("*").eq("id", user.id).single().then(({ data }) => setForm(data));
  }, [user?.id]);

  if (!form) return <div className="py-12 text-center text-sm text-muted-foreground">Loading…</div>;

  const toggleInterest = (i: string) => {
    const cur: string[] = form.interests || [];
    setForm({ ...form, interests: cur.includes(i) ? cur.filter((x) => x !== i) : [...cur, i] });
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const { error } = await supabase
      .from("profiles")
      .update({
        display_name: form.display_name,
        bio: form.bio,
        country: form.country,
        native_language: form.native_language,
        learning_language: form.learning_language,
        interests: form.interests,
        updated_at: new Date().toISOString(),
      })
      .eq("id", user!.id);
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success("Profile updated");
    navigate({ to: "/profile/$username", params: { username: form.username } });
  };

  const input = "w-full rounded-xl border bg-background/60 px-4 py-3 text-sm outline-none ring-primary/20 focus:ring-2";

  return (
    <div className="mx-auto max-w-lg">
      <h1 className="mb-4 text-2xl font-bold">Edit profile</h1>
      <form onSubmit={save} className="space-y-3 rounded-2xl glass p-6 shadow-card">
        <div>
          <label className="text-xs font-medium text-muted-foreground">Display name</label>
          <input className={input} value={form.display_name || ""} onChange={(e) => setForm({ ...form, display_name: e.target.value })} />
        </div>
        <div>
          <label className="text-xs font-medium text-muted-foreground">Bio</label>
          <textarea rows={3} className={input + " resize-none"} value={form.bio || ""} onChange={(e) => setForm({ ...form, bio: e.target.value })} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-medium text-muted-foreground">Country</label>
            <select className={input} value={form.country || ""} onChange={(e) => setForm({ ...form, country: e.target.value })}>
              <option value="">—</option>
              {COUNTRIES.map((c) => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground">Native language</label>
            <select className={input} value={form.native_language || ""} onChange={(e) => setForm({ ...form, native_language: e.target.value })}>
              <option value="">—</option>
              {LANGS.map((c) => <option key={c}>{c}</option>)}
            </select>
          </div>
        </div>
        <div>
          <label className="text-xs font-medium text-muted-foreground">Learning</label>
          <select className={input} value={form.learning_language || ""} onChange={(e) => setForm({ ...form, learning_language: e.target.value })}>
            <option value="">—</option>
            {LANGS.map((c) => <option key={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <label className="text-xs font-medium text-muted-foreground">Interests</label>
          <div className="mt-2 flex flex-wrap gap-2">
            {INTERESTS.map((i) => {
              const on = (form.interests || []).includes(i);
              return (
                <button
                  type="button"
                  key={i}
                  onClick={() => toggleInterest(i)}
                  className={
                    on
                      ? "rounded-full bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground"
                      : "rounded-full border px-3 py-1.5 text-xs font-medium text-muted-foreground"
                  }
                >
                  {i}
                </button>
              );
            })}
          </div>
        </div>
        <button disabled={saving} className="w-full rounded-xl gradient-primary py-3 text-sm font-semibold text-primary-foreground shadow-glow disabled:opacity-40">
          {saving ? "Saving…" : "Save changes"}
        </button>
      </form>
    </div>
  );
}