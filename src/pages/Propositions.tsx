import { useEffect, useState } from 'react';
import { Vote, Loader2 } from 'lucide-react';
import PropositionCard from '@/components/PropositionCard';
import { useAuthStore } from '@/store/useAuthStore';
import { api } from '@/lib/axios';
import { useGameStore } from '@/store/useGameStore';

interface Proposition {
    id: number;
    uri: string;
    siglaTipo: string;
    numero: number;
    ano: number;
    ementa: string;
    userVote?: 'APPROVE' | 'REJECT' | null;
}

const Propositions = () => {
    const [propositions, setPropositions] = useState<Proposition[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const { user } = useAuthStore();
    const { fetchUserData } = useGameStore();

    useEffect(() => {
        if (user) {
            fetchPropositions(1);
        }
    }, [user]);

    const fetchPropositions = async (pageNum: number) => {
        try {
            const response = await api.get('/propositions', {
                params: { userId: user?.id, page: pageNum, limit: 5 }
            });

            const newPropositions = response.data;

            if (pageNum === 1) {
                setPropositions(newPropositions);
            } else {
                setPropositions(prev => [...prev, ...newPropositions]);
            }

            if (newPropositions.length < 5) {
                setHasMore(false);
            } else {
                setHasMore(true);
            }
        } catch (error) {
            console.error('Error fetching propositions:', error);
        } finally {
            setLoading(false);
        }
    };

    const loadMore = () => {
        setLoading(true);
        const nextPage = page + 1;
        setPage(nextPage);
        fetchPropositions(nextPage);
    };

    const handleVote = async (propositionId: number, type: 'APPROVE' | 'REJECT', comment: string) => {
        if (!user) return;

        try {
            await api.post(`/propositions/vote`, {
                userId: user.id,
                propositionId: String(propositionId),
                voteType: type,
                comment
            });

            // Refresh user data to show new coins/XP
            await fetchUserData(user.id);
            // Update local state to reflect vote without full refetch
            setPropositions(prev => prev.map(p =>
                p.id === propositionId
                    ? { ...p, userVote: type }
                    : p
            ));
            alert('Voto computado com sucesso! Você ganhou 1 CiviCoin.');
        } catch (error: any) {
            console.error('Error voting:', error);
            alert(error.response?.data?.error || 'Erro ao votar. Tente novamente.');
        }
    };

    return (
        <div className="p-4 md:p-8 max-w-3xl mx-auto space-y-6">
            <header className="mb-8">
                <div className="flex items-center gap-3 mb-2">
                    <div className="p-3 bg-blue-100 text-blue-600 rounded-xl">
                        <Vote className="w-6 h-6" />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900">Votação de Projetos</h1>
                </div>
                <p className="text-gray-600">
                    Exerça sua cidadania votando em projetos de lei reais em tramitação.
                    Seus votos valem CiviCoins e ajudam a fiscalizar o poder público.
                </p>
            </header>

            {loading && page === 1 ? (
                <div className="flex justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                </div>
            ) : (
                <div className="space-y-6">
                    {propositions.map((prop) => (
                        <PropositionCard
                            key={prop.id}
                            proposition={prop}
                            onVote={handleVote}
                        />
                    ))}

                    {hasMore && (
                        <div className="flex justify-center pt-4">
                            <button
                                onClick={loadMore}
                                disabled={loading}
                                className="px-6 py-2 bg-white border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 font-medium transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        Carregando...
                                    </>
                                ) : (
                                    'Carregar mais'
                                )}
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default Propositions;
