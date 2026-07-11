import type { Metadata } from "next";
import BookingFlow from "@/components/BookingFlow";

export const metadata: Metadata = {
  title: "Book an appointment",
  description:
    "Reserve your hour of quiet at HAVN — choose a treatment, length and studio, and see your total as you go.",
  alternates: { canonical: "/book" },
};

export default function BookPage() {
  return (
    <div className="mx-auto max-w-[1280px] px-6 pb-32 pt-40 md:px-12 md:pt-52">
      <p className="kicker">Booking</p>
      <h1 className="type-chapter mt-10 max-w-[13em]">An hour, held for you.</h1>
      <p className="measure mt-8 text-[0.95rem] text-gray">
        Six small questions, answered at your pace. Nothing is charged online — your visit is
        settled at the studio.
      </p>
      <div className="mt-20">
        <BookingFlow />
      </div>
    </div>
  );
}
