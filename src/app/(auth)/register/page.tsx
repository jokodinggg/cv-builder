import { Suspense } from "react";
import { AuthForm } from "@/components/auth/auth-form";
import { googleEnabled } from "@/lib/auth";

export const metadata = { title: "Daftar" };

export default function Page() {
  return (
    <Suspense>
      <AuthForm mode="register" googleEnabled={googleEnabled} />
    </Suspense>
  );
}
