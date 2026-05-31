import { createFileRoute, Navigate } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/_authed")({
  component: Layout,
});

function Layout() {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="grid min-h-screen place-items-center gradient-soft">
        <div className="h-10 w-10 animate-pulse rounded-full gradient-primary" />
      </div>
    );
  }
  if (!user) return <Navigate to="/login" />;
  return <AppShell />;
}