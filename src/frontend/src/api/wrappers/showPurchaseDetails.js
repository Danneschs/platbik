import { getItemsByPurchaseIdService } from "@api/items";
import { getAllUsersService } from "@api/users";
import { EditPurchase } from "@objects/EditPurchase.js";

export const showPurchaseDetails = async (
    row,
    token,
    setAllUsers,
    setClickedPurchase,
    setShowDetail
) => {
    // Logic to display purchase details
    try {
        const items = await getItemsByPurchaseIdService(row.id, token);
        const allUsers = await getAllUsersService(token);
        setAllUsers(allUsers || []);

        const thisPurchase = new EditPurchase(
            row.id,
            row.name,
            row.coPayers,
            new Date(row.timestamp),
            row.shopName,
            row.priceInCents,
            items, // SIDE EFFECT: items here are type ItemDto, so they have id as int!
            row.buyerPays
        );
        setClickedPurchase(thisPurchase);
        setShowDetail(true);
    } catch (error) {
        console.error("Error fetching purchase details:", error);
    }
};
