import NextAuth, { Account, Session, TokenSet } from "next-auth";
import { JWT } from "next-auth/jwt";
import GoogleProvider from "next-auth/providers/google";

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          scope: "openid profile email",
          session: {
            strategy: "jwt",
          },
        },
      },
    }),
  ],
  callbacks: {
    async jwt({
      token,
      account,
    }: {
      token: TokenSet;
      account: Account | null;
    }) {
      // Store the id_token in the token object
      if (account) {
        token.idToken = account.id_token;
      }
      return token;
    },
    async session({ session, token }: { session: Session; token: JWT }) {
      // Add the id_token to the session object
      session.idToken = token.idToken;
      return session;
    },
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
