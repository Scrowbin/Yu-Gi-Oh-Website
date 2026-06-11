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

