/**
 * Used for AllPurchases and MyPurchases tables
 */
export function getPurchaseColumnWidths() {
    const widths = {
        name: 350,
        buyer: 350,
        date: 200,
        shop: 200,
        price: 200,
        isPaid: 100,
    };
    return {
        ...widths,
        total:
            widths.name +
            widths.buyer +
            widths.date +
            widths.shop +
            widths.price +
            widths.isPaid,
    };
}

/**
 * Used for AllPurchases and MyPurchases tables
 */
export function getPurchaseColumnFlexes() {
    const flexes = {
        name: 0.35,
        buyer: 0.15,
        date: 0.1,
        shop: 0.15,
        price: 0.15,
        isPaid: 0.1,
    };

    return flexes;
}

/**
 * Used for the Item table in the AddPurchase dialog
 */
export function getItemColumnWidths() {
    const widths = {
        delete: 100,
        name: 550,
        amount: 400,
        priceInCents: 400,
        total: 0,
    };
    widths.total = widths.name + widths.amount + widths.priceInCents;
    return {
        ...widths,
        total: widths.total,
    };
}

/**
 * Used for the Item table in the AddPurchase dialog
 */
export function getItemColumnFlexes() {
    const flexes = {
        delete: 0.05,
        name: 0.65,
        amount: 0.15,
        priceInCents: 0.15,
    };

    return flexes;
}

export function getDebtorDetailColumnFlexes() {
    const flexes = getPurchaseColumnFlexes();
    return flexes;
}

/**
 * Used for the ToPay bookmark table
 */
export function getDebtorColumnFlexes() {
    const flexes = {
        name: 0.7,
        debt: 0.2,
        detail: 0.1,
    };

    return flexes;
}

export function getDebtorColumnWidths() {
    const widths = {
        name: 350,
        state: 150,
        total: 300,
        pay: 100,
    };
    return widths;
}

export function getTransactionColumnWidths() {
    const widths = {
        date: 200,
        type: 150,
        from: 250,
        to: 250,
        price: 100,
        description: 500,
    };
    return widths;
}
