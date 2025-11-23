import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ThumbsUp, ThumbsDown, MessageSquare, ExternalLink, Sparkles, Loader2, Copy, Check } from 'lucide-react';
import { api } from '@/lib/axios';
import ReactMarkdown from 'react-markdown';

interface Proposition {
    id: number;
    uri: string;
    siglaTipo: string;
    numero: number;
    ano: number;
    ementa: string;
    author?: string;
    userVote?: 'APPROVE' | 'REJECT' | null;
}

interface PropositionCardProps {
    proposition: Proposition;
    onVote: (propositionId: number, type: 'APPROVE' | 'REJECT', comment: string) => Promise<void>;
}

const PropositionCard: React.FC<PropositionCardProps> = ({ proposition, onVote }) => {
    const [isVoting, setIsVoting] = useState<boolean>(false);
    const [voteType, setVoteType] = useState<'APPROVE' | 'REJECT' | null>(null);
    const [comment, setComment] = useState('');
    const [loading, setLoading] = useState(false);

    // Summary state
    const [summary, setSummary] = useState<string | null>(null);
    const [isSummarizing, setIsSummarizing] = useState(false);
    const [copied, setCopied] = useState(false);

    const handleVoteClick = (type: 'APPROVE' | 'REJECT') => {
        setVoteType(type);
        setIsVoting(true);
    };

    const handleSubmit = async () => {
        if (!comment.trim() || comment.length < 20) return;
        setLoading(true);
        try {
            await onVote(proposition.id, voteType!, comment);
            setIsVoting(false);
            setComment('');
            setVoteType(null);
        } catch (error) {
            console.error('Failed to vote', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSummarize = async () => {
        setIsSummarizing(true);
        try {
            const response = await api.post('/propositions/summarize', {
                text: proposition.ementa,
                type: proposition.siglaTipo,
                number: proposition.numero,
                year: proposition.ano,
                author: proposition.author
            });
            setSummary(response.data.summary);
        } catch (error) {
            console.error('Error summarizing:', error);
            alert('Falha ao gerar resumo.');
        } finally {
            setIsSummarizing(false);
        }
    };

    const handleCopy = (text: string) => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const shareUrl = (text: string, platform: 'whatsapp' | 'twitter' | 'linkedin' | 'facebook' | 'threads') => {
        const appUrl = encodeURIComponent(window.location.href);
        const textEncoded = encodeURIComponent(text);

        switch (platform) {
            case 'whatsapp':
                window.open(`https://wa.me/?text=${textEncoded}%20${appUrl}`, '_blank');
                break;
            case 'twitter':
                window.open(`https://twitter.com/intent/tweet?text=${textEncoded}&url=${appUrl}`, '_blank');
                break;
            case 'linkedin':
                window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${appUrl}`, '_blank');
                break;
            case 'facebook':
                window.open(`https://www.facebook.com/sharer/sharer.php?u=${appUrl}&quote=${textEncoded}`, '_blank');
                break;
            case 'threads':
                window.open(`https://threads.net/intent/post?text=${textEncoded}%20${appUrl}`, '_blank');
                break;
        }
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
                <div>
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                        <span className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
                            {proposition.siglaTipo} {proposition.numero}/{proposition.ano}
                        </span>
                        {proposition.author && (
                            <span className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-600">
                                {proposition.author}
                            </span>
                        )}
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 leading-tight hover:text-blue-600 transition-colors">
                        <Link to={`/propositions/${proposition.id}`}>
                            {proposition.ementa}
                        </Link>
                    </h3>
                </div>
            </div>

            {/* Summary Section */}
            {summary ? (
                <div className="mb-6 bg-blue-50 p-4 rounded-lg border border-blue-100 animate-in fade-in">
                    <div className="flex items-center gap-2 mb-3 text-blue-700 font-medium text-sm border-b border-blue-200 pb-2">
                        <Sparkles className="w-4 h-4" />
                        Resumo IA
                    </div>
                    <div className="text-slate-700 text-sm leading-relaxed prose prose-sm max-w-none prose-headings:font-bold prose-headings:text-blue-800 prose-p:mb-2 prose-strong:text-slate-900">
                        <ReactMarkdown>{summary}</ReactMarkdown>
                    </div>

                    <div className="mt-4 pt-3 border-t border-blue-200 flex flex-wrap gap-2 items-center">
                        <div className="w-full mb-3">
                            <span className="text-xs text-slate-500 font-medium block mb-2">Compartilhar resumo:</span>
                            <div className="flex flex-wrap gap-2">
                                <button
                                    onClick={() => shareUrl(summary, 'whatsapp')}
                                    className="flex items-center gap-2 px-3 py-1.5 bg-[#25D366]/10 text-[#25D366] hover:bg-[#25D366]/20 rounded-lg text-xs font-medium transition-colors"
                                    title="Compartilhar no WhatsApp"
                                >
                                    <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><path d="M3 21l1.65-3.8a9 9 0 1 1 3.4 2.9L3 21" /></svg>
                                    WhatsApp
                                </button>
                                <button
                                    onClick={() => shareUrl(summary, 'twitter')}
                                    className="flex items-center gap-2 px-3 py-1.5 bg-black/5 text-black hover:bg-black/10 rounded-lg text-xs font-medium transition-colors"
                                    title="Compartilhar no X / Twitter"
                                >
                                    <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><path d="M4 4l11.733 16h4.267l-11.733 -16z" /><path d="M4 20l6.768 -6.768m2.46 -2.46l6.772 -6.772" /></svg>
                                    X / Twitter
                                </button>
                                <button
                                    onClick={() => shareUrl(summary, 'facebook')}
                                    className="flex items-center gap-2 px-3 py-1.5 bg-[#1877F2]/10 text-[#1877F2] hover:bg-[#1877F2]/20 rounded-lg text-xs font-medium transition-colors"
                                    title="Compartilhar no Facebook"
                                >
                                    <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>
                                    Facebook
                                </button>
                                <button
                                    onClick={() => shareUrl(summary, 'linkedin')}
                                    className="flex items-center gap-2 px-3 py-1.5 bg-[#0A66C2]/10 text-[#0A66C2] hover:bg-[#0A66C2]/20 rounded-lg text-xs font-medium transition-colors"
                                    title="Compartilhar no LinkedIn"
                                >
                                    <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path><rect x="2" y="9" width="4" height="12"></rect><circle cx="4" cy="4" r="2"></circle></svg>
                                    LinkedIn
                                </button>
                                <button
                                    onClick={() => shareUrl(summary, 'threads')}
                                    className="flex items-center gap-2 px-3 py-1.5 bg-black/5 text-black hover:bg-black/10 rounded-lg text-xs font-medium transition-colors"
                                    title="Compartilhar no Threads"
                                >
                                    <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><path d="M19 12a7 7 0 1 1-7-7c2.485 0 4.5 2.015 4.5 4.5S14.485 14 12 14c-1.1 0-2-.9-2-2s.9-2 2-2c.55 0 1 .45 1 1v3.5"></path></svg>
                                    Threads
                                </button>
                                <button
                                    onClick={() => handleCopy(summary)}
                                    className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 text-slate-600 hover:bg-slate-200 rounded-lg text-xs font-medium transition-colors ml-auto"
                                    title="Copiar resumo"
                                >
                                    {copied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                                    {copied ? 'Copiado!' : 'Copiar'}
                                </button>
                            </div>
                        </div>

                        <div className="w-full mt-3 pt-3 border-t border-blue-200 flex justify-between items-center">
                            <a
                                href={`https://www.camara.leg.br/proposicoesWeb/fichadetramitacao?idProposicao=${proposition.id}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs font-semibold text-blue-700 hover:underline flex items-center gap-1"
                            >
                                Ler na íntegra <ExternalLink className="w-3 h-3" />
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
                <div className="mb-6">
                    <button
                        onClick={handleSummarize}
                        disabled={isSummarizing}
                        className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 hover:bg-blue-50 px-3 py-1.5 rounded-lg transition-colors border border-blue-100"
                    >
                        {isSummarizing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                        {isSummarizing ? 'Gerando resumo...' : 'Resumir com IA'}
                    </button>
                </div>
            )}

            {!isVoting ? (
                <div className="flex items-center gap-4 mt-6">
                    {proposition.userVote ? (
                        <div className={`flex-1 p-3 rounded-lg text-center font-medium text-sm ${proposition.userVote === 'APPROVE'
                            ? 'bg-green-100 text-green-800 border border-green-200'
                            : 'bg-red-100 text-red-800 border border-red-200'
                            }`}>
                            Você já votou: {proposition.userVote === 'APPROVE' ? 'Aprovado' : 'Reprovado'}
                        </div>
                    ) : (
                        <>
                            <button
                                onClick={() => handleVoteClick('APPROVE')}
                                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg border border-green-200 text-green-700 hover:bg-green-50 transition-colors"
                            >
                                <ThumbsUp className="w-4 h-4" />
                                Aprovar
                            </button>
                            <button
                                onClick={() => handleVoteClick('REJECT')}
                                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg border border-red-200 text-red-700 hover:bg-red-50 transition-colors"
                            >
                                <ThumbsDown className="w-4 h-4" />
                                Reprovar
                            </button>
                        </>
                    )}
                    <a
                        href={`https://www.camara.leg.br/proposicoesWeb/fichadetramitacao?idProposicao=${proposition.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2.5 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 transition-colors"
                        title="Ver detalhes na Câmara"
                    >
                        <ExternalLink className="w-4 h-4" />
                    </a>
                </div>
            ) : (
                <div className="mt-6 bg-gray-50 p-4 rounded-lg animate-in fade-in slide-in-from-top-2">
                    <div className="flex items-center gap-2 mb-3 text-sm font-medium text-gray-700">
                        <MessageSquare className="w-4 h-4" />
                        Justifique seu voto ({voteType === 'APPROVE' ? 'Aprovar' : 'Reprovar'})
                    </div>
                    <textarea
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        placeholder="Por que você votou assim? Mínimo 20 caracteres. Sua opinião é importante..."
                        className="w-full p-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm mb-2"
                        rows={4}
                    />
                    <div className="flex items-center justify-between mb-3">
                        <span className={`text-xs ${comment.length < 20 ? 'text-red-500' : 'text-green-600'}`}>
                            {comment.length}/20 caracteres {comment.length < 20 && `(faltam ${20 - comment.length})`}
                        </span>
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={handleSubmit}
                            disabled={loading || comment.length < 20}
                            className="flex-1 bg-blue-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            {loading ? 'Enviando...' : 'Confirmar Voto'}
                        </button>
                        <button
                            onClick={() => setIsVoting(false)}
                            disabled={loading}
                            className="px-4 py-2 text-gray-600 text-sm font-medium hover:bg-gray-200 rounded-lg transition-colors"
                        >
                            Cancelar
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PropositionCard;
