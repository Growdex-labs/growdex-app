"use client";

import Link from "next/link";
import { PRO_REQUIRED_MESSAGE } from "@/lib/billing";

export function ProRequiredNotice({
  message = PRO_REQUIRED_MESSAGE,
  className = "rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-900",
}: {
  message?: string;
  className?: string;
}) {
  return (
    <p className={className}>
      {message}{" "}
      <Link
        href="/panel/billing"
        className="font-gilroy-semibold underline underline-offset-2"
      >
        Upgrade to Pro
      </Link>
    </p>
  );
}
