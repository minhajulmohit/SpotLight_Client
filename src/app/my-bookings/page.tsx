"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  AlertCircle,
  Calendar,
  CheckCircle2,
  Clock,
  DollarSign,
  Download,
  FileDown,
  LoaderCircle,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";

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

type BookingStatus = "Confirmed" | "Pending" | "Completed" | "Cancelled";

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
  status: BookingStatus;
  createdAt?: string;
};

const money = (value: number) => `$${Number(value || 0).toFixed(2)}`;

const statusTone: Record<
  BookingStatus,
  { fill: [number, number, number]; text: [number, number, number] }
> = {
  Confirmed: { fill: [209, 250, 229], text: [4, 120, 87] },
  Pending: { fill: [254, 243, 199], text: [180, 83, 9] },
  Completed: { fill: [219, 234, 254], text: [29, 78, 216] },
  Cancelled: { fill: [255, 228, 230], text: [190, 18, 60] },
};

const downloadInvoicePdf = async (booking: Booking) => {
  const { jsPDF } = await import("jspdf");

  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 48;
  const contentWidth = pageWidth - margin * 2;
  const invoiceId = booking._id.slice(-8).toUpperCase();
  const rateAmount = booking.hourlyRate * booking.totalHours;
  const deposit = booking.securityDeposit || 0;

  // Header
  doc.setFillColor(24, 24, 27);
  doc.rect(0, 0, pageWidth, 100, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(24);
  doc.text("SpotLight", margin, 48);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(212, 212, 216);
  doc.text("Creative Workspace & Production Studio Marketplace", margin, 66);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.setTextColor(255, 255, 255);
  doc.text("BOOKING INVOICE", pageWidth - margin, 48, { align: "right" });
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(212, 212, 216);
  doc.text(`Invoice ID: #${invoiceId}`, pageWidth - margin, 66, {
    align: "right",
  });
  doc.text(
    `Issued: ${new Date().toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })}`,
    pageWidth - margin,
    82,
    { align: "right" },
  );

  // Status pill
  const tone = statusTone[booking.status] ?? statusTone.Pending;
  doc.setFillColor(...tone.fill);
  doc.roundedRect(margin, 124, 92, 24, 12, 12, "F");
  doc.setTextColor(...tone.text);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.text(booking.status.toUpperCase(), margin + 46, 139, { align: "center" });

  // Studio summary
  let y = 186;
  doc.setTextColor(113, 113, 122);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.text("STUDIO", margin, y);

  y += 18;
  doc.setTextColor(24, 24, 27);
  doc.setFontSize(16);
  doc.text(booking.studioTitle, margin, y);

  y += 16;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(82, 82, 91);
  doc.text(`Host: ${booking.hostName} (${booking.hostEmail})`, margin, y);

  // Guest + schedule columns
  y += 44;
  const colRight = margin + contentWidth / 2;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(113, 113, 122);
  doc.text("GUEST CREATOR", margin, y);
  doc.text("BOOKING SCHEDULE", colRight, y);

  y += 17;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(24, 24, 27);
  doc.text(booking.customerName, margin, y);
  doc.text(booking.bookingDate, colRight, y);

  y += 15;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(82, 82, 91);
  doc.text(booking.customerEmail, margin, y);
  doc.text(
    `${booking.startTime} - ${booking.endTime}  (${booking.totalHours} hrs)`,
    colRight,
    y,
  );

  // Divider
  y += 28;
  doc.setDrawColor(228, 228, 231);
  doc.setLineWidth(1);
  doc.line(margin, y, pageWidth - margin, y);

  // Line items
  y += 26;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(113, 113, 122);
  doc.text("DESCRIPTION", margin, y);
  doc.text("AMOUNT", pageWidth - margin, y, { align: "right" });

  const addLine = (label: string, amount: number) => {
    y += 24;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(63, 63, 70);
    doc.text(label, margin, y);
    doc.setTextColor(24, 24, 27);
    doc.text(money(amount), pageWidth - margin, y, { align: "right" });
  };

  addLine(
    `Studio rate (${money(booking.hourlyRate)}/hr × ${booking.totalHours} hrs)`,
    rateAmount,
  );

  if (deposit > 0) {
    addLine("Security deposit (refundable)", deposit);
  }

  // Total
  y += 22;
  doc.setDrawColor(228, 228, 231);
  doc.line(margin, y, pageWidth - margin, y);

  y += 12;
  doc.setFillColor(250, 250, 250);
  doc.roundedRect(margin, y, contentWidth, 52, 8, 8, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(24, 24, 27);
  doc.text("TOTAL AMOUNT", margin + 16, y + 32);
  doc.setFontSize(16);
  doc.setTextColor(180, 130, 20);
  doc.text(money(booking.totalPrice), pageWidth - margin - 16, y + 33, {
    align: "right",
  });

  // Footer
  const footerY = pageHeight - 72;
  doc.setDrawColor(228, 228, 231);
  doc.line(margin, footerY, pageWidth - margin, footerY);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(113, 113, 122);
  doc.text(
    "Thank you for creating with SpotLight. This receipt was generated automatically.",
    margin,
    footerY + 18,
  );
  doc.text(`Booking reference: ${booking._id}`, margin, footerY + 32);

  doc.save(`spotlight-invoice-${booking._id.slice(-8)}.pdf`);
};

const getStatusBadge = (status: BookingStatus) => {
  if (status === "Confirmed") {
    return "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400";
  } else if (status === "Pending") {
    return "border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400";
  } else if (status === "Completed") {
    return "border-blue-500/30 bg-blue-500/10 text-blue-600 dark:text-blue-400";
  } else if (status === "Cancelled") {
    return "border-rose-500/30 bg-rose-500/10 text-rose-600 dark:text-rose-400";
  } else {
    return "border-zinc-500/30 bg-zinc-500/10 text-zinc-600";
  }
};

const fetchBookings = async () => {
  const guestResponse = await apiFetch("/bookings");
  const guestData = await guestResponse.json();

  const hostResponse = await apiFetch("/bookings?hostEmail=true");
  const hostData = await hostResponse.json();

  if (!guestResponse.ok || !hostResponse.ok) {
    throw new Error("Failed to load bookings.");
  }

  const guestList = Array.isArray(guestData) ? guestData : [];
  const hostList = Array.isArray(hostData) ? hostData : [];

  const combinedList = [...guestList, ...hostList];

  const uniqueList: Booking[] = [];

  for (const booking of combinedList) {
    const alreadyExists = uniqueList.some((item) => item._id === booking._id);

    if (!alreadyExists) {
      uniqueList.push(booking);
    }
  }

  uniqueList.sort((a, b) => {
    const timeFirst = new Date(a.createdAt ?? 0).getTime();
    const timeSecond = new Date(b.createdAt ?? 0).getTime();

    return timeSecond - timeFirst;
  });

  return uniqueList;
};

const MyBookingsPage = () => {
  const { data: session, isPending: isAuthPending } = authClient.useSession();
  const user = session?.user;

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [confirmingId, setConfirmingId] = useState<string | null>(null);
  const [selectedBookingForCancel, setSelectedBookingForCancel] =
    useState<Booking | null>(null);
  const [selectedBookingForInvoice, setSelectedBookingForInvoice] =
    useState<Booking | null>(null);

  const refreshBookings = () => {
    setIsLoading(true);
    fetchBookings()
      .then(setBookings)
      .catch((error: unknown) =>
        toast.error(
          error instanceof Error ? error.message : "Could not load bookings.",
        ),
      )
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    if (isAuthPending || !user?.email) return;

    let active = true;
    fetchBookings()
      .then((result) => {
        if (active) setBookings(result);
      })
      .catch((error: unknown) => {
        if (active) {
          toast.error(
            error instanceof Error ? error.message : "Could not load bookings.",
          );
        }
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });

    return () => {
      active = false;
    };
  }, [user?.email, isAuthPending]);

  const handleCancelBooking = async () => {
    if (!selectedBookingForCancel) return;

    const bookingId = selectedBookingForCancel._id;

    setCancellingId(bookingId);

    try {
      const response = await apiFetch(`/bookings/${bookingId}/cancel`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
      });

      const data = await response.json();

      if (!response.ok) {
        const errorMessage = data.message || "Could not cancel booking.";
        throw new Error(errorMessage);
      }

      toast.success("Booking cancelled successfully.");

      setBookings((currentBookings) => {
        return currentBookings.map((singleBooking) => {
          if (singleBooking._id === bookingId) {
            return {
              ...singleBooking,
              status: "Cancelled",
            };
          }
          return singleBooking;
        });
      });

      setSelectedBookingForCancel(null);
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Failed to cancel booking.";
      toast.error(message);
    } finally {
      setCancellingId(null);
    }
  };

  const handleHostStatusChange = async (
    booking: Booking,
    status: "Confirmed" | "Completed",
  ) => {
    setConfirmingId(booking._id);
    try {
      const response = await apiFetch(`/bookings/${booking._id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!response.ok) throw new Error("Could not update this booking.");

      setBookings((previous) =>
        previous.map((item) =>
          item._id === booking._id ? { ...item, status } : item,
        ),
      );
      toast.success(`Booking ${status.toLowerCase()}.`);
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Could not update this booking.",
      );
    } finally {
      setConfirmingId(null);
    }
  };

  const handleDownloadInvoice = async () => {
    if (!selectedBookingForInvoice) return;

    try {
      await downloadInvoicePdf(selectedBookingForInvoice);
      toast.success("Invoice PDF downloaded.");
    } catch {
      toast.error("Could not generate the invoice PDF. Please try again.");
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
        <h2 className="mt-4 font-heading text-2xl font-bold">
          Sign In Required
        </h2>
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
            Track your reserved studio sessions, inspect timing details, and
            download receipts.
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
              You haven&apos;t reserved any creative workspaces yet. Explore
              available studios and book your next session!
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
              <span>
                {bookings.length}{" "}
                {bookings.length === 1 ? "reservation" : "reservations"}
              </span>
              <Button variant="outline" size="sm" onClick={refreshBookings}>
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
                          booking.status,
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
                        {booking.startTime} - {booking.endTime} (
                        {booking.totalHours} hrs)
                      </span>
                      <span className="flex items-center gap-1.5">
                        <DollarSign className="size-4 text-primary" />$
                        {booking.totalPrice.toFixed(2)} (${booking.hourlyRate}
                        /hr)
                      </span>
                    </div>

                    <p className="text-xs text-muted-foreground">
                      Host:{" "}
                      <span className="font-medium text-foreground">
                        {booking.hostName}
                      </span>{" "}
                      ({booking.hostEmail})
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 pt-2 md:pt-0">
                    {["Pending", "Confirmed"].includes(booking.status) &&
                      String(booking.hostEmail ?? "")
                        .trim()
                        .toLowerCase() === user.email?.trim().toLowerCase() && (
                        <Button
                          size="sm"
                          disabled={confirmingId === booking._id}
                          onClick={() =>
                            handleHostStatusChange(
                              booking,
                              booking.status === "Pending"
                                ? "Confirmed"
                                : "Completed",
                            )
                          }
                          className="gap-1.5"
                        >
                          {confirmingId === booking._id ? (
                            <LoaderCircle className="size-3.5 animate-spin" />
                          ) : (
                            <CheckCircle2 className="size-3.5" />
                          )}
                          {booking.status === "Pending"
                            ? "Confirm"
                            : "Mark Completed"}
                        </Button>
                      )}

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
              {selectedBookingForCancel?.bookingDate}? This action cannot be
              undone.
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

      {/* PDF Booking Invoice*/}
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
            <div
              id="printable-invoice"
              className="space-y-4 rounded-xl border border-border bg-card p-5 text-sm dark:border-zinc-800"
            >
              <div className="flex items-center justify-between border-b border-border pb-3 dark:border-zinc-800">
                <div>
                  <h4 className="font-heading text-lg font-bold text-foreground">
                    {selectedBookingForInvoice.studioTitle}
                  </h4>
                  <p className="text-xs text-muted-foreground">
                    Host: {selectedBookingForInvoice.hostName} (
                    {selectedBookingForInvoice.hostEmail})
                  </p>
                </div>
                <span
                  className={`rounded-full border px-2.5 py-0.5 text-xs font-semibold ${getStatusBadge(
                    selectedBookingForInvoice.status,
                  )}`}
                >
                  {selectedBookingForInvoice.status}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <p className="text-muted-foreground">Guest Creator</p>
                  <p className="font-semibold text-foreground">
                    {selectedBookingForInvoice.customerName}
                  </p>
                  <p className="text-muted-foreground">
                    {selectedBookingForInvoice.customerEmail}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Booking Date</p>
                  <p className="font-semibold text-foreground">
                    {selectedBookingForInvoice.bookingDate}
                  </p>
                  <p className="text-muted-foreground">
                    {selectedBookingForInvoice.startTime} -{" "}
                    {selectedBookingForInvoice.endTime}
                  </p>
                </div>
              </div>

              <div className="border-t border-border pt-3 dark:border-zinc-800">
                <div className="flex justify-between py-1 text-xs">
                  <span className="text-muted-foreground">
                    Rate (${selectedBookingForInvoice.hourlyRate}/hr ×{" "}
                    {selectedBookingForInvoice.totalHours} hrs)
                  </span>
                  <span className="font-medium">
                    $
                    {(
                      selectedBookingForInvoice.hourlyRate *
                      selectedBookingForInvoice.totalHours
                    ).toFixed(2)}
                  </span>
                </div>
                {selectedBookingForInvoice.securityDeposit > 0 && (
                  <div className="flex justify-between py-1 text-xs">
                    <span className="text-muted-foreground">
                      Security Deposit (Refundable)
                    </span>
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
              onClick={handleDownloadInvoice}
              className="gap-1.5"
            >
              <FileDown className="size-4" />
              Download PDF
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MyBookingsPage;
