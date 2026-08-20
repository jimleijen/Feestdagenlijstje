import bcrypt from "bcryptjs";
import { Router } from "express";
import { z } from "zod";
import { AuthedRequest, requireAuth, signToken } from "../middleware/auth";
import { prisma } from "../prisma";

export const authRouter = Router();

authRouter.get("/me", requireAuth, async (req: AuthedRequest, res) => {
  const user = await prisma.user.findUnique({ where: { id: req.userId } });
  if (!user) return res.status(404).json({ error: "Gebruiker niet gevonden" });
  res.json({ id: user.id, name: user.name, email: user.email });
});

const registerSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(8),
});

authRouter.post("/register", async (req, res) => {
  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.issues[0].message });
  }
  const { name, email, password } = parsed.data;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return res.status(409).json({ error: "Er bestaat al een account met dit e-mailadres" });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({ data: { name, email, passwordHash } });

  res.status(201).json({ token: signToken(user.id), user: { id: user.id, name: user.name, email: user.email } });
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

authRouter.post("/login", async (req, res) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.issues[0].message });
  }
  const { email, password } = parsed.data;

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    return res.status(401).json({ error: "E-mailadres of wachtwoord onjuist" });
  }

  res.json({ token: signToken(user.id), user: { id: user.id, name: user.name, email: user.email } });
});
