import HeroSection from "@/components/home/HeroSection";
import StarterKitCard from "@/components/home/StarterKitCard";
import QuickAccessGrid from "@/components/home/QuickAccessGrid";

export default function HomePage() {
  return (
    <div className="max-w-7xl mx-auto px-12 py-20">
      <HeroSection />
      <StarterKitCard />
      <QuickAccessGrid />
    </div>
  );
}
