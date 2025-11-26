import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"

export default function VerifyEmailPage() {
  return (
    <div className="w-full max-w-md">
      <Card className="border-slate-700 bg-slate-800">
        <CardHeader>
          <CardTitle className="text-2xl text-white">Verify Your Email</CardTitle>
          <CardDescription className="text-slate-400">We sent a confirmation link to your email</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-6">
          <p className="text-slate-300">
            Check your inbox and click the link to verify your email address. This helps us keep your account secure.
          </p>
          <p className="text-sm text-slate-400">
            Once verified, you&apos;ll be able to access your dashboard and start setting up your store.
          </p>
          <Link href="/merchant/auth/login">
            <Button className="w-full">Back to Sign In</Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  )
}
