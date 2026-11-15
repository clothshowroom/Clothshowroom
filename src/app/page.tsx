import { AtelierCursor } from "@/components/showroom/AtelierCursor";
import { AtelierMarqueeStrip } from "@/components/showroom/AtelierMarqueeStrip";
import { BespokeProcessSection } from "@/components/showroom/BespokeProcessSection";
import { CatalogueSection } from "@/components/showroom/CatalogueSection";
import { CustomOrderSection } from "@/components/showroom/CustomOrderSection";
import { FabricLoomSection } from "@/components/showroom/FabricLoomSection";
import { HeroSection } from "@/components/showroom/HeroSection";
import { LookbookSection } from "@/components/showroom/LookbookSection";
import { Navbar } from "@/components/showroom/Navbar";
import { RoyalConciergeDrawer } from "@/components/showroom/RoyalConciergeDrawer";
import { RoyalGrandUnveiling } from "@/components/showroom/RoyalGrandUnveiling";
import { ShowroomFooter } from "@/components/showroom/ShowroomFooter";
import ClickSpark from "@/components/react-bits/ClickSpark/ClickSpark";

export const dynamic = "force-dynamic";

export default function HomePage() {
  return (
    <ClickSpark
      sparkColor={["#E4C988", "#D7B774", "#B99149", "#FFFDF8"]}
      sparkSize={5}
      sparkRadius={26}
      sparkCount={8}
      duration={480}
      extraScale={1.15}
    >
      <div className="min-h-screen flex flex-col bg-ivory text-ink relative">
        {/* Cinematic Haute-Couture Welcoming Ceremony */}
        <RoyalGrandUnveiling />

        {/* Bespoke Gold Follower Cursor */}
        <AtelierCursor />

        {/* Luxury Glass Capsule Navigation */}
        <Navbar />

        <main className="flex-1">
          <HeroSection />
          <AtelierMarqueeStrip />
          <FabricLoomSection />
          <CatalogueSection />
          <LookbookSection />
          <BespokeProcessSection />
          <CustomOrderSection />
        </main>

        {/* Floating VIP Atelier Concierge Appointment Drawer */}
        <RoyalConciergeDrawer />

        <ShowroomFooter />
      </div>
    </ClickSpark>
  );
}
