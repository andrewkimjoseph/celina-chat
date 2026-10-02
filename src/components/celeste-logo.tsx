const LOGO_SIZES = {
  xs: 28,
  sm: 32,
  md: 36,
  lg: 48,
} as const;

type LogoSize = keyof typeof LOGO_SIZES;

function BrandImage({
  px,
  alt,
  className = "",
}: {
  px: number;
  alt: string;
  className?: string;
}) {
  return (
    <span className={`inline-flex shrink-0 ${className}`} style={{ width: px, height: px }}>
      <img
        src="/celina-logo-black.png"
        alt={alt}
        width={px}
        height={px}
        className="size-full object-contain dark:hidden"
      />
      <img
        src="/celina-logo-yellow.png"
        alt=""
        width={px}
        height={px}
        className="hidden size-full object-contain dark:block"
        aria-hidden
      />
    </span>
  );
}

export function CelesteLogo({
  size = "sm",
  className = "",
}: {
  size?: LogoSize;
  className?: string;
}) {
  return <BrandImage px={LOGO_SIZES[size]} alt="Celina" className={className} />;
}

export function CelesteGlobeMark({ className = "" }: { className?: string }) {
  return (
    <span className={`mx-auto block size-20 sm:size-24 ${className}`}>
      <BrandImage px={96} alt="" className="size-full" />
    </span>
  );
}

export function CelesteLogoMark({ className = "" }: { className?: string }) {
  return (
    <span className={`mx-auto block size-36 sm:size-44 md:size-48 ${className}`}>
      <BrandImage px={192} alt="Celina Chat" className="size-full" />
    </span>
  );
}

export function CelesteLogoAvatar({
  size = "sm",
  className = "",
}: {
  size?: LogoSize;
  className?: string;
}) {
  return (
    <BrandImage
      px={LOGO_SIZES[size]}
      alt="Celina Chat"
      className={className}
    />
  );
}
