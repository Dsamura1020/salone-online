"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";

// ─── Types ────────────────────────────────────────────────────────────────────

export type UserRow = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  username: string;
  isActive: boolean;
  createdAt: Date;
  roles: { roleId: string; role: { id: string; name: string } }[];
};

type Props = {
  initialUsers: UserRow[];
  allRoles: { id: string; name: string }[];
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(d: Date): string {
  return new Date(d).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function displayName(u: UserRow): string {
  const full = `${u.firstName} ${u.lastName}`.trim();
  return full || u.username;
}

// ─── Role badge ───────────────────────────────────────────────────────────────

const ROLE_COLORS: Record<string, string> = {
  SUPER_ADMIN: "border-rose-200 bg-rose-50 text-rose-700",
  ADMIN: "border-indigo-200 bg-indigo-50 text-indigo-700",
  BUSINESS_OWNER: "border-amber-200 bg-amber-50 text-amber-700",
  USER: "border-slate-200 bg-slate-100 text-slate-600",
};

function RoleBadge({ name }: { name: string }) {
  return (
    <span
      className={`inline-block rounded-md border px-2 py-0.5 text-xs font-bold ${
        ROLE_COLORS[name] ?? "border-slate-200 bg-slate-100 text-slate-600"
      }`}
    >
      {name.replace(/_/g, " ")}
    </span>
  );
}

// ─── Toast ────────────────────────────────────────────────────────────────────

function Toast({
  message,
  ok,
  onClose,
}: {
  message: string;
  ok: boolean;
  onClose: () => void;
}) {
  return (
    <div
      className={`fixed bottom-6 right-6 z-[100] flex items-center gap-3 rounded-xl border px-4 py-3 shadow-xl ${
        ok
          ? "border-emerald-200 bg-emerald-50 text-emerald-800"
          : "border-red-200 bg-red-50 text-red-800"
      }`}
    >
      <span className="text-sm font-semibold">{message}</span>
      <button
        type="button"
        onClick={onClose}
        className="shrink-0 rounded-lg p-1 text-current opacity-60 hover:opacity-100"
      >
        ✕
      </button>
    </div>
  );
}

// ─── Ellipsis Action Menu ─────────────────────────────────────────────────────

function ActionMenu({
  user,
  open,
  onOpen,
  onClose,
  onEdit,
  onDelete,
}: {
  user: UserRow;
  open: boolean;
  onOpen: () => void;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function handle(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    }
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, [open, onClose]);

  return (
    <div ref={ref} className="relative inline-block">
      <button
        type="button"
        onClick={() => (open ? onClose() : onOpen())}
        className="flex size-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition hover:bg-slate-100 hover:text-slate-800"
        title="Actions"
      >
        <span className="text-lg leading-none">⋯</span>
      </button>

      {open && (
        <div className="absolute right-0 top-full z-30 mt-1 min-w-[160px] rounded-xl border border-slate-200 bg-white shadow-xl">
          <Link
            href={`/dashboard/admin/users/${user.id}`}
            onClick={onClose}
            className="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 hover:text-[#10206f]"
          >
            <span>👁</span> View
          </Link>
          <button
            type="button"
            onClick={() => { onClose(); onEdit(); }}
            className="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 hover:text-[#10206f]"
          >
            <span>✏</span> Edit
          </button>
          <button
            type="button"
            onClick={() => { onClose(); onDelete(); }}
            className="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm font-semibold text-rose-600 transition hover:bg-rose-50"
          >
            <span>🗑</span> Delete
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Edit Modal ───────────────────────────────────────────────────────────────

function EditModal({
  user,
  onClose,
  onSaved,
  setToast,
}: {
  user: UserRow;
  onClose: () => void;
  onSaved: (updated: UserRow) => void;
  setToast: (msg: string, ok: boolean) => void;
}) {
  const [form, setForm] = useState({
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    isActive: user.isActive,
  });
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);

    try {
      const res = await fetch(`/api/admin/users/${user.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      type ApiResponse = { success: boolean; data?: { user: UserRow }; error?: string };
      const json = (await res.json()) as ApiResponse;

      if (!res.ok || !json.success) {
        setToast(json.error ?? "Update failed. Please try again.", false);
      } else if (json.data) {
        onSaved(json.data.user);
        setToast(`${form.firstName} ${form.lastName} updated successfully.`, true);
        onClose();
      }
    } catch {
      setToast("Network error. Please try again.", false);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-950">Edit User</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100"
          >
            ✕
          </button>
        </div>

        <form className="space-y-4" onSubmit={(e) => void handleSubmit(e)}>
          <div className="grid grid-cols-2 gap-4">
            <label className="block">
              <span className="mb-1 block text-xs font-bold text-slate-700">
                First Name *
              </span>
              <input
                required
                type="text"
                value={form.firstName}
                onChange={(e) => setForm((f) => ({ ...f, firstName: e.target.value }))}
                className="h-10 w-full rounded-lg border border-slate-300 px-3 text-sm outline-none focus:border-[#10206f]"
              />
            </label>

            <label className="block">
              <span className="mb-1 block text-xs font-bold text-slate-700">
                Last Name *
              </span>
              <input
                required
                type="text"
                value={form.lastName}
                onChange={(e) => setForm((f) => ({ ...f, lastName: e.target.value }))}
                className="h-10 w-full rounded-lg border border-slate-300 px-3 text-sm outline-none focus:border-[#10206f]"
              />
            </label>
          </div>

          <label className="block">
            <span className="mb-1 block text-xs font-bold text-slate-700">
              Email *
            </span>
            <input
              required
              type="email"
              value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              className="h-10 w-full rounded-lg border border-slate-300 px-3 text-sm outline-none focus:border-[#10206f]"
            />
          </label>

          <label className="flex cursor-pointer items-center gap-3">
            <input
              type="checkbox"
              checked={form.isActive}
              onChange={(e) => setForm((f) => ({ ...f, isActive: e.target.checked }))}
              className="size-4 accent-[#10206f]"
            />
            <span className="text-sm font-semibold text-slate-700">
              Account Active
            </span>
          </label>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="rounded-lg bg-[#10206f] px-5 py-2 text-sm font-bold text-white hover:bg-[#172d92] disabled:opacity-60"
            >
              {saving ? "Saving…" : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Delete Confirm Dialog ────────────────────────────────────────────────────

function DeleteDialog({
  user,
  onClose,
  onDeleted,
  setToast,
}: {
  user: UserRow;
  onClose: () => void;
  onDeleted: (id: string) => void;
  setToast: (msg: string, ok: boolean) => void;
}) {
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/users/${user.id}`, {
        method: "DELETE",
      });

      type ApiResponse = { success: boolean; error?: string };
      const json = (await res.json()) as ApiResponse;

      if (!res.ok || !json.success) {
        setToast(json.error ?? "Delete failed. Please try again.", false);
      } else {
        onDeleted(user.id);
        setToast(`${displayName(user)} has been deleted.`, true);
        onClose();
      }
    } catch {
      setToast("Network error. Please try again.", false);
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl">
        <div className="mb-4 flex items-start gap-4">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-rose-100 text-lg">
            🗑
          </span>
          <div>
            <h2 className="text-base font-bold text-slate-950">Delete User</h2>
            <p className="mt-1 text-sm text-slate-500">
              Are you sure you want to delete{" "}
              <span className="font-bold text-slate-800">{displayName(user)}</span>?
              This action cannot be undone.
            </p>
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={deleting}
            onClick={() => void handleDelete()}
            className="rounded-lg bg-rose-600 px-5 py-2 text-sm font-bold text-white hover:bg-rose-700 disabled:opacity-60"
          >
            {deleting ? "Deleting…" : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Role Cell ────────────────────────────────────────────────────────────────

function RoleCell({
  user,
  allRoles,
  editing,
  onStartEdit,
  onRolesUpdated,
  setToast,
}: {
  user: UserRow;
  allRoles: { id: string; name: string }[];
  editing: boolean;
  onStartEdit: () => void;
  onRolesUpdated: (newRoles: UserRow["roles"]) => void;
  setToast: (msg: string, ok: boolean) => void;
}) {
  const [saving, setSaving] = useState(false);
  // Single selected role id (primary role)
  const [selectedId, setSelectedId] = useState<string>(
    user.roles[0]?.role.id ?? "",
  );
  const ref = useRef<HTMLDivElement>(null);

  // Reset to current role whenever the editor opens
  useEffect(() => {
    if (editing) {
      setSelectedId(user.roles[0]?.role.id ?? "");
    }
  }, [editing, user.roles]);

  // Close on outside click
  useEffect(() => {
    if (!editing) return;
    function handle(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onRolesUpdated(user.roles); // cancel — restore original
      }
    }
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, [editing, onRolesUpdated, user.roles]);

  async function handleAssign() {
    if (!selectedId) {
      setToast("Please select a role.", false);
      return;
    }
    // No change
    if (user.roles.length === 1 && user.roles[0]?.role.id === selectedId) {
      onRolesUpdated(user.roles);
      return;
    }
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/users/${user.id}/roles`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roleIds: [selectedId] }),
      });

      type ApiResponse = { success: boolean; error?: string };
      const json = (await res.json()) as ApiResponse;

      if (!res.ok || !json.success) {
        setToast(json.error ?? "Role update failed.", false);
      } else {
        const role = allRoles.find((r) => r.id === selectedId);
        if (role) {
          onRolesUpdated([{ roleId: selectedId, role: { id: role.id, name: role.name } }]);
          setToast(`Role assigned to ${role.name.replace(/_/g, " ")}.`, true);
        }
      }
    } catch {
      setToast("Network error. Please try again.", false);
    } finally {
      setSaving(false);
    }
  }

  if (!editing) {
    return (
      <div className="flex flex-wrap items-center gap-1">
        {user.roles.length > 0 ? (
          user.roles.map((r) => <RoleBadge key={r.role.id} name={r.role.name} />)
        ) : (
          <span className="text-xs text-slate-400">No role</span>
        )}
        <button
          type="button"
          onClick={onStartEdit}
          title="Reassign role"
          className="ml-1 flex size-5 items-center justify-center rounded text-slate-400 transition hover:bg-slate-100 hover:text-[#10206f]"
        >
          ✎
        </button>
      </div>
    );
  }

  return (
    <div ref={ref} className="flex items-center gap-1.5">
      <select
        value={selectedId}
        onChange={(e) => setSelectedId(e.target.value)}
        className="h-8 rounded-lg border border-slate-300 bg-white px-2 text-xs font-semibold text-slate-700 outline-none focus:border-[#10206f]"
      >
        <option value="" disabled>
          Select role…
        </option>
        {allRoles.map((role) => (
          <option key={role.id} value={role.id}>
            {role.name.replace(/_/g, " ")}
          </option>
        ))}
      </select>

      <button
        type="button"
        disabled={saving}
        onClick={() => void handleAssign()}
        className="rounded-lg bg-[#10206f] px-2.5 py-1 text-xs font-bold text-white hover:bg-[#172d92] disabled:opacity-60"
      >
        {saving ? "…" : "Assign"}
      </button>

      <button
        type="button"
        onClick={() => onRolesUpdated(user.roles)}
        className="rounded-lg border border-slate-200 px-2 py-1 text-xs font-bold text-slate-500 hover:bg-slate-50"
      >
        ✕
      </button>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function AdminUsersTable({ initialUsers, allRoles }: Props) {
  const [users, setUsers] = useState<UserRow[]>(initialUsers);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [editUser, setEditUser] = useState<UserRow | null>(null);
  const [deleteUserId, setDeleteUserId] = useState<string | null>(null);
  const [roleEditUserId, setRoleEditUserId] = useState<string | null>(null);
  const [toast, setToastState] = useState<{ msg: string; ok: boolean } | null>(null);

  const showToast = useCallback((msg: string, ok: boolean) => {
    setToastState({ msg, ok });
    setTimeout(() => setToastState(null), 4000);
  }, []);

  function handleSaved(updated: UserRow) {
    setUsers((prev) => prev.map((u) => (u.id === updated.id ? { ...u, ...updated } : u)));
  }

  function handleDeleted(id: string) {
    setUsers((prev) => prev.filter((u) => u.id !== id));
  }

  function handleRolesUpdated(userId: string, newRoles: UserRow["roles"]) {
    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, roles: newRoles } : u)),
    );
    setRoleEditUserId(null);
  }

  const deleteTarget = users.find((u) => u.id === deleteUserId) ?? null;

  return (
    <>
      <div className="overflow-x-auto rounded-xl border border-slate-200">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-slate-50">
            <tr>
              {["#", "Name", "Email", "Username", "Roles", "Status", "Joined", "Actions"].map(
                (h) => (
                  <th
                    key={h}
                    className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wide text-slate-500"
                  >
                    {h}
                  </th>
                ),
              )}
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100 bg-white">
            {users.length === 0 ? (
              <tr>
                <td
                  colSpan={8}
                  className="py-16 text-center text-sm font-semibold text-slate-400"
                >
                  No users found.
                </td>
              </tr>
            ) : (
              users.map((user, idx) => (
                <tr key={user.id} className="hover:bg-slate-50">
                  {/* # */}
                  <td className="px-4 py-3 text-xs font-bold text-slate-400">
                    {idx + 1}
                  </td>

                  {/* Name */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-[#10206f]/10 text-xs font-extrabold text-[#10206f]">
                        {(user.firstName?.[0] ?? user.username[0] ?? "?").toUpperCase()}
                      </span>
                      <span className="font-semibold text-slate-950">
                        {displayName(user)}
                      </span>
                    </div>
                  </td>

                  {/* Email */}
                  <td className="px-4 py-3 text-slate-600">{user.email}</td>

                  {/* Username */}
                  <td className="px-4 py-3 font-mono text-xs text-slate-500">
                    @{user.username}
                  </td>

                  {/* Roles */}
                  <td className="px-4 py-3">
                    <RoleCell
                      user={user}
                      allRoles={allRoles}
                      editing={roleEditUserId === user.id}
                      onStartEdit={() => setRoleEditUserId(user.id)}
                      onRolesUpdated={(newRoles) => handleRolesUpdated(user.id, newRoles)}
                      setToast={showToast}
                    />
                  </td>

                  {/* Status */}
                  <td className="px-4 py-3">
                    <span
                      className={`inline-block rounded-lg border px-2.5 py-0.5 text-xs font-bold ${
                        user.isActive
                          ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                          : "border-red-200 bg-red-50 text-red-600"
                      }`}
                    >
                      {user.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>

                  {/* Joined */}
                  <td className="px-4 py-3 text-xs text-slate-500">
                    {formatDate(user.createdAt)}
                  </td>

                  {/* Actions */}
                  <td className="px-4 py-3">
                    <ActionMenu
                      user={user}
                      open={openMenuId === user.id}
                      onOpen={() => setOpenMenuId(user.id)}
                      onClose={() => setOpenMenuId(null)}
                      onEdit={() => setEditUser(user)}
                      onDelete={() => setDeleteUserId(user.id)}
                    />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Edit Modal */}
      {editUser && (
        <EditModal
          user={editUser}
          onClose={() => setEditUser(null)}
          onSaved={handleSaved}
          setToast={showToast}
        />
      )}

      {/* Delete Confirm Dialog */}
      {deleteUserId && deleteTarget && (
        <DeleteDialog
          user={deleteTarget}
          onClose={() => setDeleteUserId(null)}
          onDeleted={handleDeleted}
          setToast={showToast}
        />
      )}

      {/* Toast */}
      {toast && (
        <Toast message={toast.msg} ok={toast.ok} onClose={() => setToastState(null)} />
      )}
    </>
  );
}
