import { Suspense } from "react";
import { LoginForm } from "@/components/auth/login-form";
import { oauthProviders } from "@/lib/oauth-config";

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm google={oauthProviders.google} github={oauthProviders.github} />
    </Suspense>
  );
}
