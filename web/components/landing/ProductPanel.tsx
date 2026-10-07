"use client";

import Image from "next/image";

/** Reusable screenshot panel with window chrome */
export function ProductPanel({
  src,
  alt,
  className = "",
  priority = false,
}: {
  src: string;
  alt: string;
  className?: string;
  priority?: boolean;
}) {
  return (
    <div className={`landing-panel ${className}`}>
      <div className="landing-panel__chrome">
        <span className="landing-panel__dot landing-panel__dot--red" />
        <span className="landing-panel__dot landing-panel__dot--yellow" />
        <span className="landing-panel__dot landing-panel__dot--green" />
      </div>
      <Image
        src={src}
        alt={alt}
        width={1440}
        height={900}
        quality={90}
        priority={priority}
        className="w-full h-auto"
        sizes="(max-width: 768px) 100vw, (max-width: 1280px) 60vw, 800px"
      />
    </div>
  );
}
