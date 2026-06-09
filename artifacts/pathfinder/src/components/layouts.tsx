import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { useAuth, UserButton } from "@clerk/react";
import { Button } from "@/components/ui/button";

export function PublicLayout({ children }: { children: React.ReactNode }) {
  const { isSignedIn } = useAuth();
  
  return (
    <div className="min-h-screen flex flex-col bg-background font-sans">
      <header className="px-6 py-4 border-b flex justify-between items-center bg-white sticky top-0 z-50">
        <Link href="/" className="text-xl font-bold text-primary flex items-center gap-2">
          PathFinder 10k
        </Link>
        <nav className="flex items-center gap-4">
          {isSignedIn ? (
            <Button asChild variant="default">
              <Link href="/dashboard">Dashboard</Link>
            </Button>
          ) : (
            <>
              <Button asChild variant="ghost">
                <Link href="/login">Login</Link>
              </Button>
              <Button asChild variant="default" className="bg-accent text-accent-foreground hover:bg-accent/90">
                <Link href="/register">Get Started</Link>
              </Button>
            </>
          )}
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
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      setLocation("/login");
    }
  }, [isLoaded, isSignedIn, setLocation]);

  if (!isLoaded || !isSignedIn) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 md:flex-row">
      <aside className="w-full md:w-64 bg-white border-r md:min-h-screen flex flex-col sticky top-0 md:h-screen">
        <div className="p-4 border-b">
          <Link href="/dashboard" className="text-xl font-bold text-primary">PathFinder 10k</Link>
        </div>
        <nav className="flex-1 p-4 flex flex-col gap-2">
          <Link href="/dashboard" className="block p-3 rounded hover:bg-gray-100 text-sm font-medium">Dashboard</Link>
          <Link href="/assessment" className="block p-3 rounded hover:bg-gray-100 text-sm font-medium">Take Assessment</Link>
          <Link href="/saved-results" className="block p-3 rounded hover:bg-gray-100 text-sm font-medium">Saved Results</Link>
          <Link href="/profile" className="block p-3 rounded hover:bg-gray-100 text-sm font-medium">My Profile</Link>
        </nav>
        <div className="p-4 border-t flex items-center gap-3">
          <UserButton afterSignOutUrl="/" />
          <span className="text-sm font-medium">Account</span>
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
