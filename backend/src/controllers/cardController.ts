import type { Request, Response } from "express";
import { HttpError } from "../middleware/httpError.js";
import * as cardService from "../services/cardService.js";
import * as helperFunctions from "./helperFunctions.js";

export async function getCardById(req: Request, res: Response) {
    const card = await cardService.getCardById(
        helperFunctions.parseCardId(helperFunctions.parseRouteParam(req.params.id, "card id")),
    );

    if (!card) {
        res.status(404).json({ error: "Card not found" });
        return;
    }

    res.json(card);
}

export async function searchCards(req: Request, res: Response) {
    const name = helperFunctions.parseSearchName(req.query.name as unknown);
    const cards = await cardService.searchCardsByName(name);
    res.json(cards);
}
