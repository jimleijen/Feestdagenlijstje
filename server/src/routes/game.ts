import { Router } from "express";
import { z } from "zod";
import { AuthedRequest, requireAuth } from "../middleware/auth";
import { prisma } from "../prisma";

export const gameRouter = Router();

// The classic dice-face rules for the "cadeautjesspel" (dobbelsteenspel), used to seed
// every new session. Hosts can edit any face's text afterwards.
export const DEFAULT_RULES: Record<number, string> = {
  1: "Iedereen schuift één cadeau door naar links.",
  2: "Ruil je cadeau met een speler naar keuze.",
  3: "Jij mag een nieuw cadeau uit de stapel pakken.",
  4: "Iedereen schuift één cadeau door naar rechts.",
  5: "Een speler naar keuze slaat een beurt over.",
  6: "Jij mag kiezen: houden wat je hebt, of een nieuw cadeau pakken.",
};

// Public read by join code — registered before requireAuth below so players in the room
// can load the ruleset on their own phone without an account.
gameRouter.get("/sessions/join/:joinCode", async (req, res) => {
  const session = await prisma.gameSession.findUnique({
    where: { joinCode: req.params.joinCode },
    include: { rules: { orderBy: { face: "asc" } } },
  });
  if (!session) return res.status(404).json({ error: "Spel niet gevonden" });
  res.json(session);
});

gameRouter.use(requireAuth);

const createSchema = z.object({ title: z.string().min(1) });

gameRouter.post("/sessions", async (req: AuthedRequest, res) => {
  const parsed = createSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.issues[0].message });

  const session = await prisma.gameSession.create({
    data: {
      title: parsed.data.title,
      hostId: req.userId!,
      rules: { create: Object.entries(DEFAULT_RULES).map(([face, text]) => ({ face: Number(face), text })) },
    },
    include: { rules: { orderBy: { face: "asc" } } },
  });
  res.status(201).json(session);
});

gameRouter.get("/sessions/:id", async (req: AuthedRequest, res) => {
  const session = await prisma.gameSession.findFirst({
    where: { id: req.params.id, hostId: req.userId },
    include: { rules: { orderBy: { face: "asc" } } },
  });
  if (!session) return res.status(404).json({ error: "Spel niet gevonden" });
  res.json(session);
});

const ruleSchema = z.object({ text: z.string().min(1).max(200) });

gameRouter.patch("/sessions/:id/rules/:face", async (req: AuthedRequest, res) => {
  const session = await prisma.gameSession.findFirst({ where: { id: req.params.id, hostId: req.userId } });
  if (!session) return res.status(404).json({ error: "Spel niet gevonden" });

  const face = Number(req.params.face);
  if (!Number.isInteger(face) || face < 1 || face > 6) return res.status(400).json({ error: "Ongeldig vlak (1-6)" });

  const parsed = ruleSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.issues[0].message });

  const rule = await prisma.gameRule.update({
    where: { sessionId_face: { sessionId: session.id, face } },
    data: { text: parsed.data.text },
  });
  res.json(rule);
});
