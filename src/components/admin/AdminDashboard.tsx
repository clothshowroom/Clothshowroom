"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  CheckCircle2,
  Database,
  ExternalLink,
  ImagePlus,
  Layers,
  LogOut,
  MessageCircle,
  Pencil,
  Plus,
  RefreshCw,
  RotateCcw,
  Save,
  Scissors,
  Settings,
  ShieldCheck,
  Sparkles,
  Trash2,
} from "lucide-react";
import { useShowroom } from "@/components/providers/ShowroomProvider";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { isAllowedAdminEmail } from "@/lib/supabase/config";
import type {
  InquiryStatus,
  LookbookEntry,
  Product,
  SiteSettings,
} from "@/lib/types";
import { cn, formatINR, sanitizeWhatsAppDigits, slugify } from "@/lib/utils";

type AdminTab = "settings" | "catalogue" | "lookbook" | "inquiries";

const PRESET_IMAGES = [
  { label: "Royal Bridal Arch", url: "/images/royal-bridal-arch.jpg" },
  { label: "Navy Silk Saree", url: "/images/couture-navy-saree.jpg" },
  { label: "Mustard Lehenga", url: "/images/couture-mustard-lehenga.jpg" },
  { label: "Teal Raw Silk Set", url: "/images/couture-teal-anarkali.jpg" },
  { label: "Antique Gold Anarkali", url: "/images/couture-gold-kurta.jpg" },
  { label: "Emerald Kurta Set", url: "/images/couture-emerald-kurta.jpg" },
  { label: "Bronze Couture Drape", url: "/images/couture-drape.jpg" },
  { label: "Ivory Bandhgala", url: "/images/bandhgala-ivory.jpg" },
  { label: "Charcoal Tuxedo", url: "/images/suit-charcoal.jpg" },
  { label: "Travertine Linen", url: "/images/linen-resort.jpg" },
  { label: "Cutting Table", url: "/images/atelier-craft.jpg" },
];

const INQUIRY_STATUSES: InquiryStatus[] = [
  "new",
  "in_discussion",
  "measuring",
  "tailoring",
  "completed",
];

function emptyProductForm(): Omit<Product, "id"> & { id?: string } {
  return {
    slug: "",
    name: "",
    sku: `VC-${String(Math.floor(11 + Math.random() * 88))}`,
    category: "Sarees & Drapes",
    fabric: "Handloom Raw Silk",
    occasion: "Bridal & Reception",
    price_inr: 38000,
    price_label: "Made to measure",
    tailoring_days: 14,
    is_customizable: true,
    same_design_available: true,
    featured: false,
    in_stock: true,
    sort_order: 10,
    description: "",
    craft_notes: "",
    images: ["/images/couture-navy-saree.jpg"],
    colors: ["Royal Navy", "Forest Emerald", "Atelier Ivory"],
    fabric_options: ["Handloom Raw Silk", "Pure Banarasi Silk", "Tissue Silk"],
  };
}

function emptyLookbookForm(): Omit<LookbookEntry, "id"> & { id?: string } {
  return {
    title: "",
    season: "Heritage Couture Edit",
    story: "",
    fabric_notes: "",
    image_url: "/images/couture-mustard-lehenga.jpg",
    product_id: null,
    sort_order: 5,
  };
}

export function AdminDashboard() {
  const {
    settings,
    products,
    lookbook,
    inquiries,
    mode,
    supabaseConfigured,
    schemaReady,
    updateSettings,
    saveProduct,
    deleteProduct,
    saveLookbookEntry,
    deleteLookbookEntry,
    updateInquiryStatus,
    refreshFromSupabase,
    resetDemoData,
  } = useShowroom();

  const [tab, setTab] = useState<AdminTab>("settings");
  const [authLoading, setAuthLoading] = useState(
    () => Boolean(supabaseConfigured && createSupabaseBrowserClient())
  );
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [authError, setAuthError] = useState("");
  const [showSetupGuide, setShowSetupGuide] = useState(!supabaseConfigured);

  // Settings form state (derives from live settings unless locally edited)
  const [dirtySettings, setDirtySettings] = useState<SiteSettings | null>(null);
  const settingsDraft = dirtySettings ?? settings;
  const setSettingsDraft = (updater: (prev: SiteSettings) => SiteSettings) => {
    setDirtySettings((prev) => updater(prev ?? settings));
  };
  const [settingsSaving, setSettingsSaving] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  // Catalogue editor state
  const [editingProduct, setEditingProduct] = useState<
    (Omit<Product, "id"> & { id?: string }) | null
  >(null);
  const [colorsInput, setColorsInput] = useState("");
  const [fabricsInput, setFabricsInput] = useState("");
  const [uploadingImage, setUploadingImage] = useState(false);

  // Lookbook editor state
  const [editingLook, setEditingLook] = useState<
    (Omit<LookbookEntry, "id"> & { id?: string }) | null
  >(null);

  useEffect(() => {
    if (!supabaseConfigured) return;
    const supabase = createSupabaseBrowserClient();
    if (!supabase) return;

    let cancelled = false;
    supabase.auth.getUser().then(({ data }) => {
      if (cancelled) return;
      const email = data.user?.email ?? null;
      if (email && isAllowedAdminEmail(email)) {
        setUserEmail(email);
      } else if (email) {
        setAuthError(
          `Signed in as ${email}, which is not listed in NEXT_PUBLIC_ADMIN_EMAILS.`
        );
      }
      setAuthLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [supabaseConfigured]);

  const showNotice = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3200);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");
    const supabase = createSupabaseBrowserClient();
    if (!supabase) return;

    const { data, error } = await supabase.auth.signInWithPassword({
      email: loginEmail.trim(),
      password: loginPassword,
    });
    if (error) {
      setAuthError(error.message);
      return;
    }
    const email = data.user?.email ?? null;
    if (!isAllowedAdminEmail(email)) {
      await supabase.auth.signOut();
      setAuthError("This email is not authorized in NEXT_PUBLIC_ADMIN_EMAILS.");
      return;
    }
    setUserEmail(email);
    await refreshFromSupabase();
  };

  const handleSignOut = async () => {
    const supabase = createSupabaseBrowserClient();
    if (supabase) {
      await supabase.auth.signOut();
    }
    setUserEmail(null);
  };

  const uploadToSupabaseStorage = async (file: File): Promise<string | null> => {
    if (mode !== "supabase") {
      // In browser demo preview mode, use local object / data URL cleanly
      return await new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result || ""));
        reader.onerror = () => resolve(null);
        reader.readAsDataURL(file);
      });
    }

    const supabase = createSupabaseBrowserClient();
    if (!supabase) return null;

    setUploadingImage(true);
    const ext = file.name.split(".").pop() || "jpg";
    const fileName = `garments/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
    const { error } = await supabase.storage
      .from("showroom-media")
      .upload(fileName, file, { upsert: true });
    setUploadingImage(false);

    if (error) {
      showNotice(`Upload failed: ${error.message}`);
      return null;
    }

    const { data } = supabase.storage
      .from("showroom-media")
      .getPublicUrl(fileName);
    return data.publicUrl;
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSettingsSaving(true);
    const cleaned: SiteSettings = {
      ...settingsDraft,
      whatsapp_number:
        sanitizeWhatsAppDigits(settingsDraft.whatsapp_number) || "919800000000",
    };
    const res = await updateSettings(cleaned);
    setSettingsSaving(false);
    if (res.ok) {
      setDirtySettings(null);
      showNotice("Brand identity, address & WhatsApp saved across showroom.");
    } else {
      showNotice(`Save error: ${res.error}`);
    }
  };

  const startNewProduct = () => {
    const form = emptyProductForm();
    setEditingProduct(form);
    setColorsInput(form.colors.join(", "));
    setFabricsInput(form.fabric_options.join(", "));
  };

  const startEditProduct = (item: Product) => {
    setEditingProduct({ ...item });
    setColorsInput(item.colors.join(", "));
    setFabricsInput(item.fabric_options.join(", "));
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;
    const payload = {
      ...editingProduct,
      slug: editingProduct.slug.trim() || slugify(editingProduct.name),
      colors: colorsInput
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
      fabric_options: fabricsInput
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
    };
    const res = await saveProduct(payload);
    if (res.ok) {
      setEditingProduct(null);
      showNotice(`Saved "${payload.name}" to catalogue.`);
    } else {
      showNotice(`Error: ${res.error}`);
    }
  };

  const startNewLook = () => {
    setEditingLook(emptyLookbookForm());
  };

  const handleSaveLook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingLook) return;
    const res = await saveLookbookEntry(editingLook);
    if (res.ok) {
      setEditingLook(null);
      showNotice(`Saved lookbook chapter "${editingLook.title}".`);
    } else {
      showNotice(`Error: ${res.error}`);
    }
  };

  // Auth Gate when Supabase is configured
  if (supabaseConfigured && !userEmail && !authLoading) {
    return (
      <div className="min-h-screen bg-obsidian text-[#F6F2EB] flex items-center justify-center p-5">
        <div className="w-full max-w-md rounded-[28px] border border-white/15 bg-charcoal p-8 shadow-2xl">
          <Link
            href="/"
            className="inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.16em] text-brass hover:text-white mb-6"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to Showroom
          </Link>
          <div className="flex items-center gap-3 mb-2">
            <ShieldCheck className="h-6 w-6 text-brass" />
            <h1 className="font-serif text-3xl font-normal">
              {settings.brand_name} Admin
            </h1>
          </div>
          <p className="text-xs text-white/65 leading-relaxed mb-6">
            Sign in with your Supabase Auth owner account for this isolated Cloth Showroom project.
          </p>

          {!schemaReady && (
            <div className="mb-5 rounded-xl border border-amber-400/30 bg-amber-500/10 p-3 text-xs text-amber-200">
              Note: Supabase keys detected, verify you have run{" "}
              <code className="font-mono">supabase/schema.sql</code> in the SQL Editor.
            </div>
          )}

          {authError && (
            <div className="mb-4 rounded-xl border border-red-400/30 bg-red-500/10 p-3 text-xs text-red-200">
              {authError}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block font-mono text-[10px] uppercase tracking-[0.16em] text-white/65 mb-1.5">
                Admin Email
              </label>
              <input
                required
                type="email"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                placeholder="owner@youratelier.com"
                className="w-full rounded-xl border border-white/15 bg-obsidian px-4 py-3 text-sm text-white placeholder:text-white/35 focus:border-brass focus:outline-none"
              />
            </div>
            <div>
              <label className="block font-mono text-[10px] uppercase tracking-[0.16em] text-white/65 mb-1.5">
                Password
              </label>
              <input
                required
                type="password"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-xl border border-white/15 bg-obsidian px-4 py-3 text-sm text-white placeholder:text-white/35 focus:border-brass focus:outline-none"
              />
            </div>
            <button
              type="submit"
              className="btn-couture w-full rounded-full bg-[#F6F2EB] py-3.5 text-sm font-medium text-obsidian hover:bg-white"
            >
              Unlock Atelier Studio
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-ivory text-ink">
      {/* Top Studio Bar */}
      <header className="sticky top-0 z-30 border-b border-ink/10 bg-ivory/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-5 py-4 sm:px-8">
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-ink/15 hover:bg-obsidian hover:text-ivory transition-colors"
              aria-label="Return to storefront"
            >
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="font-serif text-xl sm:text-2xl tracking-wide">
                  {settings.brand_name}
                </h1>
                <span
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-[0.14em]",
                    mode === "supabase"
                      ? "bg-emerald-900/10 text-emerald-900 border border-emerald-700/20"
                      : "bg-amber-900/10 text-amber-950 border border-amber-700/25"
                  )}
                >
                  <Database className="h-3 w-3" />
                  {mode === "supabase" ? "Supabase Live" : "Local Preview"}
                </span>
              </div>
              <p className="text-xs text-taupe">
                Atelier Admin Studio · Manage brand name, address, WhatsApp, clothes & inquiries
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={() => setShowSetupGuide((s) => !s)}
              className="rounded-full border border-ink/15 px-3.5 py-2 font-mono text-[11px] uppercase tracking-[0.12em] text-ink hover:bg-stone/70"
            >
              {showSetupGuide ? "Hide Setup Guide" : "Supabase Setup"}
            </button>

            {mode === "demo" && (
              <button
                type="button"
                onClick={() => {
                  resetDemoData();
                  setDirtySettings(null);
                  showNotice("Demo data restored to defaults.");
                }}
                className="inline-flex items-center gap-1.5 rounded-full border border-ink/15 px-3.5 py-2 text-xs text-taupe hover:text-ink"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                Reset Demo
              </button>
            )}

            {mode === "supabase" && (
              <button
                type="button"
                onClick={() => {
                  void refreshFromSupabase();
                  showNotice("Refreshed from Supabase.");
                }}
                className="inline-flex items-center gap-1.5 rounded-full border border-ink/15 px-3.5 py-2 text-xs text-ink"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                Sync
              </button>
            )}

            <Link
              href="/"
              className="inline-flex items-center gap-1.5 rounded-full bg-obsidian px-4 py-2 text-xs font-medium text-ivory hover:bg-charcoal"
            >
              <span>View Storefront</span>
              <ExternalLink className="h-3.5 w-3.5 text-brass" />
            </Link>

            {userEmail && (
              <button
                type="button"
                onClick={handleSignOut}
                aria-label="Sign out"
                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-ink/15 text-taupe hover:text-ink"
              >
                <LogOut className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-5 py-8 sm:px-8 space-y-6">
        {toast && (
          <div className="flex items-center gap-2 rounded-2xl border border-emerald-700/25 bg-emerald-50 px-4 py-3 text-sm text-emerald-950 shadow-sm">
            <CheckCircle2 className="h-4 w-4 text-emerald-700 shrink-0" />
            <span>{toast}</span>
          </div>
        )}

        {/* Setup Guide Drawer for Connecting Brand-New Supabase / GitHub / Vercel */}
        {showSetupGuide && (
          <section className="rounded-[24px] border border-brass/35 bg-stone/70 p-6 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="font-serif text-2xl text-ink">
                Isolated Project Connection Checklist (Zero Shared Data)
              </h2>
              <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-brass">
                Ready for Your New Supabase + GitHub + Vercel
              </span>
            </div>
            <p className="text-xs sm:text-sm text-taupe leading-relaxed max-w-4xl">
              Right now you can freely edit everything in Local Preview (saved in your browser). Whenever your brand-new Supabase project is created:
            </p>
            <ol className="grid gap-3 sm:grid-cols-3 text-xs text-ink/85 pt-1">
              <li className="rounded-2xl border border-ink/10 bg-ivory p-4">
                <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-brass">
                  Step 01 · SQL Schema
                </span>
                <p className="mt-1.5 leading-relaxed">
                  Paste <code className="font-mono bg-stone px-1">supabase/schema.sql</code> into your new Supabase SQL Editor and run once. It creates tables, RLS policies, and the <code className="font-mono bg-stone px-1">showroom-media</code> photo bucket.
                </p>
              </li>
              <li className="rounded-2xl border border-ink/10 bg-ivory p-4">
                <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-brass">
                  Step 02 · Create Admin Login
                </span>
                <p className="mt-1.5 leading-relaxed">
                  In Supabase → Authentication → Users, add the showroom owner email & password. No old project keys are ever touched.
                </p>
              </li>
              <li className="rounded-2xl border border-ink/10 bg-ivory p-4">
                <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-brass">
                  Step 03 · Add Env Vars
                </span>
                <p className="mt-1.5 leading-relaxed">
                  Add <code className="font-mono bg-stone px-1">NEXT_PUBLIC_SUPABASE_URL</code> and <code className="font-mono bg-stone px-1">NEXT_PUBLIC_SUPABASE_ANON_KEY</code> into <code className="font-mono bg-stone px-1">.env.local</code> (and Vercel env vars).
                </p>
              </li>
            </ol>
          </section>
        )}

        {/* Tab Bar */}
        <div className="flex flex-wrap gap-2 border-b border-ink/12 pb-4">
          {[
            { id: "settings" as const, label: "Brand, Address & WhatsApp", icon: Settings },
            { id: "catalogue" as const, label: `Catalogue (${products.length})`, icon: Scissors },
            { id: "lookbook" as const, label: `Lookbook (${lookbook.length})`, icon: Layers },
            { id: "inquiries" as const, label: `Client Briefs (${inquiries.length})`, icon: MessageCircle },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setTab(item.id)}
                className={cn(
                  "inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-xs sm:text-sm font-medium transition-all border",
                  tab === item.id
                    ? "border-obsidian bg-obsidian text-ivory shadow-sm"
                    : "border-ink/15 bg-stone/40 text-ink/75 hover:text-ink"
                )}
              >
                <Icon className="h-3.5 w-3.5 text-brass" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* TAB 1: BRAND & CONTACT SETTINGS */}
        {tab === "settings" && (
          <form
            onSubmit={handleSaveSettings}
            className="grid gap-6 lg:grid-cols-2"
          >
            {/* Brand Identity Card */}
            <div className="rounded-[24px] border border-ink/12 bg-ivory p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-ink/10 pb-3">
                <h2 className="font-serif text-2xl">Brand & Hero Identity</h2>
                <Sparkles className="h-4 w-4 text-brass" />
              </div>

              <div className="grid gap-4 sm:grid-cols-[1fr_130px]">
                <div>
                  <label className="block font-mono text-[10px] uppercase tracking-[0.16em] text-taupe mb-1">
                    Showroom / Brand Name (Shown Everywhere) *
                  </label>
                  <input
                    required
                    type="text"
                    value={settingsDraft.brand_name}
                    onChange={(e) =>
                      setSettingsDraft((s) => ({
                        ...s,
                        brand_name: e.target.value,
                      }))
                    }
                    className="w-full rounded-xl border border-ink/15 bg-stone/30 px-3.5 py-2.5 text-sm focus:border-brass focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-mono text-[10px] uppercase tracking-[0.16em] text-taupe mb-1">
                    Monogram Mark
                  </label>
                  <input
                    type="text"
                    maxLength={4}
                    value={settingsDraft.short_mark}
                    onChange={(e) =>
                      setSettingsDraft((s) => ({
                        ...s,
                        short_mark: e.target.value,
                      }))
                    }
                    className="w-full rounded-xl border border-ink/15 bg-stone/30 px-3.5 py-2.5 text-sm font-serif text-center uppercase focus:border-brass focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-mono text-[10px] uppercase tracking-[0.16em] text-taupe mb-1">
                  Tagline
                </label>
                <input
                  type="text"
                  value={settingsDraft.tagline}
                  onChange={(e) =>
                    setSettingsDraft((s) => ({ ...s, tagline: e.target.value }))
                  }
                  className="w-full rounded-xl border border-ink/15 bg-stone/30 px-3.5 py-2.5 text-sm focus:border-brass focus:outline-none"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block font-mono text-[10px] uppercase tracking-[0.16em] text-taupe mb-1">
                    Hero Headline Line 1
                  </label>
                  <input
                    type="text"
                    value={settingsDraft.hero_title}
                    onChange={(e) =>
                      setSettingsDraft((s) => ({
                        ...s,
                        hero_title: e.target.value,
                      }))
                    }
                    className="w-full rounded-xl border border-ink/15 bg-stone/30 px-3.5 py-2.5 text-sm focus:border-brass focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-mono text-[10px] uppercase tracking-[0.16em] text-taupe mb-1">
                    Hero Headline Italic Accent
                  </label>
                  <input
                    type="text"
                    value={settingsDraft.hero_accent}
                    onChange={(e) =>
                      setSettingsDraft((s) => ({
                        ...s,
                        hero_accent: e.target.value,
                      }))
                    }
                    className="w-full rounded-xl border border-ink/15 bg-stone/30 px-3.5 py-2.5 text-sm italic focus:border-brass focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-mono text-[10px] uppercase tracking-[0.16em] text-taupe mb-1">
                  Hero Eyebrow Pill
                </label>
                <input
                  type="text"
                  value={settingsDraft.hero_eyebrow}
                  onChange={(e) =>
                    setSettingsDraft((s) => ({
                      ...s,
                      hero_eyebrow: e.target.value,
                    }))
                  }
                  className="w-full rounded-xl border border-ink/15 bg-stone/30 px-3.5 py-2.5 text-sm focus:border-brass focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-mono text-[10px] uppercase tracking-[0.16em] text-taupe mb-1">
                  Hero Subtitle Copy
                </label>
                <textarea
                  rows={3}
                  value={settingsDraft.hero_subtitle}
                  onChange={(e) =>
                    setSettingsDraft((s) => ({
                      ...s,
                      hero_subtitle: e.target.value,
                    }))
                  }
                  className="w-full rounded-xl border border-ink/15 bg-stone/30 px-3.5 py-2.5 text-sm focus:border-brass focus:outline-none resize-none"
                />
              </div>

              <div>
                <label className="block font-mono text-[10px] uppercase tracking-[0.16em] text-taupe mb-1">
                  Optional Custom Logo URL (or Upload)
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={settingsDraft.logo_url}
                    onChange={(e) =>
                      setSettingsDraft((s) => ({
                        ...s,
                        logo_url: e.target.value,
                      }))
                    }
                    placeholder="Leave blank to use monogram mark"
                    className="flex-1 rounded-xl border border-ink/15 bg-stone/30 px-3.5 py-2 text-xs focus:border-brass focus:outline-none"
                  />
                  <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl border border-ink/15 bg-stone/50 px-3 py-2 text-xs hover:bg-stone">
                    <ImagePlus className="h-3.5 w-3.5 text-brass" />
                    <span>Upload</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        const url = await uploadToSupabaseStorage(file);
                        if (url) setSettingsDraft((s) => ({ ...s, logo_url: url }));
                      }}
                    />
                  </label>
                </div>
              </div>
            </div>

            {/* Address, Contacts & WhatsApp Card */}
            <div className="rounded-[24px] border border-ink/12 bg-ivory p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-ink/10 pb-3">
                <h2 className="font-serif text-2xl">
                  WhatsApp Orders, Address & Contacts
                </h2>
                <MessageCircle className="h-4 w-4 text-brass" />
              </div>

              <div className="rounded-2xl border border-brass/30 bg-brass/10 p-4">
                <label className="block font-mono text-[10px] uppercase tracking-[0.16em] text-ink mb-1">
                  Order Receiving WhatsApp Number (Country Code + Digits, no +) *
                </label>
                <input
                  required
                  type="text"
                  value={settingsDraft.whatsapp_number}
                  onChange={(e) =>
                    setSettingsDraft((s) => ({
                      ...s,
                      whatsapp_number: e.target.value,
                    }))
                  }
                  placeholder="e.g. 919820123456"
                  className="w-full rounded-xl border border-ink/15 bg-ivory px-3.5 py-2.5 text-sm font-mono focus:border-brass focus:outline-none"
                />
                <p className="mt-1.5 font-mono text-[11px] text-taupe">
                  Active Target:{" "}
                  <span className="text-ink">
                    https://wa.me/{sanitizeWhatsAppDigits(settingsDraft.whatsapp_number)}
                  </span>
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block font-mono text-[10px] uppercase tracking-[0.16em] text-taupe mb-1">
                    Display Phone Number
                  </label>
                  <input
                    type="text"
                    value={settingsDraft.phone}
                    onChange={(e) =>
                      setSettingsDraft((s) => ({ ...s, phone: e.target.value }))
                    }
                    className="w-full rounded-xl border border-ink/15 bg-stone/30 px-3.5 py-2.5 text-sm focus:border-brass focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-mono text-[10px] uppercase tracking-[0.16em] text-taupe mb-1">
                    Contact Email
                  </label>
                  <input
                    type="email"
                    value={settingsDraft.email}
                    onChange={(e) =>
                      setSettingsDraft((s) => ({ ...s, email: e.target.value }))
                    }
                    className="w-full rounded-xl border border-ink/15 bg-stone/30 px-3.5 py-2.5 text-sm focus:border-brass focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-[1.3fr_0.7fr]">
                <div>
                  <label className="block font-mono text-[10px] uppercase tracking-[0.16em] text-taupe mb-1">
                    Showroom Street Address
                  </label>
                  <input
                    type="text"
                    value={settingsDraft.address}
                    onChange={(e) =>
                      setSettingsDraft((s) => ({
                        ...s,
                        address: e.target.value,
                      }))
                    }
                    className="w-full rounded-xl border border-ink/15 bg-stone/30 px-3.5 py-2.5 text-sm focus:border-brass focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-mono text-[10px] uppercase tracking-[0.16em] text-taupe mb-1">
                    City
                  </label>
                  <input
                    type="text"
                    value={settingsDraft.city}
                    onChange={(e) =>
                      setSettingsDraft((s) => ({ ...s, city: e.target.value }))
                    }
                    className="w-full rounded-xl border border-ink/15 bg-stone/30 px-3.5 py-2.5 text-sm focus:border-brass focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block font-mono text-[10px] uppercase tracking-[0.16em] text-taupe mb-1">
                    Opening Hours
                  </label>
                  <input
                    type="text"
                    value={settingsDraft.opening_hours}
                    onChange={(e) =>
                      setSettingsDraft((s) => ({
                        ...s,
                        opening_hours: e.target.value,
                      }))
                    }
                    className="w-full rounded-xl border border-ink/15 bg-stone/30 px-3.5 py-2.5 text-sm focus:border-brass focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-mono text-[10px] uppercase tracking-[0.16em] text-taupe mb-1">
                    Instagram Handle
                  </label>
                  <input
                    type="text"
                    value={settingsDraft.instagram_handle}
                    onChange={(e) =>
                      setSettingsDraft((s) => ({
                        ...s,
                        instagram_handle: e.target.value,
                      }))
                    }
                    className="w-full rounded-xl border border-ink/15 bg-stone/30 px-3.5 py-2.5 text-sm focus:border-brass focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-mono text-[10px] uppercase tracking-[0.16em] text-taupe mb-1">
                  Instagram URL
                </label>
                <input
                  type="url"
                  value={settingsDraft.instagram_url}
                  onChange={(e) =>
                    setSettingsDraft((s) => ({
                      ...s,
                      instagram_url: e.target.value,
                    }))
                  }
                  className="w-full rounded-xl border border-ink/15 bg-stone/30 px-3.5 py-2.5 text-sm focus:border-brass focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-mono text-[10px] uppercase tracking-[0.16em] text-taupe mb-1">
                  Turnaround & Courier Footer Note
                </label>
                <input
                  type="text"
                  value={settingsDraft.turnaround_note}
                  onChange={(e) =>
                    setSettingsDraft((s) => ({
                      ...s,
                      turnaround_note: e.target.value,
                    }))
                  }
                  className="w-full rounded-xl border border-ink/15 bg-stone/30 px-3.5 py-2.5 text-sm focus:border-brass focus:outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={settingsSaving || uploadingImage}
                className="btn-couture flex w-full items-center justify-center gap-2 rounded-full bg-obsidian py-3.5 text-sm font-medium text-ivory hover:bg-charcoal"
              >
                <Save className="h-4 w-4 text-brass" />
                <span>
                  {settingsSaving
                    ? "Publishing Changes..."
                    : "Save & Update Entire Showroom"}
                </span>
              </button>
            </div>
          </form>
        )}

        {/* TAB 2: CATALOGUE / CLOTHES MANAGER */}
        {tab === "catalogue" && (
          <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 className="font-serif text-3xl">
                  Catalogue Garments & Bespoke Templates
                </h2>
                <p className="text-xs text-taupe">
                  Items here sync to both your website archive and future mobile app via Supabase.
                </p>
              </div>
              <button
                type="button"
                onClick={startNewProduct}
                className="btn-couture inline-flex items-center gap-2 rounded-full bg-obsidian px-5 py-2.5 text-xs font-medium text-ivory"
              >
                <Plus className="h-4 w-4 text-brass" />
                Add New Outfit
              </button>
            </div>

            {/* Product Editor Form */}
            {editingProduct && (
              <form
                onSubmit={handleSaveProduct}
                className="rounded-[24px] border border-brass/35 bg-stone/60 p-6 space-y-5"
              >
                <div className="flex items-center justify-between border-b border-ink/10 pb-3">
                  <h3 className="font-serif text-2xl">
                    {editingProduct.id ? `Edit: ${editingProduct.name}` : "New Catalogue Outfit"}
                  </h3>
                  <button
                    type="button"
                    onClick={() => setEditingProduct(null)}
                    className="text-xs font-mono uppercase tracking-wider text-taupe hover:text-ink"
                  >
                    Cancel
                  </button>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  <div className="sm:col-span-2">
                    <label className="block font-mono text-[10px] uppercase tracking-wider text-taupe mb-1">
                      Outfit Title *
                    </label>
                    <input
                      required
                      type="text"
                      value={editingProduct.name}
                      onChange={(e) =>
                        setEditingProduct((p) =>
                          p ? { ...p, name: e.target.value } : p
                        )
                      }
                      placeholder="e.g. Emerald Raw-Silk Sherwani"
                      className="w-full rounded-xl border border-ink/15 bg-ivory px-3.5 py-2.5 text-sm focus:border-brass focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block font-mono text-[10px] uppercase tracking-wider text-taupe mb-1">
                      SKU Code *
                    </label>
                    <input
                      required
                      type="text"
                      value={editingProduct.sku}
                      onChange={(e) =>
                        setEditingProduct((p) =>
                          p ? { ...p, sku: e.target.value } : p
                        )
                      }
                      className="w-full rounded-xl border border-ink/15 bg-ivory px-3.5 py-2.5 text-sm font-mono focus:border-brass focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block font-mono text-[10px] uppercase tracking-wider text-taupe mb-1">
                      Price (INR)
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={editingProduct.price_inr}
                      onChange={(e) =>
                        setEditingProduct((p) =>
                          p ? { ...p, price_inr: Number(e.target.value) } : p
                        )
                      }
                      className="w-full rounded-xl border border-ink/15 bg-ivory px-3.5 py-2.5 text-sm font-mono focus:border-brass focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-mono text-[10px] uppercase tracking-wider text-taupe mb-1">
                      Category *
                    </label>
                    <input
                      required
                      list="category-suggestions"
                      value={editingProduct.category}
                      onChange={(e) =>
                        setEditingProduct((p) =>
                          p ? { ...p, category: e.target.value } : p
                        )
                      }
                      className="w-full rounded-xl border border-ink/15 bg-ivory px-3.5 py-2.5 text-sm focus:border-brass focus:outline-none"
                    />
                    <datalist id="category-suggestions">
                      <option value="Sarees & Drapes" />
                      <option value="Bridal & Lehengas" />
                      <option value="Suit & Kurta Sets" />
                      <option value="Bespoke Menswear" />
                      <option value="Bandhgala & Sherwani" />
                    </datalist>
                  </div>
                  <div>
                    <label className="block font-mono text-[10px] uppercase tracking-wider text-taupe mb-1">
                      Primary Cloth / Fabric *
                    </label>
                    <input
                      required
                      type="text"
                      value={editingProduct.fabric}
                      onChange={(e) =>
                        setEditingProduct((p) =>
                          p ? { ...p, fabric: e.target.value } : p
                        )
                      }
                      className="w-full rounded-xl border border-ink/15 bg-ivory px-3.5 py-2.5 text-sm focus:border-brass focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block font-mono text-[10px] uppercase tracking-wider text-taupe mb-1">
                      Occasion *
                    </label>
                    <input
                      required
                      type="text"
                      value={editingProduct.occasion}
                      onChange={(e) =>
                        setEditingProduct((p) =>
                          p ? { ...p, occasion: e.target.value } : p
                        )
                      }
                      className="w-full rounded-xl border border-ink/15 bg-ivory px-3.5 py-2.5 text-sm focus:border-brass focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block font-mono text-[10px] uppercase tracking-wider text-taupe mb-1">
                      Tailoring Days
                    </label>
                    <input
                      type="number"
                      min={1}
                      value={editingProduct.tailoring_days}
                      onChange={(e) =>
                        setEditingProduct((p) =>
                          p
                            ? { ...p, tailoring_days: Number(e.target.value) }
                            : p
                        )
                      }
                      className="w-full rounded-xl border border-ink/15 bg-ivory px-3.5 py-2.5 text-sm font-mono focus:border-brass focus:outline-none"
                    />
                  </div>
                </div>

                {/* Photo Upload + Presets */}
                <div className="rounded-2xl border border-ink/10 bg-ivory p-4 space-y-3">
                  <label className="block font-mono text-[10px] uppercase tracking-wider text-taupe">
                    Outfit Image (Upload to Supabase / Paste URL / Pick Preset)
                  </label>
                  <div className="flex flex-col sm:flex-row gap-2.5">
                    <input
                      type="text"
                      value={editingProduct.images[0] || ""}
                      onChange={(e) =>
                        setEditingProduct((p) =>
                          p ? { ...p, images: [e.target.value] } : p
                        )
                      }
                      placeholder="/images/suit-charcoal.jpg or https://..."
                      className="flex-1 rounded-xl border border-ink/15 bg-stone/30 px-3.5 py-2 text-xs font-mono focus:border-brass focus:outline-none"
                    />
                    <label className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-obsidian px-4 py-2 text-xs text-ivory hover:bg-charcoal">
                      <ImagePlus className="h-3.5 w-3.5 text-brass" />
                      <span>{uploadingImage ? "Uploading..." : "Upload Photo"}</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          const url = await uploadToSupabaseStorage(file);
                          if (url) {
                            setEditingProduct((p) =>
                              p ? { ...p, images: [url] } : p
                            );
                          }
                        }}
                      />
                    </label>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {PRESET_IMAGES.map((preset) => (
                      <button
                        key={preset.url}
                        type="button"
                        onClick={() =>
                          setEditingProduct((p) =>
                            p ? { ...p, images: [preset.url] } : p
                          )
                        }
                        className={cn(
                          "rounded-full border px-3 py-1 text-[11px]",
                          editingProduct.images[0] === preset.url
                            ? "border-obsidian bg-obsidian text-ivory"
                            : "border-ink/15 text-taupe hover:text-ink"
                        )}
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block font-mono text-[10px] uppercase tracking-wider text-taupe mb-1">
                      Color Swatches (comma-separated)
                    </label>
                    <input
                      type="text"
                      value={colorsInput}
                      onChange={(e) => setColorsInput(e.target.value)}
                      className="w-full rounded-xl border border-ink/15 bg-ivory px-3.5 py-2 text-xs focus:border-brass focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block font-mono text-[10px] uppercase tracking-wider text-taupe mb-1">
                      Custom Fabric Options (comma-separated)
                    </label>
                    <input
                      type="text"
                      value={fabricsInput}
                      onChange={(e) => setFabricsInput(e.target.value)}
                      className="w-full rounded-xl border border-ink/15 bg-ivory px-3.5 py-2 text-xs focus:border-brass focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block font-mono text-[10px] uppercase tracking-wider text-taupe mb-1">
                      Description *
                    </label>
                    <textarea
                      required
                      rows={2}
                      value={editingProduct.description}
                      onChange={(e) =>
                        setEditingProduct((p) =>
                          p ? { ...p, description: e.target.value } : p
                        )
                      }
                      className="w-full rounded-xl border border-ink/15 bg-ivory px-3.5 py-2 text-sm focus:border-brass focus:outline-none resize-none"
                    />
                  </div>
                  <div>
                    <label className="block font-mono text-[10px] uppercase tracking-wider text-taupe mb-1">
                      Craft & Construction Notes
                    </label>
                    <textarea
                      rows={2}
                      value={editingProduct.craft_notes}
                      onChange={(e) =>
                        setEditingProduct((p) =>
                          p ? { ...p, craft_notes: e.target.value } : p
                        )
                      }
                      placeholder="Horsehair canvas · Brass buttons · Bemberg lining"
                      className="w-full rounded-xl border border-ink/15 bg-ivory px-3.5 py-2 text-sm focus:border-brass focus:outline-none resize-none"
                    />
                  </div>
                </div>

                <div className="flex flex-wrap gap-5 pt-1 text-xs">
                  <label className="inline-flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editingProduct.same_design_available}
                      onChange={(e) =>
                        setEditingProduct((p) =>
                          p
                            ? { ...p, same_design_available: e.target.checked }
                            : p
                        )
                      }
                      className="accent-obsidian"
                    />
                    <span>Order Same-As-Shown Enabled</span>
                  </label>
                  <label className="inline-flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editingProduct.is_customizable}
                      onChange={(e) =>
                        setEditingProduct((p) =>
                          p ? { ...p, is_customizable: e.target.checked } : p
                        )
                      }
                      className="accent-obsidian"
                    />
                    <span>Allow Fabric / Fit Customization</span>
                  </label>
                </div>

                <button
                  type="submit"
                  className="btn-couture inline-flex items-center gap-2 rounded-full bg-obsidian px-7 py-3 text-xs font-medium text-ivory"
                >
                  <Save className="h-3.5 w-3.5 text-brass" />
                  Save Outfit
                </button>
              </form>
            )}

            {/* Products List */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {products.map((item) => (
                <div
                  key={item.id}
                  className="flex flex-col justify-between rounded-[22px] border border-ink/12 bg-ivory p-4"
                >
                  <div className="flex gap-4">
                    <img
                      src={item.images[0] || "/images/couture-navy-saree.jpg"}
                      alt={item.name}
                      className="h-24 w-20 shrink-0 rounded-xl object-cover object-top bg-stone"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="font-mono text-[10px] uppercase tracking-wider text-brass">
                        {item.sku} · {item.category}
                      </p>
                      <h3 className="font-serif text-xl leading-tight truncate mt-0.5">
                        {item.name}
                      </h3>
                      <p className="text-xs text-taupe truncate mt-0.5">
                        {item.fabric}
                      </p>
                      <p className="font-mono text-xs font-medium text-ink mt-1.5">
                        {formatINR(item.price_inr)} · {item.tailoring_days}d
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 flex items-center justify-between border-t border-ink/10 pt-3">
                    <span className="font-mono text-[10px] text-taupe uppercase">
                      {item.same_design_available ? "Same + Custom" : "Custom Only"}
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => startEditProduct(item)}
                        className="inline-flex items-center gap-1 rounded-full border border-ink/15 px-3 py-1.5 text-xs hover:bg-stone"
                      >
                        <Pencil className="h-3 w-3" />
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={async () => {
                          await deleteProduct(item.id);
                          showNotice(`Removed "${item.name}".`);
                        }}
                        aria-label={`Delete ${item.name}`}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-red-900/15 text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: LOOKBOOK MANAGER */}
        {tab === "lookbook" && (
          <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 className="font-serif text-3xl">Editorial Lookbook</h2>
                <p className="text-xs text-taupe">
                  Highlight seasonal stories linked directly to catalogue pieces for instant WhatsApp customization.
                </p>
              </div>
              <button
                type="button"
                onClick={startNewLook}
                className="btn-couture inline-flex items-center gap-2 rounded-full bg-obsidian px-5 py-2.5 text-xs font-medium text-ivory"
              >
                <Plus className="h-4 w-4 text-brass" />
                Add Lookbook Chapter
              </button>
            </div>

            {editingLook && (
              <form
                onSubmit={handleSaveLook}
                className="rounded-[24px] border border-brass/35 bg-stone/60 p-6 space-y-4"
              >
                <div className="flex items-center justify-between border-b border-ink/10 pb-3">
                  <h3 className="font-serif text-2xl">
                    {editingLook.id ? `Edit: ${editingLook.title}` : "New Lookbook Chapter"}
                  </h3>
                  <button
                    type="button"
                    onClick={() => setEditingLook(null)}
                    className="text-xs font-mono uppercase text-taupe"
                  >
                    Cancel
                  </button>
                </div>

                <div className="grid gap-4 sm:grid-cols-3">
                  <div>
                    <label className="block font-mono text-[10px] uppercase text-taupe mb-1">
                      Title *
                    </label>
                    <input
                      required
                      type="text"
                      value={editingLook.title}
                      onChange={(e) =>
                        setEditingLook((l) =>
                          l ? { ...l, title: e.target.value } : l
                        )
                      }
                      className="w-full rounded-xl border border-ink/15 bg-ivory px-3.5 py-2.5 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block font-mono text-[10px] uppercase text-taupe mb-1">
                      Season / Edit *
                    </label>
                    <input
                      required
                      type="text"
                      value={editingLook.season}
                      onChange={(e) =>
                        setEditingLook((l) =>
                          l ? { ...l, season: e.target.value } : l
                        )
                      }
                      className="w-full rounded-xl border border-ink/15 bg-ivory px-3.5 py-2.5 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block font-mono text-[10px] uppercase text-taupe mb-1">
                      Linked Catalogue Outfit (Optional)
                    </label>
                    <select
                      value={editingLook.product_id || ""}
                      onChange={(e) =>
                        setEditingLook((l) =>
                          l
                            ? { ...l, product_id: e.target.value || null }
                            : l
                        )
                      }
                      className="w-full rounded-xl border border-ink/15 bg-ivory px-3.5 py-2.5 text-sm"
                    >
                      <option value="">None (Direct WhatsApp Look Inquiry)</option>
                      {products.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.sku} · {p.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block font-mono text-[10px] uppercase text-taupe mb-1">
                      Editorial Story *
                    </label>
                    <textarea
                      required
                      rows={2}
                      value={editingLook.story}
                      onChange={(e) =>
                        setEditingLook((l) =>
                          l ? { ...l, story: e.target.value } : l
                        )
                      }
                      className="w-full rounded-xl border border-ink/15 bg-ivory px-3.5 py-2 text-sm resize-none"
                    />
                  </div>
                  <div>
                    <label className="block font-mono text-[10px] uppercase text-taupe mb-1">
                      Fabric & Construction Notes
                    </label>
                    <textarea
                      rows={2}
                      value={editingLook.fabric_notes}
                      onChange={(e) =>
                        setEditingLook((l) =>
                          l ? { ...l, fabric_notes: e.target.value } : l
                        )
                      }
                      className="w-full rounded-xl border border-ink/15 bg-ivory px-3.5 py-2 text-sm resize-none"
                    />
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-2.5">
                  <input
                    type="text"
                    value={editingLook.image_url}
                    onChange={(e) =>
                      setEditingLook((l) =>
                        l ? { ...l, image_url: e.target.value } : l
                      )
                    }
                    className="flex-1 rounded-xl border border-ink/15 bg-ivory px-3.5 py-2 text-xs font-mono"
                  />
                  <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-obsidian px-4 py-2 text-xs text-ivory">
                    <ImagePlus className="h-3.5 w-3.5 text-brass" />
                    <span>Upload Photo</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        const url = await uploadToSupabaseStorage(file);
                        if (url)
                          setEditingLook((l) =>
                            l ? { ...l, image_url: url } : l
                          );
                      }}
                    />
                  </label>
                </div>

                <button
                  type="submit"
                  className="btn-couture inline-flex items-center gap-2 rounded-full bg-obsidian px-6 py-3 text-xs font-medium text-ivory"
                >
                  <Save className="h-3.5 w-3.5 text-brass" />
                  Save Lookbook Chapter
                </button>
              </form>
            )}

            <div className="grid gap-5 md:grid-cols-2">
              {lookbook.map((entry) => (
                <div
                  key={entry.id}
                  className="flex gap-4 rounded-[22px] border border-ink/12 bg-ivory p-4"
                >
                  <img
                    src={entry.image_url}
                    alt={entry.title}
                    className="h-32 w-24 shrink-0 rounded-xl object-cover object-top bg-stone"
                  />
                  <div className="flex flex-1 flex-col justify-between min-w-0">
                    <div>
                      <p className="font-mono text-[10px] uppercase tracking-wider text-brass">
                        {entry.season}
                      </p>
                      <h3 className="font-serif text-xl mt-0.5">
                        {entry.title}
                      </h3>
                      <p className="mt-1 line-clamp-2 text-xs text-taupe">
                        {entry.story}
                      </p>
                    </div>
                    <div className="mt-3 flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setEditingLook({ ...entry })}
                        className="inline-flex items-center gap-1 rounded-full border border-ink/15 px-3 py-1 text-xs hover:bg-stone"
                      >
                        <Pencil className="h-3 w-3" />
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={async () => {
                          await deleteLookbookEntry(entry.id);
                          showNotice(`Removed "${entry.title}".`);
                        }}
                        className="inline-flex items-center gap-1 rounded-full border border-red-900/15 px-3 py-1 text-xs text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-3 w-3" />
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: CLIENT INQUIRIES & MEASUREMENTS LOG */}
        {tab === "inquiries" && (
          <div className="space-y-4">
            <div>
              <h2 className="font-serif text-3xl">
                Client Commissions & WhatsApp Briefs
              </h2>
              <p className="text-xs text-taupe">
                Every Same-As-Shown, Customized Outfit, and Bespoke Brief submitted by visitors is stored here with client measurements.
              </p>
            </div>

            {inquiries.length === 0 ? (
              <div className="rounded-3xl border border-ink/12 bg-stone/40 p-10 text-center text-sm text-taupe">
                No inquiries logged yet. Test submitting a garment order or custom brief on the storefront.
              </div>
            ) : (
              <div className="space-y-4">
                {inquiries.map((inq) => {
                  const clientDigits = sanitizeWhatsAppDigits(inq.customer_phone);
                  const followUpHref = clientDigits
                    ? `https://wa.me/${clientDigits}?text=${encodeURIComponent(
                        `Namaste ${inq.customer_name}, following up from ${settings.brand_name} Atelier regarding your brief for ${inq.product_name || "bespoke tailoring"}.`
                      )}`
                    : null;

                  return (
                    <div
                      key={inq.id}
                      className="rounded-[22px] border border-ink/12 bg-ivory p-5 space-y-3"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-ink/10 pb-3">
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="rounded-full bg-obsidian px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-wider text-ivory">
                              {inq.inquiry_type.replace("_", " ")}
                            </span>
                            <span className="font-mono text-xs text-brass">
                              {inq.product_name}
                            </span>
                          </div>
                          <h3 className="mt-1.5 font-serif text-2xl text-ink">
                            {inq.customer_name}{" "}
                            <span className="font-sans text-sm text-taupe font-normal">
                              · {inq.customer_phone}
                              {inq.customer_city ? ` · ${inq.customer_city}` : ""}
                            </span>
                          </h3>
                        </div>

                        <div className="flex items-center gap-2">
                          <select
                            aria-label="Update inquiry status"
                            value={inq.status}
                            onChange={(e) => {
                              void updateInquiryStatus(
                                inq.id,
                                e.target.value as InquiryStatus
                              );
                              showNotice("Inquiry status updated.");
                            }}
                            className="rounded-full border border-ink/15 bg-stone/40 px-3.5 py-1.5 font-mono text-xs uppercase text-ink focus:border-brass focus:outline-none"
                          >
                            {INQUIRY_STATUSES.map((st) => (
                              <option key={st} value={st}>
                                {st.replace("_", " ")}
                              </option>
                            ))}
                          </select>

                          {followUpHref && (
                            <a
                              href={followUpHref}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 rounded-full bg-obsidian px-3.5 py-1.5 text-xs text-ivory hover:bg-charcoal"
                            >
                              <MessageCircle className="h-3.5 w-3.5 text-brass" />
                              Follow Up
                            </a>
                          )}
                        </div>
                      </div>

                      <div className="grid gap-3 text-xs sm:grid-cols-3 text-ink/80">
                        <div>
                          <span className="font-mono text-[10px] uppercase text-taupe block">
                            Fabric & Shade
                          </span>
                          <span>
                            {inq.preferred_fabric || "Archive cloth"} ·{" "}
                            {inq.preferred_color || "Default"}
                          </span>
                        </div>
                        <div>
                          <span className="font-mono text-[10px] uppercase text-taupe block">
                            Fit / Mode
                          </span>
                          <span>
                            {inq.order_mode}
                            {inq.standard_size ? ` (${inq.standard_size})` : ""}
                            {inq.fit_preference ? ` · ${inq.fit_preference}` : ""}
                          </span>
                        </div>
                        <div>
                          <span className="font-mono text-[10px] uppercase text-taupe block">
                            Measurements
                          </span>
                          <span className="font-mono">
                            {Object.entries(inq.measurements || {})
                              .filter(([, v]) => Boolean(v))
                              .map(([k, v]) => `${k}: ${v}`)
                              .join(" · ") || "To measure via call/studio"}
                          </span>
                        </div>
                      </div>

                      {inq.notes && (
                        <p className="rounded-xl bg-stone/50 px-3.5 py-2.5 text-xs text-ink/85">
                          <span className="font-mono uppercase text-[10px] text-taupe mr-2">
                            Notes:
                          </span>
                          {inq.notes}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
