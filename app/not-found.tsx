import Link from "next/link"

export default function NotFound() {
  return (
    <main className="grid min-h-screen place-items-center bg-[#fbfaf7] px-4 text-center">
      <div>
        <p className="font-display text-7xl font-bold text-[#0b3d2c]">404</p>
        <h1 className="mt-2 text-xl font-semibold">We couldn’t find that page</h1>
        <p className="mt-2 text-sm text-neutral-600">The store or product may have moved or no longer exists.</p>
        <Link href="/" className="mt-6 inline-flex h-11 items-center rounded-full bg-[#0b3d2c] px-6 text-sm font-semibold text-white">
          Go home
        </Link>
      </div>
    </main>
  )
}
