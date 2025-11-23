import { useEffect, useState } from 'react';
import { useGameStore } from '@/store/useGameStore';
import { useAuthStore } from '@/store/useAuthStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Trophy, User, Star, Loader2 } from 'lucide-react';
import { api } from '@/lib/axios';

interface RankingUser {
    id: string;
    name: string;
    xp: number;
    level: number;
    avatar: string | null;
}

export default function Ranking() {
    const { xp, level, civiCoins } = useGameStore();
    const { user: currentUser } = useAuthStore();
    const [leaderboard, setLeaderboard] = useState<RankingUser[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchRanking();
    }, []);

    const fetchRanking = async () => {
        try {
            const response = await api.get('/ranking');
            setLeaderboard(response.data);
        } catch (error) {
            console.error('Error fetching ranking:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-4 md:p-8 max-w-3xl mx-auto space-y-6">
            <div className="flex items-center gap-3 mb-6">
                <div className="bg-yellow-100 p-3 rounded-full">
                    <Trophy className="h-8 w-8 text-yellow-600" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Ranking Cidadão</h1>
                    <p className="text-slate-500">Os maiores colaboradores do país</p>
                </div>
            </div>

            <div className="grid grid-cols-3 gap-4 mb-8">
                <Card className="bg-gradient-to-br from-yellow-50 to-white border-yellow-200">
                    <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                        <Trophy className="h-6 w-6 text-yellow-600 mb-2" />
                        <span className="text-2xl font-bold text-slate-900">{level}</span>
                        <span className="text-xs text-slate-500">Nível</span>
                    </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-blue-50 to-white border-blue-200">
                    <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                        <Star className="h-6 w-6 text-blue-600 mb-2" />
                        <span className="text-2xl font-bold text-slate-900">{xp}</span>
                        <span className="text-xs text-slate-500">XP Total</span>
                    </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-amber-50 to-white border-amber-200">
                    <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                        <div className="h-6 w-6 rounded-full bg-amber-400 border-2 border-amber-600 flex items-center justify-center text-[10px] font-bold text-white mb-2">$</div>
                        <span className="text-2xl font-bold text-slate-900">{civiCoins}</span>
                        <span className="text-xs text-slate-500">CiviCoins</span>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Top Colaboradores</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    {loading ? (
                        <div className="flex justify-center py-8">
                            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                        </div>
                    ) : (
                        leaderboard.map((user, index) => (
                            <div
                                key={user.id}
                                className={`flex items-center p-4 border-b last:border-0 ${user.id === currentUser?.id ? 'bg-primary/5' : ''
                                    }`}
                            >
                                <div className="w-8 font-bold text-slate-400 text-lg">
                                    {index + 1}º
                                </div>
                                <div className="flex-shrink-0 mr-4">
                                    {user.avatar ? (
                                        <img src={user.avatar} alt={user.name} className="w-10 h-10 rounded-full" />
                                    ) : (
                                        <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                                            <User className="h-5 w-5 text-primary" />
                                        </div>
                                    )}
                                </div>
                                <div className="flex-1">
                                    <h3 className={`font-bold ${user.id === currentUser?.id ? 'text-primary' : 'text-slate-900'}`}>
                                        {user.name} {user.id === currentUser?.id && '(Você)'}
                                    </h3>
                                    <p className="text-xs text-slate-500">Nível {user.level}</p>
                                </div>
                                <div className="font-bold text-slate-700">
                                    {user.xp.toLocaleString()} XP
                                </div>
                            </div>
                        ))
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
