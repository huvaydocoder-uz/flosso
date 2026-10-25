import type { ElementType, HTMLAttributes, ReactNode } from "react";

export type FrameMode = "spin" | "hover" | "static";

/**
 * The one frame used across the site: a thin moulding line round a block with a red light
 * that slowly runs round it ("spin"), only while hovered ("hover"), or never ("static").
 * Drawn in CSS (.fframe in globals.css); it stops under prefers-reduced-motion.
 */
export function frameClass(mode: FrameMode = "spin", { onRed = false, glow = true } = {}) {
  return ["fframe", mode === "spin" && "fframe-spin", mode === "hover" && "fframe-hover", onRed && "fframe-on-red", glow && "fframe-glow"]
    .filter(Boolean)
    .join(" ");
}

export function FlossoFrame({
  as: Tag = "div",
  mode = "spin",
  onRed = false,
  className = "",
  children,
  ...rest
}: {
  as?: ElementType;
  mode?: FrameMode;
  onRed?: boolean;
  className?: string;
  children: ReactNode;
} & HTMLAttributes<HTMLElement>) {
  return (
    <Tag className={`${frameClass(mode, { onRed })} ${className}`} {...rest}>
      {children}
    </Tag>
  );
}
