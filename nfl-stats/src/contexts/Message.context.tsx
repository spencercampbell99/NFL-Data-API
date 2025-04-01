'use client'

import React, { createContext, useContext, useState } from "react";
import FloatingTemporaryMessage from "@/components/messaging/floatingTemporaryMessage.component";

type MessageType = "error" | "info" | "success"

type MessageContextType = {
  message: string | null;
  setMessage: (message: string | null, type?: MessageType, expiration?: number) => void;
  messageType: MessageType;
};

const MessageContext = createContext<MessageContextType | undefined>(undefined);

export const MessageProvider = ({ children }: { children: React.ReactNode }) => {
  const [message, setMessageState] = useState<string | null>(null);
  const [messageType, setMessageType] = useState<MessageType>("info");

  const setMessage = (newMessage: string | null, type: MessageType = "info", expiration?: number) => {
    setMessageState(newMessage);
    setMessageType(type);

    if (expiration) {
      setTimeout(() => {
        setMessageState(null);
        setMessageType("info");
      }, expiration * 1000); // Convert seconds to milliseconds
    }
  };

  return (
    <MessageContext.Provider value={{ message, setMessage, messageType }}>
      {children}
      {message && <FloatingTemporaryMessage message={message} messageType={messageType} />}
    </MessageContext.Provider>
  );
};

export const useMessage = () => {
  const context = useContext(MessageContext);
  if (!context) {
    throw new Error("useMessage must be used within a MessageProvider");
  }
  return context;
};