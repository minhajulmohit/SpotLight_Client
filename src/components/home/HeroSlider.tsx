"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { A11y, Autoplay } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import type { Swiper as SwiperClass } from "swiper/types";
import "swiper/css";

type Slide = {
  id: number;
  title: ReactNode;
  subtext: string;
  image: string;
};

const slides: Slide[] = [
  {
    id: 1,
    title: (
      <>
        Bring Your <span className="text-amber-400">Cinematic Vision</span> to
        Life
      </>
    ),
    subtext:
      "Discover and book high-end sound stages, cyclorama walls, and fully-equipped video production sets.",
    image:
      "https://images.unsplash.com/photo-1695014192203-291edf9e4842?q=80&w=1374&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=NHwxMjA3fDA%3D",
  },
  {
    id: 2,
    title: (
      <>
        Premium <span className="text-amber-400">Daylight</span> &amp; Fashion
        Photo Studios
      </>
    ),
    subtext:
      "Explore curated photo lofts equipped with professional lighting, seamless backdrops, and vanity rooms.",
    image:
      "https://media.istockphoto.com/id/1329518145/photo/photo-studio-interior.webp?a=1&b=1&s=612x612&w=0&k=20&c=JqMYftQvse3qXeyPX7FrwkTblNYS8AG7-ZhYAl4ajSM=",
  },
  {
    id: 3,
    title: (
      <>
        Acoustically Treated{" "}
        <span className="text-amber-400">Audio &amp; Podcast</span> Lounges
      </>
    ),
    subtext:
      "Multi-camera podcast rooms and music recording suites ready with professional broadcast microphones and audio mixers.",
    image:
      "https://images.unsplash.com/photo-1610351038317-1baed1ec74e7?q=80&w=947&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=NHwxMjA3fDA%3D",
  },
];

const AUTOPLAY_MS = 6500;

const HeroSlider = () => {
  const [swiper, setSwiper] = useState<SwiperClass | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <section
      aria-roledescription="carousel"
      aria-label="Featured production spaces"
      className="relative h-[80vh] min-h-137.5 w-full overflow-hidden bg-zinc-950 text-white"
    >
      <Swiper
        modules={[Autoplay, A11y]}
        slidesPerView={1}
        loop
        speed={700}
        autoplay={{
          delay: AUTOPLAY_MS,
          disableOnInteraction: false,
          pauseOnMouseEnter: true,
        }}
        onSwiper={setSwiper}
        onSlideChange={(instance) => setActiveIndex(instance.realIndex)}
        a11y={{
          enabled: true,
          containerRoleDescriptionMessage: "carousel",
          itemRoleDescriptionMessage: "slide",
        }}
        className="h-full"
      >
        {slides.map((slide, index) => (
          <SwiperSlide
            key={slide.id}
            className="h-full"
            aria-label={`${index + 1} of ${slides.length}`}
          >
            <Image
              src={slide.image}
              alt=""
              fill
              sizes="100vw"
              preload={index === 0}
              loading={index === 0 ? undefined : "lazy"}
              className="object-cover object-center"
            />

            <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/50 to-black/30" />

            <div className="relative z-10 container mx-auto flex h-full items-end px-4 pb-24 sm:items-center sm:pb-0">
              <div className="max-w-2xl">
                <h1 className="text-3xl leading-tight font-bold sm:text-5xl lg:text-6xl">
                  {slide.title}
                </h1>
                <p className="mt-4 max-w-xl text-sm text-zinc-200 sm:text-base">
                  {slide.subtext}
                </p>

                <div className="mt-8 flex flex-wrap gap-3">
                  <Link
                    scroll={true}
                    href="/studios"
                    className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-amber-400 px-6 text-sm font-semibold text-zinc-950 transition-colors duration-200 hover:bg-amber-500"
                  >
                    Explore Studios
                    <ArrowRight className="size-4" />
                  </Link>
                  <Link
                    scroll={true}
                    href="/studios"
                    className="inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-white/30 bg-white/10 px-6 text-sm font-semibold text-white backdrop-blur-sm transition-colors duration-200 hover:border-amber-400/60 hover:bg-white/20 hover:text-amber-400"
                  >
                    Host Your Space
                  </Link>
                </div>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>

      <button
        type="button"
        onClick={() => swiper?.slidePrev()}
        aria-label="Previous slide"
        className="absolute top-1/2 left-2 z-20 hidden size-9 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-black/30 text-white backdrop-blur transition-colors duration-200 hover:border-amber-400/60 hover:text-amber-400 lg:inline-flex"
      >
        <ArrowLeft className="size-5" />
      </button>
      <button
        type="button"
        onClick={() => swiper?.slideNext()}
        aria-label="Next slide"
        className="absolute top-1/2 right-2 z-20 hidden size-9 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-black/30 text-white backdrop-blur transition-colors duration-200 hover:border-amber-400/60 hover:text-amber-400 lg:inline-flex"
      >
        <ArrowRight className="size-5" />
      </button>

      <div className="absolute bottom-6 left-1/2 z-20 flex -translate-x-1/2 items-center gap-2">
        {slides.map((slide, index) => (
          <button
            key={slide.id}
            type="button"
            onClick={() => swiper?.slideToLoop(index)}
            aria-label={`Go to slide ${index + 1}`}
            aria-current={index === activeIndex ? "true" : "false"}
            className={`h-2 cursor-pointer rounded-full transition-all duration-300 ${
              index === activeIndex
                ? "w-8 bg-amber-400"
                : "w-2 bg-white/50 hover:bg-white/80"
            }`}
          />
        ))}
      </div>
    </section>
  );
};

export default HeroSlider;
