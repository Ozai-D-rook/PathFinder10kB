import { useEffect } from "react";
import { Link, useLocation } from "wouter";
import { useAuth, useClerk, Show } from "@clerk/react";
import { Button } from "@/components/ui/button";

export function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-background font-sans">
      <header className="px-6 py-4 border-b flex justify-between items-center bg-white sticky top-0 z-50">
        <Link href="/" className="text-xl font-bold text-primary flex items-center gap-2">
          PathFinder 10k
        </Link>
        <nav className="flex items-center gap-4">
          <Show when="signed-in">
            <Button asChild variant="default">
              <Link href="/dashboard">Dashboard</Link>
            </Button>
          </Show>
          <Show when="signed-out">
            <Button asChild variant="ghost">
              <Link href="/sign-in">Login</Link>
            </Button>
            <Button asChild variant="default" className="bg-accent text-accent-foreground hover:bg-accent/90">
              <Link href="/sign-up">Get Started</Link>
            </Button>
          </Show>
        </nav>
      </header>
      <main className="flex-1">
        {children}
      </main>
      <footer className="bg-primary text-primary-foreground py-12 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div>
            <h3 className="font-bold text-xl mb-2">PathFinder 10k</h3>
            <p className="text-primary-foreground/80">Helping Nigerian students discover the right university career path.</p>
          </div>
          <div className="text-sm text-primary-foreground/60">
            © {new Date().getFullYear()} PathFinder 10k. Borno State, Nigeria.
          </div>
        </div>
      </footer>
    </div>
  );
}

export function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const { isSignedIn, isLoaded } = useAuth();
  const { signOut } = useClerk();
  const [location, setLocation] = useLocation();

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      setLocation("/sign-in");
    }
  }, [isLoaded, isSignedIn, setLocation]);

  if (!isLoaded || !isSignedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-full border-4 border-primary border-t-transparent animate-spin" />
          <p className="text-muted-foreground text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  const navItems = [
    { href: "/dashboard", label: "Dashboard", icon: "📊" },
    { href: "/assessment", label: "Take Assessment", icon: "📝" },
    { href: "/saved-results", label: "Saved Results", icon: "⭐" },
    { href: "/profile", label: "My Profile", icon: "👤" },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 md:flex-row">
      <aside className="w-full md:w-64 bg-white border-r md:min-h-screen flex flex-col sticky top-0 md:h-screen z-40">
        <div className="p-4 border-b">
          <Link href="/dashboard" className="text-xl font-bold text-primary">PathFinder 10k</Link>
        </div>
        <nav className="flex-1 p-4 flex flex-col gap-1">
          {navItems.map(({ href, label, icon }) => (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                location === href
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <span>{icon}</span>
              {label}
            </Link>
          ))}
        </nav>
        <div className="p-4 border-t">
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start text-muted-foreground hover:text-destructive"
            onClick={() => signOut({ redirectUrl: "/" })}
          >
            <span className="mr-2">🚪</span>
            Sign Out
          </Button>
        </div>
      </aside>
      <main className="flex-1 p-6 md:p-8 overflow-auto">
        <div className="max-w-4xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
