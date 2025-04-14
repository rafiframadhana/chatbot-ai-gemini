"use client";

import React, { useEffect, useRef, useState } from "react";
import { askQuestion } from "@/ai/flows/query-knowledge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Icons } from "@/components/icons";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Toaster } from "@/components/ui/toaster";
import { useToast } from "@/hooks/use-toast";
import MarkdownToJSX from "markdown-to-jsx";
import { ChevronLeft, ChevronRight } from "lucide-react";
import ReactMarkdown from "react-markdown";


const ChatMessage = ({
  role,
  content,
}: {
  role: "user" | "assistant";
  content: string;
}) => (
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
  const [messages, setMessages] = useState<
    { role: "user" | "assistant"; content: string }[]
  >([]);
  const [input, setInput] = useState("");
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const chatWindowRef = useRef<HTMLDivElement>(null);
  const suggestedMessagesContainerRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const clearMessages = () => {
    setMessages([]);
  };

  const suggestedMessages = [
    "Tell me about your skills.",
    "What projects have you worked on?",
    "What are your interests?",
    "Where are you located?",
    "What is your work experience?",
  ];

  const handleSuggestedMessageClick = (message: string) => {
    setInput(message);
  };

  const scrollSuggestedMessages = (direction: "left" | "right") => {
    const container = suggestedMessagesContainerRef.current;
    if (container) {
      const scrollAmount = direction === "left" ? -200 : 200;
      container.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  useEffect(() => {
    if (chatWindowRef.current) {
      chatWindowRef.current.scrollTop = chatWindowRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = { role: "user", content: input };
    setMessages((prevMessages) => [...prevMessages, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const aiResponse = await askQuestion({ question: input });
      const aiMessage = { role: "assistant", content: aiResponse.answer };
      setMessages((prevMessages) => [...prevMessages, aiMessage]);
    } catch (error) {
      console.error("Failed to get AI response:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to get AI response.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end space-y-2">
      <Toaster />

      {/* Chat Window */}
      {isChatOpen && (
        <Card className="w-96 shadow-2xl rounded-2xl overflow-hidden bg-black text-white border border-gray-700">
          <CardContent className="p-0 flex flex-col h-[500px]">
            {/* Header */}
            <div className="border-b border-gray-700 p-4 flex items-center justify-between bg-zinc-900">
              {/* Left: Avatar + Name */}
              <div className="flex items-center space-x-4">
                <Avatar>
                  <AvatarImage
                    src="https://picsum.photos/50/50"
                    alt="AI Chatbot"
                  />
                  <AvatarFallback>AI</AvatarFallback>
                </Avatar>
                <div>
                  <h5 className="font-semibold">Apip</h5>
                  <p className="text-sm text-muted-foreground text-gray-400">
                    Online
                  </p>
                </div>
              </div>
              {/* Right: Reset Button */}
              <Button
                onClick={clearMessages}
                variant="ghost"
                className="text-white"
              >
                Reset
              </Button>
            </div>

            {/* Chat Messages */}
            <ScrollArea
              ref={chatWindowRef}
              className="flex-grow p-4 space-y-2 bg-black overflow-y-auto scrollbar-hide"
            >
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex ${
                    message.role === "user" ? "justify-start" : "justify-end"
                  }`}
                >
                  <div
                    className={`px-4 py-2 max-w-[80%] bottom-left- rounded-xl shadow-md mb-4 ${
                      message.role === "user"
                        ? "bg-blue-600 hyphens-auto rounded-[20px] rounded-r-[20px] rounded-l  only:rounded-[20px] last:rounded-tl first:rounded-tl-[20px] first:rounded-bl only:rounded-bl last:rounded-bl-[20px]"
                        : "bg-gray-800 hyphens-auto rounded-[20px] px-1 py-4 rounded-r last:rounded-tr first:rounded-tr-[20px] only:rounded-tr-[20px] first:rounded-br only:rounded-br last:rounded-br-[20px]"
                    }`}
                  >
                    <ReactMarkdown>{message.content}</ReactMarkdown>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="my-1 text-gray-400 flex items-center justify-end">
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
                onChange={(e) => setInput(e.target.value)}
                className="flex-grow rounded-lg bg-gray-800 text-white border-gray-600"
                onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              />
              <Button
                onClick={sendMessage}
                className="rounded-lg bg-blue-600 hover:bg-blue-700 text-white"
                disabled={isLoading}
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
      )}

      {/* Toggle Chat Button */}
      <button
        className="w-16 h-16 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-colors duration-300 flex items-center justify-center text-lg"
        onClick={() => setIsChatOpen(!isChatOpen)}
      >
        {isChatOpen ? "✕" : "💬"}
      </button>
    </div>
  );
};

export default ChatInterface;
