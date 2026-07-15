'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';
import styles from './AIChatSection.module.css';

export default function AIChatSection() {
  const [messages, setMessages] = useState([
    { role: 'ai', text: 'Hello! I am your AI Health Assistant. How can I help you today? You can describe your symptoms or ask me to book an appointment.' }
  ]);
  const [inputValue, setInputValue] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const newMessages = [...messages, { role: 'user', text: `Uploaded document: ${file.name}` }];
      setMessages(newMessages);
      
      setTimeout(() => {
        setMessages(prev => [
          ...prev, 
          { 
            role: 'ai', 
            text: `I've analyzed your document (${file.name}). Based on the information, I recommend consulting a specialist.` 
          },
          {
            role: 'action',
            text: ''
          }
        ]);
      }, 1000);
    }
  };

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    // Add user message
    const newMessages = [...messages, { role: 'user', text: inputValue }];
    setMessages(newMessages);
    setInputValue('');

    // Simulate AI response after a short delay
    setTimeout(() => {
      setMessages(prev => [
        ...prev, 
        { 
          role: 'ai', 
          text: "Based on what you've described, I recommend consulting a specialist. I can help you book an appointment right now." 
        },
        {
          role: 'action',
          text: '' // This renders the action button
        }
      ]);
    }, 1000);
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
                <p>Online • Replies instantly</p>
              </div>
            </div>
            
            <div className={styles.chatBody}>
              {messages.map((msg, idx) => {
                if (msg.role === 'action') {
                  return (
                    <div key={idx} style={{ alignSelf: 'flex-start' }}>
                      <Link href="/appointment" className={styles.chatAction}>
                        Book Appointment →
                      </Link>
                    </div>
                  );
                }
                
                return (
                  <div key={idx} className={`${styles.message} ${msg.role === 'user' ? styles.userMessage : styles.aiMessage}`}>
                    {msg.text}
                  </div>
                );
              })}
            </div>
            
            <form className={styles.chatInputArea} onSubmit={handleSend}>
              <button 
                type="button" 
                className={styles.uploadBtn} 
                aria-label="Upload document or image"
                onClick={() => fileInputRef.current?.click()}
                title="Upload document or image"
              >
                📎
              </button>
              <input 
                type="file" 
                ref={fileInputRef} 
                style={{ display: 'none' }} 
                onChange={handleFileUpload}
                accept="image/*,.pdf,.doc,.docx"
              />
              <input 
                type="text" 
                className={styles.chatInput} 
                placeholder="E.g., I have a severe headache and fever..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
              />
              <button type="submit" className={styles.sendBtn} aria-label="Send">
                ➤
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
