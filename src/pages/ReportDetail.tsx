import { useParams, useNavigate } from 'react-router-dom';
import { useReportStore } from '@/store/useReportStore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, FileText, Download, Share2, MapPin } from 'lucide-react';
import { useState } from 'react';
import { generatePDF, getDocumentTemplate } from '@/services/document';

export default function ReportDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const report = useReportStore((state) => state.reports.find((r) => r.id === id));
    const [isGenerating, setIsGenerating] = useState(false);
    const [generatedUrl, setGeneratedUrl] = useState<string | null>(null);

    if (!report) {
        return (
            <div className="p-8 text-center">
                <p className="text-slate-500">Denúncia não encontrada.</p>
                <Button variant="link" onClick={() => navigate('/feed')}>Voltar para o Feed</Button>
            </div>
        );
    }

    const handleGenerateDocument = async () => {
        setIsGenerating(true);
        try {
            const url = await generatePDF(report);
            setGeneratedUrl(url);
        } catch (error) {
            console.error("Failed to generate PDF", error);
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <div className="p-4 md:p-8 max-w-3xl mx-auto space-y-6">
            <Button variant="ghost" onClick={() => navigate('/feed')} className="gap-2 pl-0 hover:bg-transparent hover:text-primary">
                <ArrowLeft className="h-4 w-4" />
                Voltar
            </Button>

            <div className="space-y-4">
                <div className="flex items-start justify-between">
                    <h1 className="text-2xl font-bold text-slate-900">{report.title}</h1>
                    <div className={`px-3 py-1 rounded-full text-xs font-bold border ${report.severity > 7 ? 'bg-red-100 text-red-700 border-red-200' :
                        report.severity > 4 ? 'bg-yellow-100 text-yellow-700 border-yellow-200' :
                            'bg-green-100 text-green-700 border-green-200'
                        }`}>
                        Severidade {report.severity}/10
                    </div>
                </div>

                {report.imageUrl && (
                    <div className="aspect-video w-full bg-slate-100 rounded-lg overflow-hidden border">
                        <img src={report.imageUrl} alt={report.title} className="w-full h-full object-cover" />
                    </div>
                )}

                <Card>
                    <CardContent className="p-6 space-y-4">
                        <div>
                            <h3 className="font-semibold text-slate-900 mb-1">Descrição</h3>
                            <p className="text-slate-600 leading-relaxed">{report.description}</p>
                        </div>

                        <div className="flex items-center gap-2 text-sm text-slate-500">
                            <MapPin className="h-4 w-4" />
                            <span>{report.location.lat.toFixed(4)}, {report.location.lng.toFixed(4)}</span>
                        </div>

                        <div className="pt-4 border-t">
                            <h3 className="font-semibold text-slate-900 mb-2">Departamento Responsável</h3>
                            <p className="text-primary font-medium">{report.department}</p>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-slate-50 border-dashed border-2">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-lg">
                            <FileText className="h-5 w-5 text-primary" />
                            Gerar Documento Oficial
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <p className="text-sm text-slate-600">
                            Transforme esta denúncia em um requerimento formal para a prefeitura.
                            O documento será gerado automaticamente com base nas leis municipais.
                        </p>

                        {!generatedUrl ? (
                            <Button
                                className="w-full gap-2"
                                onClick={handleGenerateDocument}
                                disabled={isGenerating}
                            >
                                {isGenerating ? "Gerando Documento..." : "Gerar Requerimento PDF"}
                            </Button>
                        ) : (
                            <div className="space-y-3">
                                <div className="bg-green-50 border border-green-200 p-3 rounded-md text-sm text-green-800 flex items-center gap-2">
                                    <FileText className="h-4 w-4" />
                                    Documento gerado com sucesso!
                                </div>

                                <Button
                                    className="w-full gap-2"
                                    variant="outline"
                                    onClick={() => {
                                        const link = document.createElement('a');
                                        link.href = generatedUrl;
                                        link.download = `requerimento-${report.id}.pdf`;
                                        link.click();
                                    }}
                                >
                                    <Download className="h-4 w-4" />
                                    Baixar PDF
                                </Button>

                                <div className="border-t pt-3">
                                    <span className="text-xs text-slate-600 font-medium block mb-2">Compartilhar requerimento:</span>
                                    <div className="flex flex-wrap gap-2">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="h-8 px-2 text-blue-700 hover:bg-blue-100"
                                            onClick={() => {
                                                const text = getDocumentTemplate(report);
                                                const url = encodeURIComponent(window.location.href);
                                                const textEncoded = encodeURIComponent(text);
                                                window.open(`https://wa.me/?text=${textEncoded}%20${url}`, '_blank');
                                            }}
                                        >
                                            WhatsApp
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="h-8 px-2 text-blue-700 hover:bg-blue-100"
                                            onClick={() => {
                                                const text = getDocumentTemplate(report);
                                                const url = encodeURIComponent(window.location.href);
                                                const textEncoded = encodeURIComponent(text);
                                                window.open(`https://twitter.com/intent/tweet?text=${textEncoded}&url=${url}`, '_blank');
                                            }}
                                        >
                                            X / Twitter
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="h-8 px-2 text-blue-700 hover:bg-blue-100"
                                            onClick={() => {
                                                const url = encodeURIComponent(window.location.href);
                                                window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${url}`, '_blank');
                                            }}
                                        >
                                            LinkedIn
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="h-8 px-2 text-blue-700 hover:bg-blue-100 ml-auto"
                                            onClick={() => {
                                                const text = getDocumentTemplate(report);
                                                navigator.clipboard.writeText(`${text}\n\nVer detalhes: ${window.location.href}`);
                                                alert('Requerimento copiado para a área de transferência!');
                                            }}
                                        >
                                            <Share2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>

                                <div className="mt-4 p-4 bg-white border rounded-md text-xs font-mono text-slate-500 whitespace-pre-wrap h-48 overflow-y-auto">
                                    {getDocumentTemplate(report)}
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
