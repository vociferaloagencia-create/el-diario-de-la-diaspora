import Image from "next/image";
import Link from "next/link";

interface HorizontalBannerProps {
  imageUrl: string;
  linkUrl: string;
  width?: number;
  height?: number;
}

export function HorizontalBanner({ imageUrl, linkUrl, width = 728, height = 90 }: HorizontalBannerProps) {
  return (
    <div className="my-8 flex justify-center">
      <Link href={linkUrl} target="_blank" rel="noopener noreferrer">
        <Image
          src={imageUrl}
          alt="Advertisement"
          width={width}
          height={height}
          className="object-contain"
        />
      </Link>
    </div>
  );
}
