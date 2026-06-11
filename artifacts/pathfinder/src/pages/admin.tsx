import { AdminLayout } from "@/components/layouts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { customFetch } from "@workspace/api-client-react";

type StudentRow = {
  id: number;
  userId: string;
  fullName: string;
  schoolName: string;
  classLevel: string;
  isAdmin: boolean;
  createdAt: string;
  assessmentCount: number;
  savedCount: number;
};

type AdminOverview = {
  totalStudents: number;
  totalAssessments: number;
  totalSaved: number;
  students: StudentRow[];
};

function useAdminOverview() {
  return useQuery<AdminOverview>({
    queryKey: ["admin", "overview"],
    queryFn: () => customFetch<AdminOverview>("/api/admin/overview"),
    retry: false,
  });
}

const CLASS_COLORS: Record<string, string> = {
  SSS1: "bg-blue-100 text-blue-700",
  SSS2: "bg-indigo-100 text-indigo-700",
  SSS3: "bg-purple-100 text-purple-700",
  JAMBite: "bg-orange-100 text-orange-700",
};

export default function Admin() {
  const { data, isLoading, error } = useAdminOverview();

  if (error) {
    const msg = (error as Error).message ?? "";
    const is403 = msg.includes("403") || msg.toLowerCase().includes("admin");
    return (
      <AdminLayout>
        <div className="flex flex-col items-center justify-center h-64 gap-3 text-center">
          <span className="text-4xl">{is403 ? "🔒" : "⚠️"}</span>
          <h2 className="text-xl font-bold text-foreground">
            {is403 ? "Access Denied" : "Something went wrong"}
          </h2>
          <p className="text-muted-foreground text-sm max-w-xs">
            {is403
              ? "Your account doesn't have admin access. Ask a super-admin to set is_admin = true on your student row in Supabase."
              : msg}
          </p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Admin Overview</h1>
          <p className="text-muted-foreground text-sm mt-1">All registered students and their activity</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { label: "Total Students", value: data?.totalStudents ?? "—", icon: "👥" },
            { label: "Total Assessments", value: data?.totalAssessments ?? "—", icon: "📝" },
            { label: "Saved Recommendations", value: data?.totalSaved ?? "—", icon: "⭐" },
          ].map(({ label, value, icon }) => (
            <Card key={label}>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <span>{icon}</span>
                  {label}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-foreground">
                  {isLoading ? (
                    <span className="inline-block w-12 h-8 bg-muted animate-pulse rounded" />
                  ) : (
                    value
                  )}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Students table */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold">Students</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">Name</th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">School</th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">Class</th>
                    <th className="text-center px-4 py-3 font-medium text-muted-foreground">Assessments</th>
                    <th className="text-center px-4 py-3 font-medium text-muted-foreground">Saved</th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">Joined</th>
                    <th className="text-center px-4 py-3 font-medium text-muted-foreground">Role</th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading
                    ? Array.from({ length: 4 }).map((_, i) => (
                        <tr key={i} className="border-b">
                          {Array.from({ length: 7 }).map((_, j) => (
                            <td key={j} className="px-4 py-3">
                              <div className="h-4 bg-muted animate-pulse rounded w-24" />
                            </td>
                          ))}
                        </tr>
                      ))
                    : data?.students.map((s) => (
                        <tr key={s.id} className="border-b hover:bg-muted/30 transition-colors">
                          <td className="px-4 py-3 font-medium text-foreground">{s.fullName || "—"}</td>
                          <td className="px-4 py-3 text-muted-foreground">{s.schoolName || "—"}</td>
                          <td className="px-4 py-3">
                            <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${CLASS_COLORS[s.classLevel] ?? "bg-gray-100 text-gray-700"}`}>
                              {s.classLevel}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-center font-medium">{s.assessmentCount}</td>
                          <td className="px-4 py-3 text-center font-medium">{s.savedCount}</td>
                          <td className="px-4 py-3 text-muted-foreground text-xs">
                            {new Date(s.createdAt).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" })}
                          </td>
                          <td className="px-4 py-3 text-center">
                            {s.isAdmin ? (
                              <Badge variant="secondary" className="bg-amber-100 text-amber-700 border-amber-200">Admin</Badge>
                            ) : (
                              <Badge variant="outline" className="text-muted-foreground">Student</Badge>
                            )}
                          </td>
                        </tr>
                      ))}
                  {!isLoading && data?.students.length === 0 && (
                    <tr>
                      <td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">
                        No students registered yet
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
