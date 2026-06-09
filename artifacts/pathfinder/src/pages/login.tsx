import { SignIn } from "@clerk/react";
import { PublicLayout } from "@/components/layouts";

export default function Login() {
  return (
    <PublicLayout>
      <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md space-y-6">
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold text-foreground">Welcome Back</h1>
            <p className="text-muted-foreground text-sm">
              Sign in to continue your career discovery journey
            </p>
          </div>
          <div className="flex justify-center">
            <SignIn
              routing="path"
              path="/login"
              signUpUrl="/register"
              fallbackRedirectUrl="/dashboard"
            />
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}
