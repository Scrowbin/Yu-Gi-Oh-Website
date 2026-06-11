import { HttpError } from "../middleware/httpError.js";

export function parseCardId(raw: string): number {
    const id = Number(raw);
    if (!Number.isInteger(id) || id <= 0) {
        throw new HttpError(400, "Invalid card id");
    }
    return id;
}

export function parseSearchName(raw: unknown): string {
    if (typeof raw !== "string" || !raw.trim()) {
        throw new HttpError(400, "Query parameter 'name' is required");
    }
    return raw.trim();
}

export function parseRouteParam(raw: unknown, label: string): string {
    if (typeof raw !== "string" || !raw) {
        throw new HttpError(400, `Invalid ${label}`);
    }
    return raw;
}

const IMAGE_TYPES = new Set(["cropped", "full", "small"]);

export function parseImageType(raw: unknown): "cropped" | "full" | "small" {
    const value = typeof raw === "string" ? raw : "full";
    if (!IMAGE_TYPES.has(value)) {
        throw new HttpError(400, "Query parameter 'type' must be cropped, full, or small");
    }
    return value as "cropped" | "full" | "small";
}
