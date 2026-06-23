import type { ReactNode } from "react";

type IconProps = {
  className?: string;
};

function IconBase({
  className = "size-5",
  children,
}: IconProps & { children: ReactNode }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}

const strokeProps = {
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

export function GridIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M4 4h6v6H4V4ZM14 4h6v6h-6V4ZM4 14h6v6H4v-6ZM14 14h6v6h-6v-6Z" {...strokeProps} />
    </IconBase>
  );
}

export function BuildingIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M4 21V9.5a2 2 0 0 1 2-2h4V5a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v16" {...strokeProps} />
      <path d="M8 21v-5h4v5M8 11h.01M12 11h.01M16 7h.01M16 11h.01M16 15h.01" {...strokeProps} />
    </IconBase>
  );
}

export function MessageIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M5 5h14v11H8l-3 3V5Z" {...strokeProps} />
    </IconBase>
  );
}

export function ShieldIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M12 3 5.5 5.4v5.4c0 4.3 2.7 8.2 6.5 9.7 3.8-1.5 6.5-5.4 6.5-9.7V5.4L12 3Z" {...strokeProps} />
      <path d="m9 12 2 2 4-4" {...strokeProps} />
    </IconBase>
  );
}

export function CheckIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="m5 12 4 4L19 6" {...strokeProps} />
    </IconBase>
  );
}

export function SettingsIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z" {...strokeProps} />
      <path d="M19.4 15a1.6 1.6 0 0 0 .3 1.8l.1.1a2 2 0 0 1-2.8 2.8l-.1-.1a1.6 1.6 0 0 0-1.8-.3 1.6 1.6 0 0 0-1 1.5V21a2 2 0 0 1-4 0v-.2a1.6 1.6 0 0 0-1-1.5 1.6 1.6 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.6 1.6 0 0 0 .3-1.8 1.6 1.6 0 0 0-1.5-1H3a2 2 0 0 1 0-4h.2a1.6 1.6 0 0 0 1.5-1 1.6 1.6 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.6 1.6 0 0 0 1.8.3h.1a1.6 1.6 0 0 0 .9-1.5V3a2 2 0 0 1 4 0v.2a1.6 1.6 0 0 0 1 1.5 1.6 1.6 0 0 0 1.8-.3l.1-.1a2 2 0 0 1 2.8 2.8l-.1.1a1.6 1.6 0 0 0-.3 1.8v.1a1.6 1.6 0 0 0 1.5.9h.2a2 2 0 0 1 0 4h-.2a1.6 1.6 0 0 0-1.5 1Z" {...strokeProps} />
    </IconBase>
  );
}

export function BookmarkIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M6 4h12v17l-6-3-6 3V4Z" {...strokeProps} />
    </IconBase>
  );
}

export function HeartIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M20.8 5.8a5 5 0 0 0-7.1 0L12 7.5l-1.7-1.7a5 5 0 0 0-7.1 7.1L12 21l8.8-8.1a5 5 0 0 0 0-7.1Z" {...strokeProps} />
    </IconBase>
  );
}

export function BriefcaseIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M10 6V5a2 2 0 0 1 2-2h0a2 2 0 0 1 2 2v1M4 7h16v12H4V7Z" {...strokeProps} />
      <path d="M4 12h16M12 12v2" {...strokeProps} />
    </IconBase>
  );
}

export function BellIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M18 8a6 6 0 1 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9ZM10 21h4" {...strokeProps} />
    </IconBase>
  );
}

export function PlusIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M12 5v14M5 12h14" {...strokeProps} />
    </IconBase>
  );
}

export function LogoutIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M10 17 15 12l-5-5M15 12H3M21 4v16" {...strokeProps} />
    </IconBase>
  );
}

export function EyeIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6Z" {...strokeProps} />
      <path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" {...strokeProps} />
    </IconBase>
  );
}

export function TrendingIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="m4 16 6-6 4 4 6-7M15 7h5v5" {...strokeProps} />
    </IconBase>
  );
}

export function UsersIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M16 20v-1.5a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4V20M9.5 10.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7ZM21 20v-1.5a4 4 0 0 0-3-3.9M15 3.6a3.5 3.5 0 0 1 0 6.8" {...strokeProps} />
    </IconBase>
  );
}

export function StarIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="m12 3 2.7 5.5 6 .9-4.4 4.2 1.1 6-5.4-2.9-5.4 2.9 1.1-6-4.4-4.2 6-.9L12 3Z" {...strokeProps} />
    </IconBase>
  );
}

export function PinIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M12 21s7-5.2 7-11a7 7 0 1 0-14 0c0 5.8 7 11 7 11Z" {...strokeProps} />
      <path d="M12 10.5h.01" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </IconBase>
  );
}

export function ArrowUpRightIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M7 17 17 7M9 7h8v8" {...strokeProps} />
    </IconBase>
  );
}

export function EditIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5Z" {...strokeProps} />
    </IconBase>
  );
}

export function UploadIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M12 3v12M7 8l5-5 5 5M5 21h14" {...strokeProps} />
    </IconBase>
  );
}

export function KeyIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M15 7a4 4 0 1 1 2 3.5L10.5 17H8v2H6v2H3v-3l7.5-7.5A4 4 0 0 1 15 7Z" {...strokeProps} />
    </IconBase>
  );
}

export function BarChartIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M4 20V10M10 20V4M16 20v-6M22 20V8" {...strokeProps} />
    </IconBase>
  );
}

export function FileIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M8 4h8l4 4v12H8V4Z" {...strokeProps} />
      <path d="M16 4v4h4" {...strokeProps} />
    </IconBase>
  );
}
