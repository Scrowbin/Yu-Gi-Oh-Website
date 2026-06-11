import path from "node:path";
import { fileURLToPath } from "node:url";

const srcDir = path.dirname(fileURLToPath(import.meta.url));

export const BACKEND_ROOT = path.resolve(srcDir, "../..");
export const CARD_IMAGES_DIR = path.join(BACKEND_ROOT, "card_images");
