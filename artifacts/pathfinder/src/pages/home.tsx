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
              <Link href="/sign-up">Start Your Assessment</Link>
            </Button>
            <Button size="lg" variant="outline" asChild className="bg-white/10 text-white hover:bg-white/20 border-white/20 w-full sm:w-auto h-14 text-lg px-8">
              <Link href="/sign-in">Login to Account</Link>
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

      {/* How it works */}
      <section className="py-20 px-6 bg-gray-50">
        <div className="max-w-4xl mx-auto text-center space-y-10">
          <h2 className="text-4xl font-bold text-gray-900">How It Works</h2>
          <div className="grid sm:grid-cols-3 gap-6">
            {[
              { step: "1", title: "Create Account", desc: "Sign up for free with your email or Google account." },
              { step: "2", title: "Take the Assessment", desc: "Answer 14 simple questions about your interests, skills, and personality." },
              { step: "3", title: "Get Your Results", desc: "Receive AI-powered career recommendations with JAMB subject combinations and roadmaps." },
            ].map(({ step, title, desc }) => (
              <div key={step} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm text-left space-y-3">
                <div className="w-10 h-10 rounded-full bg-primary text-white font-bold text-lg flex items-center justify-center">{step}</div>
                <h3 className="font-bold text-lg">{title}</h3>
                <p className="text-gray-500 text-sm">{desc}</p>
              </div>
            ))}
          </div>
          <Button asChild size="lg" className="mt-6 h-14 px-8 text-lg">
            <Link href="/sign-up">Get Started Free</Link>
          </Button>
        </div>
      </section>
    </PublicLayout>
  );
}
