import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, MapPin, AlertTriangle, MessageSquare } from "lucide-react";
import { type Report, useReportStore } from "@/store/useReportStore";
import { useGameStore } from "@/store/useGameStore";
import { useAuthStore } from "@/store/useAuthStore";
import { Link } from "react-router-dom";
import { useState } from "react";

interface FeedItemProps {
    report: Report;
}

export function FeedItem({ report }: FeedItemProps) {
    const voteReport = useReportStore((state) => state.voteReport);
    const addCoins = useGameStore((state) => state.addCoins);
    const { user } = useAuthStore();

    const [isVoting, setIsVoting] = useState(false);
    const [voteType, setVoteType] = useState<'valid' | 'fake' | null>(null);
    const [comment, setComment] = useState('');
    const [loading, setLoading] = useState(false);

    const handleVoteClick = (type: 'valid' | 'fake') => {
        if (!user) {
            alert("Você precisa estar logado para votar!");
            return;
        }
        setVoteType(type);
        setIsVoting(true);
    };

    const handleSubmit = async () => {
        if (!user || !voteType || !comment.trim()) return;

        setLoading(true);
        try {
            await voteReport(report.id, voteType, user.id, comment);
            addCoins(10);
            setIsVoting(false);
            setComment('');
            setVoteType(null);
        } catch (error) {
            console.error('Failed to vote', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card className="overflow-hidden mb-4">
            <div className="relative h-48 bg-slate-200">
                {report.imageUrl ? (
                    <img src={report.imageUrl} alt={report.title} className="w-full h-full object-cover" />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-400">
                        <AlertTriangle className="h-12 w-12" />
                    </div>
                )}
                <div className="absolute top-2 right-2 bg-black/60 text-white px-2 py-1 rounded-md text-xs font-bold">
                    Severidade: {report.severity}/10
                </div>
            </div>
            <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                    <div className="flex-1">
                        <Link to={`/report/${report.id}`} className="hover:underline">
                            <CardTitle className="text-lg text-slate-900">{report.title}</CardTitle>
                        </Link>
                        <div className="mt-1 space-y-1">
                            <p className="text-sm text-slate-700 flex items-start gap-1">
                                <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
                                <span>
                                    {report.address || `${report.location.lat.toFixed(4)}, ${report.location.lng.toFixed(4)}`}
                                </span>
                            </p>
                            {report.address && (
                                <p className="text-xs text-slate-400 ml-5">
                                    {report.location.lat.toFixed(4)}, {report.location.lng.toFixed(4)}
                                </p>
                            )}
                        </div>
                    </div>
                    <span className="text-xs text-slate-400">{new Date(report.createdAt).toLocaleDateString()}</span>
                </div>
            </CardHeader>
            <CardContent>
                <p className="text-sm text-slate-600 mb-4">{report.description}</p>

                {report.userVote ? (
                    <div className={`p-3 rounded-lg border-2 ${report.userVote === 'valid'
                            ? 'bg-green-50 border-green-200'
                            : 'bg-red-50 border-red-200'
                        }`}>
                        <div className="flex items-center gap-2 text-sm font-medium">
                            {report.userVote === 'valid' ? (
                                <>
                                    <CheckCircle className="h-4 w-4 text-green-700" />
                                    <span className="text-green-700">Você validou esta denúncia</span>
                                </>
                            ) : (
                                <>
                                    <XCircle className="h-4 w-4 text-red-700" />
                                    <span className="text-red-700">Você marcou como falsa</span>
                                </>
                            )}
                        </div>
                        <div className="mt-2 flex gap-4 text-xs text-slate-600">
                            <span className="flex items-center gap-1">
                                <CheckCircle className="h-3 w-3" />
                                {report.votes.valid} validações
                            </span>
                            <span className="flex items-center gap-1">
                                <XCircle className="h-3 w-3" />
                                {report.votes.fake} marcações como falsa
                            </span>
                        </div>
                    </div>
                ) : !isVoting ? (
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            className="flex-1 border-green-200 hover:bg-green-50 hover:text-green-700 gap-2"
                            onClick={() => handleVoteClick('valid')}
                        >
                            <CheckCircle className="h-4 w-4" />
                            Validar ({report.votes.valid})
                        </Button>
                        <Button
                            variant="outline"
                            className="flex-1 border-red-200 hover:bg-red-50 hover:text-red-700 gap-2"
                            onClick={() => handleVoteClick('fake')}
                        >
                            <XCircle className="h-4 w-4" />
                            Fake ({report.votes.fake})
                        </Button>
                    </div>
                ) : (
                    <div className="bg-slate-50 p-4 rounded-lg">
                        <div className="flex items-center gap-2 mb-3 text-sm font-medium text-slate-700">
                            <MessageSquare className="h-4 w-4" />
                            Justifique sua avaliação ({voteType === 'valid' ? 'Validar' : 'Marcar como Fake'})
                        </div>
                        <textarea
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            placeholder="Explique por que você avaliou assim..."
                            className="w-full p-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm mb-3"
                            rows={3}
                        />
                        <div className="flex gap-3">
                            <Button
                                onClick={handleSubmit}
                                disabled={loading || !comment.trim()}
                                className="flex-1 bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? 'Enviando...' : 'Confirmar Avaliação'}
                            </Button>
                            <Button
                                variant="outline"
                                onClick={() => {
                                    setIsVoting(false);
                                    setComment('');
                                    setVoteType(null);
                                }}
                                disabled={loading}
                            >
                                Cancelar
                            </Button>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
