export function LogoMark({ className = "h-6 w-6" }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className={className}
    >
      <path
        d="M12 4.5c1.2 2.1 3.1 3.1 3.1 5.7 0 1.4-.7 2.5-1.7 3.3.1-.5.1-.9 0-1.4-.2-.9-.8-1.7-1.8-2.5-.2 1.5-1.2 2.3-2 3.2-.7.8-1.1 1.6-1.1 2.6 0 1.9 1.5 3.3 3.5 3.3s3.5-1.4 3.5-3.4c0-2.4-1.4-4.2-3.1-5.8"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <ellipse
        cx="12"
        cy="12"
        rx="9.1"
        ry="4.1"
        transform="rotate(28 12 12)"
        stroke="currentColor"
        strokeWidth="1.25"
        opacity=".9"
      />
      <ellipse
        cx="12"
        cy="12"
        rx="9.1"
        ry="4.1"
        transform="rotate(-28 12 12)"
        stroke="currentColor"
        strokeWidth="1.25"
        opacity=".9"
      />
    </svg>
  );
}