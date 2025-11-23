import { useEffect, useState } from 'react';
import { api } from '@/lib/axios';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import ReactMarkdown from 'react-markdown';
import { FileText, ExternalLink, Sparkles, Loader2, Copy, Check } from 'lucide-react';

interface Highlight {
    id: number;
    title: string;
    link: string;
    date: string;
    tag?: string;
    summary?: string;
}

const OfficialDiary = () => {
    const [highlights, setHighlights] = useState<Highlight[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [loadingMore, setLoadingMore] = useState(false);
    const [summarizing, setSummarizing] = useState<number | null>(null);
    const [summaries, setSummaries] = useState<Record<number, string>>({});

    useEffect(() => {
        fetchHighlights(1);
    }, []);

    const fetchHighlights = async (pageNum: number) => {
        try {
            if (pageNum > 1) setLoadingMore(true);
            const response = await api.get('/dou', {
                params: { page: pageNum }
            });

            const { items, totalPages: total } = response.data;

            if (pageNum > 1) {
                setHighlights(prev => [...prev, ...items]);
            } else {
                setHighlights(items);
            }

            if (total) setTotalPages(total);
            setPage(pageNum);
        } catch (error) {
            console.error('Error fetching highlights:', error);
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    };

    const [copied, setCopied] = useState<number | null>(null);

    const handleCopy = (text: string, id: number) => {
        navigator.clipboard.writeText(text);
        setCopied(id);
        setTimeout(() => setCopied(null), 2000);
    };

    const shareUrl = (text: string, platform: 'whatsapp' | 'twitter' | 'linkedin' | 'facebook' | 'threads') => {
        const url = encodeURIComponent(window.location.href);
        const textEncoded = encodeURIComponent(text);

        switch (platform) {
            case 'whatsapp':
                window.open(`https://wa.me/?text=${textEncoded}%20${url}`, '_blank');
                break;
            case 'twitter':
                window.open(`https://twitter.com/intent/tweet?text=${textEncoded}&url=${url}`, '_blank');
                break;
            case 'linkedin':
                window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${url}`, '_blank');
                break;
            case 'facebook':
                window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}&quote=${textEncoded}`, '_blank');
                break;
            case 'threads':
                window.open(`https://threads.net/intent/post?text=${textEncoded}%20${url}`, '_blank');
                break;
        }
    };

    const handleSummarize = async (highlight: Highlight) => {
        setSummarizing(highlight.id);
        try {
            const response = await api.post('/dou/summarize', {
                url: highlight.link,
                text: highlight.title // Fallback context
            });
            setSummaries(prev => ({ ...prev, [highlight.id]: response.data.summary }));
        } catch (error) {
            console.error('Error summarizing:', error);
            alert('Falha ao gerar resumo. Tente novamente.');
        } finally {
            setSummarizing(null);
        }
    };

    return (
        <div className="p-4 md:p-8 max-w-4xl mx-auto space-y-8">
            <header className="mb-8">
                <div className="flex items-center gap-3 mb-2">
                    <div className="p-3 bg-slate-100 text-slate-700 rounded-xl">
                        <FileText className="w-6 h-6" />
                    </div>
                    <h1 className="text-2xl font-bold text-slate-900">Diário Oficial da União</h1>
                </div>
                <p className="text-slate-600">
                    Destaques e atos oficiais relevantes, simplificados para você.
                </p>
            </header>

            {loading && page === 1 ? (
                <div className="flex justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
                </div>
            ) : (
                <div className="space-y-4">
                    {highlights.map((item) => (
                        <Card key={item.id} className="hover:shadow-md transition-shadow">
                            <CardContent className="p-6">
                                <div className="flex flex-col gap-4">
                                    <div className="flex justify-between items-start gap-4">
                                        <div className="space-y-2">
                                            {item.tag && (
                                                <span className="inline-block px-2 py-1 bg-slate-100 text-slate-600 text-xs font-semibold rounded-md uppercase tracking-wider">
                                                    {item.tag}
                                                </span>
                                            )}
                                            <h3 className="font-semibold text-lg text-slate-900 leading-tight">
                                                {item.title}
                                            </h3>
                                            <div className="flex items-center gap-2 text-sm text-slate-500">
                                                <span>{item.date}</span>
                                            </div>
                                        </div>
                                        <a
                                            href={item.link}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-slate-400 hover:text-blue-600 transition-colors shrink-0"
                                        >
                                            <ExternalLink className="w-5 h-5" />
                                        </a>
                                    </div>

                                    {item.summary && (
                                        <p className="text-slate-600 text-sm border-l-2 border-slate-200 pl-3 italic">
                                            "{item.summary}"
                                        </p>
                                    )}

                                    {summaries[item.id] ? (
                                        <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 animate-in fade-in">
                                            <div className="flex items-center gap-2 mb-3 text-blue-700 font-medium text-sm border-b border-blue-200 pb-2">
                                                <Sparkles className="w-4 h-4" />
                                                Resumo IA
                                            </div>
                                            <div className="text-slate-700 text-sm leading-relaxed prose prose-sm max-w-none prose-headings:font-bold prose-headings:text-blue-800 prose-p:mb-2 prose-strong:text-slate-900">
                                                <ReactMarkdown>{summaries[item.id]}</ReactMarkdown>
                                            </div>

                                            <div className="mt-4 pt-3 border-t border-blue-200 flex flex-wrap gap-2 items-center">
                                                <div className="w-full mb-3">
                                                    <span className="text-xs text-slate-500 font-medium block mb-2">Compartilhar resumo:</span>
                                                    <div className="flex flex-wrap gap-2">
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            className="flex items-center gap-2 px-3 py-1.5 bg-[#25D366]/10 text-[#25D366] hover:bg-[#25D366]/20 hover:text-[#25D366] rounded-lg text-xs font-medium transition-colors h-auto"
                                                            onClick={() => shareUrl(summaries[item.id], 'whatsapp')}
                                                            title="Compartilhar no WhatsApp"
                                                        >
                                                            <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><path d="M3 21l1.65-3.8a9 9 0 1 1 3.4 2.9L3 21" /></svg>
                                                            WhatsApp
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            className="flex items-center gap-2 px-3 py-1.5 bg-black/5 text-black hover:bg-black/10 hover:text-black rounded-lg text-xs font-medium transition-colors h-auto"
                                                            onClick={() => shareUrl(summaries[item.id], 'twitter')}
                                                            title="Compartilhar no X / Twitter"
                                                        >
                                                            <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><path d="M4 4l11.733 16h4.267l-11.733 -16z" /><path d="M4 20l6.768 -6.768m2.46 -2.46l6.772 -6.772" /></svg>
                                                            X / Twitter
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            className="flex items-center gap-2 px-3 py-1.5 bg-[#1877F2]/10 text-[#1877F2] hover:bg-[#1877F2]/20 hover:text-[#1877F2] rounded-lg text-xs font-medium transition-colors h-auto"
                                                            onClick={() => shareUrl(summaries[item.id], 'facebook')}
                                                            title="Compartilhar no Facebook"
                                                        >
                                                            <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>
                                                            Facebook
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            className="flex items-center gap-2 px-3 py-1.5 bg-[#0A66C2]/10 text-[#0A66C2] hover:bg-[#0A66C2]/20 hover:text-[#0A66C2] rounded-lg text-xs font-medium transition-colors h-auto"
                                                            onClick={() => shareUrl(summaries[item.id], 'linkedin')}
                                                            title="Compartilhar no LinkedIn"
                                                        >
                                                            <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path><rect x="2" y="9" width="4" height="12"></rect><circle cx="4" cy="4" r="2"></circle></svg>
                                                            LinkedIn
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            className="flex items-center gap-2 px-3 py-1.5 bg-black/5 text-black hover:bg-black/10 hover:text-black rounded-lg text-xs font-medium transition-colors h-auto"
                                                            onClick={() => shareUrl(summaries[item.id], 'threads')}
                                                            title="Compartilhar no Threads"
                                                        >
                                                            <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><path d="M19 12a7 7 0 1 1-7-7c2.485 0 4.5 2.015 4.5 4.5S14.485 14 12 14c-1.1 0-2-.9-2-2s.9-2 2-2c.55 0 1 .45 1 1v3.5"></path></svg>
                                                            Threads
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-800 rounded-lg text-xs font-medium transition-colors h-auto ml-auto"
                                                            onClick={() => handleCopy(summaries[item.id], item.id)}
                                                            title="Copiar resumo"
                                                        >
                                                            {copied === item.id ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                                                            {copied === item.id ? 'Copiado!' : 'Copiar'}
                                                        </Button>
                                                    </div>
                                                </div>

                                                <div className="w-full mt-3 pt-3 border-t border-blue-200 flex justify-between items-center">
                                                    <a
                                                        href={item.link}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-xs font-semibold text-blue-700 hover:underline flex items-center gap-1"
                                                    >
                                                        Ler documento na íntegra <ExternalLink className="w-3 h-3" />
                                                    </a>
                                                    <a
                                                        href="https://www.civicux.br"
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-xs text-slate-400 hover:text-blue-600 transition-colors"
                                                    >
                                                        Powered by CivicUX
                                                    </a>
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex justify-start">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handleSummarize(item)}
                                                disabled={summarizing === item.id}
                                                className="gap-2 text-blue-600 border-blue-200 hover:bg-blue-50"
                                            >
                                                {summarizing === item.id ? (
                                                    <Loader2 className="w-4 h-4 animate-spin" />
                                                ) : (
                                                    <Sparkles className="w-4 h-4" />
                                                )}
                                                {summarizing === item.id ? 'Resumindo...' : 'Resumir com IA'}
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                    {highlights.length === 0 && (
                        <p className="text-center text-slate-500 py-8">
                            Nenhum destaque encontrado no momento.
                        </p>
                    )}

                    {page < totalPages && (
                        <div className="flex justify-center pt-6 pb-4">
                            <Button
                                onClick={() => fetchHighlights(page + 1)}
                                disabled={loadingMore}
                                variant="outline"
                                className="w-full md:w-auto min-w-[200px]"
                            >
                                {loadingMore ? (
                                    <>
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        Carregando mais...
                                    </>
                                ) : (
                                    'Carregar mais'
                                )}
                            </Button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default OfficialDiary;
