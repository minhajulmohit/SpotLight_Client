import { Suspense } from "react";

import HeroSlider from "@/components/home/HeroSlider";
import FeaturedStudios, {
  FeaturedStudiosSkeleton,
} from "@/components/home/FeaturedStudios";
import StudioCategories from "@/components/home/StudioCategories";
import HowItWorks from "@/components/home/HowItWorks";
import AboutUsPage from "./about-us/page";

export default function Home() {
  return (
    <div>
      <HeroSlider />
      <Suspense fallback={<FeaturedStudiosSkeleton />}>
        <FeaturedStudios />
      </Suspense>
      <StudioCategories />
      <HowItWorks />
      <AboutUsPage />
    </div>
  );
}
