import { useRef } from "react";

type HorizontalCarouselProps = {
  ariaLabel: string;
  children: React.ReactNode;
};

const HorizontalCarousel = ({ ariaLabel, children }: HorizontalCarouselProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  const handleScroll = (direction: "left" | "right") => {
    if (!scrollRef.current) {
      return;
    }

    const offset = scrollRef.current.clientWidth * 0.9;
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
      >
        ◀
      </button>
      <div className="carousel-track" ref={scrollRef} role="region" aria-label={ariaLabel}>
        <div className="carousel-grid">{children}</div>
      </div>
      <button
        type="button"
        className="carousel-button"
        onClick={() => handleScroll("right")}
        aria-label="Scroll right"
      >
        ▶
      </button>
    </div>
  );
};

export default HorizontalCarousel;
