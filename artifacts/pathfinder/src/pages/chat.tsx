import { useState, useEffect, useRef } from "react";
import {
  useListConversations,
  useCreateConversation,
  useDeleteConversation,
  useListMessages,
  useSendMessage,
  getListConversationsQueryKey,
  getListMessagesQueryKey,
  useGetStudentProfile,
} from "@workspace/api-client-react";
import { ProtectedLayout } from "@/components/layouts";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import {
  MessageSquare,
  Plus,
  Trash2,
  Send,
  Bot,
  User,
  Sparkles,
  BookOpen,
  GraduationCap,
  Lightbulb,
} from "lucide-react";

const SUGGESTIONS = [
  {
    icon: GraduationCap,
    label: "JAMB Subject Combination",
    prompt: "What JAMB subject combination do I need for Medicine and Surgery in Nigeria?",
  },
  {
    icon: BookOpen,
    label: "WAEC Preparation",
    prompt: "How can I best prepare for my WAEC O'Level exams as a Science student?",
  },
  {
    icon: Lightbulb,
    label: "Tech Career Path",
    prompt: "What skills and university courses should I focus on to become a Software Engineer in Nigeria?",
  },
  {
    icon: Sparkles,
    label: "University Selection",
    prompt: "What are top federal and state universities in Nigeria for Engineering?",
  },
];

export default function Chat() {
  const [activeConvId, setActiveConvId] = useState<number | null>(null);
  const [inputMessage, setInputMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: profile } = useGetStudentProfile();
  const { data: conversations, isLoading: isLoadingConvs } = useListConversations({
    query: { queryKey: getListConversationsQueryKey() },
  });

  const createConversation = useCreateConversation();
  const deleteConversation = useDeleteConversation();

  const { data: messages, isLoading: isLoadingMessages } = useListMessages(
    activeConvId ?? 0,
    {
      query: {
        enabled: !!activeConvId,
        queryKey: getListMessagesQueryKey(activeConvId ?? 0),
      },
    }
  );

  const sendMessage = useSendMessage();

  // Auto-select first conversation if available and none selected
  useEffect(() => {
    if (conversations && conversations.length > 0 && activeConvId === null) {
      setActiveConvId(conversations[0].id);
    }
  }, [conversations, activeConvId]);

  // Auto scroll to bottom of chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, sendMessage.isPending]);

  const handleNewChat = () => {
    createConversation.mutate(
      { data: { title: "New Chat" } },
      {
        onSuccess: (newConv) => {
          setActiveConvId(newConv.id);
          queryClient.invalidateQueries({ queryKey: getListConversationsQueryKey() });
        },
        onError: () => {
          toast({
            title: "Error",
            description: "Failed to create a new chat session.",
            variant: "destructive",
          });
        },
      }
    );
  };

  const handleDeleteChat = (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    deleteConversation.mutate(
      { id },
      {
        onSuccess: () => {
          if (activeConvId === id) {
            const remaining = (conversations || []).filter((c) => c.id !== id);
            setActiveConvId(remaining.length > 0 ? remaining[0].id : null);
          }
          queryClient.invalidateQueries({ queryKey: getListConversationsQueryKey() });
          toast({ title: "Deleted", description: "Chat conversation removed." });
        },
        onError: () => {
          toast({
            title: "Error",
            description: "Failed to delete chat.",
            variant: "destructive",
          });
        },
      }
    );
  };

  const handleSend = (overridePrompt?: string) => {
    const textToSend = overridePrompt || inputMessage.trim();
    if (!textToSend) return;

    if (!activeConvId) {
      // Create conversation first, then send
      createConversation.mutate(
        { data: { title: textToSend.substring(0, 30) } },
        {
          onSuccess: (newConv) => {
            setActiveConvId(newConv.id);
            queryClient.invalidateQueries({ queryKey: getListConversationsQueryKey() });
            dispatchMessage(newConv.id, textToSend);
          },
        }
      );
    } else {
      dispatchMessage(activeConvId, textToSend);
    }

    if (!overridePrompt) setInputMessage("");
  };

  const dispatchMessage = (convId: number, content: string) => {
    sendMessage.mutate(
      { id: convId, data: { content } },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListMessagesQueryKey(convId) });
          queryClient.invalidateQueries({ queryKey: getListConversationsQueryKey() });
        },
        onError: () => {
          toast({
            title: "Failed to send",
            description: "Could not send message. Please try again.",
            variant: "destructive",
          });
        },
      }
    );
  };

  return (
    <ProtectedLayout>
      <div className="h-[calc(100vh-6rem)] flex flex-col md:flex-row gap-4">
        {/* Sidebar Chat History */}
        <Card className="w-full md:w-72 flex flex-col bg-white border shrink-0 h-48 md:h-full overflow-hidden">
          <div className="p-3 border-b flex items-center justify-between bg-muted/30">
            <h2 className="font-semibold text-sm flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-primary" />
              Chat History
            </h2>
            <Button
              size="sm"
              variant="outline"
              onClick={handleNewChat}
              disabled={createConversation.isPending}
              className="gap-1 text-xs h-8"
              data-testid="button-new-chat"
            >
              <Plus className="w-3.5 h-3.5" />
              New Chat
            </Button>
          </div>

          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {isLoadingConvs ? (
              <div className="space-y-2 p-2">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-10 w-full" />
                ))}
              </div>
            ) : conversations && conversations.length > 0 ? (
              conversations.map((conv) => {
                const isActive = activeConvId === conv.id;
                return (
                  <div
                    key={conv.id}
                    onClick={() => setActiveConvId(conv.id)}
                    className={`group flex items-center justify-between px-3 py-2.5 rounded-lg text-sm cursor-pointer transition-colors ${
                      isActive
                        ? "bg-primary/10 text-primary font-medium"
                        : "hover:bg-muted text-muted-foreground hover:text-foreground"
                    }`}
                    data-testid={`conv-item-${conv.id}`}
                  >
                    <span className="truncate flex-1 text-xs">{conv.title}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="opacity-0 group-hover:opacity-100 h-6 w-6 text-muted-foreground hover:text-destructive shrink-0"
                      onClick={(e) => handleDeleteChat(e, conv.id)}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                );
              })
            ) : (
              <div className="p-4 text-center text-xs text-muted-foreground">
                No chat history yet. Start a new conversation!
              </div>
            )}
          </div>
        </Card>

        {/* Main Chat Area */}
        <Card className="flex-1 flex flex-col bg-white border overflow-hidden h-full">
          {/* Chat Header */}
          <div className="p-4 border-b flex items-center justify-between bg-white z-10 shadow-xs">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="font-bold text-foreground text-base">PathFinder AI Advisor</h1>
                  <Badge variant="secondary" className="text-[10px] bg-emerald-100 text-emerald-800 border-emerald-200">
                    Live
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  Personalized career & educational guidance for Nigerian students
                </p>
              </div>
            </div>

            {profile && (
              <Badge variant="outline" className="hidden sm:inline-flex text-xs">
                👤 {profile.fullName.split(" ")[0]} ({profile.classLevel})
              </Badge>
            )}
          </div>

          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 bg-gray-50/50">
            {!activeConvId || (!messages || messages.length === 0) ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-6 max-w-xl mx-auto">
                <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                  <Sparkles className="w-7 h-7 animate-pulse" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-bold text-foreground">
                    Hello{profile ? `, ${profile.fullName.split(" ")[0]}` : ""}! How can I help you today?
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Ask me anything about JAMB subjects, WAEC requirements, Nigerian university courses, or career roadmaps!
                  </p>
                </div>

                {/* Suggestions Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full text-left pt-2">
                  {SUGGESTIONS.map((item, idx) => {
                    const IconComp = item.icon;
                    return (
                      <button
                        key={idx}
                        onClick={() => handleSend(item.prompt)}
                        className="p-3.5 rounded-xl border border-border bg-white hover:border-primary/50 hover:bg-primary/5 transition-all text-xs flex flex-col gap-1.5 shadow-xs"
                      >
                        <div className="flex items-center gap-2 font-medium text-foreground">
                          <IconComp className="w-4 h-4 text-primary shrink-0" />
                          <span>{item.label}</span>
                        </div>
                        <p className="text-muted-foreground text-[11px] line-clamp-2">
                          "{item.prompt}"
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : (
              messages.map((msg) => {
                const isUser = msg.role === "user";
                return (
                  <div
                    key={msg.id}
                    className={`flex items-start gap-3 ${isUser ? "flex-row-reverse" : "flex-row"}`}
                  >
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                        isUser
                          ? "bg-primary text-primary-foreground"
                          : "bg-emerald-600 text-white"
                      }`}
                    >
                      {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                    </div>

                    <div
                      className={`max-w-[85%] sm:max-w-[75%] rounded-2xl p-4 text-sm shadow-xs ${
                        isUser
                          ? "bg-primary text-primary-foreground rounded-tr-none"
                          : "bg-white border border-border text-foreground rounded-tl-none space-y-2"
                      }`}
                    >
                      <div className="whitespace-pre-wrap leading-relaxed">
                        {msg.content}
                      </div>
                      <span
                        className={`text-[10px] block mt-1 ${
                          isUser ? "text-primary-foreground/70 text-right" : "text-muted-foreground"
                        }`}
                      >
                        {new Date(msg.createdAt).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                  </div>
                );
              })
            )}

            {/* Typing Indicator */}
            {sendMessage.isPending && (
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="bg-white border border-border rounded-2xl rounded-tl-none p-4 shadow-xs flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-primary animate-bounce [animation-delay:-0.3s]" />
                  <span className="w-2 h-2 rounded-full bg-primary animate-bounce [animation-delay:-0.15s]" />
                  <span className="w-2 h-2 rounded-full bg-primary animate-bounce" />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Chat Input Bar */}
          <div className="p-3 md:p-4 border-t bg-white">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="flex items-center gap-2"
            >
              <Input
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Ask PathFinder Advisor about careers, JAMB, WAEC, or universities..."
                className="flex-1 h-11"
                disabled={sendMessage.isPending}
                data-testid="input-chat-message"
              />
              <Button
                type="submit"
                disabled={sendMessage.isPending || !inputMessage.trim()}
                className="h-11 px-4 gap-2"
                data-testid="button-send-message"
              >
                <Send className="w-4 h-4" />
                <span className="hidden sm:inline">Send</span>
              </Button>
            </form>
          </div>
        </Card>
      </div>
    </ProtectedLayout>
  );
}
