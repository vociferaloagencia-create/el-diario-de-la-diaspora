import Image from "next/image";
import Link from "next/link";

interface VerticalBannerProps {
  imageUrl: string;
  linkUrl: string;
  width?: number;
  height?: number;
}

export function VerticalBanner({ imageUrl, linkUrl, width = 300, height = 600 }: VerticalBannerProps) {
  return (
    <div className="my-6 flex justify-center">
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
