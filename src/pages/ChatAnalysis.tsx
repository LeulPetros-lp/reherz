import { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Send, ArrowLeft, Bot, User } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

type Message = {
  id: string;
  content: string;
  sender: 'user' | 'assistant';
  timestamp: Date;
};

export default function ChatAnalysis() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const location = useLocation();
  const navigate = useNavigate();
  
  // Get session data from location state
  const sessionData = location.state?.sessionData;
  const latestSession = sessionData?.[sessionData.length - 1];

  // Initialize with a welcome message
  useEffect(() => {
    if (sessionData) {
      setMessages([
        {
          id: '1',
          content: `Hello! I'm your speech analysis assistant. I can help you understand your speech patterns, provide feedback, and suggest improvements based on your latest session data. What would you like to know?`,
          sender: 'assistant',
          timestamp: new Date()
        }
      ]);
    } else {
      // If no session data, navigate back to home
      navigate('/');
      toast({
        title: 'No session data',
        description: 'Please complete a recording session first',
        variant: 'destructive'
      });
    }
  }, [sessionData, navigate, toast]);

  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: input,
      sender: 'user',
      timestamp: new Date()
    };

    // Add user message to chat
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // Prepare the context with session data
      const context = {
        latestSession: latestSession,
        averagePose: sessionData?.reduce((acc: number, s: any) => acc + s.pose, 0) / sessionData?.length,
        averageTone: sessionData?.reduce((acc: number, s: any) => acc + s.tone, 0) / sessionData?.length,
        totalSessions: sessionData?.length || 0
      };

      // In a real app, you would call your backend API here
      // const response = await fetch('/api/chat', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ message: input, context })
      // });
      // const data = await response.json();

      // Mock response for now
      await new Promise(resolve => setTimeout(resolve, 1000));
      const mockResponses = [
        "Based on your latest session, your speech patterns show good clarity but could use more variation in tone.",
        "I can see you've been practicing regularly. Your average score is improving!",
        "Your pacing is good, but try to reduce filler words for better clarity.",
        "I notice you tend to speak faster when presenting complex ideas. Try to maintain a steady pace.",
        "Your tone is engaging, but adding more vocal variety could make your delivery even more compelling."
      ];
      
      const randomResponse = mockResponses[Math.floor(Math.random() * mockResponses.length)];

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: randomResponse,
        sender: 'assistant',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: 'Error',
        description: 'Failed to send message. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-muted/40">
      <header className="border-b bg-background">
        <div className="container flex h-16 items-center px-4 md:px-6">
          <Button
            variant="ghost"
            size="icon"
            className="mr-4"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="h-5 w-5" />
            <span className="sr-only">Back</span>
          </Button>
          <h1 className="text-lg font-semibold">Speech Analysis Assistant</h1>
        </div>
      </header>

      <main className="flex-1 overflow-hidden">
        <div className="h-full overflow-y-auto p-4 md:p-6">
          <div className="max-w-3xl mx-auto space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`flex items-start gap-3 max-w-[80%] ${
                    message.sender === 'user' ? 'flex-row-reverse' : ''
                  }`}
                >
                  <div
                    className={`flex h-8 w-8 items-center justify-center rounded-full ${
                      message.sender === 'user' ? 'bg-primary text-primary-foreground' : 'bg-secondary'
                    }`}
                  >
                    {message.sender === 'user' ? (
                      <User className="h-4 w-4" />
                    ) : (
                      <Bot className="h-4 w-4" />
                    )}
                  </div>
                  <Card className="p-4">
                    <p className="text-sm">{message.content}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </Card>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex items-center justify-start gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary">
                  <Bot className="h-4 w-4" />
                </div>
                <Card className="p-4">
                  <div className="flex space-x-2">
                    <div className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </Card>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>
      </main>

      <footer className="border-t bg-background p-4">
        <div className="max-w-3xl mx-auto">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex gap-2"
          >
            <Input
              type="text"
              placeholder="Ask about your speech analysis..."
              className="flex-1"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={isLoading}
            />
            <Button type="submit" size="icon" disabled={isLoading}>
              <Send className="h-4 w-4" />
              <span className="sr-only">Send</span>
            </Button>
          </form>
        </div>
      </footer>
    </div>
  );
}
