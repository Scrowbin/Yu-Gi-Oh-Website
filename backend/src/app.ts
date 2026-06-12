import express from "express";
import cardRoutes from "./routes/cards.js";
import imageRoutes from "./routes/images.js";
// import deckRoutes from "./routes/decks.js";

import { errorHandler } from "./middleware/errorHandler.js";
import { CARD_IMAGES_DIR } from "./lib/paths.js";

export function createApp() {
    const app = express();

    app.use(express.json());
    app.use("/card_images", express.static(CARD_IMAGES_DIR));
    app.use("/api/cards", cardRoutes);
    app.use("/api/images", imageRoutes);
    // implementing deck
    // app.use("api/deck", deckRoutes);


    app.use(errorHandler);

    return app;
}
