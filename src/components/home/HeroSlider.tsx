"use client";

import {
  useEffect,
  useRef,
  useState,
  type ReactNode,
  type TouchEvent,
} from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";

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
        Bring Your{" "}
        <span className="text-amber-400">Cinematic Vision</span> to Life
      </>
    ),
    subtext:
      "Discover and book high-end sound stages, cyclorama walls, and fully-equipped video production sets.",
    image: "https://images.unsplash.com/photo-1695014192203-291edf9e4842?q=80&w=1374&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=NHwxMjA3fDA%3D",
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
      "Explore curated photo lofts equipped with professional Profoto lighting, seamless backdrops, and vanity rooms.",
    image: "https://media.istockphoto.com/id/1329518145/photo/photo-studio-interior.webp?a=1&b=1&s=612x612&w=0&k=20&c=JqMYftQvse3qXeyPX7FrwkTblNYS8AG7-ZhYAl4ajSM=",
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
    image: "https://images.unsplash.com/photo-1610351038317-1baed1ec74e7?q=80&w=947&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=NHwxMjA3fDA%3D",
  },
];

const AUTOPLAY_MS = 6500;

const SWIPE_THRESHOLD = 50;

const HeroSlider = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const touchStartX = useRef<number | null>(null);

  const goTo = (index: number) => {
    const total = slides.length;
    setActiveIndex(((index % total) + total) % total);
  };

  const next = () => goTo(activeIndex + 1);
  const prev = () => goTo(activeIndex - 1);


  const handleTouchStart = (event: TouchEvent<HTMLElement>) => {
    touchStartX.current = event.touches[0].clientX;
    setIsPaused(true);
  };

  const handleTouchEnd = (event: TouchEvent<HTMLElement>) => {
    if (touchStartX.current === null) return;

    const delta = event.changedTouches[0].clientX - touchStartX.current;
    touchStartX.current = null;

    if (Math.abs(delta) > SWIPE_THRESHOLD) {
      if (delta < 0) {
        next();
      } else {
        prev();
      }
    }

    setIsPaused(false);
  };

  
  useEffect(() => {
    if (isPaused) return;

    const timer = setTimeout(() => {
      setActiveIndex((prevIndex) => (prevIndex + 1) % slides.length);
    }, AUTOPLAY_MS);

    return () => clearTimeout(timer);
  }, [activeIndex, isPaused]);

  return (
    <section
      aria-roledescription="carousel"
      aria-label="Featured production spaces"
      className="relative w-full min-h-137.5 h-[80vh] overflow-hidden bg-zinc-950 text-white"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onFocus={() => setIsPaused(true)}
      onBlur={() => setIsPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      
      {slides.map((slide, index) => {
        const isActive = index === activeIndex;

        return (
          <div
            key={slide.id}
            role="group"
            aria-roledescription="slide"
            aria-label={`${index + 1} of ${slides.length}`}
            aria-hidden={!isActive}
            className={`absolute inset-0 transition-opacity duration-700 ease-out ${
              isActive
                ? "z-10 opacity-100"
                : "z-0 pointer-events-none opacity-0"
            }`}
          >
            
            <div
              className="absolute inset-0 bg-zinc-900 bg-cover bg-center bg-no-repeat"
              style={{ backgroundImage: `url('${slide.image}')` }}
            />

           
            <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/50 to-black/30" />

          
            <div className="relative z-10 container mx-auto flex h-full items-end px-4 pb-24 sm:items-center sm:pb-0">
              <div className="max-w-2xl">
                <h1 className="text-3xl font-bold leading-tight sm:text-5xl lg:text-6xl">
                  {slide.title}
                </h1>
                <p className="mt-4 max-w-xl text-sm text-zinc-200 sm:text-base">
                  {slide.subtext}
                </p>

                <div className="mt-8 flex flex-wrap gap-3">
                  <Link
                    href="/studios"
                    className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-amber-400 px-6 text-sm font-semibold text-zinc-950 transition-colors duration-200 hover:bg-amber-500"
                  >
                    Explore Studios
                    <ArrowRight className="size-4" />
                  </Link>
                  <Link
                    href="/studios"
                    className="inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-white/30 bg-white/10 px-6 text-sm font-semibold text-white backdrop-blur-sm transition-colors duration-200 hover:border-amber-400/60 hover:bg-white/20 hover:text-amber-400"
                  >
                    Host Your Space
                  </Link>
                </div>
              </div>
            </div>
          </div>
        );
      })}


      <button
        type="button"
        onClick={prev}
        aria-label="Previous slide"
        className="absolute left-2 top-1/2 z-20 inline-flex size-9 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-black/30 text-white backdrop-blur transition-colors duration-200 hover:border-amber-400/60 hover:text-amber-400 sm:left-4 sm:size-10"
      >
        <ArrowLeft className="size-5" />
      </button>
      <button
        type="button"
        onClick={next}
        aria-label="Next slide"
        className="absolute right-2 top-1/2 z-20 inline-flex size-9 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-black/30 text-white backdrop-blur transition-colors duration-200 hover:border-amber-400/60 hover:text-amber-400 sm:right-4 sm:size-10"
      >
        <ArrowRight className="size-5" />
      </button>

   
      <div className="absolute bottom-6 left-1/2 z-20 flex -translate-x-1/2 items-center gap-2">
        {slides.map((slide, index) => (
          <button
            key={slide.id}
            type="button"
            onClick={() => goTo(index)}
            aria-label={`Go to slide ${index + 1}`}
            aria-current={index === activeIndex ? "true" : "false"}
            className={`h-2 rounded-full transition-all duration-300 ${
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
