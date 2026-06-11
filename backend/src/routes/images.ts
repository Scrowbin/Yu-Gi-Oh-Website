import { Router } from "express";
import {
    searchImageById,
    searchImageByName,
} from "../controllers/imageController.js";
import { asyncHandler } from "../middleware/asyncHandler.js";

const router = Router();

router.get("/search/name", asyncHandler(searchImageByName));
router.get("/:id", asyncHandler(searchImageById));

export default router;
