"use client";

import type { AnchorHTMLAttributes, ReactNode } from "react";
import { CONTACT } from "@/lib/contact";
import { openInstagram } from "@/lib/social";

type Props = Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href" | "target" | "rel"> & { children: ReactNode };

/** Instagram profile: the app on a phone, the web page elsewhere */
export function InstagramLink({ onClick, ...rest }: Props) {
  return (
    <a
      {...rest}
      href={CONTACT.instagramHref}
      target="_blank"
      rel="noopener noreferrer"
      onClick={(e) => {
        onClick?.(e);
        openInstagram(e);
      }}
    />
  );
}

/** the Telegram page (no prefilled text) */
export function TelegramLink(props: Props) {
  return <a {...props} href={CONTACT.telegramHref} target="_blank" rel="noopener noreferrer" />;
}

/** the YouTube channel */
export function YouTubeLink(props: Props) {
  return <a {...props} href={CONTACT.youtubeHref} target="_blank" rel="noopener noreferrer" />;
}
