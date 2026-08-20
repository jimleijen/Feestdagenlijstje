import "express-async-errors";
import cors from "cors";
import "dotenv/config";
import express, { NextFunction, Request, Response } from "express";
import { authRouter } from "./routes/auth";
import { gameRouter } from "./routes/game";
import { lootjesRouter } from "./routes/lootjes";
import { secretSantaRouter } from "./routes/secretSanta";
import { wishlistsRouter } from "./routes/wishlists";

const app = express();
app.use(cors());
app.use(express.json());

app.get("/health", (_req, res) => res.json({ ok: true }));

app.use("/api/auth", authRouter);
app.use("/api/wishlists", wishlistsRouter);
app.use("/api/lootjes", lootjesRouter);
app.use("/api/secret-santa", secretSantaRouter);
app.use("/api/game", gameRouter);

// Without express-async-errors, a rejected promise inside an async route handler is an
// unhandled rejection that crashes the whole process instead of just failing one request.
// This catches everything that reaches here (including those forwarded errors) and always
// responds instead of leaving the request hanging or taking the server down.
app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  console.error(err);
  res.status(500).json({ error: "Er ging iets mis. Probeer het opnieuw." });
});

const port = Number(process.env.PORT ?? 4000);
app.listen(port, () => console.log(`Feestdagenlijstje API listening on :${port}`));
