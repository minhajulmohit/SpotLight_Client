"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowRight,
  CalendarCheck,
  Eye,
  EyeOff,
  Loader2,
  LockKeyhole,
  LogIn,
  Mail,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

type FormValues = {
  email: string;
  password: string;
};

type FormErrors = Partial<Record<keyof FormValues, string>>;

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const highlights = [
  {
    icon: CalendarCheck,
    title: "Your bookings, organized",
    description: "See every upcoming shoot and request at a glance.",
  },
  {
    icon: ShieldCheck,
    title: "Safe and secure",
    description: "Your account is protected with encrypted sessions.",
  },
];

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="size-4">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1Z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23Z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.1a6.6 6.6 0 0 1 0-4.2V7.06H2.18a11 11 0 0 0 0 9.88l3.66-2.84Z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.55 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1A11 11 0 0 0 2.18 7.06l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38Z"
      />
    </svg>
  );
}

const LoginContent = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackURL = searchParams.get("callbackURL") || "/dashboard";

  const [values, setValues] = useState<FormValues>({
    email: "",
    password: "",
  });
  const [rememberMe, setRememberMe] = useState(true);
  const [errors, setErrors] = useState<FormErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const isBusy = isSubmitting || isGoogleLoading;

  const handleChange =
    (field: keyof FormValues) => (event: React.ChangeEvent<HTMLInputElement>) => {
      setValues((previous) => ({ ...previous, [field]: event.target.value }));
      setErrors((previous) => ({ ...previous, [field]: undefined }));
      setFormError(null);
    };

  const validate = (): FormErrors => {
    const nextErrors: FormErrors = {};

    if (!emailPattern.test(values.email.trim())) {
      nextErrors.email = "Please enter a valid email address.";
    }

    if (!values.password) {
      nextErrors.password = "Please enter your password.";
    }

    return nextErrors;
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const nextErrors = validate();
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    setIsSubmitting(true);
    setFormError(null);

    try {
      const { error } = await authClient.signIn.email({
        email: values.email.trim(),
        password: values.password,
        rememberMe,
        callbackURL: "/",
      });

      if (error) {
        const message =
          error.code === "INVALID_EMAIL_OR_PASSWORD"
            ? "Incorrect email or password. Please try again."
            : error.message || "Could not log you in. Please try again.";

        setFormError(message);
        toast.error("Login failed", {
          description: message,
        });
        return;
      }

      toast.success("Welcome back", {
        description: "You are logged in to SpotLight.",
      });

      router.push(callbackURL);
      router.refresh();
    } catch {
      const message =
        "Something went wrong. Check your connection and try again.";
      setFormError(message);
      toast.error("Login failed", {
        description: message,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true);
    setFormError(null);

    try {
      const { error } = await authClient.signIn.social({
        provider: "google",
        callbackURL: callbackURL.startsWith("/") ? callbackURL : "/",
      });

      if (error) {
        const message = error.message?.toLowerCase().includes("provider")
          ? "Google login is not configured yet. Please contact support."
          : error.message || "Could not start Google login. Please try again.";

        setFormError(message);
        toast.error("Google login failed", {
          description: message,
        });
      }
    } catch {
      const message =
        "Could not start Google login. Please check your connection and try again.";
      setFormError(message);
      toast.error("Google login failed", {
        description: message,
      });
    } finally {
      setIsGoogleLoading(false);
    }
  };

  return (
    <div className="relative overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute -top-32 -left-24 size-80 rounded-full bg-primary/15 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -right-24 -bottom-40 size-80 rounded-full bg-primary/10 blur-3xl"
      />

      <div className="container relative mx-auto grid max-w-6xl gap-12 px-4 py-12 lg:min-h-[calc(100vh-9rem)] lg:grid-cols-2 lg:items-center lg:py-16">
        {/* Brand panel (desktop only) */}
        <section className="hidden lg:flex lg:flex-col lg:justify-center">
          <span className="w-fit rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-semibold tracking-wide text-primary uppercase">
            Welcome back
          </span>

          <h1 className="mt-5 text-4xl leading-tight font-bold text-foreground xl:text-5xl">
            Your next shoot is{" "}
            <span className="text-primary">one login</span> away.
          </h1>

          <p className="mt-4 max-w-md leading-relaxed text-muted-foreground">
            Log in to manage your listings, track booking requests and keep
            every creative project moving.
          </p>

          <ul className="mt-9 space-y-5">
            {highlights.map((highlight) => {
              const Icon = highlight.icon;
              return (
                <li key={highlight.title} className="flex items-start gap-3">
                  <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Icon className="size-5" />
                  </span>
                  <div>
                    <p className="font-semibold text-foreground">
                      {highlight.title}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {highlight.description}
                    </p>
                  </div>
                </li>
              );
            })}
          </ul>
        </section>

        {/* Login form */}
        <Card className="mx-auto w-full max-w-md gap-0 border-0 p-6 shadow-sm sm:p-8 dark:bg-zinc-900 dark:ring-zinc-800">
          <div className="mb-6">
            <span className="mb-3 inline-flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <LogIn className="size-5" />
            </span>
            <h2 className="text-2xl font-bold text-foreground">
              Log in to SpotLight
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Enter your details to continue.
            </p>
          </div>

          <Button
            type="button"
            variant="outline"
            className="h-10 w-full gap-2"
            onClick={handleGoogleSignIn}
            disabled={isBusy}
          >
            {isGoogleLoading ? (
              <Loader2 className="animate-spin" />
            ) : (
              <GoogleIcon />
            )}
            Continue with Google
          </Button>

          <div className="my-5 flex items-center gap-3 text-xs text-muted-foreground">
            <span className="h-px flex-1 bg-border dark:bg-zinc-800" />
            or log in with email
            <span className="h-px flex-1 bg-border dark:bg-zinc-800" />
          </div>

          <form
            onSubmit={handleSubmit}
            noValidate
            className="flex flex-col gap-4"
          >
            {/* Email */}
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="email">Email address</Label>
              <div className="relative">
                <Mail className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  className="h-11 pl-9"
                  value={values.email}
                  onChange={handleChange("email")}
                  aria-invalid={Boolean(errors.email)}
                />
              </div>
              {errors.email && (
                <p className="text-xs text-destructive">{errors.email}</p>
              )}
            </div>

            {/* Password */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <button
                  type="button"
                  onClick={() =>
                    toast.info("Notice", {
                      description: "Password reset is disabled for examiner evaluation.",
                    })
                  }
                  className="text-xs font-medium text-primary hover:underline"
                >
                  Forgot Password?
                </button>
              </div>
              <div className="relative">
                <LockKeyhole className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="Your password"
                  className="h-11 pr-10 pl-9"
                  value={values.password}
                  onChange={handleChange("password")}
                  aria-invalid={Boolean(errors.password)}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((previous) => !previous)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute top-1/2 right-2 -translate-y-1/2 rounded-md p-1.5 text-muted-foreground transition-colors duration-200 hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:outline-none"
                >
                  {showPassword ? (
                    <EyeOff className="size-4" />
                  ) : (
                    <Eye className="size-4" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="text-xs text-destructive">{errors.password}</p>
              )}
            </div>

            {/* Remember me */}
            <div className="flex items-center gap-2.5 pt-1">
              <Checkbox
                id="rememberMe"
                checked={rememberMe}
                onCheckedChange={(checked) => setRememberMe(checked === true)}
              />
              <Label
                htmlFor="rememberMe"
                className="text-sm font-normal text-muted-foreground"
              >
                Keep me logged in on this device
              </Label>
            </div>

            {/* Server error */}
            {formError && (
              <p
                role="alert"
                className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive"
              >
                {formError}
              </p>
            )}

            <Button
              type="submit"
              size="lg"
              className="mt-1 h-10 w-full"
              disabled={isBusy}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="animate-spin" />
                  Logging in...
                </>
              ) : (
                <>
                  Log in
                  <ArrowRight />
                </>
              )}
            </Button>
          </form>

          <div className="mt-6 flex flex-col items-center gap-3 text-sm text-muted-foreground">
            <p>
              New to SpotLight?{" "}
              <Link
                href="/register"
                className="font-semibold text-primary transition-colors duration-200 hover:text-primary/80 hover:underline"
              >
                Create an account
              </Link>
            </p>
            <p className="flex items-center gap-1.5 text-xs">
              <Sparkles className="size-3.5 text-primary" />
              Discover studios, stages and creative spaces.
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
};

const LoginPage = () => (
  <Suspense fallback={<div className="min-h-screen" />}>
    <LoginContent />
  </Suspense>
);

export default LoginPage;
