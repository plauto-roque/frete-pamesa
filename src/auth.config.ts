import type { NextAuthConfig } from "next-auth";

export const authConfig: NextAuthConfig = {
  providers: [],
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  callbacks: {
    authorized({ auth, request }) {
      const isLoggedIn = !!auth?.user;
      const isAuthPage = request.nextUrl.pathname.startsWith("/login");

      if (isAuthPage) {
        return isLoggedIn ? Response.redirect(new URL("/", request.nextUrl)) : true;
      }

      if (!isLoggedIn) {
        return false;
      }

      return true;
    },
  },
};
