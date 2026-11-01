"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  Calendar,
  Clock,
  DollarSign,
  Download,
  LoaderCircle,
  Printer,
  Sparkles,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";

import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export type Booking = {
  _id: string;
  studioId: string;
  studioTitle: string;
  hostName: string;
  hostEmail: string;
  customerName: string;
  customerEmail: string;
  bookingDate: string;
  startTime: string;
  endTime: string;
  totalHours: number;
  hourlyRate: number;
  securityDeposit: number;
  totalPrice: number;
  status: "Pending" | "Confirmed" | "Completed" | "Cancelled";
  createdAt?: string;
};

const getStatusBadge = (status: Booking["status"]) => {
  switch (status) {
    case "Confirmed":
      return "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400";
    case "Pending":
      return "border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400";
    case "Completed":
      return "border-blue-500/30 bg-blue-500/10 text-blue-600 dark:text-blue-400";
    case "Cancelled":
      return "border-rose-500/30 bg-rose-500/10 text-rose-600 dark:text-rose-400";
    default:
      return "border-zinc-500/30 bg-zinc-500/10 text-zinc-600";
  }
};

const MyBookingsPage = () => {
  const router = useRouter();
  const { data: session, isPending: isAuthPending } = authClient.useSession();
  const user = session?.user;

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [selectedBookingForCancel, setSelectedBookingForCancel] = useState<Booking | null>(null);
  const [selectedBookingForInvoice, setSelectedBookingForInvoice] = useState<Booking | null>(null);

  const fetchBookings = async (email: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE}/bookings?email=${encodeURIComponent(email)}`);
      const data = await response.json();
      if (!response.ok) throw new Error(data.message ?? "Failed to load bookings.");
      setBookings(Array.isArray(data) ? data : []);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not load bookings.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!isAuthPending) {
      if (user?.email) {
        fetchBookings(user.email);
      } else {
        setIsLoading(false);
      }
    }
  }, [user?.email, isAuthPending]);

  const handleCancelBooking = async () => {
    if (!selectedBookingForCancel) return;
    const bookingId = selectedBookingForCancel._id;
    setCancellingId(bookingId);

    try {
      const response = await fetch(`${API_BASE}/bookings/${bookingId}/cancel`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message ?? "Could not cancel booking.");
      }

      toast.success("Booking cancelled successfully.");
      // Update locally
      setBookings((prev) =>
        prev.map((b) => (b._id === bookingId ? { ...b, status: "Cancelled" } : b))
      );
      setSelectedBookingForCancel(null);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to cancel booking.");
    } finally {
      setCancellingId(null);
    }
  };

  if (isAuthPending) {
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
          Please log in to your account to view and manage your studio bookings.
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
      {/* Header */}
      <section className="border-b border-border bg-muted/40 py-12 text-foreground dark:bg-zinc-950 dark:text-white sm:py-16">
        <div className="container mx-auto px-4">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary">
            Reservation Management
          </p>
          <h1 className="mt-3 font-heading text-3xl font-bold sm:text-4xl">
            My Studio Bookings
          </h1>
          <p className="mt-2 text-sm text-muted-foreground dark:text-zinc-300">
            Track your reserved studio sessions, inspect timing details, and download receipts.
          </p>
        </div>
      </section>

      <main className="container mx-auto px-4 py-10">
        {isLoading && (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, index) => (
              <div
                key={index}
                className="h-28 animate-pulse rounded-xl border border-border bg-card dark:border-zinc-800 dark:bg-zinc-900"
              />
            ))}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && bookings.length === 0 && (
          <div className="rounded-2xl border border-dashed border-border p-12 text-center dark:border-zinc-800">
            <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <Calendar className="size-7" />
            </div>
            <h3 className="mt-4 font-heading text-2xl font-bold text-foreground">
              No Bookings Found
            </h3>
            <p className="mx-auto mt-2 max-w-sm text-sm text-muted-foreground">
              You haven&apos;t reserved any creative workspaces yet. Explore available studios and book your next session!
            </p>
            <Button
              nativeButton={false}
              render={<Link href="/studios" />}
              className="mt-6"
            >
              Explore Studios
            </Button>
          </div>
        )}

        {/* Bookings List / Cards */}
        {!isLoading && bookings.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>{bookings.length} {bookings.length === 1 ? "reservation" : "reservations"}</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => user?.email && fetchBookings(user.email)}
              >
                Refresh
              </Button>
            </div>

            <div className="grid gap-4">
              {bookings.map((booking) => (
                <div
                  key={booking._id}
                  className="group relative flex flex-col justify-between gap-5 rounded-2xl border border-border bg-card p-6 shadow-sm transition-all hover:border-primary/40 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900 md:flex-row md:items-center"
                >
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2.5">
                      <h3 className="font-heading text-xl font-bold text-foreground">
                        {booking.studioTitle}
                      </h3>
                      <span
                        className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${getStatusBadge(
                          booking.status
                        )}`}
                      >
                        {booking.status}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5 text-xs text-muted-foreground sm:text-sm">
                      <span className="flex items-center gap-1.5">
                        <Calendar className="size-4 text-primary" />
                        {booking.bookingDate}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Clock className="size-4 text-primary" />
                        {booking.startTime} - {booking.endTime} ({booking.totalHours} hrs)
                      </span>
                      <span className="flex items-center gap-1.5">
                        <DollarSign className="size-4 text-primary" />
                        ${booking.totalPrice.toFixed(2)} (${booking.hourlyRate}/hr)
                      </span>
                    </div>

                    <p className="text-xs text-muted-foreground">
                      Host: <span className="font-medium text-foreground">{booking.hostName}</span> ({booking.hostEmail})
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 pt-2 md:pt-0">
                    {/* Invoice Download / View Button */}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedBookingForInvoice(booking)}
                      className="gap-1.5"
                    >
                      <Download className="size-3.5" />
                      Invoice
                    </Button>

                    {/* Cancel button only for Pending slots */}
                    {booking.status === "Pending" && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedBookingForCancel(booking)}
                        className="gap-1.5 text-destructive hover:bg-destructive/10"
                      >
                        <XCircle className="size-3.5" />
                        Cancel
                      </Button>
                    )}

                    <Button
                      variant="ghost"
                      size="sm"
                      nativeButton={false}
                      render={<Link href={`/studios/${booking.studioId}`} />}
                    >
                      View Studio
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Cancel Confirmation Modal */}
      <Dialog
        open={Boolean(selectedBookingForCancel)}
        onOpenChange={(open) => !open && setSelectedBookingForCancel(null)}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Cancel Booking Request?</DialogTitle>
            <DialogDescription>
              Are you sure you want to cancel your reservation for{" "}
              <strong>{selectedBookingForCancel?.studioTitle}</strong> on{" "}
              {selectedBookingForCancel?.bookingDate}? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              disabled={Boolean(cancellingId)}
              onClick={() => setSelectedBookingForCancel(null)}
            >
              Keep Booking
            </Button>
            <Button
              type="button"
              variant="destructive"
              disabled={Boolean(cancellingId)}
              onClick={handleCancelBooking}
            >
              {cancellingId ? (
                <>
                  <LoaderCircle className="animate-spin" />
                  Cancelling...
                </>
              ) : (
                "Confirm Cancellation"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* PDF Booking Invoice Modal (Optional Requirement) */}
      <Dialog
        open={Boolean(selectedBookingForInvoice)}
        onOpenChange={(open) => !open && setSelectedBookingForInvoice(null)}
      >
        <DialogContent className="sm:max-w-lg print:border-none print:shadow-none">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>Booking Invoice &amp; Receipt</span>
              <span className="text-xs font-normal text-muted-foreground">
                ID: {selectedBookingForInvoice?._id.slice(-8).toUpperCase()}
              </span>
            </DialogTitle>
            <DialogDescription>
              Official reservation receipt issued by SpotLight Platform.
            </DialogDescription>
          </DialogHeader>

          {selectedBookingForInvoice && (
            <div id="printable-invoice" className="space-y-4 rounded-xl border border-border bg-card p-5 text-sm dark:border-zinc-800">
              <div className="flex items-center justify-between border-b border-border pb-3 dark:border-zinc-800">
                <div>
                  <h4 className="font-heading text-lg font-bold text-foreground">
                    {selectedBookingForInvoice.studioTitle}
                  </h4>
                  <p className="text-xs text-muted-foreground">
                    Host: {selectedBookingForInvoice.hostName} ({selectedBookingForInvoice.hostEmail})
                  </p>
                </div>
                <span
                  className={`rounded-full border px-2.5 py-0.5 text-xs font-semibold ${getStatusBadge(
                    selectedBookingForInvoice.status
                  )}`}
                >
                  {selectedBookingForInvoice.status}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <p className="text-muted-foreground">Guest Creator</p>
                  <p className="font-semibold text-foreground">{selectedBookingForInvoice.customerName}</p>
                  <p className="text-muted-foreground">{selectedBookingForInvoice.customerEmail}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Booking Date</p>
                  <p className="font-semibold text-foreground">{selectedBookingForInvoice.bookingDate}</p>
                  <p className="text-muted-foreground">
                    {selectedBookingForInvoice.startTime} - {selectedBookingForInvoice.endTime}
                  </p>
                </div>
              </div>

              <div className="border-t border-border pt-3 dark:border-zinc-800">
                <div className="flex justify-between py-1 text-xs">
                  <span className="text-muted-foreground">
                    Rate (${selectedBookingForInvoice.hourlyRate}/hr × {selectedBookingForInvoice.totalHours} hrs)
                  </span>
                  <span className="font-medium">
                    ${(selectedBookingForInvoice.hourlyRate * selectedBookingForInvoice.totalHours).toFixed(2)}
                  </span>
                </div>
                {selectedBookingForInvoice.securityDeposit > 0 && (
                  <div className="flex justify-between py-1 text-xs">
                    <span className="text-muted-foreground">Security Deposit (Refundable)</span>
                    <span className="font-medium">
                      ${selectedBookingForInvoice.securityDeposit.toFixed(2)}
                    </span>
                  </div>
                )}
                <div className="mt-2 flex justify-between border-t border-border pt-2 text-sm font-bold text-foreground dark:border-zinc-800">
                  <span>Total Amount</span>
                  <span className="text-primary font-heading text-base">
                    ${selectedBookingForInvoice.totalPrice.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          )}

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => setSelectedBookingForInvoice(null)}
            >
              Close
            </Button>
            <Button
              type="button"
              onClick={() => window.print()}
              className="gap-1.5"
            >
              <Printer className="size-4" />
              Print / Save PDF
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MyBookingsPage;
