import { URL } from "@api/url";

export const getItemsByPurchaseIdService = async (purchaseId, token) => {
    const response = await fetch(
        `${URL}/item/items-by-purchase/${purchaseId}`,
        {
            method: "GET",
            headers: {
                Authorization: `Bearer ${token}`,
            },
        }
    );
    if (!response.ok) {
        throw new Error("Unable to fetch items, bad response from server");
    }
    const items = await response.json();
    return items;
};
