"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  CalendarCheck,
  Camera,
  Eye,
  EyeOff,
  Image as ImageIcon,
  Loader2,
  LockKeyhole,
  Mail,
  ShieldCheck,
  Upload,
  User,
  UserPlus,
  X,
} from "lucide-react";
import { toast } from "sonner";

import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type FormValues = {
  name: string;
  email: string;
  photoURL: string;
  password: string;
  confirmPassword: string;
};

type FormErrors = {
  name?: string;
  email?: string;
  photoURL?: string;
  password?: string;
  confirmPassword?: string;
  terms?: string;
};

const benefits = [
  {
    icon: Camera,
    title: "List in minutes",
    description: "Add photos, pricing and amenities with a guided form.",
  },
  {
    icon: CalendarCheck,
    title: "Manage bookings",
    description: "Keep every request and confirmation in one place.",
  },
  {
    icon: ShieldCheck,
    title: "Built on trust",
    description: "Real reviews from real guests, every single time.",
  },
];

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const urlPattern = /^https?:\/\/.+/i;

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

const RegisterPage = () => {
  const router = useRouter();

  const [values, setValues] = useState<FormValues>({
    name: "",
    email: "",
    photoURL: "",
    password: "",
    confirmPassword: "",
  });
  const [agreed, setAgreed] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  const isBusy = isSubmitting || isGoogleLoading || isUploadingImage;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setValues((previous) => ({ ...previous, [name]: value }));
    setErrors((previous) => ({ ...previous, [name]: undefined }));
    setFormError(null);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      toast.error("Image size should be less than 10MB.");
      return;
    }

    setIsUploadingImage(true);
    setFormError(null);
    const formData = new FormData();
    formData.append("image", file);

    const apiKey = process.env.NEXT_PUBLIC_IMGBB_API_KEY;

    if (!apiKey) {
      toast.error(
        "ImgBB API key is missing. Please add NEXT_PUBLIC_IMGBB_API_KEY to .env",
      );
      setIsUploadingImage(false);
      return;
    }

    try {
      const response = await fetch(
        `https://api.imgbb.com/1/upload?key=${apiKey}`,
        {
          method: "POST",
          body: formData,
        },
      );
      const data = await response.json();

      if (data?.data?.url) {
        setValues((previous) => ({ ...previous, photoURL: data.data.url }));
        setErrors((previous) => ({ ...previous, photoURL: undefined }));
        toast.success("Profile photo uploaded successfully!");
      } else {
        const errorMsg = data?.error?.message ?? "Upload to ImgBB failed.";
        throw new Error(errorMsg);
      }
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Could not upload image.";
      toast.error(`ImgBB Upload Error: ${message}`, {
        description:
          "Please check your ImgBB API key in .env or paste a direct image URL.",
      });
    } finally {
      setIsUploadingImage(false);
      e.target.value = "";
    }
  };

  const validate = (): FormErrors => {
    const nextErrors: FormErrors = {};

    const name = values.name.trim();
    const email = values.email.trim();
    const photoUrl = values.photoURL.trim();
    const password = values.password;
    const confirmPassword = values.confirmPassword;

    if (name.length < 2) {
      nextErrors.name = "Please enter your full name (at least 2 characters).";
    }

    if (!emailPattern.test(email)) {
      nextErrors.email = "Please enter a valid email address.";
    }

    if (!photoUrl) {
      nextErrors.photoURL = "Please upload a photo or provide a photo URL.";
    } else if (!urlPattern.test(photoUrl)) {
      nextErrors.photoURL = "Photo URL must start with http:// or https://.";
    }

    if (password.length < 6) {
      nextErrors.password = "Password must be at least 6 characters long.";
    } else if (!/[A-Z]/.test(password)) {
      nextErrors.password =
        "Password must contain at least one uppercase letter.";
    } else if (!/[a-z]/.test(password)) {
      nextErrors.password =
        "Password must contain at least one lowercase letter.";
    }

    if (confirmPassword !== password) {
      nextErrors.confirmPassword = "Passwords do not match.";
    }

    if (!agreed) {
      nextErrors.terms = "Please accept the terms to continue.";
    }

    return nextErrors;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const nextErrors = validate();
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    setIsSubmitting(true);
    setFormError(null);

    try {
      const { error } = await authClient.signUp.email({
        name: values.name.trim(),
        email: values.email.trim(),
        password: values.password,

        image: values.photoURL.trim(),
      });

      if (error) {
        const isDuplicate =
          error.code === "USER_ALREADY_EXISTS" ||
          error.code === "USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL";

        const message = isDuplicate
          ? "An account with this email already exists. Please log in instead."
          : error.message || "Could not create your account. Please try again.";

        setFormError(message);
        toast.error("Registration failed", { description: message });
        return;
      }

      toast.success("Account created successfully!", {
        description: "Please log in with your new account.",
      });

      // Registration must end on the Login page.
      router.push("/login");
    } catch {
      const message =
        "Something went wrong. Check your connection and try again.";
      setFormError(message);
      toast.error("Registration failed", { description: message });
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
        // Google sign-in must land on the Home page.
        callbackURL: "/",
      });

      if (error) {
        const message = error.message?.toLowerCase().includes("provider")
          ? "Google login is not configured yet. Please contact support."
          : error.message || "Could not start Google login. Please try again.";

        setFormError(message);
        toast.error("Google login failed", { description: message });
      }
    } catch {
      const message =
        "Could not start Google login. Please check your connection and try again.";
      setFormError(message);
      toast.error("Google login failed", { description: message });
    } finally {
      setIsGoogleLoading(false);
    }
  };

  return (
    <div className="relative overflow-hidden">
      {/* Decorative amber glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-32 -right-24 size-80 rounded-full bg-primary/15 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-40 -left-24 size-80 rounded-full bg-primary/10 blur-3xl"
      />

      <div className="container relative mx-auto grid max-w-6xl gap-12 px-4 py-12 lg:min-h-[calc(100vh-9rem)] lg:grid-cols-2 lg:items-start lg:py-16">
        {/* Brand / benefits panel (desktop only) */}
        <section className="hidden lg:mt-5 lg:flex lg:flex-col lg:justify-center">
          <span className="w-fit rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-semibold tracking-wide text-primary uppercase">
            Join SpotLight
          </span>

          <h1 className="mt-5 text-4xl leading-tight font-bold text-foreground xl:text-5xl">
            Turn empty spaces into <span className="text-primary">booked</span>{" "}
            experiences.
          </h1>

          <p className="mt-4 max-w-md leading-relaxed text-muted-foreground">
            SpotLight connects creators with photo studios, sound stages and
            creative spaces. List your own space in minutes — or find the
            perfect room for your next shoot.
          </p>

          <ul className="mt-9 space-y-5">
            {benefits.map((benefit) => {
              const Icon = benefit.icon;
              return (
                <li key={benefit.title} className="flex items-start gap-3">
                  <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Icon className="size-5" />
                  </span>
                  <div>
                    <p className="font-semibold text-foreground">
                      {benefit.title}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {benefit.description}
                    </p>
                  </div>
                </li>
              );
            })}
          </ul>
        </section>

        {/* Register form */}
        <Card className="mx-auto w-full max-w-md gap-0 border-0 p-6 shadow-sm sm:p-8 dark:bg-zinc-900 dark:ring-zinc-800">
          <div className="mb-6">
            <span className="mb-3 inline-flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <UserPlus className="size-5" />
            </span>
            <h2 className="text-2xl font-bold text-foreground">
              Create your account
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Book studios or list your own — it only takes a minute.
            </p>
          </div>

          {/* Google social login */}
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
            or sign up with email
            <span className="h-px flex-1 bg-border dark:bg-zinc-800" />
          </div>

          <form
            onSubmit={handleSubmit}
            noValidate
            className="flex flex-col gap-4"
          >
            {/* Name */}
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="name">Full name</Label>
              <div className="relative">
                <User className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="name"
                  name="name"
                  autoComplete="name"
                  placeholder="Your Name"
                  className="h-11 pl-9"
                  value={values.name}
                  onChange={handleChange}
                  aria-invalid={Boolean(errors.name)}
                />
              </div>
              {errors.name && (
                <p className="text-xs text-destructive">{errors.name}</p>
              )}
            </div>

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
                  onChange={handleChange}
                  aria-invalid={Boolean(errors.email)}
                />
              </div>
              {errors.email && (
                <p className="text-xs text-destructive">{errors.email}</p>
              )}
            </div>

            {/* Photo & ImgBB Upload */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="photoURL">Profile Photo</Label>
                {isUploadingImage && (
                  <span className="flex items-center gap-1.5 text-xs text-primary">
                    <Loader2 className="size-3.5 animate-spin" /> Uploading...
                  </span>
                )}
              </div>

              {/* Upload via ImgBB */}
              <div className="flex flex-col gap-2 rounded-xl border border-dashed border-border bg-muted/30 p-3 dark:border-zinc-800">
                <label
                  htmlFor="register-imgbb-file"
                  className={`inline-flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-border bg-background px-4 py-2.5 text-xs font-semibold text-foreground transition hover:bg-muted dark:border-zinc-800 ${
                    isBusy ? "pointer-events-none opacity-60" : ""
                  }`}
                >
                  {isUploadingImage ? (
                    <Loader2 className="size-4 animate-spin text-primary" />
                  ) : (
                    <Upload className="size-4 text-primary" />
                  )}
                  <span>
                    {isUploadingImage
                      ? "Uploading image..."
                      : "Upload Image from Device"}{" "}
                  </span>
                  <input
                    id="register-imgbb-file"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    disabled={isBusy}
                    onChange={handleImageUpload}
                  />
                </label>
              </div>

              {/* Direct image URL input */}
              <div className="relative">
                <ImageIcon className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="photoURL"
                  name="photoURL"
                  type="url"
                  autoComplete="photo"
                  placeholder="Or paste direct image URL (https://...)"
                  className="h-11 pr-9 pl-9"
                  value={values.photoURL}
                  onChange={handleChange}
                  aria-invalid={Boolean(errors.photoURL)}
                  disabled={isBusy}
                />
                {values.photoURL && (
                  <button
                    type="button"
                    onClick={() => {
                      setValues((prev) => ({ ...prev, photoURL: "" }));
                      setErrors((prev) => ({ ...prev, photoURL: undefined }));
                    }}
                    title="Clear image"
                    className="absolute top-1/2 right-2.5 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
                  >
                    <X className="size-4" />
                  </button>
                )}
              </div>

              {/* Image Preview */}
              {values.photoURL && urlPattern.test(values.photoURL) && (
                <div className="flex items-center gap-3 rounded-lg border border-border bg-muted/20 p-2.5 dark:border-zinc-800">
                  <div className="relative size-12 shrink-0 overflow-hidden rounded-full border border-border dark:border-zinc-700">
                    <img
                      src={values.photoURL}
                      alt="Profile preview"
                      className="size-full object-cover"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-medium text-foreground">
                      Photo selected
                    </p>
                    <p className="truncate text-[11px] text-muted-foreground">
                      {values.photoURL}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setValues((prev) => ({ ...prev, photoURL: "" }));
                      setErrors((prev) => ({ ...prev, photoURL: undefined }));
                    }}
                    className="rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
                    title="Remove photo"
                  >
                    <X className="size-4" />
                  </button>
                </div>
              )}

              {errors.photoURL ? (
                <p className="text-xs text-destructive">{errors.photoURL}</p>
              ) : (
                <p className="text-xs text-muted-foreground">
                  Upload an image from your device via ImgBB or paste a direct
                  image URL.
                </p>
              )}
            </div>

            {/* Password */}
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <LockKeyhole className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  placeholder="At least 6 characters"
                  className="h-11 pr-10 pl-9"
                  value={values.password}
                  onChange={handleChange}
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
              {errors.password ? (
                <p className="text-xs text-destructive">{errors.password}</p>
              ) : (
                <p className="text-xs text-muted-foreground">
                  At least 6 characters, with one uppercase and one lowercase
                  letter.
                </p>
              )}
            </div>

            {/* Confirm password */}
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="confirmPassword">Confirm password</Label>
              <div className="relative">
                <LockKeyhole className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  placeholder="Repeat your password"
                  className="h-11 pl-9"
                  value={values.confirmPassword}
                  onChange={handleChange}
                  aria-invalid={Boolean(errors.confirmPassword)}
                />
              </div>
              {errors.confirmPassword && (
                <p className="text-xs text-destructive">
                  {errors.confirmPassword}
                </p>
              )}
            </div>

            {/* Terms */}
            <div className="flex items-start gap-2.5 pt-1">
              <Checkbox
                id="terms"
                className="mt-0.5"
                checked={agreed}
                onCheckedChange={(checked) => {
                  setAgreed(checked === true);
                  setErrors((previous) => ({
                    ...previous,
                    terms: undefined,
                  }));
                }}
                aria-invalid={Boolean(errors.terms)}
              />
              <div className="flex flex-col gap-1">
                <Label
                  htmlFor="terms"
                  className="text-sm leading-snug font-normal text-muted-foreground"
                >
                  I agree to the SpotLight Terms of Service and Privacy Policy.
                </Label>
                {errors.terms && (
                  <p className="text-xs text-destructive">{errors.terms}</p>
                )}
              </div>
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
                  Registering...
                </>
              ) : (
                <>
                  <UserPlus />
                  Register
                </>
              )}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link
              href="/login"
              className="font-semibold text-primary transition-colors duration-200 hover:text-primary/80 hover:underline"
            >
              Log in
            </Link>
          </p>
        </Card>
      </div>
    </div>
  );
};

export default RegisterPage;
