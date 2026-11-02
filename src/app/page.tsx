import { Suspense } from "react";

import HeroSlider from "@/components/home/HeroSlider";
import FeaturedStudios, {
  FeaturedStudiosSkeleton,
} from "@/components/home/FeaturedStudios";
import StudioCategories from "@/components/home/StudioCategories";
import CommunitySection from "@/components/home/CommunitySection";

export default function Home() {
  return (
    <div>
      <HeroSlider />
      <Suspense fallback={<FeaturedStudiosSkeleton />}>
        <FeaturedStudios />
      </Suspense>
      <StudioCategories />
      <CommunitySection />
    </div>
  );
}
