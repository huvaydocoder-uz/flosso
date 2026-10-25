"use client";

import type { ReactNode } from "react";
import { SECTION_IDS } from "@/lib/contact";
import { openSolution } from "@/lib/events";

/** a plain anchor that also selects the set when JS is running */
export function SolutionLink({ id, className, children }: { id: number; className?: string; children: ReactNode }) {
  return (
    <a
      href={`#${SECTION_IDS.solutions}`}
      onClick={(e) => {
        e.preventDefault();
        openSolution(id);
      }}
      className={className}
    >
      {children}
    </a>
  );
}
