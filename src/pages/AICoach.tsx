import { useState, useEffect, useRef } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { MessageCircle, Send, Bot, User, Sparkles, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
}

const suggestedPrompts = [
  "Help me set a fitness goal for this month",
  "How can I improve my discipline score?",
  "What goals should I prioritize?",
  "Give me tips for building a morning routine"
];

export default function AICoach() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    fetchMessages();
  }, [user]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchMessages = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('ai_chat_messages')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: true })
      .limit(50);

    if (error) {
      console.error('Error fetching messages:', error);
    } else {
      setMessages((data || []).map(m => ({
        ...m,
        role: m.role as 'user' | 'assistant'
      })));
    }
    setInitialLoading(false);
  };

  const sendMessage = async (content: string) => {
    if (!user || !content.trim() || loading) return;

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      content: content.trim(),
      created_at: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    // Save user message to database
    await supabase.from('ai_chat_messages').insert({
      user_id: user.id,
      role: 'user',
      content: content.trim()
    });

    try {
      // Call the AI coach edge function
      const { data, error } = await supabase.functions.invoke('ai-coach', {
        body: {
          message: content.trim(),
          history: messages.slice(-10).map(m => ({
            role: m.role,
            content: m.content
          }))
        }
      });

      if (error) throw error;

      const assistantMessage: Message = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: data.response || "I'm here to help you achieve your goals. What would you like to work on?",
        created_at: new Date().toISOString()
      };

      setMessages(prev => [...prev, assistantMessage]);

      // Save assistant message to database
      await supabase.from('ai_chat_messages').insert({
        user_id: user.id,
        role: 'assistant',
        content: assistantMessage.content
      });
    } catch (error) {
      console.error('Error calling AI:', error);
      const errorMessage: Message = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: "I'm having trouble connecting right now. Please try again in a moment.",
        created_at: new Date().toISOString()
      };
      setMessages(prev => [...prev, errorMessage]);
    }

    setLoading(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  return (
    <AppLayout>
      <div className="max-w-3xl mx-auto h-[calc(100vh-180px)] flex flex-col">
        {/* Header */}
        <div className="mb-6 animate-fade-in-up">
          <h1 className="heading-display text-3xl text-primary mb-2 flex items-center gap-3">
            <MessageCircle className="w-8 h-8" />
            AI Coach
          </h1>
          <p className="text-muted-foreground text-sm">
            Your personal assistant for goal setting and productivity
          </p>
        </div>

        {/* Chat Container */}
        <div className="flex-1 glass-card rounded-3xl overflow-hidden flex flex-col animate-fade-in-up stagger-2">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {initialLoading ? (
              <div className="flex items-center justify-center h-full">
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
              </div>
            ) : messages.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Bot className="w-8 h-8 text-primary" />
                </div>
                <h3 className="heading-display text-lg text-foreground mb-2">
                  Welcome to AI Coach
                </h3>
                <p className="text-sm text-muted-foreground mb-6">
                  I'm here to help you set goals, build habits, and improve your discipline.
                </p>
                
                {/* Suggested Prompts */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-w-md mx-auto">
                  {suggestedPrompts.map((prompt, index) => (
                    <button
                      key={index}
                      onClick={() => sendMessage(prompt)}
                      className="text-left p-3 rounded-2xl border border-border/50 hover:border-primary/50 hover:bg-primary/5 transition-all text-sm text-muted-foreground hover:text-foreground"
                    >
                      <Sparkles className="w-4 h-4 text-primary inline mr-2" />
                      {prompt}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <>
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={cn(
                      'flex gap-3',
                      message.role === 'user' ? 'flex-row-reverse' : 'flex-row'
                    )}
                  >
                    <div className={cn(
                      'w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0',
                      message.role === 'user' 
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-accent/20 text-accent'
                    )}>
                      {message.role === 'user' 
                        ? <User className="w-4 h-4" />
                        : <Bot className="w-4 h-4" />
                      }
                    </div>
                    <div className={cn(
                      'max-w-[75%] p-4 rounded-2xl',
                      message.role === 'user'
                        ? 'bg-primary text-primary-foreground rounded-br-sm'
                        : 'bg-muted rounded-bl-sm'
                    )}>
                      <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    </div>
                  </div>
                ))}
                {loading && (
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center">
                      <Bot className="w-4 h-4 text-accent" />
                    </div>
                    <div className="bg-muted p-4 rounded-2xl rounded-bl-sm">
                      <div className="flex gap-1">
                        <div className="w-2 h-2 bg-muted-foreground/40 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                        <div className="w-2 h-2 bg-muted-foreground/40 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                        <div className="w-2 h-2 bg-muted-foreground/40 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </>
            )}
          </div>

          {/* Input */}
          <form onSubmit={handleSubmit} className="p-4 border-t border-border/50">
            <div className="flex gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask me anything about your goals..."
                className="flex-1"
                disabled={loading}
              />
              <Button type="submit" disabled={!input.trim() || loading}>
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </form>
        </div>
      </div>
    </AppLayout>
  );
}
