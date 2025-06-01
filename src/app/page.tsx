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
import { ChevronLeft, ChevronRight } from "lucide-react";
import ReactMarkdown from "react-markdown";
import AddCommentIcon from "@mui/icons-material/AddComment";
import ChatBubbleIcon from "@mui/icons-material/ChatBubble";
import CloseIcon from "@mui/icons-material/Close";
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
  const [messages, setMessages] = useState<
    { id: string; role: "user" | "assistant"; content: string }[]
  >([]);
  const [input, setInput] = useState("");
  const [isChatOpen, setIsChatOpen] = useState(false);  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const chatWindowRef = useRef<HTMLDivElement>(null);
  const suggestedMessagesContainerRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const clearMessages = () => {
    setMessages([]);
    setAnimatedMessageIds(new Set());
  };

  // Add intro message when chat is opened
  useEffect(() => {
    if (isChatOpen) {
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
    }
  }, [isChatOpen, messages.length]);

  const suggestedMessages = [
    "Tell me about yourself.",
    "Tell me about your skills.",
    "What projects have you worked on?",
    "What are your interests?",
    "Where are you located?",
    "What is your work experience?",
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
    setTimeout(scrollToBottom, 100);    try {
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
    setTimeout(scrollToBottom, 100);    try {
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
      return <p className="text-[16px] mb-3 last:mb-0" {...props} />;
    },
    ul: ({ node, ...props }: { node?: any; [key: string]: any }) => <ul className="mb-3 text-[16px]" {...props} />,
    li: ({ node, children, ...props }: { node?: any; children?: React.ReactNode }) => (
      <li className="text-[16px] flex items-start gap-2 mb-1" {...props}>
        <span className="select-none mt-[2px]">•</span>
        <span>{children}</span>
      </li>
    ),
    h2: ({ node, ...props }: { node?: any; [key: string]: any }) => (
      <h2 className="text-[16px] font-semibold" {...props} />
    ),
    h3: ({ node, ...props }: { node?: any; [key: string]: any }) => <h3 className="text-[16px]" {...props} />,
    a: ({ node, href, children, ...props }: { node?: any; href?: string; children?: React.ReactNode }) => {
      if (!href) return null;
      return (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-500 underline hover:text-blue-600"
          {...props}
        >
          {children}
        </a>
      );
    },
  };

  const formatMessage = (content: string) => {
    return content
      .trim()
      .replace(/\n{3,}/g, "\n\n")
      .replace(/\n\s+/g, "\n")
      .replace(/^[-*]\s/gm, "• ");
  };
  const [animatedMessageIds, setAnimatedMessageIds] = useState(
    new Set<string>()
  );
  const MessageContent = ({ message }: { message: Message }) => {
    const isLatestAssistantMessage =
      message.role === "assistant" &&
      messages[messages.length - 1]?.id === message.id;

    const previouslyAnimated = animatedMessageIds.has(message.id);    const shouldAnimate = isLatestAssistantMessage && !previouslyAnimated;

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
          speed={15}
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
    <div
      className={`${
        isMobile && isChatOpen ? "fixed inset-0" : "fixed bottom-4 left-4"
      } z-50 flex flex-col items-start ${!isMobile && "space-y-2"}`}
    >
      <Toaster />
      {/* Chat Window */}
      {isChatOpen && (
        <Card
          className={`${
            isMobile ? "w-full h-full rounded-none" : "w-[450px] rounded-2xl"
          } overflow-hidden bg-black text-white border border-blue-950`}
          style={{
            boxShadow: isMobile ? "none" : "0 0 55px rgba(0, 128, 255, 0.5)", // Gemini-like blue glow
          }}
        >
          <CardContent
            className={`p-0 flex flex-col ${isMobile ? "h-full" : "h-[550px]"}`}
          >
            {/* Header */}
            <div className="border-b border-gray-700 p-4 flex items-center justify-between bg-zinc-900">
              {/* Left: Avatar + Name */}
              <div className="flex items-center space-x-4">
                {" "}
                <div className="relative">
                  <Avatar>
                    <AvatarImage
                      src="https://avatars.githubusercontent.com/rafiframadhana"
                      alt="Rafif Ramadhana"
                    />
                    <AvatarFallback>RR</AvatarFallback>
                  </Avatar>                  <span className="absolute bottom-[2px] right-[-2px] flex h-[12px] w-[12px]">
                    <span className={`absolute inline-flex h-full w-full animate-ping rounded-full ${hasError ? 'bg-red-400' : 'bg-green-400'} opacity-75`}></span>
                    <span className={`relative inline-flex rounded-full h-[12px] w-[12px] ${hasError ? 'bg-red-500' : 'bg-green-500'} border-2 border-black shadow-md`}></span>
                  </span>
                </div>{" "}
                <div>
                  <h5 className="font-semibold text-center ">Rafif's AI</h5>
                </div>
              </div>{" "}
              <div className="flex items-center">
                {/* Exit Button - Mobile Only */}
                {isMobile && (
                  <Tooltip title="Exit Chat" arrow>
                    <button
                      onClick={() => setIsChatOpen(false)}
                      className="text-white mr-5"
                    >
                      <span className="text-xl">✕</span>
                    </button>
                  </Tooltip>
                )}
                {/* Reset Button */}
                <Tooltip title="New Chat" arrow>
                  <button onClick={clearMessages} className="text-white mr-3">
                    <AddCommentIcon sx={{ fontSize: 23 }} />
                  </button>
                </Tooltip>
              </div>
            </div>{" "}
            {/* Chat Messages */}
            <ScrollArea
              ref={chatWindowRef}
              className="flex-grow px-4 pt-4 space-y-0 bg-black overflow-y-auto scrollbar-hide"
            >
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex ${
                    message.role === "user" ? "justify-end" : "justify-start"
                  } items-start`}
                >
                  {" "}
                  <div
                    className={`px-5 py-4 max-w-[85%] rounded-xl shadow-md mb-4 ${
                      message.role === "user"
                        ? "bg-blue-600 text-white rounded-[20px] rounded-r last:rounded-tr first:rounded-tr-[20px] only:rounded-tr-[20px] first:rounded-br only:rounded-br last:rounded-br-[20px] "
                        : "bg-gray-800 text-white rounded-[20px] rounded-l only:rounded-[20px] last:rounded-tl first:rounded-tl-[20px] first:rounded-bl only:rounded-bl last:rounded-bl-[20px]"
                    }`}
                  >
                    {" "}
                    <div className="markdown-message text-[16px] leading-relaxed">
                      <MessageContent message={message} />
                    </div>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="mt-1 mb-[210px] text-gray-400 flex items-center justify-start">
                  <Icons.spinner className="animate-spin mr-2 h-4 w-4 inline-block text-white" />
                  Generating response...
                </div>
              )}
            </ScrollArea>
            {/* Suggested Messages - Updated with horizontal scroll buttons */}
            <div className="p-4 border-t border-gray-700 relative group">
              {/* Left scroll button */}
              <button
                onClick={() => scrollSuggestedMessages("left")}
                className="absolute left-0 top-1/2 transform -translate-y-1/2 bg-zinc-800 rounded-full p-1 z-10 text-white opacity-80 hover:opacity-100 transition hidden group-hover:block"
                style={{ marginLeft: "4px" }}
              >
                <ChevronLeft size={16} />
              </button>

              {/* Scrollable container */}
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

              {/* Right scroll button */}
              <button
                onClick={() => scrollSuggestedMessages("right")}
                className="absolute right-0 top-1/2 transform -translate-y-1/2 bg-zinc-800 rounded-full p-1 z-10 text-white opacity-80 hover:opacity-100 transition hidden group-hover:block"
                style={{ marginRight: "4px" }}
              >
                <ChevronRight size={16} />
              </button>
            </div>
            {/* Input Area */}
            <div className="p-4 flex items-center space-x-2 border-t border-gray-700 bg-zinc-900">
              <Input
                type="text"
                placeholder="Ask me anything..."
                value={input}
                onChange={(e) => setInput(e.target.value)}                className="flex-grow rounded-lg bg-gray-800 text-white border-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                onKeyDown={(e) => e.key === "Enter" && !isLoading && !isTyping && sendMessage()}
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
      )}{" "}
      {/* Toggle Chat Button - Hidden on mobile when chat is open */}
      {(!isMobile || !isChatOpen) && (
        <button
          className="w-16 h-16 bg-black text-white rounded-full shadow-lg hover:bg-gray-800 transition-colors duration-300 flex items-center justify-center"
          onClick={() => setIsChatOpen(!isChatOpen)}
        >
          {isChatOpen ? (
            <CloseIcon sx={{ fontSize: 24 }} />
          ) : (
            <ChatBubbleIcon sx={{ fontSize: 24 }} />
          )}
        </button>
      )}
    </div>
  );
};

export default ChatInterface;
