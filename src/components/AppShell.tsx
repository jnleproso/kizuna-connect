import { Link, Outlet, useRouterState } from "@tanstack/react-router";
import { Home, Compass, Users, User, LogOut, Sparkles } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Avatar } from "./Avatar";
import { cn } from "@/lib/utils";

interface NavItem {
  to: string;
  label: string;
  icon: typeof Home;
}

const NAV: NavItem[] = [
  { to: "/feed", label: "Feed", icon: Home },
  { to: "/discover", label: "Discover", icon: Compass },
  { to: "/groups", label: "Groups", icon: Users },
];

export function AppShell() {
  const { user, signOut } = useAuth();
  const [me, setMe] = useState<{ username: string; display_name: string | null; avatar_url: string | null } | null>(null);
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    if (!user) return;
    supabase.from("profiles").select("username,display_name,avatar_url").eq("id", user.id).maybeSingle()
      .then(({ data }) => setMe(data));
  }, [user?.id]);

  const profileHref = me ? `/profile/${me.username}` : "/feed";

  return (
    <div className="min-h-screen gradient-soft pb-24 lg:pb-0">
      {/* Top nav */}
      <header className="sticky top-0 z-40 glass border-b">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          <Link to="/feed" className="flex items-center gap-2 font-bold">
            <div className="grid h-8 w-8 place-items-center rounded-lg gradient-primary text-primary-foreground shadow-glow">
              <Sparkles className="h-4 w-4" />
            </div>
            <span className="text-lg tracking-tight">Otani Circle</span>
          </Link>
          <nav className="hidden items-center gap-1 lg:flex">
            {NAV.map((n) => {
              const active = pathname.startsWith(n.to);
              const Icon = n.icon;
              return (
                <Link
                  key={n.to}
                  to={n.to}
                  className={cn(
                    "flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition-colors",
                    active ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground hover:bg-secondary",
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {n.label}
                </Link>
              );
            })}
          </nav>
          <div className="flex items-center gap-2">
            <Link to={profileHref} className="hidden sm:flex items-center gap-2 rounded-xl px-2 py-1 hover:bg-secondary">
              <Avatar name={me?.display_name || me?.username} src={me?.avatar_url} size={32} />
              <span className="text-sm font-medium">{me?.display_name || me?.username || "Me"}</span>
            </Link>
            <button
              onClick={signOut}
              className="rounded-xl p-2 text-muted-foreground hover:bg-secondary hover:text-foreground"
              aria-label="Sign out"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6">
        <Outlet />
      </main>

      {/* Bottom nav (mobile) */}
      <nav className="fixed bottom-4 left-1/2 z-40 -translate-x-1/2 lg:hidden">
        <div className="glass shadow-glow flex items-center gap-1 rounded-2xl px-2 py-2">
          {NAV.map((n) => {
            const active = pathname.startsWith(n.to);
            const Icon = n.icon;
            return (
              <Link
                key={n.to}
                to={n.to}
                className={cn(
                  "flex flex-col items-center justify-center gap-0.5 rounded-xl px-4 py-2 text-[10px] font-medium transition-all",
                  active ? "bg-primary text-primary-foreground shadow-glow" : "text-muted-foreground",
                )}
              >
                <Icon className="h-5 w-5" />
                {n.label}
              </Link>
            );
          })}
          <Link
            to={profileHref}
            className={cn(
              "flex flex-col items-center justify-center gap-0.5 rounded-xl px-4 py-2 text-[10px] font-medium transition-all",
              pathname.startsWith("/profile") ? "bg-primary text-primary-foreground shadow-glow" : "text-muted-foreground",
            )}
          >
            <User className="h-5 w-5" />
            Profile
          </Link>
        </div>
      </nav>
    </div>
  );
}