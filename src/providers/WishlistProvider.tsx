"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { toast } from "sonner";

import { authClient } from "@/lib/auth-client";
import { API_BASE, ensureJwt } from "@/lib/api";

type WishlistStudio = {
  _id?: string;
  id?: string;
  title?: string;
};

type WishlistContextValue = {
  isSaved: (studioId: string) => boolean;
  toggleWishlist: (studio: WishlistStudio) => Promise<void>;
};

const WishlistContext = createContext<WishlistContextValue | null>(null);

const readStudioId = (studio: WishlistStudio) =>
  String(studio._id ?? studio.id ?? "").trim();

const studioLabel = (studio: WishlistStudio) => studio.title ?? "Studio";

/**
 * MongoDB-backed wishlist. Replaces the previous localStorage-only saves so a
 * creator's favourites follow them across browsers and devices.
 */
const WishlistProvider = ({ children }: { children: ReactNode }) => {
  const { data: session } = authClient.useSession();
  const email = session?.user?.email;

  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
  const [loadedFor, setLoadedFor] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (!email) return;

    let cancelled = false;

    ensureJwt()
      .then(() =>
        fetch(`${API_BASE}/wishlist`, {
          credentials: "include",
          cache: "no-store",
        }),
      )
      .then((response) => (response.ok ? response.json() : []))
      .then((data) => {
        if (cancelled) return;
        const rows = Array.isArray(data) ? data : [];
        setSavedIds(
          new Set(
            rows
              .map((row: { studioId?: string }) => String(row.studioId ?? ""))
              .filter(Boolean),
          ),
        );
        setLoadedFor(email);
      })
      .catch(() => {
        if (!cancelled) setSavedIds(new Set());
      });

    return () => {
      cancelled = true;
    };
  }, [email]);

  // Logging out (or switching accounts) must not leak the previous saves.
  const isSaved = useCallback(
    (studioId: string) => {
      if (!email || loadedFor !== email) return false;
      return savedIds.has(studioId);
    },
    [email, loadedFor, savedIds],
  );

  const toggleWishlist = useCallback(
    async (studio: WishlistStudio) => {
      const studioId = readStudioId(studio);

      if (!email) {
        toast.info("Please log in to save studios to your wishlist.");
        return;
      }
      if (!studioId) return;

      const wasSaved = savedIds.has(studioId);

      // Optimistically flip the heart; revert if the API rejects the change.
      setSavedIds((previous) => {
        const next = new Set(previous);
        if (wasSaved) next.delete(studioId);
        else next.add(studioId);
        return next;
      });

      try {
        await ensureJwt();
        const response = await fetch(`${API_BASE}/wishlist`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ studioId }),
        });
        const data = await response.json().catch(() => ({}));

        if (!response.ok) {
          throw new Error(
            data?.message ?? "Could not update your wishlist. Try again.",
          );
        }

        const nowSaved = Boolean(data.saved);
        setSavedIds((previous) => {
          const next = new Set(previous);
          if (nowSaved) next.add(studioId);
          else next.delete(studioId);
          return next;
        });
        setLoadedFor(email);

        if (nowSaved) {
          toast.success(`"${studioLabel(studio)}" saved to your wishlist!`);
        } else {
          toast.info(`"${studioLabel(studio)}" removed from your wishlist.`);
        }
      } catch (error) {
        setSavedIds((previous) => {
          const next = new Set(previous);
          if (wasSaved) next.add(studioId);
          else next.delete(studioId);
          return next;
        });
        toast.error(
          error instanceof Error
            ? error.message
            : "Could not update your wishlist.",
        );
      }
    },
    [email, savedIds],
  );

  const value = useMemo(
    () => ({ isSaved, toggleWishlist }),
    [isSaved, toggleWishlist],
  );

  return (
    <WishlistContext.Provider value={value}>
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);

  if (!context) {
    throw new Error("useWishlist must be used inside a WishlistProvider.");
  }

  return context;
};

export default WishlistProvider;
