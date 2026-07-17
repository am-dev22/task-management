import { BaseTaskStrategy } from "./BaseTaskStrategy";
import { StatusDefinition } from "./ITaskStrategy";

export class ProcurementStrategy extends BaseTaskStrategy {
    readonly taskType = "procurement";

    readonly statuses: StatusDefinition[] = [
        { status: 1, name: "Created", requiredFields: [] },
        {
            status: 2,
            name: "Supplier offers received",
            requiredFields: [
                { key: "priceQuotes", label: "price-quote strings", type: "string-list", itemCount: 2 },
            ],
        },
        {
            status: 3,
            name: "Purchase completed",
            requiredFields: [{ key: "receipt", label: "a receipt", type: "text" }],
        },
    ];
}
