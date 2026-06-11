import type { Request, Response } from "express";
import * as helperFunctions from "./helperFunctions.js";
import * as imageService from "../services/imageService.js";

export async function searchImageByName(req: Request, res: Response) {
    const name = helperFunctions.parseSearchName(req.query.name);
    const imageType = helperFunctions.parseImageType(req.query.type);
    const imageUrl = await imageService.searchImageByName(name, imageType);

    if (!imageUrl) {
        res.status(404).json({ error: "Card not found" });
        return;
    }

    res.json({ imageUrl });
}

export async function searchImageById(req: Request, res: Response) {
    const id = helperFunctions.parseCardId(
        helperFunctions.parseRouteParam(req.params.id, "card id"),
    );
    const imageType = helperFunctions.parseImageType(req.query.type);
    const imageUrl = await imageService.searchImageById(id, imageType);

    if (!imageUrl) {
        res.status(404).json({ error: "Card not found" });
        return;
    }

    res.json({ imageUrl });
}
