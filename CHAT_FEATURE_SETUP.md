# Chat Feature - Hướng dẫn Triển khai

## 📋 Tổng quan

Hệ thống chat realtime giữa người thuê (renter) và chủ máy (owner) được xây dựng dựa trên mô hình:
- **Database**: PostgreSQL (2 bảng chính: `conversations` và `messages`)
- **Backend**: NestJS API (`/chat` endpoints)
- **Frontend**: React + Supabase Realtime
- **Realtime**: Supabase Realtime subscriptions (WebSocket-based)
- **Security**: Row Level Security (RLS) Policies

## 🗄️ Cấu trúc Database

### 1. Bảng `conversations`
```sql
CREATE TABLE conversations (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  renter_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  owner_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  last_message text,
  last_message_at timestamp DEFAULT NOW(),
  created_at timestamp DEFAULT NOW(),
  updated_at timestamp DEFAULT NOW(),
  UNIQUE(renter_id, owner_id)
);

CREATE INDEX idx_conversations_renter_id ON conversations(renter_id);
CREATE INDEX idx_conversations_owner_id ON conversations(owner_id);
```

### 2. Bảng `messages`
```sql
CREATE TABLE messages (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id uuid NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content text NOT NULL,
  attachment_url text,
  is_read boolean DEFAULT false,
  created_at timestamp DEFAULT NOW()
);

CREATE INDEX idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX idx_messages_sender_id ON messages(sender_id);
CREATE INDEX idx_messages_conversation_created ON messages(conversation_id, created_at);
```

## 🔐 Row Level Security (RLS) Policies

Để bật RLS và đảm bảo bảo mật, thực hiện các bước sau trong **Supabase Dashboard**:

### Bước 1: Bật RLS trên các bảng

```sql
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
```

### Bước 2: Tạo Policies cho Conversations

**Policy 1: Người dùng chỉ thấy conversations của họ**
```sql
CREATE POLICY "Users can select their own conversations"
  ON conversations FOR SELECT
  USING (
    renter_id = auth.uid()::uuid OR owner_id = auth.uid()::uuid
  );
```

**Policy 2: Renter có thể tạo conversation mới**
```sql
CREATE POLICY "Renter can create conversation"
  ON conversations FOR INSERT
  WITH CHECK (
    renter_id = auth.uid()::uuid
  );
```

**Policy 3: Người dùng có thể cập nhật conversations của họ**
```sql
CREATE POLICY "Users can update their conversations"
  ON conversations FOR UPDATE
  USING (
    renter_id = auth.uid()::uuid OR owner_id = auth.uid()::uuid
  )
  WITH CHECK (
    renter_id = auth.uid()::uuid OR owner_id = auth.uid()::uuid
  );
```

### Bước 3: Tạo Policies cho Messages

**Policy 1: Người dùng chỉ thấy messages từ conversations của họ**
```sql
CREATE POLICY "Users can select messages from their conversations"
  ON messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM conversations c
      WHERE c.id = messages.conversation_id
      AND (c.renter_id = auth.uid()::uuid OR c.owner_id = auth.uid()::uuid)
    )
  );
```

**Policy 2: Người dùng chỉ có thể gửi tin nhắn của chính họ**
```sql
CREATE POLICY "Users can only send their own messages"
  ON messages FOR INSERT
  WITH CHECK (
    sender_id = auth.uid()::uuid
    AND EXISTS (
      SELECT 1 FROM conversations c
      WHERE c.id = messages.conversation_id
      AND (c.renter_id = auth.uid()::uuid OR c.owner_id = auth.uid()::uuid)
    )
  );
```

**Policy 3: Người dùng có thể đánh dấu tin nhắn đã đọc**
```sql
CREATE POLICY "Users can mark messages as read"
  ON messages FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM conversations c
      WHERE c.id = messages.conversation_id
      AND (c.renter_id = auth.uid()::uuid OR c.owner_id = auth.uid()::uuid)
    )
  );
```

## 🔧 Backend API Endpoints

### 1. Lấy hoặc tạo Conversation
```
POST /chat/conversations
Body: { "owner_id": "uuid" }
Response: { success: true, data: Conversation }
```

### 2. Lấy danh sách Conversations của User
```
GET /chat/conversations?limit=20&offset=0
Response: { success: true, data: Conversation[], total: number }
```

### 3. Lấy chi tiết Conversation
```
GET /chat/conversations/:id
Response: { success: true, data: Conversation }
```

### 4. Lấy danh sách Messages trong Conversation
```
GET /chat/conversations/:id/messages?limit=50&offset=0
Response: { success: true, data: Message[], total: number }
```

### 5. Gửi tin nhắn
```
POST /chat/conversations/:id/messages
Body: { "content": "string" }
Response: { success: true, data: Message }
```

## 💻 Frontend Implementation

### 1. ChatService (`src/services/chat.service.ts`)
- `getOrCreateConversation(ownerId)` - Lấy hoặc tạo conversation
- `getUserConversations(limit, offset)` - Lấy danh sách conversations
- `getConversationById(conversationId)` - Lấy chi tiết conversation
- `getConversationMessages(conversationId, limit, offset)` - Lấy messages
- `sendMessage(conversationId, content)` - Gửi tin nhắn
- `subscribeToMessages(conversationId, callback)` - Lắng nghe tin nhắn mới (Realtime)
- `subscribeToConversationUpdates(conversationId, callback)` - Lắng nghe cập nhật conversation
- `subscribeToNewConversations(userId, callback)` - Lắng nghe conversations mới

### 2. Types (`src/type/chat.type.ts`)
```typescript
interface Conversation {
  id: string;
  renter_id: string;
  owner_id: string;
  last_message?: string;
  last_message_at: string;
  created_at: string;
  updated_at: string;
  renter?: ChatUser;
  owner?: ChatUser;
}

interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  is_read: boolean;
  created_at: string;
  sender?: ChatUser;
}
```

### 3. ChatPage (`src/pages/Chat/ChatPage.tsx`)
- Hiển thị danh sách conversations (sidebar)
- Hiển thị messages trong conversation đã chọn
- Gửi tin nhắn realtime
- Tự động scroll đến tin nhắn mới nhất

### 4. BookingSidebar - Chat Button
- Thêm nút "Chat" cạnh nút "Thêm vào giỏ"
- Khi bấm, tạo conversation với owner và điều hướng đến ChatPage

## 🔄 Realtime Flow

```
1. User bấm "Chat với chủ shop" → tạo/lấy conversation → điều hướng sang ChatPage
2. Frontend load messages lịch sử
3. Frontend subscribe đến channel `messages:conversation:{id}` 
4. Khi có tin nhắn mới INSERT vào bảng messages:
   - Supabase Realtime phát sự kiện INSERT
   - Callback trong frontend nhận sự kiện
   - Thêm message vào state → UI cập nhật tức thì
5. Khi user gửi tin nhắn:
   - Frontend gửi POST /chat/conversations/:id/messages
   - Backend insert message + update last_message trong conversation
   - Supabase Realtime phát sự kiện → người kia nhận tức thì
```

## 🚀 Deployment Checklist

- [ ] Migrations chạy thành công (`npx prisma migrate dev`)
- [ ] RLS Policies được enable trên Supabase Dashboard
- [ ] ChatModule được import trong AppModule
- [ ] Frontend environment variables được cấu hình (VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY)
- [ ] Routes `/chat` được mapping trong routing config
- [ ] Material Icons được import (cho icon `chat`, `send`, etc.)
- [ ] Tested trên development:
  - [ ] Tạo conversation từ ProductDetail
  - [ ] Gửi tin nhắn 
  - [ ] Nhận tin nhắn realtime
  - [ ] Danh sách conversations cập nhật

## 📝 Notes

- **MVP** không hỗ trợ: typing indicators, upload ảnh, notification
- **Supabase Realtime** thay thế Socket.io - giảm infrastructure complexity
- **RLS** đảm bảo user chỉ thấy conversations của chính họ (backend-enforced)
- Tin nhắn được mark as read tự động khi user view
- Conversation unique constraint: (renter_id, owner_id) - chỉ 1 conversation per pair

## 🐛 Troubleshooting

### Realtime không hoạt động
1. Kiểm tra Supabase project có enable Realtime Database
2. Kiểm tra RLS Policies được bật đúng
3. Kiểm tra browser console cho lỗi Supabase

### Không nhận tin nhắn mới
1. Kiểm tra subscription được gọi
2. Kiểm tra conversation_id chính xác
3. Kiểm tra RLS policy cho SELECT messages

### Không gửi được tin nhắn
1. Kiểm tra user đã authenticate
2. Kiểm tra backend `/chat/conversations/:id/messages` endpoint
3. Kiểm tra tin nhắn content không rỗng
