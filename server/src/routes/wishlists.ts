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

function toPublicWishlist<T extends { owner: { name: string } }>(wishlist: T) {
  const { owner, ...rest } = wishlist;
  return { ...rest, ownerName: owner.name };
}

wishlistsRouter.get("/shared/:shareCode", async (req, res) => {
  const wishlist = await prisma.wishlist.findUnique({
    where: { shareCode: req.params.shareCode },
    include: { items: { orderBy: { priority: "desc" } }, owner: { select: { name: true } } },
  });
  if (!wishlist) return res.status(404).json({ error: "Lijstje niet gevonden" });
  res.json(toPublicWishlist(wishlist));
});

const reserveSchema = z.object({ buyerName: z.string().min(1), buyerEmail: z.string().email() });

wishlistsRouter.post("/shared/:shareCode/items/:itemId/reserve", async (req, res) => {
  const item = await ensureItemInSharedList(req.params.shareCode, req.params.itemId);
  if (!item) return res.status(404).json({ error: "Item niet gevonden" });
  if (item.reservedAt) return res.status(409).json({ error: "Dit cadeau is al door iemand anders afgestreept" });

  const parsed = reserveSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.issues[0].message });

  const updated = await prisma.wishlistItem.update({
    where: { id: item.id },
    data: { reservedByName: parsed.data.buyerName, reservedByEmail: parsed.data.buyerEmail, reservedAt: new Date() },
  });
  res.json(updated);
});

const unreserveSchema = z.object({ buyerEmail: z.string().email() });

// "Oeps, per ongeluk afgestreept" — only the person who made the reservation can undo it,
// matched by the email they gave when they crossed it off (nobody else browsing the list
// should be able to un-claim someone else's gift).
wishlistsRouter.post("/shared/:shareCode/items/:itemId/unreserve", async (req, res) => {
  const item = await ensureItemInSharedList(req.params.shareCode, req.params.itemId);
  if (!item) return res.status(404).json({ error: "Item niet gevonden" });

  const parsed = unreserveSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.issues[0].message });
  if (item.reservedByEmail !== parsed.data.buyerEmail) {
    return res.status(403).json({ error: "Dit is niet jouw afgestreepte cadeau" });
  }

  const updated = await prisma.wishlistItem.update({
    where: { id: item.id },
    data: { reservedByName: null, reservedById: null, reservedByEmail: null, reservedAt: null },
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

const wishlistHeaderFields = {
  title: z.string().min(1),
  occasion: z.string().optional(),
  location: z.string().optional(),
  dateLabel: z.string().optional(),
  note: z.string().optional(),
  photoUrl: z.string().optional(),
};

const createWishlistSchema = z.object(wishlistHeaderFields);

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
    include: { items: { orderBy: { priority: "desc" } }, owner: { select: { name: true } } },
  });
  if (!wishlist) return res.status(404).json({ error: "Lijstje niet gevonden" });
  res.json(toPublicWishlist(wishlist));
});

const updateWishlistSchema = z.object(wishlistHeaderFields).partial();

wishlistsRouter.patch("/:id", async (req: AuthedRequest, res) => {
  const wishlist = await prisma.wishlist.findFirst({ where: { id: req.params.id, ownerId: req.userId } });
  if (!wishlist) return res.status(404).json({ error: "Lijstje niet gevonden" });

  const parsed = updateWishlistSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.issues[0].message });

  const updated = await prisma.wishlist.update({ where: { id: wishlist.id }, data: parsed.data });
  res.json(updated);
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
