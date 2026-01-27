import { StockDashboardLayout } from "@/components/StockDashboardLayout";
import { trpc } from "@/lib/trpc";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, Trash2, Crown, Shield, Users as UsersIcon } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/_core/hooks/useAuth";

export default function UserManagement() {
  const { user: currentUser } = useAuth();
  const { data: users = [], isLoading, refetch } = trpc.user.list.useQuery();

  const deleteMutation = trpc.user.delete.useMutation({
    onSuccess: () => {
      toast.success("User removed successfully");
      refetch();
    },
    onError: () => {
      toast.error("Failed to remove user");
    },
  });

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "admin": return "bg-red-100 text-red-800";
      case "founder": return "bg-purple-100 text-purple-800";
      case "manager": return "bg-blue-100 text-blue-800";
      case "stock_controller": return "bg-green-100 text-green-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "admin": return <Shield className="w-4 h-4" />;
      case "founder": return <Crown className="w-4 h-4" />;
      case "manager": return <UsersIcon className="w-4 h-4" />;
      default: return null;
    }
  };

  const canDeleteUser = (targetRole: string): boolean => {
    if (!currentUser) return false;
    const allowedRoles = ["admin", "founder", "manager"];
    return allowedRoles.includes(currentUser.role);
  };

  const handleDeleteUser = (userId: number, userName: string, userRole: string) => {
    if (!canDeleteUser(userRole)) {
      toast.error("You don't have permission to remove users");
      return;
    }

    if (currentUser?.id === userId) {
      toast.error("You cannot remove yourself");
      return;
    }

    if (confirm(`Are you sure you want to remove "${userName}"? This action cannot be undone.`)) {
      deleteMutation.mutate({ userId });
    }
  };

  // Categorize users by role
  const founder = users.find(u => u.role === "founder");
  const manager = users.find(u => u.role === "manager");
  const mainClinicControllers = users.filter(u => u.role === "stock_controller" && u.name?.includes("Main"));
  const mobileClinicControllers = users.filter(u => u.role === "stock_controller" && u.name?.includes("Mobile"));
  const otherControllers = users.filter(u => 
    u.role === "stock_controller" && 
    !u.name?.includes("Main") && 
    !u.name?.includes("Mobile")
  );

  return (
    <StockDashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
          <p className="text-gray-600 mt-1">Manage user access and roles</p>
        </div>

        {/* Key Personnel Overview */}
        <Card className="p-6 bg-gradient-to-br from-blue-50 to-white">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Key Personnel</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-white rounded-lg border-2 border-purple-200">
              <div className="flex items-center gap-2 mb-2">
                <Crown className="w-5 h-5 text-purple-600" />
                <h3 className="font-semibold text-gray-900">Clinic Founder</h3>
              </div>
              {founder ? (
                <div>
                  <p className="font-medium text-gray-900">{founder.name || "Not set"}</p>
                  <p className="text-sm text-gray-600">{founder.email || "-"}</p>
                </div>
              ) : (
                <p className="text-sm text-gray-500 italic">No founder assigned</p>
              )}
            </div>

            <div className="p-4 bg-white rounded-lg border-2 border-blue-200">
              <div className="flex items-center gap-2 mb-2">
                <UsersIcon className="w-5 h-5 text-blue-600" />
                <h3 className="font-semibold text-gray-900">Clinic Manager</h3>
              </div>
              {manager ? (
                <div>
                  <p className="font-medium text-gray-900">{manager.name || "Not set"}</p>
                  <p className="text-sm text-gray-600">{manager.email || "-"}</p>
                </div>
              ) : (
                <p className="text-sm text-gray-500 italic">No manager assigned</p>
              )}
            </div>

            <div className="p-4 bg-white rounded-lg border-2 border-green-200">
              <div className="flex items-center gap-2 mb-2">
                <Shield className="w-5 h-5 text-green-600" />
                <h3 className="font-semibold text-gray-900">Stock Controllers</h3>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-gray-700">
                  Main Clinic: {mainClinicControllers.length || 0}
                </p>
                <p className="text-sm font-medium text-gray-700">
                  Mobile Pod: {mobileClinicControllers.length || 0}
                </p>
              </div>
            </div>
          </div>
        </Card>

        {/* Stock Controllers by Location */}
        {(mainClinicControllers.length > 0 || mobileClinicControllers.length > 0 || otherControllers.length > 0) && (
          <Card className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Stock Controllers by Location</h2>
            
            {mainClinicControllers.length > 0 && (
              <div className="mb-6">
                <h3 className="font-medium text-gray-700 mb-3 flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-blue-600"></div>
                  Main Clinic Dispensary
                </h3>
                <div className="space-y-2">
                  {mainClinicControllers.map(user => (
                    <div key={user.id} className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">{user.name || "-"}</p>
                        <p className="text-sm text-gray-600">{user.email || "-"}</p>
                      </div>
                      <Badge className={getRoleBadge(user.role)}>
                        {user.role.replace("_", " ").toUpperCase()}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {mobileClinicControllers.length > 0 && (
              <div className="mb-6">
                <h3 className="font-medium text-gray-700 mb-3 flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-600"></div>
                  POD Mobile Clinic Dispensary
                </h3>
                <div className="space-y-2">
                  {mobileClinicControllers.map(user => (
                    <div key={user.id} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">{user.name || "-"}</p>
                        <p className="text-sm text-gray-600">{user.email || "-"}</p>
                      </div>
                      <Badge className={getRoleBadge(user.role)}>
                        {user.role.replace("_", " ").toUpperCase()}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {otherControllers.length > 0 && (
              <div>
                <h3 className="font-medium text-gray-700 mb-3">Other Stock Controllers</h3>
                <div className="space-y-2">
                  {otherControllers.map(user => (
                    <div key={user.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">{user.name || "-"}</p>
                        <p className="text-sm text-gray-600">{user.email || "-"}</p>
                      </div>
                      <Badge className={getRoleBadge(user.role)}>
                        {user.role.replace("_", " ").toUpperCase()}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </Card>
        )}

        {/* All Users Table */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">All Users</h2>
          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-red-600" />
            </div>
          ) : users.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600">No users found</p>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Last Sign In</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {users.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 font-medium text-gray-900 flex items-center gap-2">
                        {getRoleIcon(user.role)}
                        {user.name || "-"}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">{user.email || "-"}</td>
                      <td className="px-6 py-4">
                        <Badge className={getRoleBadge(user.role)}>
                          {user.role.replace("_", " ").toUpperCase()}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {new Date(user.lastSignedIn).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-right">
                        {canDeleteUser(user.role) && currentUser?.id !== user.id && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteUser(user.id, user.name || "User", user.role)}
                            disabled={deleteMutation.isPending}
                          >
                            <Trash2 className="w-4 h-4 text-red-600" />
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>
    </StockDashboardLayout>
  );
}
