import { URL } from "@api/url.js";
import CommitmentDto from "@objects/CommitmentDto";
import { v4 as uuidv4 } from "uuid";

export async function getAllCommitmentsService(token) {
    const response = await fetch(`${URL}/commitment/all-commitments`, {
        method: "GET",
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
    if (!response.ok) {
        throw new Error(
            "Unable to fetch commitments, bad response from server"
        );
    }
    const commitments = await response.json();
    return commitments.map(
        (c) =>
            new CommitmentDto(
                uuidv4(),
                c.fromUserId,
                c.toUserId,
                c.state,
                c.toName,
                c.totalInCents
            )
    );
}
