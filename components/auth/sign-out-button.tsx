"use client";

import { signOut } from "next-auth/react";

import { Button } from "@/components/ui/button";

type SignOutButtonProps = {
  className?: string;
};

export function SignOutButton({ className }: SignOutButtonProps) {
  return (
    <Button
      className={className}
      type="button"
      onClick={() => signOut({ callbackUrl: "/login" })}
    >
      Se déconnecter
    </Button>
  );
}
