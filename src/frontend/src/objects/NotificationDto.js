import { markNotificationAsReadService } from "@api/transactionLogs";

class NotificationDto {
    constructor(id, type, header, text, timestamp, isRead) {
        this.id = id;
        this.type = type; // "pending_settlement", "add_purchase", "remove_purchase"
        this.header = header;
        this.text = text;
        this.timestamp = timestamp;
        this.isRead = isRead;
    }

    async markAsRead(token) {
        this.isRead = true;
        return await markNotificationAsReadService(token, this.id);
    }
}

export default NotificationDto;
