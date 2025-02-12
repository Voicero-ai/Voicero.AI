import { AuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { compare } from "bcryptjs";
import prisma from "@/lib/prisma";
import { JWT } from "next-auth/jwt";

export const authOptions: AuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        login: { label: "Email or Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials): Promise<{ id: string } | null> {
        if (!credentials?.login || !credentials?.password) {
          throw new Error("Please enter your email/username and password");
        }

        const isEmail = credentials.login.includes("@");
        const user = await prisma.user.findFirst({
          where: isEmail
            ? { email: credentials.login }
            : { username: credentials.login },
          select: { id: true, password: true },
        });

        if (!user) throw new Error("No user found with that email/username");
        const isPasswordValid = await compare(
          credentials.password,
          user.password
        );
        if (!isPasswordValid) throw new Error("Invalid password");

        return { id: user.id };
      },
    }),
  ],
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt" as const,
  },
  callbacks: {
    async jwt({ token, user }: { token: JWT; user: any }) {
      if (user) token.sub = user.id;
      return token;
    },
    async session({ session, token }: { session: any; token: JWT }) {
      return {
        ...session,
        user: { id: token.sub },
      };
    },
  },
};
