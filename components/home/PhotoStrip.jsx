import Image from "next/image";

/** Endless strip of real photos from drives. Pauses on hover. */
export default function PhotoStrip({ photos }) {
  const doubled = [...photos, ...photos];
  return (
    <section aria-label="Photos from our drives" className="relative py-6 overflow-hidden bg-ink">
      <div className="marquee-track">
        {doubled.map((p, i) => (
          <figure key={i} aria-hidden={i >= photos.length}
            className={`group relative flex-shrink-0 mx-2 overflow-hidden rounded-2xl ${i % 3 === 1 ? "w-56 h-56" : "w-80 h-56"}`}>
            <Image src={p.src} alt={i >= photos.length ? "" : p.alt} fill sizes="320px"
              className="object-cover saturate-[0.85] transition-all duration-700 ease-out-expo group-hover:saturate-100 group-hover:scale-105" />
            <figcaption className="absolute inset-x-0 bottom-0 p-3 text-[14px] text-white bg-gradient-to-t from-ink/80 to-transparent
              translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out-expo">
              {p.alt}
            </figcaption>
          </figure>
        ))}
      </div>
      <div className="pointer-events-none absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-ink to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-ink to-transparent" />
    </section>
  );
}
