import { asyncHandler } from "../middleware/asyncHandler.js";
import { getRecentDecksByArchetype, getTopDecks } from "../controllers/deckController.js";
import { Router } from "express";

const router = Router();

router.get("/decks",asyncHandler(getRecentDecksByArchetype))


export default router;
