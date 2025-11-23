import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, ExternalLink, Calendar, FileText, Activity, Sparkles, Loader2, Copy, Check, Mail } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { api } from '@/lib/axios';
import ReactMarkdown from 'react-markdown';

interface PropositionDetailsData {
    id: number;
    uri: string;
    siglaTipo: string;
    numero: number;
    ano: number;
    ementa: string;
    dataApresentacao: string;
    statusProposicao: {
        dataHora: string;
        sequencia: number;
        siglaOrgao: string;
        uriOrgao: string;
        regime: string;
        descricaoTramitacao: string;
        descricaoSituacao: string;
        despacho: string;
        url: string;
        uriUltimoRelator: string;
    };
    uriAutores: string;
    urlInteiroTeor: string;
    uriUltimoRelator: string;
}

const PropositionDetails = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [proposition, setProposition] = useState<PropositionDetailsData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Summary state
    const [summary, setSummary] = useState<string | null>(null);
    const [isSummarizing, setIsSummarizing] = useState(false);
    const [copied, setCopied] = useState(false);

    // Author state
    interface Author {
        nome: string;
        email: string | null;
        uri: string;
    }
    const [authors, setAuthors] = useState<Author[]>([]);

    // Relator state
    interface Relator {
        nome: string;
        email: string | null;
        telefone: string | null;
        uri: string;
    }
    const [relator, setRelator] = useState<Relator | null>(null);

    const handleSummarize = async () => {
        if (!proposition) return;
        setIsSummarizing(true);
        try {
            const response = await api.post('/propositions/summarize', {
                text: proposition.ementa,
                type: proposition.siglaTipo,
                number: proposition.numero,
                year: proposition.ano,
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

    useEffect(() => {
        const fetchPropositionDetails = async () => {
            try {
                const response = await axios.get(`https://dadosabertos.camara.leg.br/api/v2/proposicoes/${id}`);
                setProposition(response.data.dados);
            } catch (err) {
                console.error('Error fetching proposition details:', err);
                setError('Não foi possível carregar os detalhes da proposição.');
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchPropositionDetails();
        }
    }, [id]);

    useEffect(() => {
        const fetchData = async () => {
            if (!proposition) return;

            // Fetch Authors
            const authorsUrl = proposition.uriAutores || `https://dadosabertos.camara.leg.br/api/v2/proposicoes/${proposition.id}/autores`;

            try {
                const authorsResponse = await axios.get(authorsUrl);
                const authorsList = authorsResponse.data.dados;

                if (authorsList && authorsList.length > 0) {
                    const authorsWithEmails: Author[] = [];

                    for (const author of authorsList) {
                        let email = null;
                        try {
                            const authorDetailsResponse = await axios.get(author.uri);
                            email = authorDetailsResponse.data.dados.ultimoStatus.gabinete.email;
                        } catch (err) {
                            console.error(`Error fetching details for author ${author.nome}:`, err);
                        }

                        authorsWithEmails.push({
                            nome: author.nome,
                            email: email,
                            uri: author.uri
                        });
                    }
                    setAuthors(authorsWithEmails);
                }
            } catch (err) {
                console.error('Error fetching authors:', err);
            }

            // Fetch Relator
            if (proposition.statusProposicao.uriUltimoRelator) {
                try {
                    const relatorResponse = await axios.get(proposition.statusProposicao.uriUltimoRelator);
                    const relatorData = relatorResponse.data.dados;
                    setRelator({
                        nome: relatorData.ultimoStatus.nome,
                        email: relatorData.ultimoStatus.gabinete?.email || null,
                        telefone: relatorData.ultimoStatus.gabinete?.telefone || null,
                        uri: relatorData.uri
                    });
                } catch (err) {
                    console.error('Error fetching relator:', err);
                }
            }
        };

        fetchData();
    }, [proposition]);

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-[60vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (error || !proposition) {
        return (
            <div className="p-8 text-center">
                <p className="text-red-500 mb-4">{error || 'Proposição não encontrada'}</p>
                <Button onClick={() => navigate(-1)} variant="outline">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Voltar
                </Button>
            </div>
        );
    }


    const pressureTarget = authors.length > 0 ? 'autores' : 'relator';


    return (
        <div className="p-4 md:p-8 max-w-4xl mx-auto space-y-6">
            <div className="flex justify-between items-center mb-4">
                <Button
                    onClick={() => navigate(-1)}
                    variant="ghost"
                    className="pl-0 hover:bg-transparent hover:text-blue-600 transition-colors"
                >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Voltar para lista
                </Button>
                <a
                    href={`https://www.camara.leg.br/proposicoesWeb/fichadetramitacao?idProposicao=${proposition.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-50 px-4 py-2 rounded-lg transition-colors border border-slate-200 font-medium"
                >
                    <ExternalLink className="w-4 h-4" />
                    Ver no site da Câmara
                </a>
            </div>

            <header className="space-y-4">
                <div className="flex flex-wrap items-center gap-3">
                    <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold">
                        {proposition.siglaTipo} {proposition.numero}/{proposition.ano}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${proposition.statusProposicao.descricaoSituacao === 'Arquivada'
                        ? 'bg-red-100 text-red-700'
                        : 'bg-green-100 text-green-700'
                        }`}>
                        {proposition.statusProposicao.descricaoSituacao}
                    </span>
                </div>
                <h1 className="text-lg md:text-xl font-bold text-slate-900 leading-tight">
                    {proposition.ementa}
                </h1>
            </header>

            {/* Summary Section */}
            {summary ? (
                <div className="bg-blue-50 p-6 rounded-xl border border-blue-100 animate-in fade-in">
                    <div className="flex items-center gap-2 mb-4 text-blue-700 font-medium text-lg border-b border-blue-200 pb-2">
                        <Sparkles className="w-5 h-5" />
                        Resumo IA
                    </div>
                    <div className="text-slate-700 text-base leading-relaxed prose prose-blue max-w-none mb-6">
                        <ReactMarkdown>{summary}</ReactMarkdown>
                    </div>

                    <div className="pt-4 border-t border-blue-200">
                        <span className="text-xs text-slate-500 font-medium block mb-3">Compartilhar resumo:</span>
                        <div className="flex flex-wrap gap-2">
                            <button
                                onClick={() => shareUrl(summary, 'whatsapp')}
                                className="flex items-center gap-2 px-3 py-2 bg-[#25D366]/10 text-[#25D366] hover:bg-[#25D366]/20 rounded-lg text-sm font-medium transition-colors"
                                title="Compartilhar no WhatsApp"
                            >
                                <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><path d="M3 21l1.65-3.8a9 9 0 1 1 3.4 2.9L3 21" /></svg>
                                WhatsApp
                            </button>
                            <button
                                onClick={() => shareUrl(summary, 'twitter')}
                                className="flex items-center gap-2 px-3 py-2 bg-black/5 text-black hover:bg-black/10 rounded-lg text-sm font-medium transition-colors"
                                title="Compartilhar no X / Twitter"
                            >
                                <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><path d="M4 4l11.733 16h4.267l-11.733 -16z" /><path d="M4 20l6.768 -6.768m2.46 -2.46l6.772 -6.772" /></svg>
                                X / Twitter
                            </button>
                            <button
                                onClick={() => shareUrl(summary, 'facebook')}
                                className="flex items-center gap-2 px-3 py-2 bg-[#1877F2]/10 text-[#1877F2] hover:bg-[#1877F2]/20 rounded-lg text-sm font-medium transition-colors"
                                title="Compartilhar no Facebook"
                            >
                                <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>
                                Facebook
                            </button>
                            <button
                                onClick={() => shareUrl(summary, 'linkedin')}
                                className="flex items-center gap-2 px-3 py-2 bg-[#0A66C2]/10 text-[#0A66C2] hover:bg-[#0A66C2]/20 rounded-lg text-sm font-medium transition-colors"
                                title="Compartilhar no LinkedIn"
                            >
                                <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path><rect x="2" y="9" width="4" height="12"></rect><circle cx="4" cy="4" r="2"></circle></svg>
                                LinkedIn
                            </button>
                            <button
                                onClick={() => shareUrl(summary, 'threads')}
                                className="flex items-center gap-2 px-3 py-2 bg-black/5 text-black hover:bg-black/10 rounded-lg text-sm font-medium transition-colors"
                                title="Compartilhar no Threads"
                            >
                                <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><path d="M19 12a7 7 0 1 1-7-7c2.485 0 4.5 2.015 4.5 4.5S14.485 14 12 14c-1.1 0-2-.9-2-2s.9-2 2-2c.55 0 1 .45 1 1v3.5"></path></svg>
                                Threads
                            </button>
                            <button
                                onClick={() => handleCopy(summary)}
                                className="flex items-center gap-2 px-3 py-2 bg-slate-100 text-slate-600 hover:bg-slate-200 rounded-lg text-sm font-medium transition-colors ml-auto"
                                title="Copiar resumo"
                            >
                                {copied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                                {copied ? 'Copiado!' : 'Copiar'}
                            </button>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="mb-2">
                    <button
                        onClick={handleSummarize}
                        disabled={isSummarizing}
                        className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 hover:bg-blue-50 px-4 py-2 rounded-lg transition-colors border border-blue-100"
                    >
                        {isSummarizing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                        {isSummarizing ? 'Gerando resumo com IA...' : 'Resumir com IA'}
                    </button>
                </div>
            )}

            {/* Political Pressure Box */}

            <div className="w-full bg-red-50 border border-red-100 rounded-xl p-6 animate-in fade-in">
                <div className="flex items-center gap-2 mb-4 text-red-700 font-medium text-lg border-b border-red-200 pb-2">
                    <Activity className="w-5 h-5" />
                    Gerar pressão política
                </div>
                <p className="text-red-800 mb-4">
                    Envie um e-mail para o {pressureTarget} desta proposta cobrando posicionamento.
                </p>

                <p>
                    <textarea
                        className="w-full border border-red-100 rounded-lg p-5"
                        defaultValue={`Olá, gostaria de solicitar seu posicionamento sobre a proposta abaixo:
${proposition.siglaTipo} ${proposition.numero}/${proposition.ano}`}
                    />
                </p>
                <a
                    href='#'
                    className="inline-flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium w-full md:w-auto gap-2"
                    onClick={() => alert(`Email enviado para o ${pressureTarget} e notificado CGU`)}
                >
                    <Mail className="w-4 h-4" />
                    Enviar email e notificar CGU
                </a>


            </div>

            {/* Contact Info Box */}
            <div className="w-full bg-slate-50 border border-slate-200 rounded-xl p-6 animate-in fade-in">
                <div className="flex items-center gap-2 mb-4 text-slate-700 font-medium text-lg border-b border-slate-200 pb-2">
                    <Activity className="w-5 h-5" />
                    Informações de Contato
                </div>
                <div className="space-y-3">
                    <div>
                        <span className="text-sm text-slate-500 block">Autores:</span>
                        {authors.length > 0 ? (
                            <ul className="space-y-2">
                                {authors.map((author, index) => (
                                    <li key={index} className="text-slate-900">
                                        <span className="font-medium block">{author.nome}</span>
                                        <span className="text-sm text-slate-600">{author.email || 'Email não encontrado'}</span>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <span className="text-slate-900 font-medium">Não encontrado</span>
                        )}
                    </div>
                    <div>
                        <span className="text-sm text-slate-500 block">Email do Relator:</span>
                        <span className="text-slate-900 font-medium">{relator?.email || 'Não encontrado'}</span>
                    </div>
                    <div>
                        <span className="text-sm text-slate-500 block">Telefone do Relator:</span>
                        <span className="text-slate-900 font-medium">{relator?.telefone || 'Não encontrado'}</span>
                    </div>
                </div>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
                <div className="md:col-span-2 space-y-6">
                    <Card>
                        <CardContent className="p-6 space-y-4">
                            <div className="flex items-center gap-2 text-lg font-semibold text-slate-800 border-b pb-2">
                                <Activity className="w-5 h-5 text-blue-600" />
                                Tramitação Atual
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <span className="text-sm text-slate-500 block mb-1">Situação:</span>
                                    <p className="text-slate-900 font-medium">{proposition.statusProposicao.descricaoTramitacao}</p>
                                </div>

                                {proposition.statusProposicao.despacho && (
                                    <div>
                                        <span className="text-sm text-slate-500 block mb-1">Despacho:</span>
                                        <p className="text-slate-700 text-sm leading-relaxed bg-slate-50 p-3 rounded-lg">
                                            {proposition.statusProposicao.despacho}
                                        </p>
                                    </div>
                                )}

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <span className="text-sm text-slate-500 block mb-1">Órgão Atual:</span>
                                        <p className="font-medium text-slate-900">{proposition.statusProposicao.siglaOrgao}</p>
                                    </div>
                                    <div>
                                        <span className="text-sm text-slate-500 block mb-1">Regime:</span>
                                        <p className="font-medium text-slate-900">{proposition.statusProposicao.regime}</p>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center gap-2 text-lg font-semibold text-slate-800 border-b pb-2 mb-4">
                                <FileText className="w-5 h-5 text-blue-600" />
                                Documentos
                            </div>
                            <div className="flex gap-4">
                                {proposition.urlInteiroTeor && (
                                    <a
                                        href={proposition.urlInteiroTeor}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors font-medium"
                                    >
                                        <FileText className="w-4 h-4" />
                                        Ver Inteiro Teor
                                    </a>
                                )}
                                <a
                                    href={`https://www.camara.leg.br/proposicoesWeb/fichadetramitacao?idProposicao=${proposition.id}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-2 px-4 py-2 border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors font-medium"
                                >
                                    <ExternalLink className="w-4 h-4" />
                                    Ficha de Tramitação
                                </a>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="space-y-6">
                    <Card className="bg-blue-50 border-blue-100">
                        <CardContent className="p-6">
                            <div className="flex items-center gap-2 text-lg font-semibold text-blue-800 border-b border-blue-200 pb-2 mb-4">
                                <ExternalLink className="w-5 h-5" />
                                Compartilhar
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                <button
                                    onClick={() => shareUrl(`Confira esta proposição: ${proposition.siglaTipo} ${proposition.numero}/${proposition.ano}`, 'whatsapp')}
                                    className="col-span-2 flex items-center justify-center gap-2 px-3 py-2 bg-white text-[#25D366] hover:bg-[#25D366]/10 rounded-lg text-sm font-medium transition-colors border border-blue-100"
                                >
                                    <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><path d="M3 21l1.65-3.8a9 9 0 1 1 3.4 2.9L3 21" /></svg>
                                    WhatsApp
                                </button>
                                <button
                                    onClick={() => shareUrl(`Confira esta proposição: ${proposition.siglaTipo} ${proposition.numero}/${proposition.ano}`, 'twitter')}
                                    className="col-span-2 flex items-center justify-center gap-2 px-3 py-2 bg-white text-black hover:bg-black/5 rounded-lg text-sm font-medium transition-colors border border-blue-100"
                                >
                                    <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><path d="M4 4l11.733 16h4.267l-11.733 -16z" /><path d="M4 20l6.768 -6.768m2.46 -2.46l6.772 -6.772" /></svg>
                                    X / Twitter
                                </button>
                                <button
                                    onClick={() => shareUrl(`Confira esta proposição: ${proposition.siglaTipo} ${proposition.numero}/${proposition.ano}`, 'facebook')}
                                    className="col-span-2 flex items-center justify-center gap-2 px-3 py-2 bg-white text-[#1877F2] hover:bg-[#1877F2]/10 rounded-lg text-sm font-medium transition-colors border border-blue-100"
                                >
                                    <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>
                                    Facebook
                                </button>
                                <button
                                    onClick={() => shareUrl(`Confira esta proposição: ${proposition.siglaTipo} ${proposition.numero}/${proposition.ano}`, 'linkedin')}
                                    className="col-span-2 flex items-center justify-center gap-2 px-3 py-2 bg-white text-[#0A66C2] hover:bg-[#0A66C2]/10 rounded-lg text-sm font-medium transition-colors border border-blue-100"
                                >
                                    <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path><rect x="2" y="9" width="4" height="12"></rect><circle cx="4" cy="4" r="2"></circle></svg>
                                    LinkedIn
                                </button>
                                <button
                                    onClick={() => handleCopy(window.location.href)}
                                    className="col-span-2 flex items-center justify-center gap-2 px-3 py-2 bg-white text-slate-600 hover:bg-slate-50 rounded-lg text-sm font-medium transition-colors border border-blue-100"
                                >
                                    {copied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                                    {copied ? 'Link Copiado!' : 'Copiar Link'}
                                </button>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-6 space-y-4">
                            <div className="flex items-center gap-2 text-lg font-semibold text-slate-800 border-b pb-2">
                                <Calendar className="w-5 h-5 text-blue-600" />
                                Detalhes
                            </div>

                            <div className="space-y-3">
                                <div>
                                    <span className="text-sm text-slate-500 block">Data de Apresentação</span>
                                    <span className="font-medium text-slate-900">
                                        {new Date(proposition.dataApresentacao).toLocaleDateString('pt-BR')}
                                    </span>
                                </div>
                                <div>
                                    <span className="text-sm text-slate-500 block">Última Movimentação</span>
                                    <span className="font-medium text-slate-900">
                                        {new Date(proposition.statusProposicao.dataHora).toLocaleDateString('pt-BR')}
                                    </span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default PropositionDetails;
