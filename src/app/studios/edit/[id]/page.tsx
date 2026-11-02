"use client";

import { FormEvent, Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  AlertCircle,
  ArrowRight,
  ImageIcon,
  Loader2,
  LoaderCircle,
  MapPin,
  Upload,
  X,
} from "lucide-react";
import { toast } from "sonner";

import { authClient } from "@/lib/auth-client";
import { API_BASE } from "@/lib/api";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

const CATEGORIES = [
  "Photo Studio",
  "Sound Stage",
  "Podcast Lounge",
  "Music Suite",
  "Art Workshop",
  "Film Stage",
];

type StudioForm = {
  title: string;
  category: string;
  location: string;
  hourlyRate: string;
  securityDeposit: string;
  capacity: string;
  imageUrl: string;
  overview: string;
  amenities: string;
  hostName: string;
  hostEmail: string;
};

const urlPattern = /^https?:\/\/.+/i;

const EditStudioContent = () => {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { data: session, isPending: isAuthPending } = authClient.useSession();
  const user = session?.user;

  const [form, setForm] = useState<StudioForm>({
    title: "",
    category: "",
    location: "",
    hourlyRate: "",
    securityDeposit: "",
    capacity: "",
    imageUrl: "",
    overview: "",
    amenities: "",
    hostName: "",
    hostEmail: "",
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [gallery, setGallery] = useState<string[]>([]);
  const [galleryInput, setGalleryInput] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    fetch(`${API_BASE}/all-studio/${encodeURIComponent(params.id)}`, {
      signal: controller.signal,
      cache: "no-store",
    })
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok) throw new Error(data.message ?? "Studio could not be loaded.");
        const studio = data.studio ?? data;
        const imageList: string[] =
          Array.isArray(studio.images) && studio.images.length
            ? studio.images.filter(Boolean)
            : [studio.imageUrl ?? studio.image ?? studio.bannerImage ?? ""].filter(
                Boolean,
              );
        setForm({
          title: studio.title ?? "",
          category: studio.category ?? "",
          location: studio.location ?? "",
          hourlyRate: String(studio.hourlyRate ?? studio.rate ?? ""),
          securityDeposit: String(studio.securityDeposit ?? studio.deposit ?? ""),
          capacity: String(studio.capacity ?? studio.maxCapacity ?? ""),
          imageUrl: imageList[0] ?? "",
          overview: studio.overview ?? studio.description ?? "",
          amenities: Array.isArray(studio.amenities) ? studio.amenities.join(", ") : "",
          hostName: studio.hostName || studio.host?.name || user?.name || "SpotLight Host",
          hostEmail: studio.hostEmail || studio.host?.email || user?.email || "",
        });
        setGallery(imageList.slice(1));
      })
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === "AbortError") return;
        toast.error(error instanceof Error ? error.message : "Studio could not be loaded.");
      })
      .finally(() => setIsLoading(false));

    return () => controller.abort();
  }, [params.id, user]);

  const updateField = (field: keyof StudioForm, value: string) =>
    setForm((current) => ({ ...current, [field]: value }));

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      toast.error("Image size should be less than 10MB.");
      return;
    }

    setIsUploadingImage(true);
    const formData = new FormData();
    formData.append("image", file);

    const apiKey = process.env.NEXT_PUBLIC_IMGBB_API_KEY;
    if (!apiKey) {
      setIsUploadingImage(false);
      toast.error(
        "ImgBB API key is missing. Add NEXT_PUBLIC_IMGBB_API_KEY to your .env file.",
      );
      return;
    }

    try {
      const response = await fetch(`https://api.imgbb.com/1/upload?key=${apiKey}`, {
        method: "POST",
        body: formData,
      });
      const data = await response.json();

      if (data?.data?.url) {
        updateField("imageUrl", data.data.url);
        toast.success("Image uploaded to ImgBB successfully!");
      } else {
        throw new Error(data?.error?.message ?? "ImgBB upload failed.");
      }
    } catch {
      toast.error("Could not upload to ImgBB. You can paste an image URL directly.");
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleGalleryUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const files = Array.from(event.target.files ?? []);
    event.target.value = "";
    if (!files.length) return;

    if (files.some((file) => file.size > 10 * 1024 * 1024)) {
      toast.error("Each gallery image must be smaller than 10MB.");
      return;
    }

    const apiKey = process.env.NEXT_PUBLIC_IMGBB_API_KEY;
    if (!apiKey) {
      toast.error(
        "ImgBB API key is missing. Add NEXT_PUBLIC_IMGBB_API_KEY to your .env file.",
      );
      return;
    }

    setIsUploadingImage(true);
    try {
      const uploaded = await Promise.all(
        files.map(async (file) => {
          const formData = new FormData();
          formData.append("image", file);

          const response = await fetch(
            `https://api.imgbb.com/1/upload?key=${apiKey}`,
            { method: "POST", body: formData },
          );
          const data = await response.json();

          if (!data?.data?.url) {
            throw new Error(data?.error?.message ?? "Upload failed.");
          }
          return data.data.url as string;
        }),
      );

      setGallery((previous) => [...previous, ...uploaded]);
      toast.success(
        `${uploaded.length} gallery image${uploaded.length > 1 ? "s" : ""} uploaded.`,
      );
    } catch {
      toast.error("Could not upload every image. Try again or paste image URLs.");
    } finally {
      setIsUploadingImage(false);
    }
  };

  const addGalleryUrl = () => {
    const url = galleryInput.trim();
    if (!url) return;
    if (!urlPattern.test(url)) {
      toast.error("Gallery URLs must start with http:// or https://.");
      return;
    }
    setGallery((previous) =>
      previous.includes(url) ? previous : [...previous, url],
    );
    setGalleryInput("");
  };

  const removeGalleryImage = (url: string) => {
    setGallery((previous) => previous.filter((item) => item !== url));
  };

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    try {
      const imageList = Array.from(
        new Set([form.imageUrl.trim(), ...gallery].filter(Boolean)),
      );
      const response = await fetch(`${API_BASE}/all-studio/${encodeURIComponent(params.id)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          imageUrl: imageList[0] ?? "",
          images: imageList,
          hourlyRate: Number(form.hourlyRate),
          securityDeposit: Number(form.securityDeposit),
          capacity: Number(form.capacity),
          amenities: form.amenities.split(",").map((item) => item.trim()).filter(Boolean),
        }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.message ?? "Studio could not be updated.");

      toast.success("Studio listing updated successfully!");
      router.push("/my-listings");
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Studio could not be updated.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isAuthPending || isLoading) {
    return (
      <div className="container mx-auto flex min-h-[60vh] items-center justify-center px-4">
        <LoaderCircle className="size-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container mx-auto max-w-md px-4 py-24 text-center">
        <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-500">
          <AlertCircle className="size-7" />
        </div>
        <h2 className="mt-4 font-heading text-2xl font-bold">Sign In Required</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Please log in to your account to update studio listings.
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
    <div className="bg-background pb-20">
      <section className="border-b border-border bg-muted/40 py-12 text-foreground dark:bg-zinc-950 dark:text-white sm:py-16">
        <div className="container mx-auto px-4 max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-wider text-primary">
            Host Controls
          </p>
          <h1 className="mt-2 font-heading text-3xl font-bold sm:text-4xl">
            Update Studio Listing
          </h1>
          <p className="mt-1 text-sm text-muted-foreground dark:text-zinc-300">
            Keep your workspace pricing, media, and availability up to date for creators.
          </p>
        </div>
      </section>

      <main className="container mx-auto max-w-3xl px-4 py-10">
        <form onSubmit={submit} className="space-y-6">
          <Card className="dark:bg-zinc-900 dark:ring-zinc-800">
            <CardHeader>
              <CardTitle>Studio Basics</CardTitle>
              <CardDescription>Title and production category.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="title">Studio Title</Label>
                <Input
                  id="title"
                  required
                  value={form.title}
                  onChange={(e) => updateField("title", e.target.value)}
                  className="mt-1.5"
                />
              </div>

              <div>
                <Label htmlFor="category">Category</Label>
                <div className="mt-1.5">
                  <Select
                    value={form.category || null}
                    onValueChange={(val) => updateField("category", val as string)}
                  >
                    <SelectTrigger id="category" className="w-full">
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          {cat}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="dark:bg-zinc-900 dark:ring-zinc-800">
            <CardHeader>
              <CardTitle>Pricing, Deposit &amp; Capacity</CardTitle>
              <CardDescription>Rates and occupancy specifications.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-3">
                <div>
                  <Label htmlFor="hourlyRate">Hourly Rate ($)</Label>
                  <Input
                    id="hourlyRate"
                    required
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.hourlyRate}
                    onChange={(e) => updateField("hourlyRate", e.target.value)}
                    className="mt-1.5"
                  />
                </div>
                <div>
                  <Label htmlFor="securityDeposit">Deposit ($)</Label>
                  <Input
                    id="securityDeposit"
                    required
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.securityDeposit}
                    onChange={(e) => updateField("securityDeposit", e.target.value)}
                    className="mt-1.5"
                  />
                </div>
                <div>
                  <Label htmlFor="capacity">Max Capacity</Label>
                  <Input
                    id="capacity"
                    required
                    type="number"
                    min="1"
                    value={form.capacity}
                    onChange={(e) => updateField("capacity", e.target.value)}
                    className="mt-1.5"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="dark:bg-zinc-900 dark:ring-zinc-800">
            <CardHeader>
              <CardTitle>Location &amp; Banner Image</CardTitle>
              <CardDescription>Address and photos.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="location">Location / Address</Label>
                <div className="relative mt-1.5">
                  <MapPin className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="location"
                    required
                    value={form.location}
                    onChange={(e) => updateField("location", e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="imageUrl">Banner Image</Label>

                <div className="mt-1.5 flex flex-col gap-2 rounded-xl border border-dashed border-border bg-muted/30 p-4 dark:border-zinc-800">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                      <Upload className="size-3.5 text-primary" /> Upload to ImgBB
                    </span>
                    {isUploadingImage && (
                      <span className="text-xs text-primary flex items-center gap-1">
                        <Loader2 className="size-3 animate-spin" /> Uploading...
                      </span>
                    )}
                  </div>
                  <label
                    htmlFor="edit-imgbb-file"
                    className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-semibold text-foreground transition hover:bg-muted dark:border-zinc-800"
                  >
                    <ImageIcon className="size-3.5 text-primary" />
                    Select Image File
                    <input
                      id="edit-imgbb-file"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      disabled={isUploadingImage || isSubmitting}
                      onChange={handleImageUpload}
                    />
                  </label>
                </div>

                <Input
                  id="imageUrl"
                  required
                  type="url"
                  value={form.imageUrl}
                  onChange={(e) => updateField("imageUrl", e.target.value)}
                  placeholder="Or paste image URL"
                  className="mt-2"
                />

                {form.imageUrl && (
                  <div className="mt-3 relative h-36 w-full overflow-hidden rounded-lg border border-border dark:border-zinc-800">
                    <img
                      src={form.imageUrl}
                      alt="Studio preview"
                      className="h-full w-full object-cover"
                    />
                  </div>
                )}

                <div className="mt-4 rounded-xl border border-dashed border-border p-4 dark:border-zinc-800">
                  <p className="text-sm font-medium">Gallery images</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Optional extra photos shown in the details-page carousel.
                  </p>

                  <label
                    htmlFor="edit-gallery-file"
                    className="mt-3 inline-flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-border bg-background px-4 py-2 text-xs font-semibold text-foreground transition hover:bg-muted dark:border-zinc-800"
                  >
                    <ImageIcon className="size-4 text-primary" />
                    Upload gallery images
                    <input
                      id="edit-gallery-file"
                      type="file"
                      accept="image/*"
                      multiple
                      className="hidden"
                      disabled={isUploadingImage || isSubmitting}
                      onChange={handleGalleryUpload}
                    />
                  </label>

                  <div className="mt-3 flex flex-col gap-2 sm:flex-row">
                    <Input
                      value={galleryInput}
                      onChange={(event) => setGalleryInput(event.target.value)}
                      onKeyDown={(event) => {
                        if (event.key === "Enter") {
                          event.preventDefault();
                          addGalleryUrl();
                        }
                      }}
                      placeholder="Or paste a gallery image URL"
                      disabled={isSubmitting || isUploadingImage}
                      className="mt-0"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={addGalleryUrl}
                      disabled={isSubmitting || isUploadingImage}
                    >
                      Add image
                    </Button>
                  </div>

                  {gallery.length > 0 && (
                    <ul className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
                      {gallery.map((url) => (
                        <li
                          key={url}
                          className="relative h-24 overflow-hidden rounded-lg border border-border dark:border-zinc-800"
                        >
                          <img
                            src={url}
                            alt="Gallery preview"
                            className="h-full w-full object-cover"
                          />
                          <button
                            type="button"
                            onClick={() => removeGalleryImage(url)}
                            aria-label="Remove gallery image"
                            className="absolute top-1.5 right-1.5 flex size-6 items-center justify-center rounded-full bg-black/60 text-white transition hover:bg-destructive"
                          >
                            <X className="size-3.5" />
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>

              <div>
                <Label htmlFor="amenities">Amenities (comma-separated)</Label>
                <Input
                  id="amenities"
                  value={form.amenities}
                  onChange={(e) => updateField("amenities", e.target.value)}
                  placeholder="WiFi, Cyc Wall, Studio Lighting, Soundproof"
                  className="mt-1.5"
                />
              </div>

              <div>
                <Label htmlFor="overview">Detailed Overview</Label>
                <Textarea
                  id="overview"
                  required
                  rows={5}
                  value={form.overview}
                  onChange={(e) => updateField("overview", e.target.value)}
                  className="mt-1.5"
                />
              </div>
            </CardContent>
          </Card>

          {/* Read-only Host Info as required by Assignment Document */}
          <Card className="dark:bg-zinc-900 dark:ring-zinc-800">
            <CardHeader>
              <CardTitle>Host Details (Read-only)</CardTitle>
              <CardDescription>
                Locked to the studio owner account.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="hostName">Host Name (Read-only)</Label>
                  <Input
                    id="hostName"
                    readOnly
                    value={form.hostName}
                    className="mt-1.5 bg-muted text-muted-foreground cursor-not-allowed"
                  />
                </div>
                <div>
                  <Label htmlFor="hostEmail">Host Email (Read-only)</Label>
                  <Input
                    id="hostEmail"
                    readOnly
                    value={form.hostEmail}
                    className="mt-1.5 bg-muted text-muted-foreground cursor-not-allowed"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              disabled={isSubmitting}
              onClick={() => router.push("/my-listings")}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || isUploadingImage}
              className="gap-2"
            >
              {isSubmitting ? (
                <>
                  <LoaderCircle className="size-4 animate-spin" />
                  Saving Changes...
                </>
              ) : (
                <>
                  Save Changes
                  <ArrowRight className="size-4" />
                </>
              )}
            </Button>
          </div>
        </form>
      </main>
    </div>
  );
};

const EditStudioPage = () => (
  <Suspense
    fallback={
      <div className="container mx-auto px-4 py-20 text-center">
        Loading editor...
      </div>
    }
  >
    <EditStudioContent />
  </Suspense>
);

export default EditStudioPage;
