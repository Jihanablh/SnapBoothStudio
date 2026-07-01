const STRIP = [
  "https://images.unsplash.com/photo-1519741497674-611481863552?w=400",
  "https://images.unsplash.com/photo-1523580494863-6f3031224c94?w=400",
  "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=400",
  "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=400",
  "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=400",
  "https://images.unsplash.com/photo-1502635385003-ee1e6a1a742d?w=400",
  "https://images.unsplash.com/photo-1478147427282-58a87a120781?w=400",
  "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=400",
  "https://images.unsplash.com/photo-1519671482749-fd09be7ccebf?w=400",
];

export function PhotoMarquee({ reverse = false, speed = "slow" }: { reverse?: boolean; speed?: "slow" | "fast" }) {
  const list = [...STRIP, ...STRIP];
  return (
    <div className="group relative overflow-hidden py-2" style={{ maskImage: "linear-gradient(90deg, transparent, black 8%, black 92%, transparent)" }}>
      <div
        className={`flex w-max gap-4 ${speed === "slow" ? "animate-marquee-slow" : "animate-marquee"} group-hover:[animation-play-state:paused]`}
        style={{ animationDirection: reverse ? "reverse" : "normal" }}
      >
        {list.map((src, i) => (
          <figure
            key={i}
            className="relative w-[150px] shrink-0 rounded-lg bg-white p-1.5 pb-6 shadow-lg shadow-black/60"
            style={{ transform: `rotate(${(i % 5) - 2}deg)` }}
          >
            <div className="aspect-[3/4] overflow-hidden rounded">
              <img src={src} alt="" className="h-full w-full object-cover" loading="lazy" />
            </div>
            <figcaption className="absolute inset-x-0 bottom-1 text-center font-display text-[10px] italic text-neutral-800">
              SnapBooth
            </figcaption>
          </figure>
        ))}
      </div>
    </div>
  );
}
