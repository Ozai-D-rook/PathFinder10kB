import { useEffect } from "react";
import { useGetStudentProfile, useCreateStudentProfile, getGetStudentProfileQueryKey, getGetStudentDashboardQueryKey } from "@workspace/api-client-react";
import { ProtectedLayout } from "@/components/layouts";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQueryClient } from "@tanstack/react-query";

const profileSchema = z.object({
  fullName: z.string().min(2, "Full name is required"),
  schoolName: z.string().min(2, "School name is required"),
  phoneNumber: z.string().optional(),
  classLevel: z.enum(["SSS1", "SSS2", "SSS3", "JAMBite"]),
});
type ProfileForm = z.infer<typeof profileSchema>;

export default function Profile() {
  const { data: profile, isLoading } = useGetStudentProfile({
    query: { queryKey: getGetStudentProfileQueryKey() },
  });
  const updateProfile = useCreateStudentProfile();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: { fullName: "", schoolName: "", phoneNumber: "", classLevel: "SSS1" },
  });

  useEffect(() => {
    if (profile) {
      form.reset({
        fullName: profile.fullName,
        schoolName: profile.schoolName,
        phoneNumber: profile.phoneNumber ?? "",
        classLevel: profile.classLevel as ProfileForm["classLevel"],
      });
    }
  }, [profile]);

  const onSubmit = (data: ProfileForm) => {
    updateProfile.mutate(
      { data: { fullName: data.fullName, schoolName: data.schoolName, phoneNumber: data.phoneNumber, classLevel: data.classLevel } },
      {
        onSuccess: () => {
          toast({ title: "Profile updated", description: "Your profile has been saved successfully." });
          queryClient.invalidateQueries({ queryKey: getGetStudentProfileQueryKey() });
          queryClient.invalidateQueries({ queryKey: getGetStudentDashboardQueryKey() });
        },
        onError: () => {
          toast({ title: "Error", description: "Failed to update profile. Please try again.", variant: "destructive" });
        },
      }
    );
  };

  return (
    <ProtectedLayout>
      <div className="max-w-2xl space-y-6">
        <div>
          <h1 className="text-3xl font-bold" data-testid="text-profile-title">My Profile</h1>
          <p className="text-muted-foreground mt-1">Keep your profile up to date for the best recommendations.</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Student Information</CardTitle>
            <CardDescription>This information is used to personalize your career recommendations.</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-10 w-full" />)}
              </div>
            ) : (
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input
                    id="fullName"
                    {...form.register("fullName")}
                    placeholder="Enter your full name"
                    data-testid="input-full-name"
                  />
                  {form.formState.errors.fullName && (
                    <p className="text-sm text-destructive">{form.formState.errors.fullName.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="schoolName">School Name</Label>
                  <Input
                    id="schoolName"
                    {...form.register("schoolName")}
                    placeholder="e.g. Government Secondary School Maiduguri"
                    data-testid="input-school-name"
                  />
                  {form.formState.errors.schoolName && (
                    <p className="text-sm text-destructive">{form.formState.errors.schoolName.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phoneNumber">Phone Number (optional)</Label>
                  <Input
                    id="phoneNumber"
                    {...form.register("phoneNumber")}
                    placeholder="e.g. 08012345678"
                    data-testid="input-phone"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Class Level</Label>
                  <Select
                    value={form.watch("classLevel")}
                    onValueChange={(v) => form.setValue("classLevel", v as ProfileForm["classLevel"])}
                  >
                    <SelectTrigger data-testid="select-class-level">
                      <SelectValue placeholder="Select your class" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="SSS1">SSS1</SelectItem>
                      <SelectItem value="SSS2">SSS2</SelectItem>
                      <SelectItem value="SSS3">SSS3</SelectItem>
                      <SelectItem value="JAMBite">JAMBite</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button
                  type="submit"
                  disabled={updateProfile.isPending}
                  className="w-full"
                  data-testid="button-save-profile"
                >
                  {updateProfile.isPending ? "Saving..." : "Save Profile"}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </ProtectedLayout>
  );
}
