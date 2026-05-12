import { useState } from 'react';
import { Link } from 'react-router-dom';

const conversations = [
  {
    id: 1,
    name: 'Hoàng Nam Photo',
    avatar: 'https://i.pravatar.cc/100?img=12',
    lastMessage: 'Bạn có thể nhận máy lúc 8h sáng nhé 👍',
    time: '2 phút',
    unread: 2,
    online: true,
  },
  {
    id: 2,
    name: 'Studio Minh Đức',
    avatar: 'https://i.pravatar.cc/100?img=15',
    lastMessage: 'Lens vẫn còn rất mới nha bạn',
    time: '1 giờ',
    unread: 0,
    online: false,
  },
  {
    id: 3,
    name: 'Huy Cinema',
    avatar: 'https://i.pravatar.cc/100?img=18',
    lastMessage: 'Ok mình giữ lịch cho bạn',
    time: 'Hôm qua',
    unread: 0,
    online: true,
  },
];

const messages = [
  {
    id: 1,
    sender: 'owner',
    text: 'Chào bạn 👋',
    time: '14:20',
  },
  {
    id: 2,
    sender: 'owner',
    text: 'Bạn muốn nhận máy lúc mấy giờ vậy?',
    time: '14:21',
  },
  {
    id: 3,
    sender: 'me',
    text: 'Mình nhận khoảng 8h sáng được không anh?',
    time: '14:22',
  },
  {
    id: 4,
    sender: 'owner',
    text: 'Được nhé 👍',
    time: '14:23',
  },
];

export default function ChatPage() {
  const [message, setMessage] = useState('');

  return (
    <div className="h-screen overflow-hidden bg-[#f4f7fa]">
      {/* HEADER */}
      <header className="border-b border-gray-100 bg-white">
        <div className="mx-auto flex h-16 max-w-[1600px] items-center justify-between px-4">
          <div className="flex items-center gap-4">
            <Link
              to="/"
              className="text-xl font-extrabold text-[#0b45b3]"
            >
              LensLease VN
            </Link>

            <div className="hidden h-6 w-px bg-gray-200 md:block" />

            <div className="hidden text-sm font-medium text-gray-500 md:block">
              Tin nhắn
            </div>
          </div>

          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 font-bold text-[#0b45b3]">
            H
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
              <span className="material-symbols-outlined text-gray-400">
                search
              </span>

              <input
                type="text"
                placeholder="Tìm cuộc trò chuyện..."
                className="w-full bg-transparent text-sm outline-none"
              />
            </div>
          </div>

          {/* CONVERSATIONS */}
          <div className="flex-1 overflow-y-auto">
            {conversations.map((conversation, index) => (
              <button
                key={conversation.id}
                className={`flex w-full items-center gap-4 border-b border-gray-50 px-4 py-4 text-left transition hover:bg-gray-50 ${
                  index === 0 ? 'bg-blue-50' : ''
                }`}
              >
                <div className="relative">
                  <img
                    src={conversation.avatar}
                    alt={conversation.name}
                    className="h-14 w-14 rounded-full object-cover"
                  />

                  {conversation.online && (
                    <div className="absolute bottom-0 right-0 h-4 w-4 rounded-full border-2 border-white bg-green-500" />
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-3">
                    <h3 className="truncate font-bold text-gray-900">
                      {conversation.name}
                    </h3>

                    <span className="shrink-0 text-xs text-gray-400">
                      {conversation.time}
                    </span>
                  </div>

                  <div className="mt-1 flex items-center justify-between gap-3">
                    <p className="truncate text-sm text-gray-500">
                      {conversation.lastMessage}
                    </p>

                    {conversation.unread > 0 && (
                      <div className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-[#0b45b3] px-1 text-xs font-bold text-white">
                        {conversation.unread}
                      </div>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* CHAT AREA */}
        <div className="flex flex-1 flex-col">
          {/* CHAT HEADER */}
          <div className="flex items-center justify-between border-b border-gray-100 bg-white px-6 py-4">
            <div className="flex items-center gap-4">
              <div className="relative">
                <img
                  src="https://i.pravatar.cc/100?img=12"
                  alt="avatar"
                  className="h-12 w-12 rounded-full object-cover"
                />

                <div className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white bg-green-500" />
              </div>

              <div>
                <h2 className="font-bold text-gray-900">
                  Hoàng Nam Photo
                </h2>

                <div className="mt-1 flex items-center gap-2 text-sm text-green-600">
                  <span className="h-2 w-2 rounded-full bg-green-500" />
                  Đang hoạt động
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button className="flex h-11 w-11 items-center justify-center rounded-xl bg-gray-100 text-gray-600 transition hover:bg-gray-200">
                <span className="material-symbols-outlined">
                  call
                </span>
              </button>

              <button className="flex h-11 w-11 items-center justify-center rounded-xl bg-gray-100 text-gray-600 transition hover:bg-gray-200">
                <span className="material-symbols-outlined">
                  more_horiz
                </span>
              </button>
            </div>
          </div>

          {/* MESSAGES */}
          <div className="flex-1 overflow-y-auto px-4 py-6 md:px-8">
            <div className="mx-auto flex max-w-4xl flex-col gap-4">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${
                    msg.sender === 'me'
                      ? 'justify-end'
                      : 'justify-start'
                  }`}
                >
                  <div
                    className={`max-w-[75%] rounded-3xl px-5 py-4 shadow-sm ${
                      msg.sender === 'me'
                        ? 'rounded-br-md bg-[#0b45b3] text-white'
                        : 'rounded-bl-md bg-white text-gray-800'
                    }`}
                  >
                    <p className="text-sm leading-relaxed">
                      {msg.text}
                    </p>

                    <div
                      className={`mt-2 text-right text-xs ${
                        msg.sender === 'me'
                          ? 'text-blue-100'
                          : 'text-gray-400'
                      }`}
                    >
                      {msg.time}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* INPUT */}
          <div className="border-t border-gray-100 bg-white p-4 md:p-5">
            <div className="mx-auto flex max-w-4xl items-end gap-3">
              <button className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gray-100 text-gray-600 transition hover:bg-gray-200">
                <span className="material-symbols-outlined">
                  attach_file
                </span>
              </button>

              <div className="flex-1 rounded-3xl border border-gray-200 bg-gray-50 px-5 py-3">
                <textarea
                  rows={1}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Nhập tin nhắn..."
                  className="max-h-40 w-full resize-none bg-transparent text-sm outline-none"
                />
              </div>

              <button className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#0b45b3] text-white shadow-lg shadow-blue-200 transition hover:bg-blue-800">
                <span className="material-symbols-outlined">
                  send
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}