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
            // 1. Force the data to be an array if it isn't already
            let quotes = customData?.priceQuotes;
            if (!Array.isArray(quotes)) {
                throw new Error("Procurement status 2 requires an array of price-quotes.");
            }

            // 2. FORCE CONVERSION: Convert every element to a string explicitly
            const stringQuotes = quotes.map(q => String(q));

            // 3. Now validate the length and type
            if (stringQuotes.length < 2 || stringQuotes[0].trim() === "" || stringQuotes[1].trim() === "") {
                throw new Error("Procurement status 2 requires 2 price-quote strings.");
            }

            // Update the reference so the rest of the application uses the string versions
            customData.priceQuotes = stringQuotes;
        }

        if (targetStatus === 3) {
            if (typeof customData?.receipt !== "string" || !customData.receipt.trim()) {
                throw new Error("Procurement status 3 requires a receipt string.");
            }
        }
    }
}