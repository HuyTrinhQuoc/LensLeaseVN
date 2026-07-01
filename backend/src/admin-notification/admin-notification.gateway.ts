import {
    WebSocketGateway,
    WebSocketServer,
    OnGatewayConnection,
    OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

// Mở CORS để Frontend ở port khác (ví dụ 5173) có thể kết nối
@WebSocketGateway({ cors: { origin: '*' } })
export class NotificationsGateway implements OnGatewayConnection, OnGatewayDisconnect {

    @WebSocketServer()
    server!: Server;

    // Khi có 1 client (React) kết nối vào
    handleConnection(client: Socket) {
        // Lấy thông tin từ query URL do Frontend gửi lên
        const userId = client.handshake.query.userId as string;
        const role = client.handshake.query.role as string;

        console.log(`Client connected: ${client.id} - Role: ${role}`);
        if (userId) {
            // QUAN TRỌNG: Cho BẤT KỲ user nào (dù là ADMIN, OWNER hay USER thường) 
            // join vào một phòng mang tên ID của chính họ.
            client.join(`user_${userId}`);
            console.log(`User ${userId} joined room: user_${userId}`);
        }
        if (role === 'ADMIN') {
            // Phân admin vào một "phòng" (room) riêng để dễ gửi thông báo chung
            client.join('admins_room');
            console.log(`User ${userId} joined admins_room`);
        }
    }

    // Khi client ngắt kết nối
    handleDisconnect(client: Socket) {
        console.log(`Client disconnected: ${client.id}`);
    }

    // Hàm này dùng để gọi từ Controller hoặc Service khác khi muốn bắn thông báo
    sendToAdmins(notificationData: any) {
        this.server.to('admins_room').emit('new_admin_notification', notificationData);
    }
    // HÀM MỚI: Gửi cho 1 cá nhân cụ thể (Owner hoặc Renter)
    sendToUser(userId: string, notificationData: any) {
        // Phát event 'new_user_notification' tới đúng căn phòng của user đó
        this.server.to(`user_${userId}`).emit('new_user_notification', notificationData);
    }
}