"use client";

import { FormEvent, useMemo, useState } from "react";
import { LoaderCircle } from "lucide-react";
import { toast } from "sonner";

import type { StudioDetails } from "@/app/studios/[id]/page";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type BookingModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  studio: StudioDetails;
  hourlyRate: number;
  securityDeposit: number;
};

const toLocalDate = (date: Date) => {
  const offset = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 10);
};

const BookingModal = ({
  open,
  onOpenChange,
  studio,
  hourlyRate,
  securityDeposit,
}: BookingModalProps) => {
  const { data: session } = authClient.useSession();
  const [bookingDate, setBookingDate] = useState(() => toLocalDate(new Date()));
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("10:00");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const hours = useMemo(() => {
    const [startHour, startMinute] = startTime.split(":").map(Number);
    const [endHour, endMinute] = endTime.split(":").map(Number);
    const total = (endHour * 60 + endMinute - (startHour * 60 + startMinute)) / 60;
    return Math.max(0, total);
  }, [startTime, endTime]);

  const totalPrice = hours * hourlyRate;
  const customerName = session?.user?.name ?? "";
  const customerEmail = session?.user?.email ?? "";
  const studioId = studio._id ?? studio.id ?? "";
  const hostName = studio.host?.name ?? studio.hostName ?? "Studio Host";
  const hostEmail = studio.host?.email ?? studio.hostEmail ?? "";

  const submitBooking = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!session?.user) {
      toast.error("Please sign in to book this studio.");
      return;
    }
    if (!bookingDate || hours <= 0) {
      toast.error("Choose a valid time range.");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studioId,
          studioTitle: studio.title,
          hostName,
          hostEmail,
          customerName,
          customerEmail,
          bookingDate,
          startTime,
          endTime,
          totalHours: hours,
          hourlyRate,
          securityDeposit,
          totalPrice,
          status: "Pending",
        }),
      });
      const data = await response.json().catch(() => ({}));

      if (response.status === 409) {
        toast.error("This time slot is already booked. Please choose another.");
        return;
      }
      if (!response.ok) {
        throw new Error(data.message ?? "Booking could not be submitted.");
      }

      toast.success("Booking request submitted and is pending approval.");
      onOpenChange(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Booking could not be submitted.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Book {studio.title}</DialogTitle>
          <DialogDescription>Choose your session time and review the estimated price.</DialogDescription>
        </DialogHeader>

        <form onSubmit={submitBooking} className="space-y-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="space-y-2 text-sm font-medium">
              Logged-in user
              <input readOnly value={customerName || customerEmail || "Sign in required"} className="h-10 w-full rounded-lg border border-border bg-muted px-3 text-sm dark:border-zinc-800" />
            </label>
            <label className="space-y-2 text-sm font-medium">
              Host
              <input readOnly value={hostName} className="h-10 w-full rounded-lg border border-border bg-muted px-3 text-sm dark:border-zinc-800" />
            </label>
          </div>

          <label className="block space-y-2 text-sm font-medium">
            Booking date
            <input required type="date" min={toLocalDate(new Date())} value={bookingDate} onChange={(event) => setBookingDate(event.target.value)} className="h-10 w-full rounded-lg border border-border bg-background px-3 dark:border-zinc-800 dark:bg-zinc-900" />
          </label>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="space-y-2 text-sm font-medium">
              Start time
              <input required type="time" value={startTime} onChange={(event) => setStartTime(event.target.value)} className="h-10 w-full rounded-lg border border-border bg-background px-3 dark:border-zinc-800 dark:bg-zinc-900" />
            </label>
            <label className="space-y-2 text-sm font-medium">
              End time
              <input required type="time" value={endTime} onChange={(event) => setEndTime(event.target.value)} className="h-10 w-full rounded-lg border border-border bg-background px-3 dark:border-zinc-800 dark:bg-zinc-900" />
            </label>
          </div>

          <div className="grid grid-cols-2 gap-3 rounded-xl border border-border bg-muted/40 p-4 dark:border-zinc-800">
            <div>
              <p className="text-xs text-muted-foreground">Total hours</p>
              <p className="mt-1 text-lg font-bold">{hours.toFixed(hours % 1 ? 2 : 0)} hrs</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Total price</p>
              <p className="mt-1 text-lg font-bold text-amber-500">${totalPrice.toFixed(2)}</p>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={isSubmitting || hours <= 0} className="bg-amber-400 text-zinc-950 hover:bg-amber-300 dark:text-zinc-950">
              {isSubmitting && <LoaderCircle className="animate-spin" />}
              Submit Booking Request
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default BookingModal;
