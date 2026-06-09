import { useEffect } from "react";
import { useAuth } from "@clerk/react";
import { setAuthTokenGetter } from "@workspace/api-client-react";
import { Switch, Route } from "wouter";
import { ClerkProvider } from "@clerk/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";

import Home from "@/pages/home";
import Login from "@/pages/login";
import Register from "@/pages/register";
import Dashboard from "@/pages/dashboard";
import Assessment from "@/pages/assessment";
import Results from "@/pages/results";
import SavedResults from "@/pages/saved-results";
import Profile from "@/pages/profile";
import NotFound from "@/pages/not-found";

const queryClient = new QueryClient();
const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");

function AuthTokenSetter({ children }: { children: React.ReactNode }) {
  const { getToken } = useAuth();
  useEffect(() => {
    setAuthTokenGetter(() => getToken());
  }, [getToken]);
  return <>{children}</>;
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/login" component={Login} />
      <Route path="/login/*" component={Login} />
      <Route path="/register" component={Register} />
      <Route path="/register/*" component={Register} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/assessment" component={Assessment} />
      <Route path="/results/:id" component={Results} />
      <Route path="/saved-results" component={SavedResults} />
      <Route path="/profile" component={Profile} />
      <Route component={NotFound} />
    </Switch>
  );
}

export default function App() {
  const clerkPubKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;
  if (!clerkPubKey) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-muted-foreground">Authentication configuration missing.</p>
      </div>
    );
  }

  return (
    <ClerkProvider
      publishableKey={clerkPubKey}
    >
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <AuthTokenSetter>
            <Router />
          </AuthTokenSetter>
          <Toaster />
        </TooltipProvider>
      </QueryClientProvider>
    </ClerkProvider>
  );
}
