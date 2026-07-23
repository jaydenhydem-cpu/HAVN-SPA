import type { Metadata } from "next";
import { isAdminToken, listBookingsForAdmin } from "@/lib/booking/admin";
import { currentMode } from "@/lib/booking/db";
import AdminBookingsTable from "@/components/booking/AdminBookingsTable";

export const metadata: Metadata = {
  title: "Bookings — HAVN admin",
  robots: { index: false, follow: false },
};
export const dynamic = "force-dynamic";

/**
 * Minimal, token-gated admin view of bookings. Intentionally simple — a real
 * admin dashboard replaces this token check with proper auth. Set ADMIN_TOKEN
 * and open /admin/bookings?token=YOUR_TOKEN.
 */
export default async function AdminBookingsPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;

  const shell = (children: React.ReactNode) => (
    <div className="mx-auto max-w-[1100px] px-6 pb-32 pt-40 md:px-12 md:pt-52">{children}</div>
  );

  if (!process.env.ADMIN_TOKEN) {
    return shell(
      <>
        <p className="kicker">HAVN admin</p>
        <h1 className="type-chapter mt-6">Admin is disabled.</h1>
        <p className="measure mt-6 text-[0.95rem] text-gray">
          Set an <code className="text-ink">ADMIN_TOKEN</code> environment variable, then open{" "}
          <code className="text-ink">/admin/bookings?token=YOUR_TOKEN</code>.
        </p>
      </>
    );
  }

  if (!isAdminToken(token)) {
    return shell(
      <>
        <p className="kicker">HAVN admin</p>
        <h1 className="type-chapter mt-6">Enter admin token.</h1>
        <form method="get" className="mt-8 flex max-w-sm items-center gap-3">
          <input
            type="password"
            name="token"
            placeholder="Admin token"
            className="rule w-full bg-transparent pt-2 text-[0.95rem] outline-none"
            autoComplete="off"
          />
          <button className="rounded-full bg-ink px-6 py-3 text-[0.78rem] tracking-[0.06em] text-paper">Enter</button>
        </form>
      </>
    );
  }

  const [bookings, mode] = await Promise.all([listBookingsForAdmin(), currentMode()]);

  return shell(
    <>
      <p className="kicker">HAVN admin</p>
      <div className="mt-6 flex flex-wrap items-baseline justify-between gap-4">
        <h1 className="type-chapter">Bookings</h1>
        <span className="rounded-full border border-oak/70 px-3 py-1 text-[0.68rem] uppercase tracking-[0.1em] text-gray">
          {mode === "memory" ? "Dev store (in-memory)" : "Supabase"}
        </span>
      </div>
      <p className="measure mt-4 text-[0.9rem] text-gray">
        Managing staff, schedules, services and policy is config-as-code for now — edit{" "}
        <code className="text-ink">lib/booking/data/*</code> and reseed. This view manages live bookings.
      </p>
      <AdminBookingsTable bookings={bookings} token={token!} />
    </>
  );
}
