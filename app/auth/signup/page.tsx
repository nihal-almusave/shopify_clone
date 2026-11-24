import { SignupForm } from "@/components/auth/signup-form"

export const metadata = {
  title: "Create your free online store",
  description: "Sign up for ShopHub and open your online store in minutes. Free to start, no credit card required.",
  alternates: { canonical: "/auth/signup" },
  robots: { index: true, follow: true },
}

export default function SignupPage() {
  return <SignupForm />
}
