import { useListRecommendations, getListRecommendationsQueryKey } from "@workspace/api-client-react";
import { ProtectedLayout } from "@/components/layouts";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "wouter";

export default function SavedResults() {
  const { data: recommendations, isLoading } = useListRecommendations({
    query: { queryKey: getListRecommendationsQueryKey() },
  });

  return (
    <ProtectedLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold" data-testid="text-saved-results-title">Saved Career Results</h1>
          <p className="text-muted-foreground mt-1">Review and compare your saved career recommendations.</p>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Card key={i}>
                <CardContent className="pt-6 space-y-3">
                  <Skeleton className="h-6 w-48" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : !recommendations?.length ? (
          <Card className="border-dashed" data-testid="card-empty-state">
            <CardContent className="pt-10 pb-10 text-center space-y-4">
              <p className="text-muted-foreground text-lg">No saved results yet.</p>
              <p className="text-muted-foreground text-sm">
                Complete the career assessment and save your results to see them here.
              </p>
              <Button asChild data-testid="button-take-assessment">
                <Link href="/assessment">Take Assessment</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {recommendations.map((rec) => (
              <Card key={rec.id} className="hover:shadow-md transition-shadow" data-testid={`card-recommendation-${rec.id}`}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <CardTitle className="text-xl" data-testid={`text-career-${rec.id}`}>{rec.topCareer}</CardTitle>
                      <p className="text-xs text-muted-foreground mt-1">
                        Saved on {new Date(rec.createdAt).toLocaleDateString("en-NG", { day: "numeric", month: "long", year: "numeric" })}
                      </p>
                    </div>
                    <Button asChild size="sm" variant="outline" data-testid={`link-view-${rec.id}`}>
                      <Link href={`/results/${rec.id}`}>View Details</Link>
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {(rec.alternativeCareers as string[]).length > 0 && (
                    <div>
                      <p className="text-xs text-muted-foreground mb-2">Alternative paths:</p>
                      <div className="flex flex-wrap gap-2">
                        {(rec.alternativeCareers as string[]).map((c) => (
                          <Badge key={c} variant="secondary" data-testid={`badge-alt-${rec.id}-${c}`}>{c}</Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  {(rec.jambSubjects as string[]).length > 0 && (
                    <div>
                      <p className="text-xs text-muted-foreground mb-2">JAMB subjects:</p>
                      <div className="flex flex-wrap gap-2">
                        {(rec.jambSubjects as string[]).map((s) => (
                          <Badge key={s} variant="outline" className="text-xs" data-testid={`badge-jamb-${rec.id}-${s}`}>{s}</Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </ProtectedLayout>
  );
}
