import { SignUp } from "@clerk/react";
import { PublicLayout } from "@/components/layouts";

export default function Register() {
  return (
    <PublicLayout>
      <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md space-y-6">
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold text-foreground">Create Your Account</h1>
            <p className="text-muted-foreground text-sm">
              Join thousands of Nigerian students finding their career path
            </p>
          </div>
          <div className="flex justify-center">
            <SignUp
              routing="path"
              path="/register"
              signInUrl="/login"
              fallbackRedirectUrl="/profile"
            />
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}
