import { betterAuth } from "better-auth";
import { APIError, createAuthMiddleware } from "better-auth/api";
import { MongoClient } from "mongodb";
import { mongodbAdapter } from "@better-auth/mongo-adapter";

const client = new MongoClient(process.env.MONGODB_URI as string);
const db = client.db("spotlight");

const googleClientId = process.env.GOOGLE_CLIENT_ID;
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;

export const auth = betterAuth({
  hooks: {
    before: createAuthMiddleware(async (ctx) => {
      // Defence in depth: the form validates too, but the API must also
      // reject passwords that break the assignment rules.
      if (ctx.path !== "/sign-up/email") return;

      const password = ctx.body?.password;

      if (
        typeof password !== "string" ||
        password.length < 6 ||
        !/[A-Z]/.test(password) ||
        !/[a-z]/.test(password)
      ) {
        throw new APIError("BAD_REQUEST", {
          message:
            "Password must be at least 6 characters and include at least one uppercase and one lowercase letter.",
        });
      }
    }),
  },
  emailAndPassword: {
    enabled: true,
    // Assignment rule: at least 6 characters.
    minPasswordLength: 6,
    // Registration should send the user to /login instead of creating a session.
    autoSignIn: false,
  },
  socialProviders:
    googleClientId && googleClientSecret
      ? {
          google: {
            clientId: process.env.GOOGLE_CLIENT_ID as string,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
          },
        }
      : undefined,
  database: mongodbAdapter(db, {
    client,
  }),
});
