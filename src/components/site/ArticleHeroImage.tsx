import Image from "next/image";

interface ArticleHeroImageProps {
  src: string;
  alt: string;
  caption?: string;
}

export function ArticleHeroImage({ src, alt, caption }: ArticleHeroImageProps) {
  return (
    <div className="mb-8">
        <div className="relative aspect-video w-full rounded-lg overflow-hidden">
        <Image
            src={src}
            alt={alt}
            fill
            sizes="(max-width: 768px) 100vw, 1200px"
            className="object-cover"
            priority
        />
        </div>
        {caption && <p className="text-center text-sm text-muted-foreground mt-2">{caption}</p>}
    </div>
  );
}
