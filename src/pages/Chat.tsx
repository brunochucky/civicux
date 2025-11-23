import { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Send, Bot, User } from 'lucide-react';
import { sendMessage, type Message } from '@/services/mentor';
import { cn } from '@/lib/utils';

export default function Chat() {
    const [messages, setMessages] = useState<Message[]>([
        {
            id: '1',
            role: 'assistant',
            content: 'Olá! Sou o Mentor Cívico do Portal EVC (Educação Vira Cidadania) da Câmara dos Deputados. 🏛️\n\nPosso ajudar você com informações sobre:\n\n✅ **Programas Educacionais** (Câmara Mirim, Parlamento Jovem Brasileiro, Missão Pedagógica, etc.)\n✅ **Trilhas de Aprendizagem** sobre democracia e cidadania\n✅ **Como participar** dos programas do EVC\n\nO que você gostaria de saber?',
            timestamp: new Date(),
        },
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = async () => {
        if (!input.trim()) return;

        const userMsg: Message = {
            id: Math.random().toString(36).substring(7),
            role: 'user',
            content: input,
            timestamp: new Date(),
        };

        setMessages((prev) => [...prev, userMsg]);
        setInput('');
        setIsLoading(true);

        try {
            const response = await sendMessage(messages, input);
            setMessages((prev) => [...prev, response]);
        } catch (error) {
            console.error("Chat error", error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-[calc(100vh-4rem)] md:h-[calc(100vh-64px)] max-w-3xl mx-auto bg-slate-50 md:border-x">
            {/* Header */}
            <div className="bg-white border-b p-4 flex items-center gap-3 shadow-sm">
                <div className="bg-primary/10 p-2 rounded-full">
                    <Bot className="h-6 w-6 text-primary" />
                </div>
                <div>
                    <h1 className="font-bold text-slate-900">Mentor Cívico</h1>
                    <p className="text-xs text-slate-500">Portal EVC - Educação para Democracia</p>
                </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((msg) => (
                    <div
                        key={msg.id}
                        className={cn(
                            "flex gap-3 max-w-[80%]",
                            msg.role === 'user' ? "ml-auto flex-row-reverse" : ""
                        )}
                    >
                        <div className={cn(
                            "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0",
                            msg.role === 'user' ? "bg-slate-200" : "bg-primary/10"
                        )}>
                            {msg.role === 'user' ? <User className="h-5 w-5 text-slate-600" /> : <Bot className="h-5 w-5 text-primary" />}
                        </div>
                        <Card className={cn(
                            "p-3 text-sm shadow-sm border-none prose prose-sm max-w-none",
                            msg.role === 'user' ? "bg-primary text-white prose-invert" : "bg-white"
                        )}>
                            <ReactMarkdown
                                remarkPlugins={[remarkGfm]}
                                rehypePlugins={[rehypeRaw]}
                                components={{
                                    // Customizar estilos para links
                                    a: ({ node, ...props }) => (
                                        <a {...props} className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer" />
                                    ),
                                    // Garantir quebras de linha
                                    p: ({ node, ...props }) => (
                                        <p {...props} className="mb-2 last:mb-0" />
                                    ),
                                    // Listas
                                    ul: ({ node, ...props }) => (
                                        <ul {...props} className="list-disc ml-4 mb-2" />
                                    ),
                                    ol: ({ node, ...props }) => (
                                        <ol {...props} className="list-decimal ml-4 mb-2" />
                                    ),
                                }}
                            >
                                {msg.content}
                            </ReactMarkdown>
                        </Card>
                    </div>
                ))}
                {isLoading && (
                    <div className="flex gap-3 max-w-[80%]">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                            <Bot className="h-5 w-5 text-primary" />
                        </div>
                        <Card className="p-3 bg-white shadow-sm border-none">
                            <div className="flex gap-1">
                                <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></span>
                                <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-75"></span>
                                <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-150"></span>
                            </div>
                        </Card>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 bg-white border-t">
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                        placeholder="Pergunte sobre programas educacionais, trilhas ou como participar..."
                        className="flex-1 bg-slate-100 border-0 rounded-md px-4 focus:ring-2 focus:ring-primary focus:outline-none"
                        disabled={isLoading}
                    />
                    <Button onClick={handleSend} disabled={isLoading || !input.trim()}>
                        <Send className="h-4 w-4" />
                    </Button>
                </div>
            </div>
        </div>
    );
}
