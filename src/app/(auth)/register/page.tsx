import { Suspense } from "react";
import { AuthForm } from "@/components/auth/auth-form";
import { googleEnabled, turnstileSiteKey } from "@/lib/auth";

export const metadata = { title: "Daftar" };

export default function Page() {
  return (
    <Suspense>
      <AuthForm mode="register" googleEnabled={googleEnabled} captchaSiteKey={turnstileSiteKey} />
    </Suspense>
  );
}
