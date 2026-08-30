/** Authored icon set — one 24px grid, 1.75 stroke, round caps, currentColor. */
import type { SVGProps } from "react";

type P = SVGProps<SVGSVGElement>;

function Svg({ children, ...p }: P & { children: React.ReactNode }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="1em"
      height="1em"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...p}
    >
      {children}
    </svg>
  );
}

export const ThumbUp = (p: P) => (
  <Svg {...p}>
    <path d="M7 10.5V20H4.5A1.5 1.5 0 0 1 3 18.5v-6.5A1.5 1.5 0 0 1 4.5 10.5H7Z" />
    <path d="M7 10.5 11 3.5a2 2 0 0 1 2.9 2.4L13 10.5h5.6a2 2 0 0 1 2 2.5l-1.6 6A2 2 0 0 1 17 20.5H7" />
  </Svg>
);

export const ThumbDown = (p: P) => (
  <Svg {...p}>
    <path d="M17 13.5V4h2.5A1.5 1.5 0 0 1 21 5.5v6.5A1.5 1.5 0 0 1 19.5 13.5H17Z" />
    <path d="M17 13.5 13 20.5a2 2 0 0 1-2.9-2.4L11 13.5H5.4a2 2 0 0 1-2-2.5l1.6-6A2 2 0 0 1 7 3.5h10" />
  </Svg>
);

export const Search = (p: P) => (
  <Svg {...p}>
    <circle cx="11" cy="11" r="6.5" />
    <path d="m20 20-4.3-4.3" />
  </Svg>
);

export const Plus = (p: P) => (
  <Svg {...p}>
    <path d="M12 5v14M5 12h14" />
  </Svg>
);

export const ArrowLeft = (p: P) => (
  <Svg {...p}>
    <path d="M19 12H5M11 6l-6 6 6 6" />
  </Svg>
);

export const Chevron = (p: P) => (
  <Svg {...p}>
    <path d="m9 6 6 6-6 6" />
  </Svg>
);

export const Close = (p: P) => (
  <Svg {...p}>
    <path d="M6 6l12 12M18 6 6 18" />
  </Svg>
);

export const Restore = (p: P) => (
  <Svg {...p}>
    <path d="M4 9h9a6 6 0 1 1-5.7 7.8" />
    <path d="M4 4v5h5" />
  </Svg>
);

export const Trash = (p: P) => (
  <Svg {...p}>
    <path d="M4 7h16M10 4h4M9 7l.7 12.5A1.5 1.5 0 0 0 11.2 21h1.6a1.5 1.5 0 0 0 1.5-1.5L15 7" />
  </Svg>
);

export const Pencil = (p: P) => (
  <Svg {...p}>
    <path d="M4 20h4L19 9a2 2 0 0 0-3-3L5 17v3Z" />
    <path d="m14 6 3 3" />
  </Svg>
);

export const Sun = (p: P) => (
  <Svg {...p}>
    <circle cx="12" cy="12" r="4" />
    <path d="M12 3v2M12 19v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M3 12h2M19 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
  </Svg>
);

export const Moon = (p: P) => (
  <Svg {...p}>
    <path d="M20 14A8 8 0 1 1 10 4a6 6 0 0 0 10 10Z" />
  </Svg>
);

export const Monitor = (p: P) => (
  <Svg {...p}>
    <rect x="3" y="4" width="18" height="13" rx="1.5" />
    <path d="M8 21h8M12 17v4" />
  </Svg>
);
