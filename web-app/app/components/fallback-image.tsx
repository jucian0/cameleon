import React from "react";

type FallbackImageProps = React.ImgHTMLAttributes<HTMLImageElement> & {
  src: string;
  fallback: string;
  alt: string;
};

export function FallbackImage({
  src,
  fallback,
  alt,
  ...props
}: FallbackImageProps) {
  const [imgSrc, setImgSrc] = React.useState(src);

  return (
    <img
      key={imgSrc}
      src={imgSrc}
      alt={alt}
      onError={() => setImgSrc(fallback)}
      {...props}
    />
  );
}
