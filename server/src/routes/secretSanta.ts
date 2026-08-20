import { z } from "zod";
import { AuthedRequest } from "../middleware/auth";
import { prisma } from "../prisma";
import { createDrawRouter } from "./draws";

// Secret Santa reuses the exact same draw engine as Lootjes trekken, but adds hints:
// each participant can write clues about themself, visible only to whoever draws them.
export const secretSantaRouter = createDrawRouter("SECRET_SANTA");

async function findMyParticipant(drawId: string, userId?: string) {
  const user = userId ? await prisma.user.findUnique({ where: { id: userId } }) : null;
  if (!user) return null;
  return prisma.drawParticipant.findFirst({ where: { drawId, email: user.email } });
}

const hintSchema = z.object({ text: z.string().min(1).max(500) });

// Write a hint about myself (only my own participant record, never someone else's).
secretSantaRouter.post("/:id/hints", async (req: AuthedRequest, res) => {
  const me = await findMyParticipant(req.params.id, req.userId);
  if (!me) return res.status(404).json({ error: "Je staat niet in deze Secret Santa" });

  const parsed = hintSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.issues[0].message });

  const hint = await prisma.hint.create({ data: { participantId: me.id, text: parsed.data.text } });
  res.status(201).json(hint);
});

secretSantaRouter.get("/:id/hints/mine", async (req: AuthedRequest, res) => {
  const me = await findMyParticipant(req.params.id, req.userId);
  if (!me) return res.status(404).json({ error: "Je staat niet in deze Secret Santa" });
  const hints = await prisma.hint.findMany({ where: { participantId: me.id }, orderBy: { createdAt: "desc" } });
  res.json(hints);
});

secretSantaRouter.delete("/:id/hints/:hintId", async (req: AuthedRequest, res) => {
  const me = await findMyParticipant(req.params.id, req.userId);
  if (!me) return res.status(404).json({ error: "Je staat niet in deze Secret Santa" });
  const hint = await prisma.hint.findFirst({ where: { id: req.params.hintId, participantId: me.id } });
  if (!hint) return res.status(404).json({ error: "Hint niet gevonden" });
  await prisma.hint.delete({ where: { id: hint.id } });
  res.status(204).send();
});

// Hints written by the person I'm buying a gift for — only unlocked once the draw has run
// and only ever scoped to *my* assignment, never a lookup of someone else's.
secretSantaRouter.get("/:id/my-hints-to-read", async (req: AuthedRequest, res) => {
  const draw = await prisma.nameDraw.findUnique({ where: { id: req.params.id } });
  if (!draw || draw.status !== "DRAWN") return res.status(404).json({ error: "Nog geen trekking om te bekijken" });

  const me = await findMyParticipant(req.params.id, req.userId);
  if (!me?.assignedToId) return res.status(404).json({ error: "Je staat niet in deze Secret Santa" });

  const hints = await prisma.hint.findMany({ where: { participantId: me.assignedToId }, orderBy: { createdAt: "desc" } });
  res.json(hints);
});
