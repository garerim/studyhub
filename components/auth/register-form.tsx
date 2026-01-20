"use client";

import { useState } from "react";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function RegisterForm() {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsLoading(true);

    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email") ?? "");
    const password = String(formData.get("password") ?? "");
    const name = String(formData.get("name") ?? "");

    const response = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, name }),
    });

    if (!response.ok) {
      const payload = (await response.json()) as { error?: string };
      setIsLoading(false);
      setError(payload.error ?? "Impossible de créer le compte.");
      return;
    }

    const signInResult = await signIn("credentials", {
      email,
      password,
      redirect: false,
      callbackUrl: "/dashboard",
    });

    setIsLoading(false);

    if (signInResult?.error) {
      setError("Compte créé, mais connexion impossible.");
      return;
    }

    router.push(signInResult?.url ?? "/dashboard");
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="gap-2 text-center">
        <CardTitle className="text-2xl">Créer un compte</CardTitle>
        <p className="text-muted-foreground text-sm">
          Remplis les champs pour commencer.
        </p>
      </CardHeader>
      <CardContent>
        <form className="grid gap-4" onSubmit={onSubmit}>
          <div className="grid gap-2">
            <Label htmlFor="name">Nom</Label>
            <Input id="name" name="name" autoComplete="name" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="password">Mot de passe</Label>
            <Input
              id="password"
              name="password"
              type="password"
              minLength={8}
              autoComplete="new-password"
              required
            />
          </div>
          {error ? (
            <p className="text-sm text-destructive">{error}</p>
          ) : null}
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Création..." : "Créer un compte"}
          </Button>
          <p className="text-center text-sm text-muted-foreground">
            Déjà un compte ?{" "}
            <Link className="text-primary hover:underline" href="/login">
              Se connecter
            </Link>
          </p>
        </form>
      </CardContent>
    </Card>
  );
}
