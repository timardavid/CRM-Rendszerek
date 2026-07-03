import { Suspense } from "react";
import { RegisterForm } from "@/components/auth/register-form";
import { oauthProviders } from "@/lib/oauth-config";

export default function RegisterPage() {
  return (
    <Suspense>
      <RegisterForm google={oauthProviders.google} github={oauthProviders.github} />
    </Suspense>
  );
}
