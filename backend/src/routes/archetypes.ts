import { Router } from "express";
// import {} from the Controller
import { asyncHandler } from "../middleware/asyncHandler.js";

const router = Router();

router.get("/top",asyncHandler());

router.get("/:id",asyncHandler());
//return cards from the archetype

export default router;
