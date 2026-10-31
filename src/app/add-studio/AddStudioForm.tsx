"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  ImageIcon,
  Loader2,
  MapPin,
  Upload,
} from "lucide-react";
import { toast } from "sonner";

import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

const STUDIO_API_ENDPOINT = `${
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000"
}/add-new-studio`;

const CATEGORIES = [
  "Photo Studio",
  "Sound Stage",
  "Podcast Lounge",
  "Music Suite",
  "Art Workshop",
];

const AMENITIES = [
  { value: "wifi", label: "WiFi" },
  { value: "cyc-wall", label: "Cyc Wall" },
  { value: "studio-lighting", label: "Studio Lighting" },
  { value: "soundproof", label: "Soundproof" },
  { value: "dressing-room", label: "Dressing Room" },
  { value: "restroom", label: "Restroom" },
  { value: "parking", label: "Parking" },
];

type FormState = {
  title: string;
  category: string;
  hourlyRate: string;
  securityDeposit: string;
  capacity: string;
  location: string;
  imageUrl: string;
  overview: string;
  hostName: string;
  hostEmail: string;
};

type FormErrors = Partial<Record<keyof FormState, string>>;

const initialForm: FormState = {
  title: "",
  category: "",
  hourlyRate: "",
  securityDeposit: "",
  capacity: "",
  location: "",
  imageUrl: "",
  overview: "",
  hostName: "",
  hostEmail: "",
};

const urlPattern = /^https?:\/\/.+/i;

const AddStudioForm = () => {
  const router = useRouter();
  const { data: session, isPending: isAuthPending } = authClient.useSession();
  const user = session?.user;

  const [form, setForm] = useState<FormState>(initialForm);
  const [amenities, setAmenities] = useState<string[]>([]);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  // Auto-populate read-only host details from logged-in session
  useEffect(() => {
    if (user) {
      setForm((prev) => ({
        ...prev,
        hostName: user.name ?? "",
        hostEmail: user.email ?? "",
      }));
    }
  }, [user]);

  const update = <K extends keyof FormState>(key: K, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const toggleAmenity = (value: string, checked: boolean) => {
    setAmenities((prev) =>
      checked ? [...prev, value] : prev.filter((item) => item !== value),
    );
  };

  // Image upload using ImgBB API
  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Check size limit (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error("Image size should be less than 10MB.");
      return;
    }

    setIsUploadingImage(true);
    const formData = new FormData();
    formData.append("image", file);

    const apiKey =
      process.env.NEXT_PUBLIC_IMGBB_API_KEY || "c0379965d83626fa323fcf63e9f0298a";

    try {
      const response = await fetch(`https://api.imgbb.com/1/upload?key=${apiKey}`, {
        method: "POST",
        body: formData,
      });
      const data = await response.json();

      if (data?.data?.url) {
        update("imageUrl", data.data.url);
        toast.success("Image uploaded to ImgBB successfully!");
      } else {
        throw new Error(data?.error?.message ?? "ImgBB upload failed.");
      }
    } catch (error) {
      toast.error("Could not upload to ImgBB. You can paste an image URL directly.");
    } finally {
      setIsUploadingImage(false);
    }
  };

  const validate = (): FormErrors => {
    const nextErrors: FormErrors = {};

    if (!form.title.trim()) {
      nextErrors.title = "Title is required.";
    } else if (form.title.trim().length < 3) {
      nextErrors.title = "Title must be at least 3 characters.";
    }

    if (!form.category) {
      nextErrors.category = "Please select a category.";
    }

    const hourlyRate = Number(form.hourlyRate);
    if (!form.hourlyRate.trim()) {
      nextErrors.hourlyRate = "Hourly rate is required.";
    } else if (Number.isNaN(hourlyRate) || hourlyRate <= 0) {
      nextErrors.hourlyRate = "Enter a valid amount greater than 0.";
    }

    const securityDeposit = Number(form.securityDeposit);
    if (!form.securityDeposit.trim()) {
      nextErrors.securityDeposit = "Security deposit is required.";
    } else if (Number.isNaN(securityDeposit) || securityDeposit < 0) {
      nextErrors.securityDeposit = "Enter a valid amount (0 or more).";
    }

    const capacity = Number(form.capacity);
    if (!form.capacity.trim()) {
      nextErrors.capacity = "Max capacity is required.";
    } else if (!Number.isInteger(capacity) || capacity < 1) {
      nextErrors.capacity = "Capacity must be a whole number (1 or more).";
    }

    if (!form.location.trim()) {
      nextErrors.location = "Location is required.";
    }

    if (!form.imageUrl.trim()) {
      nextErrors.imageUrl = "Image URL or upload is required.";
    } else if (!urlPattern.test(form.imageUrl.trim())) {
      nextErrors.imageUrl =
        "Enter a valid URL starting with http:// or https://.";
    }

    if (!form.overview.trim()) {
      nextErrors.overview = "Overview is required.";
    } else if (form.overview.trim().length < 20) {
      nextErrors.overview = "Overview must be at least 20 characters.";
    }

    return nextErrors;
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const nextErrors = validate();
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      toast.error("Please fill in all required fields.");
      return;
    }

    const payload = {
      title: form.title.trim(),
      category: form.category,
      hourlyRate: Number(form.hourlyRate),
      securityDeposit: Number(form.securityDeposit),
      capacity: Number(form.capacity),
      location: form.location.trim(),
      imageUrl: form.imageUrl.trim(),
      amenities,
      overview: form.overview.trim(),
      hostName: form.hostName || user?.name || "SpotLight Host",
      hostEmail: form.hostEmail || user?.email || "",
      ownerEmail: form.hostEmail || user?.email || "",
    };

    setIsSubmitting(true);

    try {
      const response = await fetch(STUDIO_API_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(
          data?.message ?? `Request failed with status ${response.status}`,
        );
      }

      toast.success("Studio published successfully!");
      router.push("/my-listings");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Could not create studio.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isAuthPending) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="size-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="mx-auto max-w-md py-16 text-center">
        <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-500">
          <AlertCircle className="size-7" />
        </div>
        <h2 className="mt-4 font-heading text-2xl font-bold">Sign In Required</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Please log in to your account before hosting a new creative space.
        </p>
        <Button
          nativeButton={false}
          render={<Link href="/login" />}
          className="mt-6 w-full"
        >
          Go to Login
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      <div className="mb-8">
        <p className="text-xs font-semibold uppercase tracking-wider text-primary">
          Host Your Space
        </p>
        <h1 className="mt-1 text-2xl font-bold text-foreground sm:text-3xl">
          List Your Creative Studio
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Fill in the specifications of your workspace to share it with filmmakers, photographers, and audio producers.
        </p>
      </div>

      <Card className="dark:bg-zinc-900 dark:ring-zinc-800">
        <CardHeader>
          <CardTitle>Studio Basics</CardTitle>
          <CardDescription>
            Give your space a clear title and assign its primary production category.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <FieldGroup>
            <Field data-invalid={Boolean(errors.title)}>
              <FieldLabel htmlFor="title">Studio Title</FieldLabel>
              <Input
                id="title"
                name="title"
                value={form.title}
                onChange={(event) => update("title", event.target.value)}
                placeholder="e.g. Brooklyn Daylight Cyc Studio"
                aria-invalid={Boolean(errors.title)}
                disabled={isSubmitting}
              />
              {errors.title && <FieldError>{errors.title}</FieldError>}
            </Field>

            <Field data-invalid={Boolean(errors.category)}>
              <FieldLabel htmlFor="category">Category</FieldLabel>
              <Select
                value={form.category || null}
                onValueChange={(value) => update("category", value as string)}
                disabled={isSubmitting}
              >
                <SelectTrigger
                  id="category"
                  className="w-full"
                  aria-invalid={Boolean(errors.category)}
                >
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.category && <FieldError>{errors.category}</FieldError>}
            </Field>
          </FieldGroup>
        </CardContent>
      </Card>

      <Card className="mt-6 dark:bg-zinc-900 dark:ring-zinc-800">
        <CardHeader>
          <CardTitle>Pricing &amp; Capacity</CardTitle>
          <CardDescription>
            Set your transparent hourly rate, security deposit, and set capacity.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <FieldGroup>
            <div className="grid gap-5 sm:grid-cols-2">
              <Field data-invalid={Boolean(errors.hourlyRate)}>
                <FieldLabel htmlFor="hourlyRate">Hourly Rate ($)</FieldLabel>
                <Input
                  id="hourlyRate"
                  name="hourlyRate"
                  type="number"
                  inputMode="decimal"
                  min="0"
                  step="0.01"
                  value={form.hourlyRate}
                  onChange={(event) => update("hourlyRate", event.target.value)}
                  placeholder="75"
                  aria-invalid={Boolean(errors.hourlyRate)}
                  disabled={isSubmitting}
                />
                {errors.hourlyRate && (
                  <FieldError>{errors.hourlyRate}</FieldError>
                )}
              </Field>

              <Field data-invalid={Boolean(errors.securityDeposit)}>
                <FieldLabel htmlFor="securityDeposit">
                  Security Deposit ($)
                </FieldLabel>
                <Input
                  id="securityDeposit"
                  name="securityDeposit"
                  type="number"
                  inputMode="decimal"
                  min="0"
                  step="0.01"
                  value={form.securityDeposit}
                  onChange={(event) =>
                    update("securityDeposit", event.target.value)
                  }
                  placeholder="200"
                  aria-invalid={Boolean(errors.securityDeposit)}
                  disabled={isSubmitting}
                />
                {errors.securityDeposit && (
                  <FieldError>{errors.securityDeposit}</FieldError>
                )}
              </Field>
            </div>

            <Field data-invalid={Boolean(errors.capacity)}>
              <FieldLabel htmlFor="capacity">Max Capacity (Persons)</FieldLabel>
              <Input
                id="capacity"
                name="capacity"
                type="number"
                inputMode="numeric"
                min="1"
                step="1"
                value={form.capacity}
                onChange={(event) => update("capacity", event.target.value)}
                placeholder="15"
                aria-invalid={Boolean(errors.capacity)}
                disabled={isSubmitting}
              />
              <FieldDescription>
                Maximum crew and cast allowed on set simultaneously.
              </FieldDescription>
              {errors.capacity && <FieldError>{errors.capacity}</FieldError>}
            </Field>
          </FieldGroup>
        </CardContent>
      </Card>

      <Card className="mt-6 dark:bg-zinc-900 dark:ring-zinc-800">
        <CardHeader>
          <CardTitle>Location &amp; Image Upload</CardTitle>
          <CardDescription>
            Provide your address and upload a studio banner via ImgBB or paste a direct image URL.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <FieldGroup>
            <Field data-invalid={Boolean(errors.location)}>
              <FieldLabel htmlFor="location">Location / Address</FieldLabel>
              <div className="relative">
                <MapPin className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="location"
                  name="location"
                  className="pl-8"
                  value={form.location}
                  onChange={(event) => update("location", event.target.value)}
                  placeholder="452 Studio Blvd, Manhattan, NY"
                  aria-invalid={Boolean(errors.location)}
                  disabled={isSubmitting}
                />
              </div>
              {errors.location && <FieldError>{errors.location}</FieldError>}
            </Field>

            {/* ImgBB Upload & URL field */}
            <Field data-invalid={Boolean(errors.imageUrl)}>
              <FieldLabel htmlFor="imageUrl">Studio Banner Image</FieldLabel>

              {/* Upload to ImgBB widget */}
              <div className="flex flex-col gap-3 rounded-xl border border-dashed border-border bg-muted/30 p-4 dark:border-zinc-800">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <Upload className="size-4 text-primary" />
                    <span>Upload via ImgBB</span>
                  </div>
                  {isUploadingImage && (
                    <span className="flex items-center gap-1.5 text-xs text-primary">
                      <Loader2 className="size-3.5 animate-spin" /> Uploading to ImgBB...
                    </span>
                  )}
                </div>

                <label
                  htmlFor="imgbb-file-input"
                  className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-border bg-background px-4 py-2 text-xs font-semibold text-foreground transition hover:bg-muted dark:border-zinc-800"
                >
                  <ImageIcon className="size-4 text-primary" />
                  Select Image File from Device
                  <input
                    id="imgbb-file-input"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    disabled={isUploadingImage || isSubmitting}
                    onChange={handleImageUpload}
                  />
                </label>
              </div>

              {/* URL input */}
              <div className="mt-2">
                <Input
                  id="imageUrl"
                  name="imageUrl"
                  type="url"
                  value={form.imageUrl}
                  onChange={(event) => update("imageUrl", event.target.value)}
                  placeholder="Or paste image URL (e.g. https://...)"
                  aria-invalid={Boolean(errors.imageUrl)}
                  disabled={isSubmitting || isUploadingImage}
                />
              </div>

              {/* Preview */}
              {form.imageUrl && urlPattern.test(form.imageUrl) && (
                <div className="mt-3 relative h-36 w-full overflow-hidden rounded-lg border border-border dark:border-zinc-800">
                  <img
                    src={form.imageUrl}
                    alt="Studio preview"
                    className="h-full w-full object-cover"
                  />
                  <span className="absolute bottom-2 right-2 rounded-md bg-black/60 px-2 py-1 text-[11px] font-medium text-white backdrop-blur">
                    Image Preview
                  </span>
                </div>
              )}

              {errors.imageUrl && <FieldError>{errors.imageUrl}</FieldError>}
            </Field>
          </FieldGroup>
        </CardContent>
      </Card>

      <Card className="mt-6 dark:bg-zinc-900 dark:ring-zinc-800">
        <CardHeader>
          <CardTitle>Amenities</CardTitle>
          <CardDescription>
            Select equipment and facilities provided with this studio.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {AMENITIES.map((amenity) => {
              const isSelected = amenities.includes(amenity.value);

              return (
                <label
                  key={amenity.value}
                  htmlFor={`amenity-${amenity.value}`}
                  className={`flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-sm transition-colors duration-200 ${
                    isSelected
                      ? "border-primary/50 bg-primary/10 text-foreground"
                      : "border-border text-muted-foreground hover:bg-muted dark:border-zinc-800 dark:hover:bg-zinc-800/60"
                  }`}
                >
                  <Checkbox
                    id={`amenity-${amenity.value}`}
                    checked={isSelected}
                    onCheckedChange={(checked) =>
                      toggleAmenity(amenity.value, checked)
                    }
                    disabled={isSubmitting}
                  />
                  <span>{amenity.label}</span>
                </label>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Card className="mt-6 dark:bg-zinc-900 dark:ring-zinc-800">
        <CardHeader>
          <CardTitle>Detailed Overview</CardTitle>
          <CardDescription>
            Describe the floor layout, lighting setups, ceiling height, and sound isolation.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Field data-invalid={Boolean(errors.overview)}>
            <FieldLabel htmlFor="overview">Overview</FieldLabel>
            <Textarea
              id="overview"
              name="overview"
              rows={5}
              value={form.overview}
              onChange={(event) => update("overview", event.target.value)}
              placeholder="Highlight studio dimensions, cyclorama dimensions, sound acoustic rating, power capacity..."
              aria-invalid={Boolean(errors.overview)}
              disabled={isSubmitting}
            />
            {errors.overview && <FieldError>{errors.overview}</FieldError>}
          </Field>
        </CardContent>
      </Card>

      {/* Read-only User Email & Name as required by Assignment Document */}
      <Card className="mt-6 dark:bg-zinc-900 dark:ring-zinc-800">
        <CardHeader>
          <CardTitle>Host Details (Read-only)</CardTitle>
          <CardDescription>
            Automatically linked to your authenticated creator account.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <FieldGroup>
            <div className="grid gap-5 sm:grid-cols-2">
              <Field>
                <FieldLabel htmlFor="hostName">Host Name (Read-only)</FieldLabel>
                <Input
                  id="hostName"
                  name="hostName"
                  readOnly
                  value={form.hostName}
                  className="bg-muted text-muted-foreground cursor-not-allowed"
                />
              </Field>

              <Field>
                <FieldLabel htmlFor="hostEmail">Host Email (Read-only)</FieldLabel>
                <Input
                  id="hostEmail"
                  name="hostEmail"
                  readOnly
                  value={form.hostEmail}
                  className="bg-muted text-muted-foreground cursor-not-allowed"
                />
              </Field>
            </div>
          </FieldGroup>
        </CardContent>
      </Card>

      <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <Button
          variant="outline"
          size="lg"
          disabled={isSubmitting}
          nativeButton={false}
          render={<Link href="/my-listings" />}
        >
          Cancel
        </Button>
        <Button type="submit" size="lg" disabled={isSubmitting || isUploadingImage}>
          {isSubmitting ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              Publishing Studio...
            </>
          ) : (
            <>
              Publish Studio
              <ArrowRight className="size-4" />
            </>
          )}
        </Button>
      </div>
    </form>
  );
};

export default AddStudioForm;
