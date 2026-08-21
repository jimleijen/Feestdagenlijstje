import { Router } from "express";
import { z } from "zod";
import { AuthedRequest, requireAuth } from "../middleware/auth";
import { prisma } from "../prisma";
import { generateAssignments } from "../services/nameDraw";
import { sendMail } from "../services/mailer";

/**
 * Shared implementation behind both /api/lootjes and /api/secret-santa — same data model
 * and draw engine, "kind" only changes labelling/copy and which extra features are mounted
 * (Secret Santa gets hints on top, see secretSanta.ts).
 */
export function createDrawRouter(kind: "LOOTJES" | "SECRET_SANTA") {
  const router = Router();

  // Public self-join by code — registered before requireAuth below so someone who received
  // a join code (shared outside the app, e.g. via WhatsApp) can add themselves without an
  // account, mirroring the "deel uitnodigingslink" flow. Only exposes the draw's title/
  // status, never the participant list, so joining doesn't leak who else is already in.
  const joinSchema = z.object({ name: z.string().min(1), email: z.string().email() });

  router.get("/join/:joinCode", async (req, res) => {
    const draw = await prisma.nameDraw.findFirst({ where: { joinCode: req.params.joinCode, kind } });
    if (!draw) return res.status(404).json({ error: "Trekking niet gevonden" });
    res.json({ id: draw.id, title: draw.title, status: draw.status });
  });

  router.post("/join/:joinCode", async (req, res) => {
    const draw = await prisma.nameDraw.findFirst({ where: { joinCode: req.params.joinCode, kind } });
    if (!draw) return res.status(404).json({ error: "Trekking niet gevonden" });
    if (draw.status !== "OPEN") return res.status(409).json({ error: "Deze trekking is al geloot, aanmelden kan niet meer" });

    const parsed = joinSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.issues[0].message });

    const existing = await prisma.drawParticipant.findFirst({ where: { drawId: draw.id, email: parsed.data.email } });
    if (existing) return res.status(409).json({ error: "Dit e-mailadres staat al in deze trekking" });

    const linkedUser = await prisma.user.findUnique({ where: { email: parsed.data.email } });
    const participant = await prisma.drawParticipant.create({
      data: {
        drawId: draw.id,
        name: parsed.data.name,
        email: parsed.data.email,
        userId: linkedUser?.id,
        excludeIds: "[]",
      },
    });
    res.status(201).json({ id: participant.id, name: participant.name });
  });

  router.use(requireAuth);

  router.get("/", async (req: AuthedRequest, res) => {
    const draws = await prisma.nameDraw.findMany({
      where: { ownerId: req.userId, kind },
      orderBy: { createdAt: "desc" },
      include: { participants: true },
    });
    res.json(draws);
  });

  const createSchema = z.object({
    title: z.string().min(1),
    budget: z.string().optional(),
    eventDate: z.coerce.date().optional(),
  });

  router.post("/", async (req: AuthedRequest, res) => {
    const parsed = createSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.issues[0].message });
    const draw = await prisma.nameDraw.create({ data: { ...parsed.data, kind, ownerId: req.userId! } });
    res.status(201).json(draw);
  });

  router.get("/:id", async (req: AuthedRequest, res) => {
    const draw = await prisma.nameDraw.findFirst({
      where: { id: req.params.id, ownerId: req.userId, kind },
      include: { participants: { select: { id: true, name: true, email: true, excludeIds: true } } },
    });
    if (!draw) return res.status(404).json({ error: "Trekking niet gevonden" });
    res.json(draw);
  });

  const participantSchema = z.object({
    name: z.string().min(1),
    email: z.string().email(),
    excludeIds: z.array(z.string()).optional(),
  });

  router.post("/:id/participants", async (req: AuthedRequest, res) => {
    const draw = await prisma.nameDraw.findFirst({ where: { id: req.params.id, ownerId: req.userId, kind } });
    if (!draw) return res.status(404).json({ error: "Trekking niet gevonden" });
    if (draw.status !== "OPEN") return res.status(409).json({ error: "Er is al geloot, deelnemers toevoegen kan niet meer" });

    const parsed = participantSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.issues[0].message });

    const linkedUser = await prisma.user.findUnique({ where: { email: parsed.data.email } });
    const participant = await prisma.drawParticipant.create({
      data: {
        drawId: draw.id,
        name: parsed.data.name,
        email: parsed.data.email,
        userId: linkedUser?.id,
        excludeIds: JSON.stringify(parsed.data.excludeIds ?? []),
      },
    });
    res.status(201).json(participant);
  });

  router.delete("/:id/participants/:participantId", async (req: AuthedRequest, res) => {
    const draw = await prisma.nameDraw.findFirst({ where: { id: req.params.id, ownerId: req.userId, kind } });
    if (!draw) return res.status(404).json({ error: "Trekking niet gevonden" });
    if (draw.status !== "OPEN") return res.status(409).json({ error: "Er is al geloot, deelnemers verwijderen kan niet meer" });
    await prisma.drawParticipant.delete({ where: { id: req.params.participantId } });
    res.status(204).send();
  });

  const exclusionsSchema = z.object({ excludeIds: z.array(z.string()) });

  // Sets who a participant may NOT draw (e.g. their partner) — separate from creation so the
  // organiser can set this up in its own step once everyone's already been added.
  router.patch("/:id/participants/:participantId/exclusions", async (req: AuthedRequest, res) => {
    const draw = await prisma.nameDraw.findFirst({ where: { id: req.params.id, ownerId: req.userId, kind } });
    if (!draw) return res.status(404).json({ error: "Trekking niet gevonden" });
    if (draw.status !== "OPEN") return res.status(409).json({ error: "Er is al geloot, uitsluitingen aanpassen kan niet meer" });

    const parsed = exclusionsSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.issues[0].message });

    const participant = await prisma.drawParticipant.findFirst({
      where: { id: req.params.participantId, drawId: draw.id },
    });
    if (!participant) return res.status(404).json({ error: "Deelnemer niet gevonden" });

    const updated = await prisma.drawParticipant.update({
      where: { id: participant.id },
      data: { excludeIds: JSON.stringify(parsed.data.excludeIds) },
    });
    res.json({ id: updated.id, excludeIds: JSON.parse(updated.excludeIds) });
  });

  // Runs the draw, e-mails every participant who they have, and flips status to DRAWN.
  // The mapping itself is never in the response — only the admin-peek and the
  // participant's own my-assignment endpoint ever reveal an assignment.
  router.post("/:id/run", async (req: AuthedRequest, res) => {
    const draw = await prisma.nameDraw.findFirst({
      where: { id: req.params.id, ownerId: req.userId, kind },
      include: { participants: true },
    });
    if (!draw) return res.status(404).json({ error: "Trekking niet gevonden" });
    if (draw.status !== "OPEN") return res.status(409).json({ error: "Er is al geloot" });
    if (draw.participants.length < 3) {
      return res.status(400).json({ error: "Minimaal 3 deelnemers nodig om te kunnen loten" });
    }

    const assignments = generateAssignments(
      draw.participants.map((p) => ({ id: p.id, excludeIds: JSON.parse(p.excludeIds) as string[] }))
    );
    if (!assignments) {
      return res.status(400).json({
        error: "Loten lukt niet met deze uitsluitingen (bv. iemand die iedereen behalve zijn partner uitsluit). Pas de uitsluitingen aan.",
      });
    }

    await prisma.$transaction([
      ...Object.entries(assignments).map(([giverId, receiverId]) =>
        prisma.drawParticipant.update({ where: { id: giverId }, data: { assignedToId: receiverId } })
      ),
      prisma.nameDraw.update({ where: { id: draw.id }, data: { status: "DRAWN", drawnAt: new Date() } }),
    ]);

    const byId = new Map(draw.participants.map((p) => [p.id, p]));
    const label = kind === "SECRET_SANTA" ? "Secret Santa" : "Lootjes trekken";
    await Promise.all(
      Object.entries(assignments).map(([giverId, receiverId]) => {
        const giver = byId.get(giverId)!;
        const receiver = byId.get(receiverId)!;
        return sendMail(
          giver.email,
          `${label}: "${draw.title}" — jij hebt getrokken!`,
          `Hoi ${giver.name},\n\nDe trekking voor "${draw.title}" is gedaan. Jij geeft een cadeau aan: ${receiver.name}.\n\nBen je dit later vergeten? Log in op Feestdagenlijstje en kijk bij "${label}" om het weer op te zoeken.\n\nVeel plezier!`
        );
      })
    );

    res.json({ status: "DRAWN", participantCount: draw.participants.length });
  });

  // Secret admin peek: the organiser can look up who has who if someone forgot, without
  // it being visible anywhere else in the UI by default.
  router.get("/:id/admin-peek", async (req: AuthedRequest, res) => {
    const draw = await prisma.nameDraw.findFirst({
      where: { id: req.params.id, ownerId: req.userId, kind },
      include: { participants: true },
    });
    if (!draw) return res.status(404).json({ error: "Trekking niet gevonden" });
    if (draw.status !== "DRAWN") return res.status(409).json({ error: "Er is nog niet geloot" });

    const byId = new Map(draw.participants.map((p) => [p.id, p.name]));
    const assignments = draw.participants.map((p) => ({
      giver: p.name,
      receiver: p.assignedToId ? byId.get(p.assignedToId) ?? "?" : "?",
    }));
    res.json({ assignments });
  });

  // A participant looking themself up: only works if they're logged in with the same
  // e-mail address they were entered with, so a forgetful buyer can self-serve.
  router.get("/:id/my-assignment", async (req: AuthedRequest, res) => {
    const user = await prisma.user.findUnique({ where: { id: req.userId } });
    const draw = await prisma.nameDraw.findFirst({ where: { id: req.params.id, kind } });
    if (!draw || draw.status !== "DRAWN" || !user) {
      return res.status(404).json({ error: "Nog geen trekking om te bekijken" });
    }
    const me = await prisma.drawParticipant.findFirst({
      where: { drawId: draw.id, email: user.email },
      include: { assignedTo: true },
    });
    if (!me || !me.assignedTo) return res.status(404).json({ error: "Je staat niet in deze trekking" });
    res.json({ receiverName: me.assignedTo.name, receiverParticipantId: me.assignedTo.id });
  });

  return router;
}
