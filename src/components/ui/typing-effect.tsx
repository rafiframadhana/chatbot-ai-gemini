"use client";

import React, { useState, useEffect, useCallback, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import { PrismLight as SyntaxHighlighter } from 'react-syntax-highlighter';
import { dracula } from 'react-syntax-highlighter/dist/cjs/styles/prism';

interface TypingEffectProps {
  text: string;
  speed?: number;
  className?: string;
  onComplete?: () => void;
}

// Calculate random typing delay to make it feel more natural
const getRandomTypingDelay = (min: number, max: number) => {
  return Math.random() * (max - min) + min;
};

export function TypingEffect({ 
  text, 
  speed = 30, 
  className = "", 
  onComplete 
}: TypingEffectProps) {  const [displayedText, setDisplayedText] = useState('');
  const [isComplete, setIsComplete] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const typeNextCharacter = useCallback((currentIndex: number) => {
    if (currentIndex >= text.length) {
      setIsComplete(true);
      onComplete?.();
      return;
    }

    // Get the next character
    const nextChar = text[currentIndex];
    
    // Calculate delay based on character type
    let delay = speed;
    
    // Faster for spaces and punctuation
    if (nextChar === ' ') delay = speed * 0.5;
    else if ([',', '.', '!', '?'].includes(nextChar)) delay = speed * 1.5;
    // Slower for new lines and code blocks
    else if (nextChar === '\n') delay = speed * 2;
    else delay = getRandomTypingDelay(speed * 0.8, speed * 1.2);

    timeoutRef.current = setTimeout(() => {
      setDisplayedText(text.substring(0, currentIndex + 1));
      typeNextCharacter(currentIndex + 1);
    }, delay);
  }, [text, speed, onComplete]);
  useEffect(() => {
    setDisplayedText('');
    setIsComplete(false);
    typeNextCharacter(0);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [text, typeNextCharacter]);

  const markdownComponents = {
    code({ node, inline, className, children, ...props }: any) {
      const match = /language-(\w+)/.exec(className || '');
      const language = match ? match[1] : '';
      
      if (!inline && language) {
        return (
          <SyntaxHighlighter
            style={dracula}
            language={language}
            PreTag="div"
            {...props}
          >
            {String(children).replace(/\n$/, '')}
          </SyntaxHighlighter>
        );
      }
      
      return (
        <code className={className} {...props}>
          {children}
        </code>
      );
    }
  };
  return (
    <div className={`${className} text-base`}>
      <ReactMarkdown>
        {isComplete ? text : displayedText}
      </ReactMarkdown>
    </div>
  );
}
