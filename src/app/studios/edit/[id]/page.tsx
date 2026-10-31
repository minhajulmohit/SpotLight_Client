"use client";

import { FormEvent, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { LoaderCircle } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";

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
};

const EditStudioPage = () => {
  const params = useParams<{ id: string }>();
  const router = useRouter();
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
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const controller = new AbortController();

    fetch(`/api/studios/${encodeURIComponent(params.id)}`, {
      signal: controller.signal,
      cache: "no-store",
    })
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok) throw new Error(data.message ?? "Studio could not be loaded.");
        const studio = data.studio ?? data;
        setForm({
          title: studio.title ?? "",
          category: studio.category ?? "",
          location: studio.location ?? "",
          hourlyRate: String(studio.hourlyRate ?? studio.rate ?? ""),
          securityDeposit: String(studio.securityDeposit ?? studio.deposit ?? ""),
          capacity: String(studio.capacity ?? studio.maxCapacity ?? ""),
          imageUrl: studio.imageUrl ?? studio.image ?? studio.bannerImage ?? "",
          overview: studio.overview ?? studio.description ?? "",
          amenities: Array.isArray(studio.amenities) ? studio.amenities.join(", ") : "",
        });
      })
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === "AbortError") return;
        toast.error(error instanceof Error ? error.message : "Studio could not be loaded.");
      })
      .finally(() => setIsLoading(false));

    return () => controller.abort();
  }, [params.id]);

  const updateField = (field: keyof StudioForm, value: string) =>
    setForm((current) => ({ ...current, [field]: value }));

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/studios/${encodeURIComponent(params.id)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          hourlyRate: Number(form.hourlyRate),
          securityDeposit: Number(form.securityDeposit),
          capacity: Number(form.capacity),
          amenities: form.amenities.split(",").map((item) => item.trim()).filter(Boolean),
        }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.message ?? "Studio could not be updated.");

      toast.success("Studio updated successfully.");
      router.push("/my-listings");
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Studio could not be updated.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto flex min-h-[60vh] items-center justify-center px-4">
        <LoaderCircle className="size-7 animate-spin text-amber-500" />
      </div>
    );
  }

  const inputClass = "h-11 w-full rounded-lg border border-border bg-background px-3 outline-none focus:border-amber-400 dark:border-zinc-800 dark:bg-zinc-900";

  return (
    <main className="container mx-auto max-w-3xl px-4 py-10">
      <h1 className="font-heading text-3xl font-bold">Edit studio</h1>
      <p className="mt-2 text-muted-foreground">Update this listing and keep its availability accurate.</p>

      <form onSubmit={submit} className="mt-8 grid gap-5 rounded-2xl border border-border p-6 dark:border-zinc-800 dark:bg-zinc-900">
        <label className="space-y-2 text-sm font-medium">Studio title<input required value={form.title} onChange={(event) => updateField("title", event.target.value)} className={inputClass} /></label>
        <div className="grid gap-5 sm:grid-cols-2">
          <label className="space-y-2 text-sm font-medium">Category<input required value={form.category} onChange={(event) => updateField("category", event.target.value)} className={inputClass} /></label>
          <label className="space-y-2 text-sm font-medium">Location<input required value={form.location} onChange={(event) => updateField("location", event.target.value)} className={inputClass} /></label>
        </div>
        <div className="grid gap-5 sm:grid-cols-3">
          <label className="space-y-2 text-sm font-medium">Hourly rate ($)<input required type="number" min="0" value={form.hourlyRate} onChange={(event) => updateField("hourlyRate", event.target.value)} className={inputClass} /></label>
          <label className="space-y-2 text-sm font-medium">Deposit ($)<input required type="number" min="0" value={form.securityDeposit} onChange={(event) => updateField("securityDeposit", event.target.value)} className={inputClass} /></label>
          <label className="space-y-2 text-sm font-medium">Capacity<input required type="number" min="1" value={form.capacity} onChange={(event) => updateField("capacity", event.target.value)} className={inputClass} /></label>
        </div>
        <label className="space-y-2 text-sm font-medium">Image URL<input required type="url" value={form.imageUrl} onChange={(event) => updateField("imageUrl", event.target.value)} className={inputClass} /></label>
        <label className="space-y-2 text-sm font-medium">Amenities<input value={form.amenities} onChange={(event) => updateField("amenities", event.target.value)} placeholder="WiFi, Cyc Wall, Studio Lighting" className={inputClass} /></label>
        <label className="space-y-2 text-sm font-medium">Overview<textarea required rows={5} value={form.overview} onChange={(event) => updateField("overview", event.target.value)} className="w-full rounded-lg border border-border bg-background p-3 outline-none focus:border-amber-400 dark:border-zinc-800 dark:bg-zinc-900" /></label>
        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={() => router.push("/my-listings")}>Cancel</Button>
          <Button type="submit" disabled={isSubmitting} className="bg-amber-400 text-zinc-950 hover:bg-amber-500">
            {isSubmitting && <LoaderCircle className="animate-spin" />}
            Save changes
          </Button>
        </div>
      </form>
    </main>
  );
};

export default EditStudioPage;
