import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/lib/auth";
import { fetchPosts } from "@/lib/feed";
import { PostCard, type FeedPost } from "@/components/PostCard";
import { MockPostCard } from "@/components/MockPostCard";
import { MOCK_POSTS, SAMPLE_POST_IMAGES, IMG_PREFIX } from "@/lib/mockData";
import { Avatar } from "@/components/Avatar";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ImageIcon, Upload, X } from "lucide-react";

export const Route = createFileRoute("/_authed/feed")({
  component: Feed,
});

function Feed() {
  const { user } = useAuth();
  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);
  const [image, setImage] = useState<string | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

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
    const content = image ? `${text.trim()}\n\n${IMG_PREFIX}${image}` : text.trim();
    const { error } = await supabase.from("posts").insert({ user_id: user.id, content });
    if (error) return toast.error(error.message);
    setText("");
    setImage(null);
    setPickerOpen(false);
    toast.success("Posted");
    load();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be under 5 MB");
      if (fileRef.current) fileRef.current.value = "";
      return;
    }
    setUploading(true);
    const ext = file.name.split(".").pop() || "jpg";
    const path = `${crypto.randomUUID()}.${ext}`;
    const { error: upErr } = await supabase.storage.from("post-images").upload(path, file, {
      contentType: file.type,
    });
    if (upErr) {
      toast.error(upErr.message);
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
      return;
    }
    const { data: signedData, error: signErr } = await supabase.storage.from("post-images").createSignedUrl(path, 315360000);
    if (signErr || !signedData?.signedUrl) {
      toast.error(signErr?.message || "Failed to generate image URL");
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
      return;
    }
    setImage(signedData.signedUrl);
    setPickerOpen(false);
    setUploading(false);
    if (fileRef.current) fileRef.current.value = "";
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
            {image && (
              <div className="relative">
                <img src={image} alt="" className="max-h-64 w-full rounded-xl object-cover" />
                <button
                  type="button"
                  onClick={() => setImage(null)}
                  className="absolute right-2 top-2 grid h-7 w-7 place-items-center rounded-full bg-background/80 backdrop-blur hover:bg-background"
                  aria-label="Remove image"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}
            {pickerOpen && !image && (
              <div className="grid grid-cols-4 gap-2">
                {SAMPLE_POST_IMAGES.map((u) => (
                  <button
                    type="button"
                    key={u}
                    onClick={() => { setImage(u); setPickerOpen(false); }}
                    className="overflow-hidden rounded-lg border hover:ring-2 ring-primary"
                  >
                    <img src={u} alt="" className="h-16 w-full object-cover" loading="lazy" />
                  </button>
                ))}
              </div>
            )}
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setPickerOpen((s) => !s)}
                  className="inline-flex items-center gap-1 rounded-lg border px-2.5 py-1.5 text-xs font-medium hover:bg-secondary"
                >
                  <ImageIcon className="h-3.5 w-3.5" /> Photo
                </button>
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  disabled={uploading}
                  className="inline-flex items-center gap-1 rounded-lg border px-2.5 py-1.5 text-xs font-medium hover:bg-secondary disabled:opacity-40"
                >
                  <Upload className="h-3.5 w-3.5" /> {uploading ? "Uploading…" : "Upload"}
                </button>
                <input
                  type="file"
                  accept="image/*"
                  ref={fileRef}
                  onChange={handleFileChange}
                  className="hidden"
                />
                <span>{text.length}/2000</span>
              </div>
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
      ) : (
        <>
          {posts.map((p) => <PostCard key={p.id} post={p} onChange={load} />)}
          {MOCK_POSTS.map((p) => <MockPostCard key={p.id} post={p} />)}
        </>
      )}
    </div>
  );
}
