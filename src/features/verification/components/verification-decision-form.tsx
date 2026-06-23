"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function VerificationDecisionForm({
  verificationRequestId,
}: {
  verificationRequestId: string;
}) {
  const router = useRouter();
  const [comments, setComments] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(decision: "APPROVED" | "REJECTED") {
    setLoading(true);
    setError(null);

    const res = await fetch(
      `/api/verification/${verificationRequestId}/decision`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ decision, comments: comments || undefined }),
      },
    );

    setLoading(false);

    if (!res.ok) {
      const body = (await res.json()) as { error?: string };
      setError(body.error ?? "Request failed");
      return;
    }

    router.refresh();
  }

  return (
    <div className="space-y-4 rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
      <textarea
        className="w-full rounded-md border border-zinc-300 bg-white p-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
        placeholder="Comments (optional)"
        rows={3}
        value={comments}
        onChange={(e) => setComments(e.target.value)}
      />
      {error && <p className="text-sm text-red-600">{error}</p>}
      <div className="flex gap-2">
        <button
          type="button"
          disabled={loading}
          onClick={() => submit("APPROVED")}
          className="rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50"
        >
          Approve
        </button>
        <button
          type="button"
          disabled={loading}
          onClick={() => submit("REJECTED")}
          className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
        >
          Reject
        </button>
      </div>
    </div>
  );
}
