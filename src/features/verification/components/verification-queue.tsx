"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type QueueItem = {
  id: string;
  status: "PENDING" | "UNDER_REVIEW" | "APPROVED" | "REJECTED";
  business: {
    businessName: string;
    categoryName: string;
    latestDocumentName: string;
  };
};

export function VerificationQueue({ initialItems }: { initialItems: QueueItem[] }) {
  const router = useRouter();
  const [items, setItems] = useState(initialItems);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function decide(requestId: string, decision: "APPROVED" | "REJECTED") {
    setProcessingId(requestId);
    setError(null);

    const response = await fetch(`/api/verification/${requestId}/decision`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ decision }),
    });

    setProcessingId(null);

    if (!response.ok) {
      const body = (await response.json()) as { error?: string };
      setError(body.error ?? "Failed to record decision");
      return;
    }

    setItems((current) =>
      current.map((item) =>
        item.id === requestId
          ? {
              ...item,
              status: decision,
            }
          : item,
      ),
    );
    router.refresh();
  }

  return (
    <div className="rounded-3xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
      <h2 className="text-[38px] font-semibold leading-none text-zinc-900 dark:text-zinc-100">
        Verification Queue
      </h2>
      <p className="mt-2 text-lg text-zinc-500">Admin review panel for business onboarding</p>

      {error && (
        <p className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      )}

      {items.length === 0 ? (
        <p className="mt-6 text-zinc-600 dark:text-zinc-400">No requests yet.</p>
      ) : (
        <ul className="mt-6 space-y-4">
          {items.map((item) => {
            const isPending =
              item.status === "PENDING" || item.status === "UNDER_REVIEW";
            return (
              <li
                key={item.id}
                className="grid grid-cols-[1.8fr_1.3fr_auto_auto] items-center gap-4 rounded-2xl border border-zinc-200 bg-white px-5 py-4 dark:border-zinc-700 dark:bg-zinc-900"
              >
                <div>
                  <p className="text-[18px] font-semibold leading-none text-zinc-900 dark:text-zinc-100">
                    {item.business.businessName}
                  </p>
                  <p className="mt-2 text-[14px] leading-none text-zinc-500">
                    {item.business.categoryName}
                  </p>
                </div>

                <p className="text-[14px] leading-none text-zinc-600 dark:text-zinc-300">
                  {item.business.latestDocumentName}
                </p>

                <span className="rounded-full bg-zinc-100 px-4 py-2 text-[13px] font-medium text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
                  {item.status === "UNDER_REVIEW"
                    ? "Under Review"
                    : item.status === "PENDING"
                      ? "Pending"
                      : item.status}
                </span>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled={!isPending || processingId === item.id}
                    onClick={() => void decide(item.id, "APPROVED")}
                    className="inline-flex items-center gap-2 rounded-xl bg-[#071532] px-4 py-2 text-[14px] font-semibold text-white disabled:opacity-50"
                  >
                    <span className="inline-flex h-4 w-4 items-center justify-center rounded-full border border-white text-[10px] leading-none">
                      ✓
                    </span>
                    Approve
                  </button>
                  <button
                    type="button"
                    disabled={!isPending || processingId === item.id}
                    onClick={() => void decide(item.id, "REJECTED")}
                    className="inline-flex items-center gap-2 rounded-xl border border-zinc-300 bg-white px-4 py-2 text-[14px] font-semibold text-zinc-700 disabled:opacity-50"
                  >
                    <span className="inline-flex h-4 w-4 items-center justify-center rounded-full border border-zinc-400 text-[10px] leading-none">
                      ×
                    </span>
                    Reject
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
