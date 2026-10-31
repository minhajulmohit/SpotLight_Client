import HeroSlider from "@/components/home/HeroSlider";
import FeaturedStudios from "@/components/home/FeaturedStudios";
import HowItWorks from "@/components/home/HowItWorks";
import StudioCategories from "@/components/home/StudioCategories";
import CommunitySection from "@/components/home/CommunitySection";

export default function Home() {
  return (
    <div>
      <HeroSlider />
      <FeaturedStudios />
      <StudioCategories />
      <CommunitySection />
      <HowItWorks />
    </div>
  );
}
