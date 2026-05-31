import { supabase } from "@/integrations/supabase/client";
import type { FeedPost } from "@/components/PostCard";

export async function fetchPosts(opts: { groupId?: string; userId?: string; viewerId?: string | null } = {}): Promise<FeedPost[]> {
  let q = supabase
    .from("posts")
    .select(
      "id, content, created_at, user_id, group_id, author:profiles!posts_user_id_fkey(username,display_name,avatar_url,country), group:groups(name,slug)"
    )
    .order("created_at", { ascending: false })
    .limit(50);
  if (opts.groupId) q = q.eq("group_id", opts.groupId);
  else if (!opts.userId) q = q.is("group_id", null);
  if (opts.userId) q = q.eq("user_id", opts.userId);

  const { data, error } = await q;
  if (error) throw error;
  const posts = data || [];
  if (posts.length === 0) return [];

  const ids = posts.map((p) => p.id);
  const [{ data: likes }, { data: comments }, { data: myLikes }] = await Promise.all([
    supabase.from("likes").select("post_id").in("post_id", ids),
    supabase.from("comments").select("post_id").in("post_id", ids),
    opts.viewerId
      ? supabase.from("likes").select("post_id").in("post_id", ids).eq("user_id", opts.viewerId)
      : Promise.resolve({ data: [] as { post_id: string }[] }),
  ]);

  const likeCount = new Map<string, number>();
  likes?.forEach((l) => likeCount.set(l.post_id, (likeCount.get(l.post_id) || 0) + 1));
  const commentCount = new Map<string, number>();
  comments?.forEach((c) => commentCount.set(c.post_id, (commentCount.get(c.post_id) || 0) + 1));
  const liked = new Set(myLikes?.map((l) => l.post_id) || []);

  return posts.map((p: any) => ({
    ...p,
    author: Array.isArray(p.author) ? p.author[0] : p.author,
    group: Array.isArray(p.group) ? p.group[0] : p.group,
    like_count: likeCount.get(p.id) || 0,
    comment_count: commentCount.get(p.id) || 0,
    liked_by_me: liked.has(p.id),
  }));
}