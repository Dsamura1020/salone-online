import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";
import { ROLES } from "@/lib/auth/permissions";

export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl;

    if (pathname.startsWith("/admin")) {
      const url = req.nextUrl.clone();
      url.pathname = pathname.replace(/^\/admin/, "/dashboard/admin");
      return NextResponse.redirect(url);
    }

    if (pathname.startsWith("/dashboard/admin")) {
      const roles = req.nextauth.token?.roles as string[] | undefined;
      if (
        !roles?.includes(ROLES.ADMIN) &&
        !roles?.includes(ROLES.SUPER_ADMIN)
      ) {
        return NextResponse.redirect(new URL("/", req.url));
      }
    }
  },
  {
    callbacks: {
      authorized: ({ token }) => Boolean(token),
    },
  },
);

export const config = {
  matcher: ["/admin/:path*", "/dashboard/:path*"],
};
