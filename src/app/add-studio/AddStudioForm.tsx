"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Loader2, MapPin } from "lucide-react";

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
import { toast } from "@/components/ui/toast";

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

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const urlPattern = /^https?:\/\/.+/i;

const AddStudioForm = () => {
  const router = useRouter();

  const [form, setForm] = useState<FormState>(initialForm);
  const [amenities, setAmenities] = useState<string[]>([]);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const update = <K extends keyof FormState>(key: K, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));

    setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const toggleAmenity = (value: string, checked: boolean) => {
    setAmenities((prev) =>
      checked ? [...prev, value] : prev.filter((item) => item !== value),
    );
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
      nextErrors.imageUrl = "Image URL is required.";
    } else if (!urlPattern.test(form.imageUrl.trim())) {
      nextErrors.imageUrl =
        "Enter a valid URL starting with http:// or https://.";
    }

    if (!form.overview.trim()) {
      nextErrors.overview = "Overview is required.";
    } else if (form.overview.trim().length < 20) {
      nextErrors.overview = "Overview must be at least 20 characters.";
    }

    if (!form.hostName.trim()) {
      nextErrors.hostName = "Host name is required.";
    }

    if (!form.hostEmail.trim()) {
      nextErrors.hostEmail = "Host email is required.";
    } else if (!emailPattern.test(form.hostEmail.trim())) {
      nextErrors.hostEmail = "Enter a valid email address.";
    }

    return nextErrors;
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const nextErrors = validate();
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      toast.add({
        type: "error",
        title: "Missing information",
        description: "Please fix the highlighted fields and try again.",
      });
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
      hostName: form.hostName.trim(),
      hostEmail: form.hostEmail.trim(),
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

      toast.add({
        type: "success",
        title: "Studio created",
        description: "Your studio has been listed successfully.",
      });

      router.push("/my-listings");
    } catch (error) {
      toast.add({
        type: "error",
        title: "Could not create studio",
        description:
          error instanceof Error ? error.message : "Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} noValidate>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground sm:text-3xl">
          List Your Studio
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Add the details of your production space so creative professionals can
          discover and book it.
        </p>
      </div>

      <Card className="dark:bg-zinc-900 dark:ring-zinc-800">
        <CardHeader>
          <CardTitle>Studio Basics</CardTitle>
          <CardDescription>
            Give your space a clear name and choose the closest category.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <FieldGroup>
            <Field data-invalid={Boolean(errors.title)}>
              <FieldLabel htmlFor="title">Title</FieldLabel>
              <Input
                id="title"
                name="title"
                value={form.title}
                onChange={(event) => update("title", event.target.value)}
                placeholder="e.g. Downtown Daylight Loft"
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
            Set your hourly rate, deposit and how many people the space fits.
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
              <FieldLabel htmlFor="capacity">Max Capacity</FieldLabel>
              <Input
                id="capacity"
                name="capacity"
                type="number"
                inputMode="numeric"
                min="1"
                step="1"
                value={form.capacity}
                onChange={(event) => update("capacity", event.target.value)}
                placeholder="12"
                aria-invalid={Boolean(errors.capacity)}
                disabled={isSubmitting}
              />
              <FieldDescription>
                Maximum number of people allowed on set.
              </FieldDescription>
              {errors.capacity && <FieldError>{errors.capacity}</FieldError>}
            </Field>
          </FieldGroup>
        </CardContent>
      </Card>

      <Card className="mt-6 dark:bg-zinc-900 dark:ring-zinc-800">
        <CardHeader>
          <CardTitle>Location &amp; Media</CardTitle>
          <CardDescription>
            Where is your studio and what does it look like?
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
                  placeholder="123 Studio Ave, Brooklyn, NY"
                  aria-invalid={Boolean(errors.location)}
                  disabled={isSubmitting}
                />
              </div>
              {errors.location && <FieldError>{errors.location}</FieldError>}
            </Field>

            <Field data-invalid={Boolean(errors.imageUrl)}>
              <FieldLabel htmlFor="imageUrl">Image URL</FieldLabel>
              <Input
                id="imageUrl"
                name="imageUrl"
                type="url"
                value={form.imageUrl}
                onChange={(event) => update("imageUrl", event.target.value)}
                placeholder="https://example.com/studio-banner.jpg"
                aria-invalid={Boolean(errors.imageUrl)}
                disabled={isSubmitting}
              />
              <FieldDescription>
                Banner image for your listing (used as the featured photo).
              </FieldDescription>
              {errors.imageUrl && <FieldError>{errors.imageUrl}</FieldError>}
            </Field>
          </FieldGroup>
        </CardContent>
      </Card>

      <Card className="mt-6 dark:bg-zinc-900 dark:ring-zinc-800">
        <CardHeader>
          <CardTitle>Amenities</CardTitle>
          <CardDescription>
            Select everything your space provides.
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
            Describe the workspace, rules and technical specs.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Field data-invalid={Boolean(errors.overview)}>
            <FieldLabel htmlFor="overview">Overview</FieldLabel>
            <Textarea
              id="overview"
              name="overview"
              rows={6}
              value={form.overview}
              onChange={(event) => update("overview", event.target.value)}
              placeholder="Highlights, house rules, equipment list, load-in access..."
              aria-invalid={Boolean(errors.overview)}
              disabled={isSubmitting}
            />
            {errors.overview && <FieldError>{errors.overview}</FieldError>}
          </Field>
        </CardContent>
      </Card>

      <Card className="mt-6 dark:bg-zinc-900 dark:ring-zinc-800">
        <CardHeader>
          <CardTitle>Host Details</CardTitle>
          <CardDescription>How can guests reach you?</CardDescription>
        </CardHeader>
        <CardContent>
          <FieldGroup>
            <div className="grid gap-5 sm:grid-cols-2">
              <Field data-invalid={Boolean(errors.hostName)}>
                <FieldLabel htmlFor="hostName">Host Name</FieldLabel>
                <Input
                  id="hostName"
                  name="hostName"
                  value={form.hostName}
                  onChange={(event) => update("hostName", event.target.value)}
                  placeholder="Your name"
                  aria-invalid={Boolean(errors.hostName)}
                  disabled={isSubmitting}
                />
                {errors.hostName && <FieldError>{errors.hostName}</FieldError>}
              </Field>

              <Field data-invalid={Boolean(errors.hostEmail)}>
                <FieldLabel htmlFor="hostEmail">Host Email</FieldLabel>
                <Input
                  id="hostEmail"
                  name="hostEmail"
                  type="email"
                  value={form.hostEmail}
                  onChange={(event) => update("hostEmail", event.target.value)}
                  placeholder="you@example.com"
                  aria-invalid={Boolean(errors.hostEmail)}
                  disabled={isSubmitting}
                />
                {errors.hostEmail && (
                  <FieldError>{errors.hostEmail}</FieldError>
                )}
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
        <Button type="submit" size="lg" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="animate-spin" />
              Saving...
            </>
          ) : (
            <>
              Publish Studio
              <ArrowRight />
            </>
          )}
        </Button>
      </div>
    </form>
  );
};

export default AddStudioForm;
