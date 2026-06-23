import { prisma } from "@/lib/prisma/prisma";
import { AdminUsersTable } from "@/features/admin/components/admin-users-table";

export default async function AdminUsersPage() {
  const [users, roles] = await Promise.all([
    prisma.user.findMany({
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        username: true,
        isActive: true,
        createdAt: true,
        roles: {
          include: {
            role: { select: { id: true, name: true } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 100,
    }),
    prisma.role.findMany({ orderBy: { name: "asc" } }),
  ]);

  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-extrabold text-slate-950">Users</h1>
          <p className="mt-0.5 text-sm text-slate-500">{users.length} total users</p>
        </div>
      </div>
      <AdminUsersTable initialUsers={users} allRoles={roles} />
    </article>
  );
}
