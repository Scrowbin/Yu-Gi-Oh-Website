import express from "express";
import cardRoutes from "./routes/cards.js";
import imageRoutes from "./routes/images.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { CARD_IMAGES_DIR } from "./lib/paths.js";

export function createApp() {
    const app = express();

    app.use(express.json());
    app.use("/card_images", express.static(CARD_IMAGES_DIR));
    app.use("/api/cards", cardRoutes);
    app.use("/api/images", imageRoutes);
    app.use(errorHandler);

    return app;
}
