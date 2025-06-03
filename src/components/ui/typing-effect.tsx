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

  const typeNextChunk = useCallback((currentIndex: number) => {
  if (currentIndex >= text.length) {
    setIsComplete(true);
    onComplete?.();
    return;
  }

  // Define chunk size — how many characters to reveal each tick
  const chunkSize = 3;

  // Calculate next index, not to exceed text length
  const nextIndex = Math.min(currentIndex + chunkSize, text.length);

  // Fixed delay between chunks, still respecting speed prop
  // (You can adjust multiplier for feel)
  const delay = speed * 0.5;

  timeoutRef.current = setTimeout(() => {
    setDisplayedText(text.substring(0, nextIndex));
    typeNextChunk(nextIndex);
  }, delay);
}, [text, speed, onComplete]);

useEffect(() => {
  setDisplayedText('');
  setIsComplete(false);
  typeNextChunk(0);

  return () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
  };
}, [text, typeNextChunk]);


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
