import { useEffect, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ChatService } from '../../services/chat.service';
import { userService } from '../../services/user.service';
import { getUserIdFromToken } from '../../utils/auth';
import { setSupabaseJWT } from '../../lib/supabase';
import { getAuthToken } from '../../utils/auth';
import type { Conversation, Message } from '../../type/chat.type';

export default function ChatPage() {
  const [searchParams] = useSearchParams();
  const conversationId = searchParams.get('conversation_id');

  const [currentUser, setCurrentUser] = useState<any>(null);

  const [conversations, setConversations] = useState<Conversation[]>([]);

  const [selectedConversation, setSelectedConversation] =
    useState<Conversation | null>(null);

  const [messages, setMessages] = useState<Message[]>([]);

  const [messageInput, setMessageInput] = useState('');

  const [loading, setLoading] = useState(true);

  const [sending, setSending] = useState(false);

  const [conversationsLoading, setConversationsLoading] = useState(true);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const unsubscribeMessagesRef = useRef<(() => void) | null>(null);

  const unsubscribeConversationsRef = useRef<(() => void) | null>(null);
  const currentSubscribedConvIdRef = useRef<string | null>(null);

  // =====================================================
  // SCROLL TO BOTTOM
  // =====================================================

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({
      behavior: 'smooth',
    });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // =====================================================
  // GET CURRENT USER
  // =====================================================

  useEffect(() => {
    const getCurrentUser = async () => {
      try {
        const userId = getUserIdFromToken();

        if (!userId) {
          console.error('No user ID found in token');
          return;
        }

        // ✅ Setup Supabase JWT for Realtime
        const token = getAuthToken();
        if (token) {
          await setSupabaseJWT(token);
        }

        const response = await userService.getMe();

        setCurrentUser(response.data);
      } catch (error) {
        console.error('Error getting current user:', error);
      }
    };

    getCurrentUser();
  }, []);

  // =====================================================
  // LOAD CONVERSATIONS
  // =====================================================

  useEffect(() => {
    if (!currentUser) return;

    const loadConversations = async () => {
      try {
        setConversationsLoading(true);

        const convs = await ChatService.getUserConversations(20, 0);

        setConversations(convs);

        // =================================================
        // AUTO SELECT
        // =================================================

        if (conversationId) {
          const selected = convs.find(
            (c) => c.id === conversationId,
          );

          if (selected) {
            setSelectedConversation(selected);
          }
        } else if (convs.length > 0) {
          setSelectedConversation(convs[0]);
        }
      } catch (error) {
        console.error('Error loading conversations:', error);
      } finally {
        setConversationsLoading(false);
      }
    };

    loadConversations();
  }, [currentUser, conversationId]);

  // =====================================================
  // FIX RACE CONDITION
  // conversation created realtime
  // =====================================================

  useEffect(() => {
    if (!conversationId || conversations.length === 0) return;

    const selected = conversations.find(
      (c) => c.id === conversationId,
    );

    if (selected) {
      setSelectedConversation(selected);
    }
  }, [conversationId, conversations]);

  // =====================================================
  // REALTIME CONVERSATIONS
  // =====================================================

  useEffect(() => {
    if (!currentUser) return;

    if (unsubscribeConversationsRef.current) {
      unsubscribeConversationsRef.current();
    }

    const unsubscribe =
      ChatService.subscribeToNewConversations(
        currentUser.id,

        (updatedConversation) => {

          setConversations((prev) => {

            const exists = prev.find(
              (c) => c.id === updatedConversation.id,
            );

            // ===========================================
            // NEW CONVERSATION
            // ===========================================

            if (!exists) {
              return [
                updatedConversation,
                ...prev,
              ];
            }

            // ===========================================
            // UPDATE EXISTING
            // ===========================================

            const updated = prev.map((c) => {

              if (c.id === updatedConversation.id) {
                return {
                  ...c,
                  ...updatedConversation,
                };
              }

              return c;
            });

            // ===========================================
            // SORT LATEST MESSAGE
            // ===========================================

            updated.sort((a, b) => {
              return (
                new Date(
                  b.updated_at || b.last_message_at,
                ).getTime() -
                new Date(
                  a.updated_at || a.last_message_at,
                ).getTime()
              );
            });

            return updated;
          });
        },
      );

    unsubscribeConversationsRef.current = unsubscribe;

    return () => {
      if (unsubscribeConversationsRef.current) {
        unsubscribeConversationsRef.current();
      }
    };
  }, [currentUser]);

  // =====================================================
  // LOAD MESSAGES & REALTIME
  // =====================================================
  useEffect(() => {
    // Nếu không có selectedConversation hoặc conversationId, hủy subscription
    if (!selectedConversation || !selectedConversation.id) {
      if (unsubscribeMessagesRef.current) {
        unsubscribeMessagesRef.current();
        unsubscribeMessagesRef.current = null;
        currentSubscribedConvIdRef.current = null;
      }
      return;
    }

    const targetConvId = selectedConversation.id;

    // Nếu đã subscribed đúng conversation này rồi, không làm gì cả
    if (currentSubscribedConvIdRef.current === targetConvId) {
      return;
    }

    // Nếu đang subscribed conversation khác, hủy cái cũ trước
    if (unsubscribeMessagesRef.current) {
      console.log(`🛑 Unsubscribing from old conv: ${currentSubscribedConvIdRef.current}`);
      unsubscribeMessagesRef.current();
      unsubscribeMessagesRef.current = null;
    }

    console.log(` Subscribing to new conv: ${targetConvId}`);
    currentSubscribedConvIdRef.current = targetConvId;

    // Load lịch sử tin nhắn
    const loadMessages = async () => {
      try {
        setLoading(true);
        const msgs = await ChatService.getConversationMessages(targetConvId, 50, 0);
        setMessages(msgs);
      } catch (error) {
        console.error('Error loading messages:', error);
      } finally {
        setLoading(false);
      }
    };
    loadMessages();

    // Subscribe Realtime
    const cleanup = ChatService.subscribeToMessages(
      targetConvId,
      (newMessage) => {
        console.log(' Realtime message received:', newMessage.content);
        
        setMessages((prev) => {
          const exists = prev.some((m) => m.id === newMessage.id);
          if (exists) return prev;
          return [...prev, newMessage];
        });

        // Cập nhật sidebar
        setConversations((prev) => {
          const updated = prev.map((conv) => {
            if (conv.id === targetConvId) {
              return {
                ...conv,
                last_message: newMessage.content,
                last_message_at: newMessage.created_at,
                updated_at: newMessage.created_at,
              };
            }
            return conv;
          });
          return updated.sort((a, b) => 
            new Date(b.updated_at || b.last_message_at).getTime() - 
            new Date(a.updated_at || a.last_message_at).getTime()
          );
        });
      }
    );

    unsubscribeMessagesRef.current = cleanup;
    return () => {
      // Không cần làm gì ở đây vì logic trên đã xử lý việc chuyển đổi conversation
      // Chỉ cần đảm bảo ref được dọn dẹp nếu component unmount hoàn toàn
    };
  }, [selectedConversation?.id]);
  useEffect(() => {
    return () => {
      if (unsubscribeMessagesRef.current) {
        unsubscribeMessagesRef.current();
      }
      if (unsubscribeConversationsRef.current) {
        unsubscribeConversationsRef.current();
      }
    };
  }, []);

  const handleSendMessage = async () => {
    if (!messageInput.trim() || !selectedConversation || !currentUser) {
      return;
    }

    const tempId = `temp-${Date.now()}`; // Tạo ID tạm thời
    const now = new Date().toISOString();
    
    // 1. Tạo object tin nhắn tạm thời để hiển thị ngay
    const tempMessage: Message = {
      id: tempId, // ID tạm
      conversation_id: selectedConversation.id,
      sender_id: currentUser.id,
      content: messageInput,
      created_at: now,
      sender: currentUser,
      is_read: false,
    };

    try {
      setSending(true);
      setMessageInput(''); // Xóa input ngay lập tức để UX tốt hơn

      // 2. Cập nhật UI ngay lập tức (Optimistic Update)
      setMessages((prev) => [...prev, tempMessage]);
      
      // 3. Cập nhật sidebar ngay lập tức (để cuộc hội thoại nhảy lên đầu)
      setConversations((prev) => {
        const updated = prev.map((conv) => {
          if (conv.id === selectedConversation.id) {
            return {
              ...conv,
              last_message: messageInput,
              last_message_at: now,
              updated_at: now,
            };
          }
          return conv;
        });
        // Sort lại để đưa lên đầu
        return updated.sort((a, b) => {
           return (new Date(b.updated_at || b.last_message_at).getTime() - 
                   new Date(a.updated_at || a.last_message_at).getTime());
        });
      });

      // 4. Gọi API thực tế
      const sentMessage = await ChatService.sendMessage(
        selectedConversation.id,
        messageInput,
      );

      // 5. (Optional) Thay thế tin nhắn tạm bằng tin nhắn thật từ Server
      // Điều này giúp đồng bộ ID thật và các trường dữ liệu khác nếu cần
      setMessages((prev) => 
        prev.map((m) => (m.id === tempId ? sentMessage : m))
      );

    } catch (error) {
      console.error('Error sending message:', error);
      // Nếu lỗi, xóa tin nhắn tạm hoặc báo lỗi
      setMessages((prev) => prev.filter((m) => m.id !== tempId));
      setMessageInput(messageInput); // Khôi phục nội dung nếu gửi lỗi
      alert("Gửi tin nhắn thất bại");
    } finally {
      setSending(false);
    }
  };

  // =====================================================
  // GET OTHER USER
  // =====================================================

  const getOtherUser = (
    conversation: Conversation,
  ) => {

    if (!currentUser) return null;

    if (
      conversation.renter_id === currentUser.id
    ) {
      return conversation.owner;
    }

    return conversation.renter;
  };

  const otherUser = selectedConversation
    ? getOtherUser(selectedConversation)
    : null;

  return (
     <div className="h-screen overflow-hidden bg-[#f4f7fa]">
      {/* HEADER */}
      <header className="border-b border-gray-100 bg-white">
        <div className="mx-auto flex h-16 max-w-[1600px] items-center justify-between px-4">
          <div className="flex items-center gap-4">
            <Link to="/" className="text-xl font-extrabold text-[#0b45b3]">
              LensLease VN
            </Link>

            <div className="hidden h-6 w-px bg-gray-200 md:block" />

            <div className="hidden text-sm font-medium text-gray-500 md:block">
              Tin nhắn
            </div>
          </div>

          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 font-bold text-[#0b45b3]">
            {currentUser?.email?.[0]?.toUpperCase() || 'U'}
          </div>
        </div>
      </header>

      {/* CHAT */}
      <div className="mx-auto flex h-[calc(100vh-64px)] max-w-[1600px]">
        {/* SIDEBAR */}
        <div className="hidden w-[360px] flex-col border-r border-gray-100 bg-white lg:flex">
          {/* SEARCH */}
          <div className="border-b border-gray-100 p-4">
            <div className="flex items-center gap-3 rounded-2xl bg-gray-100 px-4 py-3">
              <span className="material-symbols-outlined text-gray-400">search</span>
              <input
                type="text"
                placeholder="Tìm cuộc trò chuyện..."
                className="w-full bg-transparent text-sm outline-none"
              />
            </div>
          </div>

          {/* CONVERSATIONS */}
          <div className="flex-1 overflow-y-auto">
            {conversationsLoading ? (
              <div className="p-4 text-center text-gray-400">Đang tải...</div>
            ) : conversations.length === 0 ? (
              <div className="p-4 text-center text-gray-400 text-sm">
                Chưa có cuộc trò chuyện nào
              </div>
            ) : (
              conversations.map((conversation) => {
                const other = getOtherUser(conversation);
                const isSelected = selectedConversation?.id === conversation.id;

                return (
                  <button
                    key={conversation.id}
                    onClick={() => setSelectedConversation(conversation)}
                    className={`flex w-full items-center gap-4 border-b border-gray-50 px-4 py-4 text-left transition hover:bg-gray-50 ${
                      isSelected ? 'bg-blue-50' : ''
                    }`}
                  >
                    <div className="relative">
                      <img
                        src={other?.avatar_url || 'https://i.pravatar.cc/100?img=0'}
                        alt={other?.full_name || 'User'}
                        className="h-14 w-14 rounded-full object-cover"
                      />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-3">
                        <h3 className="truncate font-bold text-gray-900">
                          {other?.full_name || 'Người dùng'}
                        </h3>

                        <span className="shrink-0 text-xs text-gray-400">
                          {conversation.last_message_at
                            ? new Date(conversation.last_message_at).toLocaleTimeString('vi-VN', {
                                hour: '2-digit',
                                minute: '2-digit',
                              })
                            : ''}
                        </span>
                      </div>

                      <div className="mt-1 flex items-center justify-between gap-3">
                        <p className="truncate text-sm text-gray-500">
                          {conversation.last_message || 'Không có tin nhắn'}
                        </p>
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* CHAT AREA */}
        {selectedConversation && otherUser ? (
          <div className="flex flex-1 flex-col">
            {/* CHAT HEADER */}
            <div className="flex items-center justify-between border-b border-gray-100 bg-white px-6 py-4">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <img
                    src={otherUser.avatar_url || 'https://i.pravatar.cc/100?img=0'}
                    alt={otherUser.full_name || 'User'}
                    className="h-12 w-12 rounded-full object-cover"
                  />
                </div>

                <div>
                  <h2 className="font-bold text-gray-900">{otherUser.full_name || 'Người dùng'}</h2>

                  <div className="mt-1 text-xs text-gray-500">{otherUser.email}</div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button className="flex h-11 w-11 items-center justify-center rounded-xl bg-gray-100 text-gray-600 transition hover:bg-gray-200">
                  <span className="material-symbols-outlined">info</span>
                </button>
              </div>
            </div>

            {/* MESSAGES */}
            <div className="flex-1 overflow-y-auto bg-white p-6 space-y-4">
              {loading ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-gray-400">Đang tải tin nhắn...</div>
                </div>
              ) : messages.length === 0 ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center text-gray-400">
                    <div className="text-4xl mb-2">👋</div>
                    <div>Bắt đầu cuộc trò chuyện mới</div>
                  </div>
                </div>
              ) : (
                messages.map((message) => {
                  const isMe = message.sender_id === currentUser?.id;

                  return (
                    <div
                      key={message.id}
                      className={`flex gap-3 ${isMe ? 'justify-end' : 'justify-start'}`}
                    >
                      {!isMe && (
                        <img
                          src={
                            message.sender?.avatar_url ||
                            'https://i.pravatar.cc/100?img=0'
                          }
                          alt={message.sender?.full_name || 'User'}
                          className="h-8 w-8 rounded-full object-cover"
                        />
                      )}

                      <div
                        className={`max-w-xs rounded-2xl px-4 py-2 ${
                          isMe
                            ? 'bg-[#0b45b3] text-white'
                            : 'bg-gray-100 text-gray-900'
                        }`}
                      >
                        <p className="text-sm break-words">{message.content}</p>

                        <p
                          className={`mt-1 text-xs ${
                            isMe ? 'text-blue-100' : 'text-gray-500'
                          }`}
                        >
                          {new Date(message.created_at).toLocaleTimeString('vi-VN', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                      </div>

                      {isMe && (
                        <img
                          src={
                            currentUser?.avatar_url ||
                            'https://i.pravatar.cc/100?img=0'
                          }
                          alt="You"
                          className="h-8 w-8 rounded-full object-cover"
                        />
                      )}
                    </div>
                  );
                })
              )}

              <div ref={messagesEndRef} />
            </div>
            {/* MESSAGE INPUT */}
            <div className="border-t border-gray-100 bg-white p-4">
              <div className="flex items-center gap-3">
                <input
                  type="text"
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  placeholder="Nhập tin nhắn..."
                  className="flex-1 rounded-full border border-gray-300 px-4 py-3 text-sm focus:border-blue-500 focus:outline-none"
                />

                <button
                  onClick={handleSendMessage}
                  disabled={!messageInput.trim() || sending}
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-[#0b45b3] text-white transition hover:bg-blue-800 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="material-symbols-outlined text-[20px]">
                    send
                  </span>
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-white">
            <div className="text-center text-gray-400">
              <div className="text-4xl mb-2">💬</div>
              <div>Chọn một cuộc trò chuyện để bắt đầu</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}