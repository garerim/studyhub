import { redirect } from "next/navigation";

import { getServerSession } from "next-auth";

import { authOptions } from "@/auth";
import { LoginForm } from "@/components/auth/login-form";

export default async function LoginPage() {
  const session = await getServerSession(authOptions);

  if (session?.user) {
    redirect("/dashboard");
  }

  return <LoginForm />;
}
