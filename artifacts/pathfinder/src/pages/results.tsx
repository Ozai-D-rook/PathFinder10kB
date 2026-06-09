import { useGetRecommendation, getGetRecommendationQueryKey, useSaveRecommendation, getListRecommendationsQueryKey } from "@workspace/api-client-react";
import { ProtectedLayout } from "@/components/layouts";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { Link, useParams } from "wouter";
import { useQueryClient } from "@tanstack/react-query";

export default function Results() {
  const { id } = useParams<{ id: string }>();
  const recId = Number(id);
  const { data: rec, isLoading } = useGetRecommendation(recId, {
    query: { enabled: !!recId, queryKey: getGetRecommendationQueryKey(recId) },
  });
  const saveRec = useSaveRecommendation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleSave = () => {
    saveRec.mutate(
      { id: recId },
      {
        onSuccess: () => {
          toast({ title: "Saved!", description: "This recommendation has been saved to your profile." });
          queryClient.invalidateQueries({ queryKey: getGetRecommendationQueryKey(recId) });
          queryClient.invalidateQueries({ queryKey: getListRecommendationsQueryKey() });
        },
        onError: () => {
          toast({ title: "Error", description: "Could not save recommendation.", variant: "destructive" });
        },
      }
    );
  };

  return (
    <ProtectedLayout>
      <div className="space-y-6 max-w-3xl">
        <div className="flex items-center gap-4">
          <Button asChild variant="ghost" size="sm" data-testid="link-back">
            <Link href="/dashboard">← Back to Dashboard</Link>
          </Button>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-10 w-80" />
            {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-32 w-full" />)}
          </div>
        ) : !rec ? (
          <Card>
            <CardContent className="pt-8 text-center">
              <p className="text-muted-foreground">Recommendation not found.</p>
              <Button asChild className="mt-4" data-testid="link-go-dashboard">
                <Link href="/dashboard">Go to Dashboard</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Top Career */}
            <Card className="border-primary/30 bg-primary/5" data-testid="card-top-career">
              <CardHeader>
                <p className="text-sm font-medium text-primary uppercase tracking-wide">Top Career Recommendation</p>
                <CardTitle className="text-4xl font-extrabold text-foreground" data-testid="text-top-career">
                  {rec.topCareer}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {rec.reasonForRecommendation && (
                  <p className="text-muted-foreground text-sm leading-relaxed" data-testid="text-reason">
                    {rec.reasonForRecommendation}
                  </p>
                )}
                {!rec.isSaved && (
                  <Button
                    onClick={handleSave}
                    disabled={saveRec.isPending}
                    data-testid="button-save"
                  >
                    {saveRec.isPending ? "Saving..." : "Save This Result"}
                  </Button>
                )}
                {rec.isSaved && (
                  <Badge variant="secondary" data-testid="badge-saved">Saved to your profile</Badge>
                )}
              </CardContent>
            </Card>

            {/* Alternative Careers */}
            {(rec.alternativeCareers as string[]).length > 0 && (
              <Card data-testid="card-alternatives">
                <CardHeader>
                  <CardTitle className="text-lg">Alternative Career Paths</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-3">
                    {(rec.alternativeCareers as string[]).map((c) => (
                      <Badge key={c} variant="outline" className="text-sm px-3 py-1" data-testid={`badge-alt-${c}`}>
                        {c}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* AI Explanation */}
            {rec.aiExplanation && (
              <Card data-testid="card-ai-explanation">
                <CardHeader>
                  <CardTitle className="text-lg">What is {rec.topCareer}?</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground leading-relaxed" data-testid="text-ai-explanation">
                    {rec.aiExplanation}
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Career Roadmap */}
            {rec.aiRoadmap && (
              <Card data-testid="card-roadmap">
                <CardHeader>
                  <CardTitle className="text-lg">Your Career Roadmap</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {rec.aiRoadmap.split("\n").filter(Boolean).map((step, i) => (
                      <div key={i} className="flex gap-3 items-start text-sm text-muted-foreground leading-relaxed" data-testid={`text-roadmap-step-${i}`}>
                        <span className="shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary text-xs flex items-center justify-center font-bold mt-0.5">
                          {i + 1}
                        </span>
                        <p>{step.replace(/^\d+\.\s*/, "")}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="grid sm:grid-cols-2 gap-4">
              {/* Suitable Courses */}
              {(rec.suitableCourses as string[]).length > 0 && (
                <Card data-testid="card-courses">
                  <CardHeader>
                    <CardTitle className="text-lg">University Courses</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {(rec.suitableCourses as string[]).map((c) => (
                        <li key={c} className="flex items-center gap-2 text-sm" data-testid={`text-course-${c}`}>
                          <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                          {c}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}

              {/* Job Roles */}
              {(rec.jobRoles as string[]).length > 0 && (
                <Card data-testid="card-job-roles">
                  <CardHeader>
                    <CardTitle className="text-lg">Possible Job Roles</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {(rec.jobRoles as string[]).map((r) => (
                        <li key={r} className="flex items-center gap-2 text-sm" data-testid={`text-role-${r}`}>
                          <span className="w-1.5 h-1.5 rounded-full bg-accent shrink-0" />
                          {r}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* JAMB Subjects */}
            {(rec.jambSubjects as string[]).length > 0 && (
              <Card data-testid="card-jamb">
                <CardHeader>
                  <CardTitle className="text-lg">JAMB Subject Combination</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {(rec.jambSubjects as string[]).map((s) => (
                      <Badge key={s} className="text-sm px-3 py-1" data-testid={`badge-jamb-${s}`}>{s}</Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Skills */}
            {(rec.requiredSkills as string[]).length > 0 && (
              <Card data-testid="card-skills">
                <CardHeader>
                  <CardTitle className="text-lg">Skills You Need</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {(rec.requiredSkills as string[]).map((s) => (
                      <Badge key={s} variant="secondary" className="text-sm" data-testid={`badge-skill-${s}`}>{s}</Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* AI Encouragement */}
            {rec.aiEncouragement && (
              <Card className="border-accent/30 bg-accent/5" data-testid="card-encouragement">
                <CardHeader>
                  <CardTitle className="text-lg">A Message for You</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-foreground leading-relaxed italic" data-testid="text-encouragement">
                    "{rec.aiEncouragement}"
                  </p>
                </CardContent>
              </Card>
            )}

            <Separator />

            <div className="flex gap-3 pb-6">
              <Button asChild variant="outline" data-testid="link-retake">
                <Link href="/assessment">Retake Assessment</Link>
              </Button>
              <Button asChild data-testid="link-saved-results">
                <Link href="/saved-results">All Saved Results</Link>
              </Button>
            </div>
          </>
        )}
      </div>
    </ProtectedLayout>
  );
}
