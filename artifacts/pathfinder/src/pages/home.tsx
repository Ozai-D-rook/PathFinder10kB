import { PublicLayout } from "@/components/layouts";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

export default function Home() {
  return (
    <PublicLayout>
      {/* Hero Section */}
      <section className="py-24 px-6 bg-gradient-to-br from-primary to-primary/90 text-white text-center">
        <div className="max-w-4xl mx-auto space-y-6">
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight">Find Your True Career Path</h1>
          <p className="text-xl md:text-2xl text-white/90 max-w-2xl mx-auto">
            PathFinder 10k is an AI-powered career guidance counselor designed exclusively for secondary school students in Nigeria.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8">
            <Button size="lg" asChild className="bg-accent text-accent-foreground hover:bg-accent/90 w-full sm:w-auto h-14 text-lg px-8">
              <Link href="/register">Start Your Assessment</Link>
            </Button>
            <Button size="lg" variant="outline" asChild className="bg-white/10 text-white hover:bg-white/20 border-white/20 w-full sm:w-auto h-14 text-lg px-8">
              <Link href="/login">Login to Account</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 px-6 bg-white">
        <div className="max-w-6xl mx-auto text-center space-y-12">
          <h2 className="text-4xl font-bold text-gray-900">Why PathFinder 10k?</h2>
          <div className="grid md:grid-cols-3 gap-8 text-left">
            <div className="p-8 rounded-2xl bg-gray-50 border border-gray-100">
              <div className="w-12 h-12 bg-primary/10 text-primary flex items-center justify-center rounded-xl mb-6 text-2xl font-bold">1</div>
              <h3 className="text-xl font-bold mb-3">AI-Powered Insights</h3>
              <p className="text-gray-600">Get personalized career recommendations based on your unique skills, interests, and personality traits.</p>
            </div>
            <div className="p-8 rounded-2xl bg-gray-50 border border-gray-100">
              <div className="w-12 h-12 bg-accent/10 text-accent flex items-center justify-center rounded-xl mb-6 text-2xl font-bold">2</div>
              <h3 className="text-xl font-bold mb-3">JAMB Subject Guide</h3>
              <p className="text-gray-600">Know exactly which JAMB subjects you need for your chosen course to ensure admission success.</p>
            </div>
            <div className="p-8 rounded-2xl bg-gray-50 border border-gray-100">
              <div className="w-12 h-12 bg-primary/10 text-primary flex items-center justify-center rounded-xl mb-6 text-2xl font-bold">3</div>
              <h3 className="text-xl font-bold mb-3">Clear Roadmaps</h3>
              <p className="text-gray-600">Step-by-step guidance from secondary school to university and straight into the job market.</p>
            </div>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
