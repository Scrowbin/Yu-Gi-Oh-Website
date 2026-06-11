import { Router } from "express";
import {
    getCardById,
    searchCards,
} from "../controllers/cardController.js";
import { asyncHandler } from "../middleware/asyncHandler.js";

const router = Router();

router.get("/search/name", asyncHandler(searchCards));
router.get("/:id", asyncHandler(getCardById));

export default router;
