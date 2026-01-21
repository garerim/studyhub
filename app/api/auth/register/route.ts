import { hash } from "bcryptjs";
import { NextResponse } from "next/server";
import { z } from "zod";

import { prisma } from "@/lib/prisma";

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  firstName: z.string().min(1).optional(),
  lastName: z.string().min(1).optional(),
  gender: z.enum(["male", "female", "other", "prefer-not-to-say"]).optional(),
  birthDate: z.string().optional(),
});

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = registerSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid payload" },
      { status: 400 },
    );
  }

  const existingUser = await prisma.user.findUnique({
    where: { email: parsed.data.email },
  });

  if (existingUser) {
    return NextResponse.json(
      { error: "Email already in use" },
      { status: 409 },
    );
  }

  const passwordHash = await hash(parsed.data.password, 12);

  // Convertir la date de naissance en DateTime si fournie
  const birthDate = parsed.data.birthDate
    ? new Date(parsed.data.birthDate)
    : null;

  const user = await prisma.user.create({
    data: {
      email: parsed.data.email,
      username: null,
      firstName: parsed.data.firstName || null,
      lastName: parsed.data.lastName || null,
      gender: parsed.data.gender || null,
      birthDate: birthDate,
      password: passwordHash,
    },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
    },
  });

  return NextResponse.json({ user }, { status: 201 });
}
