-- Enable RLS on conversations and messages tables
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- ==========================================
-- RLS Policies for Conversations Table
-- ==========================================

-- Policy: Users can SELECT their own conversations (as renter or owner)
CREATE POLICY "Users can select their own conversations"
  ON conversations FOR SELECT
  USING (
    renter_id = auth.uid()::uuid OR owner_id = auth.uid()::uuid
  );

-- Policy: Users can INSERT conversations (only renter_id and owner_id set to them)
CREATE POLICY "Renter can create conversation"
  ON conversations FOR INSERT
  WITH CHECK (
    renter_id = auth.uid()::uuid
  );

-- Policy: Users can UPDATE last_message in their conversations
CREATE POLICY "Users can update their conversations"
  ON conversations FOR UPDATE
  USING (
    renter_id = auth.uid()::uuid OR owner_id = auth.uid()::uuid
  )
  WITH CHECK (
    renter_id = auth.uid()::uuid OR owner_id = auth.uid()::uuid
  );

-- ==========================================
-- RLS Policies for Messages Table
-- ==========================================

-- Policy: Users can SELECT messages from conversations they're part of
CREATE POLICY "Users can select messages from their conversations"
  ON messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM conversations c
      WHERE c.id = messages.conversation_id
      AND (c.renter_id = auth.uid()::uuid OR c.owner_id = auth.uid()::uuid)
    )
  );

-- Policy: Users can INSERT messages only if they're the sender in a conversation they're part of
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

-- Policy: Users can UPDATE is_read flag on messages in their conversations
CREATE POLICY "Users can mark messages as read"
  ON messages FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM conversations c
      WHERE c.id = messages.conversation_id
      AND (c.renter_id = auth.uid()::uuid OR c.owner_id = auth.uid()::uuid)
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM conversations c
      WHERE c.id = messages.conversation_id
      AND (c.renter_id = auth.uid()::uuid OR c.owner_id = auth.uid()::uuid)
    )
  );

-- ==========================================
-- Create indexes for better query performance
-- ==========================================

-- If these indexes don't exist, create them
CREATE INDEX IF NOT EXISTS idx_conversations_renter_id ON conversations(renter_id);
CREATE INDEX IF NOT EXISTS idx_conversations_owner_id ON conversations(owner_id);
CREATE INDEX IF NOT EXISTS idx_conversations_renter_owner ON conversations(renter_id, owner_id);
CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_conversation_created ON messages(conversation_id, created_at);
CREATE INDEX IF NOT EXISTS idx_messages_is_read ON messages(is_read);
