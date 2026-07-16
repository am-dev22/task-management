import { ITaskStrategy } from "./ITaskStrategy";

export class ProcurementStrategy implements ITaskStrategy {
    readonly taskType = "procurement";
    readonly maxStatus = 3;

    getStatusName(status: number): string {
        switch (status) {
            case 1: return "Created";
            case 2: return "Supplier offers received";
            case 3: return "Purchase completed";
            default: return "Unknown";
        }
    }

    validateStatusTransition(targetStatus: number, customData: Record<string, any>): void {
        if (targetStatus === 2) {
            // Must contain two quote strings
            const quotes = customData?.priceQuotes;
            if (!Array.isArray(quotes) || quotes.length < 2 || typeof quotes[0] !== "string" || typeof quotes[1] !== "string") {
                throw new Error("Procurement status 2 requires 2 price-quote strings.");
            }
        }

        if (targetStatus === 3) {
            // Must contain a receipt string
            if (typeof customData?.receipt !== "string" || !customData.receipt.trim()) {
                throw new Error("Procurement status 3 requires a receipt string.");
            }
        }
    }
}