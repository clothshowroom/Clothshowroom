import type { Metadata } from "next";
import {
  Cinzel,
  Cormorant_Garamond,
  JetBrains_Mono,
  Plus_Jakarta_Sans,
} from "next/font/google";
import { ShowroomProvider } from "@/components/providers/ShowroomProvider";
import { fetchShowroomSnapshotServer } from "@/lib/showroom-data";
import "./globals.css";

export const dynamic = "force-dynamic";

const cinzel = Cinzel({
  variable: "--font-display-cinzel",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const cormorant = Cormorant_Garamond({
  variable: "--font-serif-cormorant",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
});

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-sans-jakarta",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono-jetbrains",
  subsets: ["latin"],
  weight: ["400", "500"],
});

export async function generateMetadata(): Promise<Metadata> {
  const snapshot = await fetchShowroomSnapshotServer();
  return {
    title: `${snapshot.settings.brand_name} — ${snapshot.settings.tagline}`,
    description: snapshot.settings.hero_subtitle,
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const initialSnapshot = await fetchShowroomSnapshotServer();

  return (
    <html
      lang="en"
      className={`${cinzel.variable} ${cormorant.variable} ${jakarta.variable} ${jetbrainsMono.variable} h-full`}
    >
      <body className="min-h-full flex flex-col bg-ivory text-ink antialiased">
        <ShowroomProvider initialSnapshot={initialSnapshot}>
          {children}
        </ShowroomProvider>
      </body>
    </html>
  );
}
