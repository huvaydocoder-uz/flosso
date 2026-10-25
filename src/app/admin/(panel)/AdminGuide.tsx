import { Info } from "lucide-react";
import type { ReactNode } from "react";

/** a short "what is this page for" note at the top of an admin page */
export function AdminGuide({ children }: { children: ReactNode }) {
  return (
    <div className="mb-6 flex gap-3 rounded-[12px] border border-[#f0d9a8] bg-[#fff8e8] px-4 py-3.5 text-[14px] leading-relaxed text-[#5c4410]">
      <Info className="mt-0.5 size-5 shrink-0 text-[#b7791f]" aria-hidden="true" />
      <div className="space-y-1">{children}</div>
    </div>
  );
}
