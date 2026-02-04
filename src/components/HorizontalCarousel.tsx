import { useRef, useState, useEffect } from "react";

type HorizontalCarouselProps = {
  ariaLabel: string;
  children: React.ReactNode;
};

const HorizontalCarousel = ({ ariaLabel, children }: HorizontalCarouselProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScroll = () => {
    if (!scrollRef.current) return;
    
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
    setCanScrollLeft(scrollLeft > 0);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 1);
  };

  useEffect(() => {
    checkScroll();
    const scrollElement = scrollRef.current;
    scrollElement?.addEventListener("scroll", checkScroll);
    window.addEventListener("resize", checkScroll);
    
    return () => {
      scrollElement?.removeEventListener("scroll", checkScroll);
      window.removeEventListener("resize", checkScroll);
    };
  }, [children]);

  const handleScroll = (direction: "left" | "right") => {
    if (!scrollRef.current) return;

    const offset = scrollRef.current.clientWidth * 0.85;
    scrollRef.current.scrollBy({
      left: direction === "left" ? -offset : offset,
      behavior: "smooth",
    });
  };

  return (
    <div className="carousel">
      <button
        type="button"
        className="carousel-button"
        onClick={() => handleScroll("left")}
        aria-label="Scroll left"
        disabled={!canScrollLeft}
        style={{ opacity: canScrollLeft ? 1 : 0.3, cursor: canScrollLeft ? "pointer" : "default" }}
      >
        ←
      </button>
      <div className="carousel-track" ref={scrollRef} role="region" aria-label={ariaLabel}>
        <div className="carousel-grid">{children}</div>
      </div>
      <button
        type="button"
        className="carousel-button"
        onClick={() => handleScroll("right")}
        aria-label="Scroll right"
        disabled={!canScrollRight}
        style={{ opacity: canScrollRight ? 1 : 0.3, cursor: canScrollRight ? "pointer" : "default" }}
      >
        →
      </button>
    </div>
  );
};

export default HorizontalCarousel;
