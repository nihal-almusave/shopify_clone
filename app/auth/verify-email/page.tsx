import Link from "next/link"
import { MailCheck } from "lucide-react"

export const metadata = { title: "Check your email" }

export default async function VerifyEmailPage({ searchParams }: { searchParams: Promise<{ email?: string }> }) {
  const { email } = await searchParams
  return (
    <div className="text-center">
      <div className="mx-auto mb-4 grid size-14 place-items-center rounded-full bg-[#dcfce9] text-[#0b3d2c]">
        <MailCheck className="size-7" />
      </div>
      <h1 className="font-display text-[34px] leading-tight font-bold tracking-[-0.035em]">Check your email</h1>
      <p className="mt-2 text-sm text-[#5d6b63]">
        We sent a confirmation link to {email ? <strong className="text-[#12201a]">{email}</strong> : "your inbox"}. Click it
        to open your store admin.
      </p>
      <Link href="/auth/login" className="btn-secondary mt-6 h-11 w-full text-sm">
        Back to log in
      </Link>
    </div>
  )
}
