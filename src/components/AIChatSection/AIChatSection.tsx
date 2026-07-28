'use client';

// React 19 replaced the old `FormEvent` with `SubmitEvent` for onSubmit; import
// it explicitly so we get React's synthetic event, not the DOM global.
import { useState, useRef, useEffect, type SubmitEvent } from 'react';
import Link from 'next/link';
import styles from './AIChatSection.module.css';

const GREETING =
  'Hello! I am your AI Health Assistant. Describe what you are experiencing and I will point you to the right department and doctor.';

/**
 * The assistant ends a recommendation with `[BOOK:<doctorId>|<name>]` on its own
 * line (see the system prompt in src/lib/hospital-context.ts). We strip that
 * marker out of the visible text and render it as a booking button instead.
 *
 * Deliberately forgiving: open-weight models routinely wrap the marker in
 * backticks or bold, and pad the delimiters with spaces. Those variants should
 * still produce a button rather than leaking raw syntax into the chat bubble.
 */
const BOOKING_MARKER = /[`*_]*\[BOOK:\s*([^|\]]+?)\s*\|\s*([^\]]+?)\s*\][`*_]*/;

type Booking = { doctorId: string; doctorName: string };

type Message = {
  role: 'user' | 'assistant';
  /** Display text, with any booking marker already stripped. */
  text: string;
  booking?: Booking;
};

function parseBooking(raw: string): { text: string; booking?: Booking } {
  const match = raw.match(BOOKING_MARKER);
  if (!match) return { text: raw.trim() };

  return {
    text: raw.replace(BOOKING_MARKER, '').trim(),
    booking: { doctorId: match[1].trim(), doctorName: match[2].trim() },
  };
}

export default function AIChatSection() {
  const [messages, setMessages] = useState<Message[]>([{ role: 'assistant', text: GREETING }]);
  const [inputValue, setInputValue] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const chatBodyRef = useRef<HTMLDivElement>(null);

  // Keep the newest message in view as tokens stream in.
  useEffect(() => {
    const body = chatBodyRef.current;
    if (body) body.scrollTop = body.scrollHeight;
  }, [messages]);

  const handleSend = async (e: SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    const question = inputValue.trim();
    if (!question || isStreaming) return;

    // The greeting is UI-only — the API expects the conversation to open with a
    // user turn, so it never goes over the wire.
    const history = messages
      .slice(1)
      .map(({ role, text }) => ({ role, content: text }))
      .concat({ role: 'user' as const, content: question });

    setMessages((prev) => [...prev, { role: 'user', text: question }, { role: 'assistant', text: '' }]);
    setInputValue('');
    setIsStreaming(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: history }),
      });

      if (!response.ok || !response.body) {
        const { error } = await response.json().catch(() => ({ error: null }));
        throw new Error(error ?? 'The assistant is unavailable right now.');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let raw = '';

      // Replace the trailing placeholder bubble with each new chunk.
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        raw += decoder.decode(value, { stream: true });

        const { text, booking } = parseBooking(raw);
        setMessages((prev) => [...prev.slice(0, -1), { role: 'assistant', text, booking }]);
      }
    } catch (error) {
      const text =
        error instanceof Error
          ? error.message
          : 'Something went wrong. Please try again, or call the hospital if it is urgent.';
      setMessages((prev) => [...prev.slice(0, -1), { role: 'assistant', text }]);
    } finally {
      setIsStreaming(false);
    }
  };

  return (
    <section className={styles.chatSection}>
      <div className={styles.decorativeBlob1}></div>
      <div className={styles.decorativeBlob2}></div>

      <div className={`container ${styles.container}`}>
        <div className={styles.textContent}>
          <span className={styles.badge}>
            ✨ Powered by Advanced AI
          </span>
          <h2 className={styles.title}>
            Check Your Symptoms & <br/>
            <span className={styles.highlight}>Book Instantly</span>
          </h2>
          <p className={styles.description}>
            Not feeling well? Describe your symptoms to our intelligent AI assistant. It provides instant recommendations and can seamlessly book an appointment with the right specialist for your condition.
          </p>

          <div className={styles.features}>
            <div className={styles.featureItem}>
              <span className={styles.featureIcon}>⚡</span>
              <span>Instant AI-driven symptom analysis</span>
            </div>
            <div className={styles.featureItem}>
              <span className={styles.featureIcon}>🔒</span>
              <span>100% private and secure</span>
            </div>
            <div className={styles.featureItem}>
              <span className={styles.featureIcon}>📅</span>
              <span>Direct booking integration</span>
            </div>
          </div>

          <div className={styles.actions}>
            <Link href="/appointment" className="btn btn-primary">
              Book Appointment Now
            </Link>
          </div>
        </div>

        <div className={styles.chatInterfaceWrapper}>
          <div className={styles.chatWindow}>
            <div className={styles.chatHeader}>
              <div className={styles.aiAvatar}>🤖</div>
              <div className={styles.aiInfo}>
                <h3>AI Health Assistant</h3>
                <p>{isStreaming ? 'Typing…' : 'Online • Replies instantly'}</p>
              </div>
            </div>

            <div className={styles.chatBody} ref={chatBodyRef}>
              {messages.map((msg, idx) => (
                <div key={idx}>
                  <div
                    className={`${styles.message} ${
                      msg.role === 'user' ? styles.userMessage : styles.aiMessage
                    }`}
                  >
                    {msg.text || (isStreaming ? '…' : '')}
                  </div>

                  {msg.booking && (
                    <div style={{ alignSelf: 'flex-start' }}>
                      <Link
                        href={`/appointment?doctor=${encodeURIComponent(msg.booking.doctorId)}`}
                        className={styles.chatAction}
                      >
                        Book with {msg.booking.doctorName} →
                      </Link>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <form className={styles.chatInputArea} onSubmit={handleSend}>
              <input
                type="text"
                className={styles.chatInput}
                placeholder="E.g., I have a severe headache and fever..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                disabled={isStreaming}
              />
              <button
                type="submit"
                className={styles.sendBtn}
                aria-label="Send"
                disabled={isStreaming || !inputValue.trim()}
              >
                ➤
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
