import { createFileRoute } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import { Sparkles, Globe2, Users, MessageSquare, Heart, ArrowRight } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Otani Circle — Connect. Practice. Belong." },
      { name: "description", content: "A social platform for language exchange and cultural connection between Japan, the Philippines, and the world." },
      { property: "og:title", content: "Otani Circle" },
      { property: "og:description", content: "Connect. Practice. Belong." },
    ],
  }),
  component: Landing,
});

function Landing() {
  return (
    <div className="min-h-screen gradient-soft">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <div className="flex items-center gap-2 font-bold">
          <div className="grid h-9 w-9 place-items-center rounded-xl gradient-primary text-primary-foreground shadow-glow">
            <Sparkles className="h-4 w-4" />
          </div>
          <span className="text-lg tracking-tight">Otani Circle</span>
        </div>
        <nav className="flex items-center gap-2">
          <Link to="/login" className="rounded-xl px-4 py-2 text-sm font-medium text-foreground hover:bg-secondary">
            Sign in
          </Link>
          <Link
            to="/register"
            className="rounded-xl gradient-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-glow"
          >
            Join
          </Link>
        </nav>
      </header>

      <section className="mx-auto max-w-4xl px-6 py-20 text-center">
        <div className="mb-6 inline-flex items-center gap-2 rounded-full glass px-4 py-1.5 text-xs font-medium text-primary">
          <Globe2 className="h-3.5 w-3.5" />
          Japan · Philippines · World
        </div>
        <h1 className="text-5xl font-bold tracking-tight sm:text-7xl">
          Connect. Practice.<br />
          <span className="text-gradient">Belong.</span>
        </h1>
        <p className="mx-auto mt-6 max-w-xl text-lg text-muted-foreground">
          A modern social circle for language exchange and cultural friendship.
          Find partners, join groups, and grow together.
        </p>
        <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
          <Link
            to="/register"
            className="inline-flex items-center gap-2 rounded-xl gradient-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-glow"
          >
            Create your circle <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            to="/login"
            className="inline-flex items-center gap-2 rounded-xl glass px-6 py-3 text-sm font-semibold"
          >
            I already have an account
          </Link>
        </div>
      </section>

      <section className="mx-auto grid max-w-5xl gap-4 px-6 pb-20 sm:grid-cols-3">
        {[
          { icon: Users, title: "Real groups", desc: "JLPT study rooms, English practice, Anime fans, Filipinos in Japan." },
          { icon: MessageSquare, title: "Real posts", desc: "Share progress, ask questions, get culture tips from natives." },
          { icon: Heart, title: "Real friendships", desc: "Follow people you vibe with. Build a circle that lasts." },
        ].map((f) => (
          <div key={f.title} className="rounded-2xl glass p-6 shadow-card">
            <div className="mb-3 grid h-10 w-10 place-items-center rounded-xl bg-primary/10 text-primary">
              <f.icon className="h-5 w-5" />
            </div>
            <h3 className="font-semibold">{f.title}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{f.desc}</p>
          </div>
        ))}
      </section>

      <footer className="border-t py-8 text-center text-sm text-muted-foreground">
        © Otani Circle · Built for language learners
      </footer>
    </div>
  );
}
