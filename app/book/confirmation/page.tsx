import type { Metadata } from "next";
import { Suspense } from "react";
import ConfirmationView from "@/components/booking/ConfirmationView";

export const metadata: Metadata = {
  title: "Your appointment — HAVN",
  robots: { index: false, follow: false },
};

export default function ConfirmationPage() {
  return (
    <div className="mx-auto max-w-[1280px] px-6 pb-32 pt-40 md:px-12 md:pt-52">
      <Suspense fallback={<p className="text-[0.9rem] text-gray">Loading…</p>}>
        <ConfirmationView />
      </Suspense>
    </div>
  );
}
