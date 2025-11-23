import { useGameStore } from '@/store/useGameStore';
import { Card, CardContent } from "@/components/ui/card";
import { Lock } from 'lucide-react';

const AchievementsList = () => {
    const { achievements } = useGameStore();

    return (
        <div>
            <h2 className="text-lg font-bold text-slate-900 mb-4">Suas Conquistas</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {achievements.map((ach) => (
                    <Card key={ach.id} className={`border-none shadow-sm ${ach.unlocked ? 'bg-white' : 'bg-slate-50 opacity-70'}`}>
                        <CardContent className="p-4 flex flex-col items-center text-center gap-2">
                            <div className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl ${ach.unlocked ? 'bg-yellow-100' : 'bg-slate-200'}`}>
                                {ach.unlocked ? ach.icon : <Lock className="w-5 h-5 text-slate-400" />}
                            </div>
                            <div>
                                <h3 className={`font-bold text-sm ${ach.unlocked ? 'text-slate-900' : 'text-slate-500'}`}>
                                    {ach.title}
                                </h3>
                                <p className="text-xs text-slate-500 mt-1 leading-tight">
                                    {ach.description}
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
};

export default AchievementsList;
