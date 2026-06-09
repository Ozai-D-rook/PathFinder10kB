import { useGetStudentDashboard, getGetStudentDashboardQueryKey } from "@workspace/api-client-react";
import { ProtectedLayout } from "@/components/layouts";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "wouter";

export default function Dashboard() {
  const { data: dashboard, isLoading } = useGetStudentDashboard({
    query: { queryKey: getGetStudentDashboardQueryKey() },
  });

  return (
    <ProtectedLayout>
      <div className="space-y-8">
        {/* Welcome */}
        <div>
          {isLoading ? (
            <Skeleton className="h-9 w-64" />
          ) : (
            <h1 className="text-3xl font-bold text-foreground" data-testid="text-welcome">
              Welcome back{dashboard?.student ? `, ${dashboard.student.fullName.split(" ")[0]}` : ""}
            </h1>
          )}
          <p className="text-muted-foreground mt-1">
            Your career journey starts here. Let's find the right path for you.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card data-testid="card-assessments">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Assessments Taken</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-8 w-12" />
              ) : (
                <p className="text-3xl font-bold text-primary" data-testid="text-assessment-count">
                  {dashboard?.assessmentCount ?? 0}
                </p>
              )}
            </CardContent>
          </Card>
          <Card data-testid="card-saved">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Saved Results</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-8 w-12" />
              ) : (
                <p className="text-3xl font-bold text-primary" data-testid="text-saved-count">
                  {dashboard?.savedRecommendationsCount ?? 0}
                </p>
              )}
            </CardContent>
          </Card>
          <Card data-testid="card-profile">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Class Level</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-8 w-20" />
              ) : (
                <p className="text-3xl font-bold text-primary" data-testid="text-class-level">
                  {dashboard?.student?.classLevel ?? "—"}
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Assessment CTA */}
        <Card className="border-primary/20 bg-primary/5" data-testid="card-assessment-cta">
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-foreground">
                  {dashboard?.hasCompletedAssessment
                    ? "Take Another Assessment"
                    : "Start Your Career Assessment"}
                </h2>
                <p className="text-muted-foreground mt-1 text-sm">
                  {dashboard?.hasCompletedAssessment
                    ? "Retake the assessment to get updated recommendations based on your growth."
                    : "Answer 14 questions about your interests and strengths to get personalized career recommendations."}
                </p>
              </div>
              <Button asChild size="lg" className="shrink-0" data-testid="button-start-assessment">
                <Link href="/assessment">
                  {dashboard?.hasCompletedAssessment ? "Retake Assessment" : "Start Assessment"}
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Latest Recommendation */}
        {dashboard?.latestRecommendation && (
          <Card data-testid="card-latest-recommendation">
            <CardHeader>
              <CardTitle className="text-lg">Latest Recommendation</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-3">
                <Badge className="text-base px-3 py-1" data-testid="badge-top-career">
                  {dashboard.latestRecommendation.topCareer}
                </Badge>
              </div>
              {(dashboard.latestRecommendation.alternativeCareers as string[]).length > 0 && (
                <div>
                  <p className="text-xs text-muted-foreground mb-2">Alternative paths:</p>
                  <div className="flex flex-wrap gap-2">
                    {(dashboard.latestRecommendation.alternativeCareers as string[]).map((c) => (
                      <Badge key={c} variant="outline" data-testid={`badge-alt-career-${c}`}>{c}</Badge>
                    ))}
                  </div>
                </div>
              )}
              <div className="pt-2 flex gap-3">
                <Button asChild variant="outline" size="sm" data-testid="link-view-result">
                  <Link href={`/results/${dashboard.latestRecommendation.id}`}>View Full Result</Link>
                </Button>
                <Button asChild variant="ghost" size="sm" data-testid="link-saved-results">
                  <Link href="/saved-results">All Saved Results</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </ProtectedLayout>
  );
}
