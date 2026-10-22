import { lazy, Suspense, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Send, X, Headphones } from "lucide-react";
import { api } from "../../services/shop";
const ChatMarkdown = lazy(() =>
  import("./ChatMarkdown").then((module) => ({ default: module.ChatMarkdown })),
);
export function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [handoff, setHandoff] = useState(false);
  const launcher = useRef<HTMLButtonElement>(null);
  const closeButton = useRef<HTMLButtonElement>(null);
  const conversation = useRef<HTMLDivElement>(null);
  const [messages, setMessages] = useState([
    {
      sender: "bot",
      text: "Chào bạn, Sóc Thám Tử có mặt! 🐿️\nBạn muốn khám phá **bộ Tránh Trap** hay cùng Sóc gỡ rối một tình huống trên mạng nè?",
    },
  ]);
  useEffect(() => {
    if (open) closeButton.current?.focus({ preventScroll: true });
  }, [open]);
  useEffect(() => {
    if (open && conversation.current) {
      conversation.current.scrollTop = conversation.current.scrollHeight;
    }
  }, [open, messages, busy]);
  function close() {
    setOpen(false);
    requestAnimationFrame(() =>
      launcher.current?.focus({ preventScroll: true }),
    );
  }
  async function send(text: string) {
    if (!text.trim() || busy) return;
    setInput("");
    setBusy(true);
    setMessages((m) => [...m, { sender: "user", text }]);
    try {
      const r = await api<{ message: string; handoff: boolean }>(
        "/chat",
        "POST",
        { message: text },
      );
      setMessages((m) => [...m, { sender: "bot", text: r.message }]);
      setHandoff(r.handoff);
    } catch (e) {
      setMessages((m) => [
        ...m,
        {
          sender: "bot",
          text: e instanceof Error ? e.message : "Vui lòng thử lại.",
        },
      ]);
      setHandoff(true);
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="chat-widget">
      {open && (
        <section
          id="soc-chat"
          className="chat-panel"
          role="dialog"
          aria-label="Chat với Sóc Thám Tử"
          onKeyDown={(event) => {
            if (event.key === "Escape") close();
          }}
        >
          <header>
            <img src="/images/figma/home-5.png" alt="" />
            <div>
              <strong>Sóc Thám Tử</strong>
              <small>Đồng hành cùng bạn</small>
            </div>
            <button ref={closeButton} aria-label="Đóng chat" onClick={close}>
              <X size={20} />
            </button>
          </header>
          <div
            ref={conversation}
            className="chat-messages"
            role="log"
            aria-live="polite"
            aria-relevant="additions text"
          >
            {messages.map((m, i) => (
              <div key={i} className={`chat-bubble ${m.sender}`}>
                {m.sender === "bot" ? (
                  <Suspense fallback={m.text}>
                    <ChatMarkdown text={m.text} />
                  </Suspense>
                ) : (
                  m.text
                )}
              </div>
            ))}
            {busy && (
              <p className="chat-bubble">Sóc đang xem giúp bạn nè… 🐾</p>
            )}
            {handoff && (
              <Link
                className="button"
                to="/tai-khoan/ho-tro"
                onClick={() => setOpen(false)}
              >
                <Headphones size={16} />
                Kết nối nhân viên
              </Link>
            )}
          </div>
          <div className="chat-suggestions">
            <button
              disabled={busy}
              onClick={() => void send("Bộ Tránh Trap có giá bao nhiêu?")}
            >
              Tư vấn bộ trò chơi
            </button>
            <button
              disabled={busy}
              onClick={() => void send("Tôi muốn gặp nhân viên hỗ trợ")}
            >
              Gặp nhân viên
            </button>
          </div>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              void send(input);
            }}
          >
            <input
              aria-label="Câu hỏi cho Sóc"
              placeholder="Bạn muốn hỏi điều gì?"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              maxLength={2000}
            />
            <button disabled={busy || !input.trim()} aria-label="Gửi câu hỏi">
              <Send size={18} />
            </button>
          </form>
        </section>
      )}
      {!open && (
        <button
          ref={launcher}
          className="chat-launcher"
          aria-label="Mở chat với Sóc Thám Tử"
          aria-expanded={false}
          aria-controls="soc-chat"
          onClick={() => setOpen(true)}
        >
          <span>Chat với Tránh Trap!</span>
          <img src="/images/figma/home-5.png" alt="" />
        </button>
      )}
    </div>
  );
}
