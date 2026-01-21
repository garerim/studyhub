"use client";

import { useState } from "react";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

export function RegisterForm() {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [gender, setGender] = useState<string>("");
  const [birthDate, setBirthDate] = useState<Date | undefined>(undefined);
  const router = useRouter();

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsLoading(true);

    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email") ?? "");
    const password = String(formData.get("password") ?? "");
    const confirmPassword = String(formData.get("confirmPassword") ?? "");
    const firstName = String(formData.get("firstName") ?? "");
    const lastName = String(formData.get("lastName") ?? "");
    const birthDateString = birthDate ? birthDate.toISOString().split('T')[0] : "";

    // Vérifier que les mots de passe correspondent
    if (password !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas.");
      setIsLoading(false);
      return;
    }

    // Vérifier que les conditions sont acceptées
    if (!acceptedTerms) {
      setError("Vous devez accepter les conditions d'utilisation.");
      setIsLoading(false);
      return;
    }

    // Vérifier que le sexe est sélectionné
    if (!gender) {
      setError("Veuillez sélectionner votre sexe.");
      setIsLoading(false);
      return;
    }

    const response = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ 
        email, 
        password, 
        firstName,
        lastName,
        gender,
        birthDate: birthDateString,
      }),
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
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="firstName">Prénom</Label>
              <Input 
                id="firstName" 
                name="firstName" 
                autoComplete="given-name"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="lastName">Nom</Label>
              <Input 
                id="lastName" 
                name="lastName" 
                autoComplete="family-name"
                required
              />
            </div>
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
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="gender">Sexe</Label>
              <Select value={gender} onValueChange={setGender} required>
                <SelectTrigger id="gender" className="w-full">
                  <SelectValue placeholder="Sélectionner" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Homme</SelectItem>
                  <SelectItem value="female">Femme</SelectItem>
                  <SelectItem value="other">Autre</SelectItem>
                  <SelectItem value="prefer-not-to-say">Je préfère ne pas dire</SelectItem>
                </SelectContent>
              </Select>
              <input type="hidden" name="gender" value={gender} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="birthDate">Date de naissance</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    id="birthDate"
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !birthDate && "text-muted-foreground"
                    )}
                    type="button"
                  >
                    <CalendarIcon className="mr-2 size-4" />
                    {birthDate ? (
                      format(birthDate, "PPP", { locale: fr })
                    ) : (
                      <span>Sélectionner une date</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={birthDate}
                    onSelect={setBirthDate}
                    disabled={(date) =>
                      date > new Date() ||
                      date > new Date(new Date().setFullYear(new Date().getFullYear() - 13))
                    }
                    captionLayout="dropdown"
                  />
                </PopoverContent>
              </Popover>
              <input
                type="hidden"
                name="birthDate"
                value={birthDate ? birthDate.toISOString().split('T')[0] : ""}
                required
              />
            </div>
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
          <div className="grid gap-2">
            <Label htmlFor="confirmPassword">Confirmer le mot de passe</Label>
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              minLength={8}
              autoComplete="new-password"
              required
            />
          </div>
          <div className="flex items-start gap-2">
            <Checkbox
              id="terms"
              checked={acceptedTerms}
              onCheckedChange={(checked) => setAcceptedTerms(checked === true)}
              required
            />
            <Label
              htmlFor="terms"
              className="text-sm font-normal leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              J&apos;accepte les{" "}
              <Link
                href="/conditions-utilisation"
                className="text-primary hover:underline"
                target="_blank"
              >
                conditions d&apos;utilisation
              </Link>
            </Label>
          </div>
          {error ? (
            <p className="text-sm text-destructive">{error}</p>
          ) : null}
          <Button type="submit" disabled={isLoading || !acceptedTerms}>
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
