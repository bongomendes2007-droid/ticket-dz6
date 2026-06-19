const LOGO_URL =
  "https://res.cloudinary.com/dnth1inmv/image/upload/v1781874362/e85fb47d-da26-43d5-9702-f3dbe39f0df4_bbti2q.png";

type LogoProps = {
  /** "light" wraps the logo in a white chip for use on dark surfaces (e.g. footer) */
  variant?: "light" | "dark";
  /** logo height in px */
  height?: number;
  className?: string;
};

export default function Logo({
  variant = "dark",
  height = 40,
  className = "",
}: LogoProps) {
  const img = (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={LOGO_URL}
      alt="Ticket DZ6"
      style={{ height: `${height}px`, width: "auto", objectFit: "contain" }}
    />
  );

  if (variant === "light") {
    return (
      <span
        className={`inline-flex items-center rounded-xl bg-white px-4 py-2.5 shadow-soft ${className}`}
      >
        {img}
      </span>
    );
  }

  return (
    <span className={`inline-flex items-center ${className}`}>{img}</span>
  );
}
