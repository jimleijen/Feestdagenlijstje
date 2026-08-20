import { Router } from "express";
import { z } from "zod";
import { AuthedRequest, requireAuth } from "../middleware/auth";
import { prisma } from "../prisma";
import { getPriceComparison } from "../services/priceAggregator";

export const wishlistsRouter = Router();

// ---- Public routes (registered before requireAuth below) ----
// The person buying a gift is usually not the list owner and often has no account,
// mirroring how lijstje.nl works: anyone with the share link can view, reserve/afstrepen,
// undo a reservation, and see prices — without logging in.

wishlistsRouter.get("/shared/:shareCode", async (req, res) => {
  const wishlist = await prisma.wishlist.findUnique({
    where: { shareCode: req.params.shareCode },
    include: { items: { orderBy: { priority: "desc" } } },
  });
  if (!wishlist) return res.status(404).json({ error: "Lijstje niet gevonden" });
  res.json(wishlist);
});

const reserveSchema = z.object({ buyerName: z.string().min(1) });

wishlistsRouter.post("/shared/:shareCode/items/:itemId/reserve", async (req, res) => {
  const item = await ensureItemInSharedList(req.params.shareCode, req.params.itemId);
  if (!item) return res.status(404).json({ error: "Item niet gevonden" });
  if (item.reservedAt) return res.status(409).json({ error: "Dit cadeau is al door iemand anders afgestreept" });

  const parsed = reserveSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.issues[0].message });

  const updated = await prisma.wishlistItem.update({
    where: { id: item.id },
    data: { reservedByName: parsed.data.buyerName, reservedAt: new Date() },
  });
  res.json(updated);
});

// "Oeps, per ongeluk afgestreept" — reservation is only undoable by the same browser/session
// that made it in the UI (the app keeps a local record of what it reserved); the server itself
// doesn't gate this by identity so a forgetful buyer is never permanently locked out.
wishlistsRouter.post("/shared/:shareCode/items/:itemId/unreserve", async (req, res) => {
  const item = await ensureItemInSharedList(req.params.shareCode, req.params.itemId);
  if (!item) return res.status(404).json({ error: "Item niet gevonden" });

  const updated = await prisma.wishlistItem.update({
    where: { id: item.id },
    data: { reservedByName: null, reservedById: null, reservedAt: null },
  });
  res.json(updated);
});

async function ensureItemInSharedList(shareCode: string, itemId: string) {
  return prisma.wishlistItem.findFirst({ where: { id: itemId, wishlist: { shareCode } } });
}

// Price comparison is public too (item id only, same trust model as reserve/unreserve above) —
// buyers browsing a shared list need to see prices without an account.
wishlistsRouter.get("/items/:itemId/prices", async (req, res) => {
  const item = await prisma.wishlistItem.findUnique({ where: { id: req.params.itemId } });
  if (!item) return res.status(404).json({ error: "Item niet gevonden" });
  const comparison = await getPriceComparison(item.id, req.query.refresh === "true");
  res.json(comparison);
});

// ---- Owner-only routes below ----

wishlistsRouter.use(requireAuth);

wishlistsRouter.get("/", async (req: AuthedRequest, res) => {
  const wishlists = await prisma.wishlist.findMany({
    where: { ownerId: req.userId },
    orderBy: { createdAt: "desc" },
  });
  res.json(wishlists);
});

const createWishlistSchema = z.object({
  title: z.string().min(1),
  occasion: z.string().optional(),
});

wishlistsRouter.post("/", async (req: AuthedRequest, res) => {
  const parsed = createWishlistSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.issues[0].message });

  const wishlist = await prisma.wishlist.create({
    data: { ...parsed.data, ownerId: req.userId! },
  });
  res.status(201).json(wishlist);
});

wishlistsRouter.get("/:id", async (req: AuthedRequest, res) => {
  const wishlist = await prisma.wishlist.findFirst({
    where: { id: req.params.id, ownerId: req.userId },
    include: { items: { orderBy: { priority: "desc" } } },
  });
  if (!wishlist) return res.status(404).json({ error: "Lijstje niet gevonden" });
  res.json(wishlist);
});

wishlistsRouter.delete("/:id", async (req: AuthedRequest, res) => {
  const wishlist = await prisma.wishlist.findFirst({ where: { id: req.params.id, ownerId: req.userId } });
  if (!wishlist) return res.status(404).json({ error: "Lijstje niet gevonden" });
  await prisma.wishlist.delete({ where: { id: wishlist.id } });
  res.status(204).send();
});

// ---- Items ----

const itemSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  imageUrl: z.string().url().optional(),
  sourceUrl: z.string().url().optional(),
  priority: z.number().int().optional(),
});

wishlistsRouter.post("/:id/items", async (req: AuthedRequest, res) => {
  const wishlist = await prisma.wishlist.findFirst({ where: { id: req.params.id, ownerId: req.userId } });
  if (!wishlist) return res.status(404).json({ error: "Lijstje niet gevonden" });

  const parsed = itemSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.issues[0].message });

  const item = await prisma.wishlistItem.create({ data: { ...parsed.data, wishlistId: wishlist.id } });
  res.status(201).json(item);
});

wishlistsRouter.patch("/items/:itemId", async (req: AuthedRequest, res) => {
  const item = await prisma.wishlistItem.findFirst({
    where: { id: req.params.itemId, wishlist: { ownerId: req.userId } },
  });
  if (!item) return res.status(404).json({ error: "Item niet gevonden" });

  const parsed = itemSchema.partial().safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.issues[0].message });

  const updated = await prisma.wishlistItem.update({ where: { id: item.id }, data: parsed.data });
  res.json(updated);
});

wishlistsRouter.delete("/items/:itemId", async (req: AuthedRequest, res) => {
  const item = await prisma.wishlistItem.findFirst({
    where: { id: req.params.itemId, wishlist: { ownerId: req.userId } },
  });
  if (!item) return res.status(404).json({ error: "Item niet gevonden" });
  await prisma.wishlistItem.delete({ where: { id: item.id } });
  res.status(204).send();
});
