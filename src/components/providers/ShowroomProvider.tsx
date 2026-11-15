"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import {
  DEFAULT_INQUIRIES,
  DEFAULT_LOOKBOOK,
  DEFAULT_PRODUCTS,
  DEFAULT_SITE_SETTINGS,
} from "@/lib/demo-data";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import type {
  CustomInquiry,
  DataSourceMode,
  InquiryStatus,
  LookbookEntry,
  Product,
  ShowroomSnapshot,
  SiteSettings,
} from "@/lib/types";

const STORAGE_KEYS = {
  settings: "cloth_showroom_demo_settings_v1",
  products: "cloth_showroom_demo_products_v1",
  lookbook: "cloth_showroom_demo_lookbook_v1",
  inquiries: "cloth_showroom_demo_inquiries_v1",
} as const;

const STORE_SYNC_EVENT = "cloth-showroom-sync";

interface ShowroomContextValue {
  settings: SiteSettings;
  products: Product[];
  lookbook: LookbookEntry[];
  inquiries: CustomInquiry[];
  mode: DataSourceMode;
  supabaseConfigured: boolean;
  schemaReady: boolean;
  hydrated: boolean;
  updateSettings: (next: SiteSettings) => Promise<{ ok: boolean; error?: string }>;
  saveProduct: (
    product: Omit<Product, "id"> & { id?: string }
  ) => Promise<{ ok: boolean; error?: string }>;
  deleteProduct: (id: string) => Promise<{ ok: boolean; error?: string }>;
  saveLookbookEntry: (
    entry: Omit<LookbookEntry, "id"> & { id?: string }
  ) => Promise<{ ok: boolean; error?: string }>;
  deleteLookbookEntry: (id: string) => Promise<{ ok: boolean; error?: string }>;
  submitInquiry: (
    inquiry: Omit<CustomInquiry, "id" | "created_at" | "status">
  ) => Promise<{ ok: boolean; error?: string }>;
  updateInquiryStatus: (
    id: string,
    status: InquiryStatus
  ) => Promise<{ ok: boolean; error?: string }>;
  refreshFromSupabase: () => Promise<void>;
  resetDemoData: () => void;
}

const ShowroomContext = createContext<ShowroomContextValue | null>(null);

function safeReadLocal<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function safeWriteLocal<T>(key: string, value: T) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
    window.dispatchEvent(new Event(STORE_SYNC_EVENT));
  } catch {
    // Ignore storage quota issues cleanly
  }
}

export function ShowroomProvider({
  initialSnapshot,
  children,
}: {
  initialSnapshot: ShowroomSnapshot;
  children: React.ReactNode;
}) {
  const [settings, setSettings] = useState<SiteSettings>(
    initialSnapshot.settings
  );
  const [products, setProducts] = useState<Product[]>(initialSnapshot.products);
  const [lookbook, setLookbook] = useState<LookbookEntry[]>(
    initialSnapshot.lookbook
  );
  const [inquiries, setInquiries] = useState<CustomInquiry[]>(
    initialSnapshot.mode === "demo" ? DEFAULT_INQUIRIES : []
  );
  const [hydrated, setHydrated] = useState(false);

  const syncFromDemoStorage = useCallback(() => {
    if (initialSnapshot.mode !== "demo") return;
    setSettings(safeReadLocal(STORAGE_KEYS.settings, DEFAULT_SITE_SETTINGS));
    setProducts(safeReadLocal(STORAGE_KEYS.products, DEFAULT_PRODUCTS));
    setLookbook(safeReadLocal(STORAGE_KEYS.lookbook, DEFAULT_LOOKBOOK));
    setInquiries(safeReadLocal(STORAGE_KEYS.inquiries, DEFAULT_INQUIRIES));
  }, [initialSnapshot.mode]);

  const refreshFromSupabase = useCallback(async () => {
    const supabase = createSupabaseBrowserClient();
    if (!supabase) return;

    const [sRes, pRes, lRes, iRes] = await Promise.all([
      supabase.from("site_settings").select("*").eq("id", 1).maybeSingle(),
      supabase
        .from("products")
        .select("*")
        .order("sort_order", { ascending: true })
        .order("created_at", { ascending: false }),
      supabase
        .from("lookbook_entries")
        .select("*")
        .order("sort_order", { ascending: true })
        .order("created_at", { ascending: false }),
      supabase
        .from("custom_inquiries")
        .select("*")
        .order("created_at", { ascending: false }),
    ]);

    if (!sRes.error && sRes.data) {
      setSettings({ ...DEFAULT_SITE_SETTINGS, ...sRes.data, id: 1 });
    }
    if (!pRes.error && Array.isArray(pRes.data)) {
      setProducts(pRes.data as Product[]);
    }
    if (!lRes.error && Array.isArray(lRes.data)) {
      setLookbook(lRes.data as LookbookEntry[]);
    }
    if (!iRes.error && Array.isArray(iRes.data)) {
      setInquiries(iRes.data as CustomInquiry[]);
    }
  }, []);

  useEffect(() => {
    const rafId = window.requestAnimationFrame(() => {
      if (initialSnapshot.mode === "demo") {
        syncFromDemoStorage();
      } else {
        void refreshFromSupabase();
      }
      setHydrated(true);
    });

    const onSync = () => syncFromDemoStorage();
    const onStorage = (e: StorageEvent) => {
      if (Object.values(STORAGE_KEYS).includes(e.key as never)) {
        syncFromDemoStorage();
      }
    };
    window.addEventListener(STORE_SYNC_EVENT, onSync);
    window.addEventListener("storage", onStorage);
    return () => {
      window.cancelAnimationFrame(rafId);
      window.removeEventListener(STORE_SYNC_EVENT, onSync);
      window.removeEventListener("storage", onStorage);
    };
  }, [initialSnapshot.mode, refreshFromSupabase, syncFromDemoStorage]);

  useEffect(() => {
    if (typeof document !== "undefined" && settings.brand_name) {
      document.title = `${settings.brand_name} — ${settings.tagline}`;
    }
  }, [settings.brand_name, settings.tagline]);

  const updateSettings = useCallback(
    async (next: SiteSettings) => {
      const normalized = { ...next, id: 1 };
      if (initialSnapshot.mode === "demo") {
        setSettings(normalized);
        safeWriteLocal(STORAGE_KEYS.settings, normalized);
        return { ok: true };
      }

      const supabase = createSupabaseBrowserClient();
      if (!supabase) return { ok: false, error: "Supabase client unavailable." };

      const { data, error } = await supabase
        .from("site_settings")
        .upsert(normalized, { onConflict: "id" })
        .select()
        .single();

      if (error) return { ok: false, error: error.message };
      setSettings(data as SiteSettings);
      return { ok: true };
    },
    [initialSnapshot.mode]
  );

  const saveProduct = useCallback(
    async (payload: Omit<Product, "id"> & { id?: string }) => {
      if (initialSnapshot.mode === "demo") {
        const list = safeReadLocal<Product[]>(
          STORAGE_KEYS.products,
          DEFAULT_PRODUCTS
        );
        const entry: Product = {
          ...payload,
          id: payload.id || `prod-${Date.now()}`,
        };
        const exists = list.some((p) => p.id === entry.id);
        const nextList = exists
          ? list.map((p) => (p.id === entry.id ? entry : p))
          : [entry, ...list];
        setProducts(nextList);
        safeWriteLocal(STORAGE_KEYS.products, nextList);
        return { ok: true };
      }

      const supabase = createSupabaseBrowserClient();
      if (!supabase) return { ok: false, error: "Supabase client unavailable." };

      const record = { ...payload };
      if (!record.id) delete record.id;

      const query = payload.id
        ? supabase.from("products").update(record).eq("id", payload.id)
        : supabase.from("products").insert(record);

      const { error } = await query;
      if (error) return { ok: false, error: error.message };
      await refreshFromSupabase();
      return { ok: true };
    },
    [initialSnapshot.mode, refreshFromSupabase]
  );

  const deleteProduct = useCallback(
    async (id: string) => {
      if (initialSnapshot.mode === "demo") {
        const list = safeReadLocal<Product[]>(
          STORAGE_KEYS.products,
          DEFAULT_PRODUCTS
        ).filter((p) => p.id !== id);
        setProducts(list);
        safeWriteLocal(STORAGE_KEYS.products, list);
        return { ok: true };
      }

      const supabase = createSupabaseBrowserClient();
      if (!supabase) return { ok: false, error: "Supabase client unavailable." };

      const { error } = await supabase.from("products").delete().eq("id", id);
      if (error) return { ok: false, error: error.message };
      await refreshFromSupabase();
      return { ok: true };
    },
    [initialSnapshot.mode, refreshFromSupabase]
  );

  const saveLookbookEntry = useCallback(
    async (payload: Omit<LookbookEntry, "id"> & { id?: string }) => {
      if (initialSnapshot.mode === "demo") {
        const list = safeReadLocal<LookbookEntry[]>(
          STORAGE_KEYS.lookbook,
          DEFAULT_LOOKBOOK
        );
        const entry: LookbookEntry = {
          ...payload,
          id: payload.id || `look-${Date.now()}`,
        };
        const exists = list.some((l) => l.id === entry.id);
        const nextList = exists
          ? list.map((l) => (l.id === entry.id ? entry : l))
          : [entry, ...list];
        setLookbook(nextList);
        safeWriteLocal(STORAGE_KEYS.lookbook, nextList);
        return { ok: true };
      }

      const supabase = createSupabaseBrowserClient();
      if (!supabase) return { ok: false, error: "Supabase client unavailable." };

      const record = { ...payload };
      if (!record.id) delete record.id;

      const query = payload.id
        ? supabase.from("lookbook_entries").update(record).eq("id", payload.id)
        : supabase.from("lookbook_entries").insert(record);

      const { error } = await query;
      if (error) return { ok: false, error: error.message };
      await refreshFromSupabase();
      return { ok: true };
    },
    [initialSnapshot.mode, refreshFromSupabase]
  );

  const deleteLookbookEntry = useCallback(
    async (id: string) => {
      if (initialSnapshot.mode === "demo") {
        const list = safeReadLocal<LookbookEntry[]>(
          STORAGE_KEYS.lookbook,
          DEFAULT_LOOKBOOK
        ).filter((l) => l.id !== id);
        setLookbook(list);
        safeWriteLocal(STORAGE_KEYS.lookbook, list);
        return { ok: true };
      }

      const supabase = createSupabaseBrowserClient();
      if (!supabase) return { ok: false, error: "Supabase client unavailable." };

      const { error } = await supabase
        .from("lookbook_entries")
        .delete()
        .eq("id", id);
      if (error) return { ok: false, error: error.message };
      await refreshFromSupabase();
      return { ok: true };
    },
    [initialSnapshot.mode, refreshFromSupabase]
  );

  const submitInquiry = useCallback(
    async (payload: Omit<CustomInquiry, "id" | "created_at" | "status">) => {
      if (initialSnapshot.mode === "demo") {
        const list = safeReadLocal<CustomInquiry[]>(
          STORAGE_KEYS.inquiries,
          DEFAULT_INQUIRIES
        );
        const entry: CustomInquiry = {
          ...payload,
          id: `inq-${Date.now()}`,
          status: "new",
          created_at: new Date().toISOString(),
        };
        const nextList = [entry, ...list];
        setInquiries(nextList);
        safeWriteLocal(STORAGE_KEYS.inquiries, nextList);
        return { ok: true };
      }

      const supabase = createSupabaseBrowserClient();
      if (!supabase) return { ok: false, error: "Supabase client unavailable." };

      const { error } = await supabase
        .from("custom_inquiries")
        .insert({ ...payload, status: "new" });
      if (error) return { ok: false, error: error.message };
      return { ok: true };
    },
    [initialSnapshot.mode]
  );

  const updateInquiryStatus = useCallback(
    async (id: string, status: InquiryStatus) => {
      if (initialSnapshot.mode === "demo") {
        const list = safeReadLocal<CustomInquiry[]>(
          STORAGE_KEYS.inquiries,
          DEFAULT_INQUIRIES
        ).map((inq) => (inq.id === id ? { ...inq, status } : inq));
        setInquiries(list);
        safeWriteLocal(STORAGE_KEYS.inquiries, list);
        return { ok: true };
      }

      const supabase = createSupabaseBrowserClient();
      if (!supabase) return { ok: false, error: "Supabase client unavailable." };

      const { error } = await supabase
        .from("custom_inquiries")
        .update({ status })
        .eq("id", id);
      if (error) return { ok: false, error: error.message };
      await refreshFromSupabase();
      return { ok: true };
    },
    [initialSnapshot.mode, refreshFromSupabase]
  );

  const resetDemoData = useCallback(() => {
    if (typeof window === "undefined") return;
    Object.values(STORAGE_KEYS).forEach((k) =>
      window.localStorage.removeItem(k)
    );
    setSettings(DEFAULT_SITE_SETTINGS);
    setProducts(DEFAULT_PRODUCTS);
    setLookbook(DEFAULT_LOOKBOOK);
    setInquiries(DEFAULT_INQUIRIES);
    window.dispatchEvent(new Event(STORE_SYNC_EVENT));
  }, []);

  return (
    <ShowroomContext.Provider
      value={{
        settings,
        products,
        lookbook,
        inquiries,
        mode: initialSnapshot.mode,
        supabaseConfigured: initialSnapshot.supabaseConfigured,
        schemaReady: initialSnapshot.schemaReady,
        hydrated,
        updateSettings,
        saveProduct,
        deleteProduct,
        saveLookbookEntry,
        deleteLookbookEntry,
        submitInquiry,
        updateInquiryStatus,
        refreshFromSupabase,
        resetDemoData,
      }}
    >
      {children}
    </ShowroomContext.Provider>
  );
}

export function useShowroom() {
  const ctx = useContext(ShowroomContext);
  if (!ctx) {
    throw new Error("useShowroom must be used inside ShowroomProvider");
  }
  return ctx;
}
