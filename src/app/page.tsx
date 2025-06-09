"use client";

import React, { useEffect, useRef, useState } from "react";
import { askQuestion } from "@/ai/flows/query-knowledge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useIsMobile } from "@/hooks/use-mobile";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Icons } from "@/components/icons";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Toaster } from "@/components/ui/toaster";
import { useToast } from "@/hooks/use-toast";
import { TypingEffect } from "@/components/ui/typing-effect";
import MarkdownToJSX from "markdown-to-jsx";
import { ChevronDownIcon, ChevronLeft, ChevronRight } from "lucide-react";
import ReactMarkdown from "react-markdown";
import AddCommentIcon from "@mui/icons-material/AddComment";
import Tooltip from "@mui/material/Tooltip";

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

const ChatMessage = ({ role, content }: Pick<Message, "role" | "content">) => (
  <div
    className={`rounded-lg p-3 my-1 max-w-xs ${
      role === "user"
        ? "bg-secondary text-foreground self-end"
        : "bg-accent text-accent-foreground self-start"
    }`}
  >
    <MarkdownToJSX>{content}</MarkdownToJSX>
  </div>
);

const ChatInterface = () => {
  const isMobile = useIsMobile();
  const [hasError, setHasError] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const chatWindowRef = useRef<HTMLDivElement>(null);
  const suggestedMessagesContainerRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const [animatedMessageIds, setAnimatedMessageIds] = useState(
    new Set<string>()
  );
  const imageUrl = "https://i.imgur.com/dZTdQf8.jpeg";

  const clearMessages = () => {
    setMessages([]);
    setAnimatedMessageIds(new Set());
  };

  // Add intro message when component mounts
  useEffect(() => {
    const timer = setTimeout(() => {
      if (messages.length === 0) {
        const introMessage: Message = {
          id: Date.now().toString(),
          role: "assistant",
          content: "Hi! Rafif's here. How can I help you?",
        };
        setMessages([introMessage]);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [messages.length]);

  const suggestedMessages = [
    "Tell me about yourself.",
    "What projects have you worked on?",
    "Tell me about your skills.",
    "What is your work experience?",
    "What is your education background?",
    "What are your interests?",
    "Where are you located?",
  ];

  const handleSuggestedMessageClick = async (message: string) => {
    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: message,
    };
    setMessages((prevMessages) => [...prevMessages, userMessage]);
    setIsLoading(true);
    // Scroll to bottom when user clicks a suggested message
    setTimeout(scrollToBottom, 100);
    try {
      const aiResponse = await askQuestion({ question: message });
      const aiMessage: Message = {
        id: Date.now().toString(),
        role: "assistant",
        content: aiResponse.answer,
      };
      setMessages((prevMessages) => [...prevMessages, aiMessage]);
      setHasError(false);
    } catch (error) {
      console.error("Failed to get AI response:", error);
      setHasError(true);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to get AI response.",
      });
    } finally {
      setIsLoading(false);
      setInput("");
    }
  };

  const scrollSuggestedMessages = (direction: "left" | "right") => {
    const container = suggestedMessagesContainerRef.current;
    if (container) {
      const scrollAmount = direction === "left" ? -200 : 200;
      container.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };
  const scrollToBottom = () => {
    if (chatWindowRef.current) {
      const viewport = chatWindowRef.current.querySelector(
        "[data-radix-scroll-area-viewport]"
      );
      if (viewport) {
        viewport.scrollTo({ top: viewport.scrollHeight, behavior: "smooth" });
      }
    }
  };

  // Only scroll when user sends a message or chat is opened
  useEffect(() => {
    if (messages.length > 0 && messages[messages.length - 1].role === "user") {
      scrollToBottom();
    }
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim()) return;
    const userMessage = {
      id: Date.now().toString(),
      role: "user",
      content: input,
    };
    setMessages((prevMessages: any) => [...prevMessages, userMessage]);
    setInput("");
    setIsLoading(true);
    // Scroll to bottom when user sends a message
    setTimeout(scrollToBottom, 100);
    try {
      const aiResponse = await askQuestion({ question: input });
      const aiMessage = {
        id: Date.now().toString(),
        role: "assistant",
        content: aiResponse.answer,
      };
      setMessages((prevMessages: any) => [...prevMessages, aiMessage]);
      setHasError(false);
    } catch (error) {
      console.error("Failed to get AI response:", error);
      setHasError(true);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to get AI response.",
      });
    } finally {
      setIsLoading(false);
    }
  };
  const markdownComponents = {
    p: ({ node, ...props }: { node?: any; [key: string]: any }) => {
      const content = props.children?.toString()?.trim();
      if (!content) return null;
      return <p className="text-[16px] mb-3 last:mb-0 break-words" {...props} />;
    },    pre: ({ node, ...props }: { node?: any; [key: string]: any }) => (
      <div className="relative rounded-md">
        <pre className="overflow-x-auto scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-transparent pr-2" {...props} />
      </div>
    ),
    code: ({ node, inline, ...props }: { node?: any; inline?: boolean; [key: string]: any }) => {
      if (inline) {
        return <code className="bg-black/30 rounded px-1 py-0.5 text-[16px]" {...props} />;
      }
      return (
        <code className="block w-full font-mono text-xs sm:text-sm break-all whitespace-pre-wrap" {...props} />
      );
    },
    ul: ({ node, ...props }: { node?: any; [key: string]: any }) => (
      <ul className="mb-3 text-[16px]" {...props} />
    ),
    li: ({
      node,
      children,
      ...props
    }: {
      node?: any;
      children?: React.ReactNode;
    }) => (
      <li className="text-[16px] flex items-start gap-2 mb-1" {...props}>
        <span className="select-none mt-[2px]">•</span>
        <span>{children}</span>
      </li>
    ),
    h2: ({ node, ...props }: { node?: any; [key: string]: any }) => (
      <h2 className="text-[16px] font-semibold" {...props} />
    ),
    h3: ({ node, ...props }: { node?: any; [key: string]: any }) => (
      <h3 className="text-[16px]" {...props} />
    ),
    a: ({
      node,
      href,
      children,
      ...props
    }: {
      node?: any;
      href?: string;
      children?: React.ReactNode;
    }) => {
      if (!href) return null;
      return (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="text-cyan-500 underline hover:text-blue-500"
          {...props}
        >
          {children}
        </a>
      );
    },
  };

  const formatMessage = (content: string) => {
  return content
    .trim()                                         // Remove leading/trailing whitespace
    .replace(/\r\n/g, "\n")                         // Normalize Windows-style line endings to Unix
    .replace(/\n{3,}/g, "\n\n")                     // Collapse 3+ newlines into 2 (for readability)
    .replace(/^([ \t]*)[-*]\s+/gm, "$1• ")          // Replace list dashes/stars with bullets, keep indentation
    .replace(/[ \t]+$/gm, "");                      // Remove trailing spaces on each line
};

  const MessageContent = ({ message }: { message: Message }) => {
    const isLatestAssistantMessage =
      message.role === "assistant" &&
      messages[messages.length - 1]?.id === message.id;

    const previouslyAnimated = animatedMessageIds.has(message.id);
    const shouldAnimate = isLatestAssistantMessage && !previouslyAnimated;

    useEffect(() => {
      if (shouldAnimate) {
        setIsTyping(true);
      }
    }, [shouldAnimate]);

    if (shouldAnimate) {
      return (
        <TypingEffect
          key={message.id}
          text={formatMessage(message.content || "")}
          speed={35}
          onComplete={() => {
            setAnimatedMessageIds(new Set([...animatedMessageIds, message.id]));
            setIsTyping(false);
          }}
        />
      );
    }

    return (
      <ReactMarkdown components={markdownComponents}>
        {formatMessage(message.content || "")}
      </ReactMarkdown>
    );
  };
  return (
    <div className="fixed inset-0 flex flex-col bg-black">
      <Toaster />{" "}
      <Card className="w-full flex-1 bg-black text-white border-0 overflow-hidden">
        <CardContent className="p-0 flex flex-col h-full overflow-hidden">
          {/* Header */}
          <div className="border-b border-gray-700 p-4 flex items-center justify-between bg-zinc-900">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Avatar>
                  <AvatarImage src={imageUrl} alt="Rafif Ramadhana" />
                  <AvatarFallback>RR</AvatarFallback>
                </Avatar>
                <span className="absolute bottom-[2px] right-[-2px] flex h-[12px] w-[12px]">
                  <span
                    className={`absolute inline-flex h-full w-full animate-ping rounded-full ${
                      hasError ? "bg-red-400" : "bg-green-400"
                    } opacity-75`}
                  ></span>
                  <span
                    className={`relative inline-flex rounded-full h-[12px] w-[12px] ${
                      hasError ? "bg-red-500" : "bg-green-500"
                    } border-2 border-black shadow-md`}
                  ></span>
                </span>
              </div>
              <div>
                <h5 className="font-semibold text-center">Rafif</h5>
              </div>
            </div>
            <div className="flex items-center">
              <Tooltip title="New Chat" arrow>
                <button onClick={clearMessages} className="text-white mr-2">
                  <AddCommentIcon sx={{ fontSize: 23 }} />
                </button>
              </Tooltip>
            </div>
          </div>{" "}
          {/* Chat Messages */}{" "}
          <ScrollArea
            ref={chatWindowRef}
            className="flex-1 min-h-0 px-4 pt-4 bg-black scrollbar-hide"
          >
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${
                  message.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                {message.role === "assistant" && (
                  <div className="flex flex-col justify-end">
                    <Avatar className="mr-2 w-8 h-8 flex items-center justify-center mb-4">
                      <AvatarImage src={imageUrl} alt="Rafif Ramadhana" />
                      <AvatarFallback>RR</AvatarFallback>
                    </Avatar>
                  </div>
                )}                <div
                  className={`px-4 py-3 sm:px-5 sm:py-4 max-w-[85%] sm:max-w-[85%] rounded-xl shadow-md mb-4 overflow-hidden ${
                    message.role === "user"
                      ? "bg-blue-600 text-gray-100 rounded-[20px] rounded-r last:rounded-tr first:rounded-tr-[20px] only:rounded-tr-[20px] first:rounded-br only:rounded-br last:rounded-br-[20px]"
                      : "bg-gray-800 text-gray-200 rounded-[20px] rounded-l only:rounded-[20px] last:rounded-bl first:rounded-bl-[20px] first:rounded-tl only:rounded-tl last:rounded-tl-[20px]"
                  }`}
                >
                  <div className="markdown-message text-[14px] sm:text-[16px] leading-relaxed [&_pre]:overflow-x-auto [&_pre]:w-[calc(100vw-120px)] sm:[&_pre]:w-full [&_pre]:max-w-full [&_pre]:p-2 sm:[&_pre]:p-4 [&_pre]:rounded-md [&_pre]:bg-black/50 [&_pre]:my-2 [&_pre_code]:text-[14px] sm:[&_pre_code]:text-[14px]">
                    <MessageContent message={message} />
                  </div>
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex justify-start">
                <div className="flex flex-col justify-end">
                  <Avatar className="mr-2 w-8 h-8 flex items-center justify-center mb-4">
                    <AvatarImage src={imageUrl} alt="Rafif Ramadhana" />
                    <AvatarFallback>RR</AvatarFallback>
                  </Avatar>
                </div>

                <div className="px-5 py-4 max-w-[85%] shadow-md mb-4 bg-gray-800 text-white rounded-[20px] rounded-l only:rounded-[20px] last:rounded-bl first:rounded-bl-[20px] first:rounded-tl only:rounded-tl last:rounded-tl-[20px]">
                  <div className="chat-loader"></div>
                </div>
              </div>
            )}

            {/* <button
              onClick={scrollToBottom}
              className="fixed bottom-40 right-3 p-3 rounded-full bg-gray-500 bg-opacity-20 hover:bg-opacity-30 text-white shadow-lg z-50"
              aria-label="Scroll to bottom"
            >
              <ChevronDownIcon />
            </button> */}
          </ScrollArea>
          {/* Suggested Messages */}{" "}
          <div className="shrink-0 p-4 border-t border-gray-700 relative group">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => scrollSuggestedMessages("left")}
              className="absolute left-0 top-1/2 transform -translate-y-1/2 bg-zinc-800/80 hover:bg-zinc-800 rounded-full z-10 opacity-0 group-hover:opacity-100 transition-opacity"
              style={{ marginLeft: "4px" }}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            <div
              ref={suggestedMessagesContainerRef}
              className="w-full overflow-x-auto scrollbar-hide"
              style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
            >
              <div className="flex flex-row space-x-3 whitespace-nowrap">
                {suggestedMessages.map((msg, idx) => (
                  <span
                    key={idx}
                    onClick={() => handleSuggestedMessageClick(msg)}
                    className="cursor-pointer bg-gray-700 px-4 py-2 rounded-full hover:bg-gray-600 transition text-sm text-white"
                  >
                    {msg}
                  </span>
                ))}
              </div>
            </div>

            <Button
              variant="ghost"
              size="icon"
              onClick={() => scrollSuggestedMessages("right")}
              className="absolute right-0 top-1/2 transform -translate-y-1/2 bg-zinc-800/80 hover:bg-zinc-800 rounded-full z-10 opacity-0 group-hover:opacity-100 transition-opacity"
              style={{ marginRight: "4px" }}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          {/* Input Area */}{" "}
          <div className="shrink-0 p-4 flex items-center space-x-2 border-t border-gray-700 bg-zinc-900">
            <Input
              type="text"
              placeholder="Ask me anything..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="flex-grow rounded-lg bg-gray-800 text-white border-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
              onKeyDown={(e) =>
                e.key === "Enter" && !isLoading && !isTyping && sendMessage()
              }
              disabled={isLoading || isTyping}
            />
            <Button
              onClick={sendMessage}
              className="rounded-lg bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isLoading || isTyping || !input.trim()}
            >
              {isLoading ? (
                <Icons.loader className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Icons.send className="h-4 w-4" />
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ChatInterface;
