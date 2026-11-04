"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { LoaderCircle } from "lucide-react";
import { toast } from "sonner";

import type { StudioDetails } from "@/app/studios/[id]/StudioDetailsClient";
import { authClient } from "@/lib/auth-client";
import { apiFetch } from "@/lib/api";
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

type BookedTime = {
  startTime: string;
  endTime: string;
};


const toMinutes = (time: string) => {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
};


const getTodayDate = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const BookingModal = ({
  open,
  onOpenChange,
  studio,
  hourlyRate,
  securityDeposit,
}: BookingModalProps) => {
  const router = useRouter();
  const { data: session } = authClient.useSession();


  const [bookingDate, setBookingDate] = useState(getTodayDate());
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("10:00");

  const [bookedTimes, setBookedTimes] = useState<BookedTime[]>([]);
  const [isLoadingAvailability, setIsLoadingAvailability] = useState(false);
  const [availabilityError, setAvailabilityError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);


  const startMinutes = toMinutes(startTime);
  const endMinutes = toMinutes(endTime);
  const totalMinutes = endMinutes - startMinutes;
  const hours = totalMinutes > 0 ? totalMinutes / 60 : 0;
  const totalPrice = hours * hourlyRate;

  
  const customerName = session?.user?.name ?? "";
  const customerEmail = session?.user?.email ?? "";
  const studioId = studio._id ?? studio.id ?? "";
  const ownerName = studio.ownerName ?? "Studio Owner";
  const ownerEmail = studio.ownerEmail ?? "";


  const selectedTimeIsBooked = bookedTimes.some((booked) => {
    const bookedStart = toMinutes(booked.startTime);
    const bookedEnd = toMinutes(booked.endTime);
    return startMinutes < bookedEnd && endMinutes > bookedStart;
  });

 
  useEffect(() => {
    if (!open || !studioId || !bookingDate) return;

    const fetchAvailability = async () => {
      setIsLoadingAvailability(true);
      setAvailabilityError("");

      try {
        const response = await apiFetch(
          `/api/bookings/availability?studioId=${studioId}&bookingDate=${bookingDate}`,
        );

        if (!response.ok) {
          throw new Error("Could not check studio availability.");
        }

        const data = await response.json();
        setBookedTimes(Array.isArray(data) ? data : []);
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : "Could not check studio availability.";
        setAvailabilityError(message);
        toast.error(message);
      } finally {
        setIsLoadingAvailability(false);
      }
    };

    fetchAvailability();
  }, [open, studioId, bookingDate]);


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
      const response = await apiFetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studioId,
          studioTitle: studio.title,
          ownerName,
          ownerEmail,
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

      const data = await response.json();

      if (response.status === 409) {
        toast.error("This time slot is already booked. Please choose another.");
        return;
      }

      if (!response.ok) {
        throw new Error(data.message ?? "Booking could not be submitted.");
      }

      toast.success("Booking request submitted and is pending approval.");
      onOpenChange(false);
      router.push("/my-bookings");
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Booking could not be submitted.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Book {studio.title}</DialogTitle>
          <DialogDescription>
            Choose your session time and review the estimated price.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={submitBooking} className="space-y-5">
          {/* ইউজার ও ওনার তথ্য */}
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="space-y-2 text-sm font-medium">
              Logged-in user
              <input
                readOnly
                value={customerName || customerEmail || "Sign in required"}
                className="h-10 w-full rounded-lg border border-border bg-muted px-3 text-sm dark:border-zinc-800"
              />
            </label>
            <label className="space-y-2 text-sm font-medium">
              Studio owner
              <input
                readOnly
                value={ownerName}
                className="h-10 w-full rounded-lg border border-border bg-muted px-3 text-sm dark:border-zinc-800"
              />
            </label>
          </div>

          {/* তারিখ সিলেক্ট */}
          <label className="block space-y-2 text-sm font-medium">
            Booking date
            <input
              required
              type="date"
              min={getTodayDate()}
              value={bookingDate}
              onChange={(e) => setBookingDate(e.target.value)}
              className="h-10 w-full rounded-lg border border-border bg-background px-3 dark:border-zinc-800 dark:bg-zinc-900"
            />
          </label>

          {/* সময় সিলেক্ট */}
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="space-y-2 text-sm font-medium">
              Start time
              <input
                required
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="h-10 w-full rounded-lg border border-border bg-background px-3 dark:border-zinc-800 dark:bg-zinc-900"
              />
            </label>
            <label className="space-y-2 text-sm font-medium">
              End time
              <input
                required
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="h-10 w-full rounded-lg border border-border bg-background px-3 dark:border-zinc-800 dark:bg-zinc-900"
              />
            </label>
          </div>

          {/* তারিখের বুকিং স্ট্যাটাস বক্স */}
          <div className="rounded-lg border border-border bg-muted/40 px-4 py-3 text-sm dark:border-zinc-800">
            {isLoadingAvailability ? (
              <p className="text-muted-foreground">Checking availability...</p>
            ) : availabilityError ? (
              <p className="text-destructive">{availabilityError}</p>
            ) : bookedTimes.length > 0 ? (
              <>
                <p className="font-medium">Already booked on this date</p>
                <p className="mt-1 text-muted-foreground">
                  {bookedTimes
                    .map((item) => `${item.startTime}–${item.endTime}`)
                    .join(", ")}
                </p>
              </>
            ) : (
              <p className="text-muted-foreground">
                No bookings yet for this date.
              </p>
            )}
          </div>

          {/* টাইম কনফ্লিক্ট ওয়ার্নিং */}
          {selectedTimeIsBooked && (
            <p className="text-sm text-destructive">
              This time overlaps an existing booking. Choose another time.
            </p>
          )}

          {/* মোট ঘণ্টা ও মোট টাকা */}
          <div className="grid grid-cols-2 gap-3 rounded-xl border border-border bg-muted/40 p-4 dark:border-zinc-800">
            <div>
              <p className="text-xs text-muted-foreground">Total hours</p>
              <p className="mt-1 text-lg font-bold">
                {hours % 1 === 0 ? hours : hours.toFixed(2)} hrs
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Total price</p>
              <p className="mt-1 text-lg font-bold text-amber-500">
                ${totalPrice.toFixed(2)}
              </p>
            </div>
          </div>

          {/* বাটনসমূহ */}
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={
                isSubmitting ||
                isLoadingAvailability ||
                hours <= 0 ||
                selectedTimeIsBooked
              }
              className="bg-amber-400 text-zinc-950 hover:bg-amber-300 dark:text-zinc-950"
            >
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
