import { useEffect, useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Camera, CheckCircle, MapPin, Trophy, Vote } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useGameStore } from '@/store/useGameStore';
import { useAuthStore } from '@/store/useAuthStore';
import { api } from '@/lib/axios';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import AchievementsList from "@/components/AchievementsList";

interface Activity {
    id: string;
    type: 'REPORT' | 'PROP_VOTE';
    title: string;
    description: string;
    date: string;
    location: string;
    status: string;
    user: string;
    icon: string;
}

import NotificationToast from "@/components/NotificationToast";

export default function Home() {
    const { xp, level, civiCoins, nextLevelXp, fetchUserData } = useGameStore();
    const { user } = useAuthStore();
    const progress = (xp / nextLevelXp) * 100;
    const [activities, setActivities] = useState<Activity[]>([]);
    const [showToast, setShowToast] = useState(true);

    useEffect(() => {
        if (user?.id) {
            fetchUserData(user.id);
        }
    }, [user?.id, fetchUserData]);

    useEffect(() => {
        const fetchActivity = async () => {
            try {
                const response = await api.get('/activity');
                setActivities(response.data);
            } catch (error) {
                console.error('Error fetching activity:', error);
            }
        };
        fetchActivity();
    }, []);

    return (
        <div className="p-4 md:p-8 max-w-4xl mx-auto space-y-8">
            <NotificationToast
                isVisible={showToast}
                onClose={() => setShowToast(false)}
                title="Nova Proposta que pode te interessar!"
                message="PL 2345/2024: Institui o Programa Nacional de Educação Digital nas escolas públicas."
                linkTo="/propositions/2265603"
            />

            {/* Welcome Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-slate-900">
                        Olá, {user?.name || 'Cidadão'}!
                    </h1>
                    <p className="text-slate-500">
                        Você está ajudando a construir um país melhor.
                    </p>
                </div>
                <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-sm border">
                    <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                    <span className="text-sm font-medium text-slate-600">Sistema Operacional</span>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="bg-gradient-to-br from-primary/90 to-primary text-white border-none shadow-lg">
                    <CardContent className="p-6">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <p className="text-primary-foreground/80 text-sm font-medium">Nível Atual</p>
                                <h2 className="text-4xl font-bold">{level}</h2>
                            </div>
                            <Trophy className="h-8 w-8 text-yellow-400" />
                        </div>
                        <div className="space-y-2">
                            <div className="flex justify-between text-xs text-primary-foreground/80">
                                <span>{xp} XP</span>
                                <span>{nextLevelXp} XP</span>
                            </div>
                            <div className="h-2 bg-black/20 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-yellow-400 transition-all duration-500"
                                    style={{ width: `${progress}%` }}
                                />
                            </div>
                            <p className="text-xs text-primary-foreground/80 text-right">
                                Faltam {nextLevelXp - xp} XP para o nível {level + 1}
                            </p>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6 flex flex-col justify-between h-full">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-slate-500 text-sm font-medium">CiviCoins</p>
                                <h2 className="text-3xl font-bold text-slate-900">{civiCoins}</h2>
                            </div>
                            <div className="h-10 w-10 rounded-full bg-amber-100 flex items-center justify-center">
                                <div className="h-6 w-6 rounded-full bg-amber-400 border-2 border-amber-600 flex items-center justify-center text-[10px] font-bold text-white">$</div>
                            </div>
                        </div>
                        <Link to="/rewards" className="w-full">
                            <Button variant="outline" className="w-full mt-4 text-xs h-8">
                                Ver Recompensas
                            </Button>
                        </Link>
                    </CardContent>
                </Card>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-2 gap-4">
                <Link to="/audit" className="col-span-1">
                    <Card className="h-full hover:shadow-md transition-shadow cursor-pointer border-primary/20">
                        <CardContent className="p-6 flex flex-col items-center justify-center text-center gap-3">
                            <div className="bg-primary/10 p-4 rounded-full">
                                <Camera className="h-8 w-8 text-primary" />
                            </div>
                            <div>
                                <h3 className="font-bold text-slate-900">Nova Denúncia</h3>
                                <p className="text-xs text-slate-500">Reportar um problema</p>
                            </div>
                        </CardContent>
                    </Card>
                </Link>
                <Link to="/feed" className="col-span-1">
                    <Card className="h-full hover:shadow-md transition-shadow cursor-pointer">
                        <CardContent className="p-6 flex flex-col items-center justify-center text-center gap-3">
                            <div className="bg-secondary/10 p-4 rounded-full">
                                <CheckCircle className="h-8 w-8 text-secondary" />
                            </div>
                            <div>
                                <h3 className="font-bold text-slate-900">Validar</h3>
                                <p className="text-xs text-slate-500">Ganhe moedas votando</p>
                            </div>
                        </CardContent>
                    </Card>
                </Link>
            </div>

            {/* Achievements */}
            <AchievementsList />

            {/* Recent Activity Feed */}
            <div>
                <h2 className="text-lg font-bold text-slate-900 mb-4">Atividade Recente</h2>
                <div className="space-y-4">
                    {activities.map((activity) => (
                        <Card key={`${activity.type}-${activity.id}`}>
                            <CardContent className="p-4 flex gap-4">
                                <div className="h-20 w-20 bg-slate-200 rounded-md flex-shrink-0 overflow-hidden">
                                    <div className="w-full h-full flex items-center justify-center text-slate-400 bg-slate-100">
                                        {activity.icon === 'Vote' ? <Vote className="h-6 w-6" /> : <Camera className="h-6 w-6" />}
                                    </div>
                                </div>
                                <div className="flex-1">
                                    <div className="flex justify-between items-start">
                                        <h3 className="font-bold text-slate-900 text-sm">{activity.title}</h3>
                                        <span className="text-xs text-slate-400">
                                            {formatDistanceToNow(new Date(activity.date), { addSuffix: true, locale: ptBR })}
                                        </span>
                                    </div>
                                    <p className="text-xs text-slate-600 mt-1">{activity.description}</p>
                                    <div className="flex items-center gap-1 text-xs text-slate-500 mt-1">
                                        <MapPin className="h-3 w-3" />
                                        <span>{activity.location}</span>
                                    </div>
                                    <div className="mt-3 flex gap-2">
                                        <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-[10px] font-bold rounded-full">
                                            {activity.status}
                                        </span>
                                        <span className="text-[10px] text-slate-400 flex items-center">
                                            por {activity.user}
                                        </span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                    {activities.length === 0 && (
                        <p className="text-center text-slate-500 py-4">Nenhuma atividade recente.</p>
                    )}
                </div>
            </div>
        </div>
    );
}
