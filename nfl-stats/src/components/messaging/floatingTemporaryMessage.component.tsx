import React, { useState } from 'react';

interface FloatingTemporaryMessageProps {
  message: string;
  messageType: 'error' | 'info' | 'success';
}

const FloatingTemporaryMessage: React.FC<FloatingTemporaryMessageProps> = ({
  message,
  messageType,
}) => {
  const [currentMessage, setCurrentMessage] = useState(message);

  const getBackgroundColor = () => {
    switch (messageType) {
      case 'error':
        return 'red';
      case 'success':
        return 'green';
      case 'info':
        return 'blue';
      default:
        return 'gray';
    }
  };

  if (!currentMessage) {
    return null; // Don't render anything if there's no message
  }

  return (
    <div
      style={{
        position: 'fixed',
        top: '100px',
        left: '50%',
        transform: 'translateX(-50%)',
        backgroundColor: getBackgroundColor(),
        color: 'white',
        padding: '10px 20px',
        borderRadius: '5px',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        zIndex: 1000,
        textAlign: 'center',
        cursor: 'pointer', // Indicate it's clickable
      }}
      onClick={() => setCurrentMessage('')} // Clear the message on click
    >
      {currentMessage}
    </div>
  );
};

export default FloatingTemporaryMessage;