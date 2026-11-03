import { betterAuth } from "better-auth";
import { APIError, createAuthMiddleware } from "better-auth/api";
import { MongoClient } from "mongodb";
import { mongodbAdapter } from "@better-auth/mongo-adapter";
import { jwt } from "better-auth/plugins";

const client = new MongoClient(process.env.MONGODB_URI as string);
const db = client.db("spotlight");

const googleClientId = process.env.GOOGLE_CLIENT_ID;
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;

export const auth = betterAuth({
  hooks: {
    before: createAuthMiddleware(async (ctx) => {
      if (ctx.path !== "/sign-up/email") return;

      const email =
        typeof ctx.body?.email === "string"
          ? ctx.body.email.trim().toLowerCase()
          : "";
      if (email) {
        const existingUser = await db.collection("user").findOne(
          { email },
          { collation: { locale: "en", strength: 2 } },
        );
        if (existingUser) {
          throw new APIError("UNPROCESSABLE_ENTITY", {
            message: "An account with this email already exists. Please log in instead.",
            code: "USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL",
          });
        }
      }

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

    minPasswordLength: 6,

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
  plugins: [jwt()],
  session: {
    cookieCache: { strategy: "jwt", enabled: true, maxAge: 7 * 24 * 60 * 60 },
  },
});
