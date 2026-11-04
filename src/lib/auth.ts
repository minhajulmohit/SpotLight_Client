import { betterAuth } from "better-auth";

import { MongoClient } from "mongodb";
import { mongodbAdapter } from "@better-auth/mongo-adapter";
import { jwt } from "better-auth/plugins";

const client = new MongoClient(process.env.MONGODB_URI as string);
const db = client.db("spotlight");

const googleClientId = process.env.GOOGLE_CLIENT_ID;
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;

export const auth = betterAuth({
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
