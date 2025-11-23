import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Trophy, User, Star, Camera, CheckCircle, MapPin, MessageSquare, AlertTriangle } from 'lucide-react';
import API_CONFIG from '@/config/api';

interface PublicUser {
    id: string;
    name: string;
    avatar?: string;
    level: number;
    xp: number;
    civiCoins: number;
    reportsSubmitted: number;
    votesCast: number;
    achievements: {
        id: string;
        unlockedAt: string;
        achievement: {
            title: string;
            description: string;
            icon: string;
        }
    }[];
    reports: {
        id: string;
        title: string;
        description: string;
        severity: number;
        status: string;
        createdAt: string;
        imageUrl?: string;
        address?: string;
    }[];
    votes: {
        id: string;
        type: 'valid' | 'fake';
        comment?: string;
        createdAt: string;
        report: {
            id: string;
            title: string;
        }
    }[];
    propositionVotes: {
        id: string;
        voteType: 'APPROVE' | 'REJECT';
        comment: string;
        createdAt: string;
        propositionId: string;
    }[];
}

export default function PublicProfile() {
    const { id } = useParams();
    const [user, setUser] = useState<PublicUser | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const response = await fetch(API_CONFIG.ENDPOINTS.USER.GET(id!));
                if (!response.ok) throw new Error('Usuário não encontrado');
                const data = await response.json();
                setUser(data);
            } catch (err) {
                setError('Erro ao carregar perfil');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        if (id) fetchUser();
    }, [id]);

    if (loading) return <div className="p-8 text-center">Carregando perfil...</div>;
    if (error || !user) return <div className="p-8 text-center text-red-500">{error || 'Perfil não encontrado'}</div>;

    return (
        <div className="p-4 md:p-8 max-w-3xl mx-auto space-y-8">
            {/* Header Profile */}
            <div className="flex items-center gap-4 mb-6">
                <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center border-4 border-white shadow-md overflow-hidden">
                    {user.avatar ? (
                        <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                    ) : (
                        <User className="h-10 w-10 text-primary" />
                    )}
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">{user.name}</h1>
                    <p className="text-slate-500">Cidadão Auditor Nível {user.level}</p>
                    <div className="flex items-center gap-2 mt-1">
                        <span className="bg-yellow-100 text-yellow-800 text-xs font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                            <Star className="h-3 w-3" /> {user.xp} XP
                        </span>
                        <span className="bg-amber-100 text-amber-800 text-xs font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                            <div className="h-3 w-3 rounded-full bg-amber-500 flex items-center justify-center text-[8px] text-white">$</div> {user.civiCoins}
                        </span>
                    </div>
                </div>
            </div>

            {/* Overview Section */}
            <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                    <Card>
                        <CardContent className="p-4 flex flex-col items-center justify-center text-center gap-2">
                            <div className="bg-blue-100 p-2 rounded-full">
                                <Camera className="h-5 w-5 text-blue-600" />
                            </div>
                            <div>
                                <h3 className="font-bold text-2xl">{user.reportsSubmitted}</h3>
                                <p className="text-xs text-slate-500">Denúncias</p>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4 flex flex-col items-center justify-center text-center gap-2">
                            <div className="bg-green-100 p-2 rounded-full">
                                <CheckCircle className="h-5 w-5 text-green-600" />
                            </div>
                            <div>
                                <h3 className="font-bold text-2xl">{user.votesCast}</h3>
                                <p className="text-xs text-slate-500">Votos</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Trophy className="h-5 w-5 text-yellow-500" />
                            Conquistas Desbloqueadas
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {user.achievements.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {user.achievements.map((ua) => (
                                    <div key={ua.id} className="flex items-center gap-3 p-3 rounded-lg border bg-yellow-50 border-yellow-200">
                                        <div className="text-2xl">{ua.achievement.icon}</div>
                                        <div>
                                            <h4 className="font-bold text-sm text-slate-900">{ua.achievement.title}</h4>
                                            <p className="text-xs text-slate-500">{ua.achievement.description}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-slate-500 text-center py-4">Nenhuma conquista desbloqueada ainda.</p>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Reports Section */}
            <div className="space-y-4">
                <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2 border-b pb-2">
                    <Camera className="h-5 w-5 text-blue-600" />
                    Denúncias ({user.reports.length})
                </h2>
                {user.reports.length > 0 ? (
                    user.reports.map((report) => (
                        <Card key={report.id} className="overflow-hidden">
                            <div className="flex flex-col md:flex-row">
                                {report.imageUrl && (
                                    <div className="w-full md:w-32 h-32 bg-slate-200 shrink-0">
                                        <img src={report.imageUrl} alt={report.title} className="w-full h-full object-cover" />
                                    </div>
                                )}
                                <div className="p-4 flex-1">
                                    <div className="flex justify-between items-start mb-2">
                                        <h3 className="font-bold text-lg">{report.title}</h3>
                                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${report.status === 'validated' ? 'bg-green-100 text-green-800' :
                                            report.status === 'rejected' ? 'bg-red-100 text-red-800' :
                                                'bg-yellow-100 text-yellow-800'
                                            }`}>
                                            {report.status === 'validated' ? 'Validada' :
                                                report.status === 'rejected' ? 'Rejeitada' : 'Em Análise'}
                                        </span>
                                    </div>
                                    <p className="text-sm text-slate-600 mb-2 line-clamp-2">{report.description}</p>
                                    <div className="flex items-center gap-4 text-xs text-slate-500">
                                        <span className="flex items-center gap-1">
                                            <MapPin className="h-3 w-3" />
                                            {report.address || 'Localização não informada'}
                                        </span>
                                        <span>{new Date(report.createdAt).toLocaleDateString()}</span>
                                    </div>
                                </div>
                            </div>
                        </Card>
                    ))
                ) : (
                    <div className="text-center py-8 text-slate-500 bg-slate-50 rounded-lg border border-dashed">
                        <AlertTriangle className="h-10 w-10 mx-auto mb-2 opacity-20" />
                        <p>Nenhuma denúncia realizada.</p>
                    </div>
                )}
            </div>

            {/* Votes Section */}
            <div className="space-y-6">
                <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2 border-b pb-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    Votos & Justificativas
                </h2>

                {/* Report Validations */}
                <div>
                    <h3 className="font-bold text-lg mb-3 flex items-center gap-2 text-slate-700">
                        <CheckCircle className="h-4 w-4" />
                        Validações de Denúncias
                    </h3>
                    <div className="space-y-3">
                        {user.votes.length > 0 ? (
                            user.votes.map((vote) => (
                                <Card key={vote.id} className="p-4">
                                    <div className="flex justify-between items-start mb-2">
                                        <p className="text-sm font-medium">
                                            Avaliou a denúncia <span className="text-blue-600">"{vote.report.title}"</span> como:
                                            <span className={`ml-2 px-2 py-0.5 rounded text-xs font-bold ${vote.type === 'valid' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                                }`}>
                                                {vote.type === 'valid' ? 'VERDADEIRA' : 'FALSA'}
                                            </span>
                                        </p>
                                        <span className="text-xs text-slate-400">{new Date(vote.createdAt).toLocaleDateString()}</span>
                                    </div>
                                    {vote.comment && (
                                        <div className="bg-slate-50 p-3 rounded-lg text-sm text-slate-700 flex gap-2">
                                            <MessageSquare className="h-4 w-4 text-slate-400 shrink-0 mt-0.5" />
                                            <p>"{vote.comment}"</p>
                                        </div>
                                    )}
                                </Card>
                            ))
                        ) : (
                            <p className="text-slate-500 text-sm italic bg-slate-50 p-4 rounded-lg text-center">Nenhuma validação realizada.</p>
                        )}
                    </div>
                </div>

                {/* Proposition Votes */}
                <div>
                    <h3 className="font-bold text-lg mb-3 flex items-center gap-2 text-slate-700">
                        <Trophy className="h-4 w-4" />
                        Votos em Proposições
                    </h3>
                    <div className="space-y-3">
                        {user.propositionVotes.length > 0 ? (
                            user.propositionVotes.map((vote) => (
                                <Card key={vote.id} className="p-4">
                                    <div className="flex justify-between items-start mb-2">
                                        <p className="text-sm font-medium">
                                            Votou na proposição <span className="text-purple-600">#{vote.propositionId}</span> como:
                                            <span className={`ml-2 px-2 py-0.5 rounded text-xs font-bold ${vote.voteType === 'APPROVE' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                                }`}>
                                                {vote.voteType === 'APPROVE' ? 'APROVAR' : 'REPROVAR'}
                                            </span>
                                        </p>
                                        <span className="text-xs text-slate-400">{new Date(vote.createdAt).toLocaleDateString()}</span>
                                    </div>
                                    {vote.comment && (
                                        <div className="bg-slate-50 p-3 rounded-lg text-sm text-slate-700 flex gap-2">
                                            <MessageSquare className="h-4 w-4 text-slate-400 shrink-0 mt-0.5" />
                                            <p>"{vote.comment}"</p>
                                        </div>
                                    )}
                                </Card>
                            ))
                        ) : (
                            <p className="text-slate-500 text-sm italic bg-slate-50 p-4 rounded-lg text-center">Nenhum voto em proposição.</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
