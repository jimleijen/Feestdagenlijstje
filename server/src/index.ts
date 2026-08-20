import cors from "cors";
import "dotenv/config";
import express from "express";
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

const port = Number(process.env.PORT ?? 4000);
app.listen(port, () => console.log(`Feestdagenlijstje API listening on :${port}`));
