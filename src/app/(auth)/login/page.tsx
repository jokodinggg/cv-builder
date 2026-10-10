import { Suspense } from "react";
import { AuthForm } from "@/components/auth/auth-form";
import { googleEnabled } from "@/lib/auth";

export const metadata = { title: "Masuk" };

export default function Page() {
  return (
    <Suspense>
      <AuthForm mode="login" googleEnabled={googleEnabled} />
    </Suspense>
  );
}
