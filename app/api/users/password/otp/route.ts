import { jsonError, jsonOk } from "@/lib/api/response";
import { requireAuth } from "@/lib/auth/auth";
import { createAndSendPasswordChangeOtp } from "@/lib/email/otp";

export async function POST() {
  const session = await requireAuth();
  if (!session?.user?.email) {
    return jsonError("Unauthorized", 401);
  }

  try {
    await createAndSendPasswordChangeOtp(session.user.email);
  } catch {
    return jsonError(
      "Could not send the password change code. Please try again.",
      503,
    );
  }

  return jsonOk({
    sent: true,
    email: session.user.email,
  });
}
