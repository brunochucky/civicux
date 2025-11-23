import { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useGameStore } from '@/store/useGameStore';
import { ShoppingBag, Heart, GraduationCap, Store, Ticket as TicketIcon, Car, Utensils, Dumbbell, Pill, BookOpen, Monitor, Map, Film } from 'lucide-react';

interface Reward {
    id: string;
    title: string;
    description: string;
    cost: number;
    icon: any;
    category: 'food_transport' | 'health' | 'education' | 'local' | 'leisure';
}

const rewards: Reward[] = [
    // Food & Transport
    { id: '1', title: 'Cupom iFood R$ 20', description: 'Válido para qualquer pedido acima de R$ 40', cost: 500, icon: Utensils, category: 'food_transport' },
    { id: '2', title: 'Uber R$ 15', description: 'Crédito para suas próximas viagens', cost: 400, icon: Car, category: 'food_transport' },

    // Health & Wellness
    { id: '3', title: 'Mensalidade SmartFit', description: '1 mês grátis no plano Black', cost: 1500, icon: Dumbbell, category: 'health' },
    { id: '4', title: 'Avaliador Físico', description: 'Sessão gratuita com personal trainer', cost: 800, icon: Heart, category: 'health' },
    { id: '5', title: 'Desconto Droga Raia', description: '20% OFF em medicamentos genéricos', cost: 300, icon: Pill, category: 'health' },

    // Education & Technology
    { id: '6', title: 'Curso Udemy', description: 'Vale R$ 50 em qualquer curso', cost: 1000, icon: GraduationCap, category: 'education' },
    { id: '7', title: 'Duolingo Plus', description: '3 meses de assinatura premium', cost: 1200, icon: BookOpen, category: 'education' },
    { id: '8', title: 'Mentoria de Carreira', description: '1 hora de mentoria online', cost: 2000, icon: Monitor, category: 'education' },

    // Local Commerce
    { id: '9', title: 'Corte de Cabelo', description: 'Válido na Barbearia do Zé', cost: 600, icon: Store, category: 'local' },
    { id: '10', title: 'Lava Rápido', description: 'Lavagem completa com cera', cost: 500, icon: Car, category: 'local' },
    { id: '11', title: 'Vale Compras R$ 50', description: 'Supermercado Dia', cost: 1200, icon: ShoppingBag, category: 'local' },

    // Leisure & Entertainment
    { id: '12', title: 'Ingresso Cinema', description: 'Cinemark 2D (qualquer dia)', cost: 600, icon: Film, category: 'leisure' },
    { id: '13', title: 'City Tour SP', description: 'Passeio turístico pelo centro histórico', cost: 1500, icon: Map, category: 'leisure' },
    { id: '14', title: 'Kart Indoor', description: 'Bateria de 20 minutos', cost: 1800, icon: TicketIcon, category: 'leisure' },
];

const categories = [
    { id: 'all', label: 'Todos' },
    { id: 'food_transport', label: 'Alimentação & Transporte' },
    { id: 'health', label: 'Saúde & Bem-estar' },
    { id: 'education', label: 'Educação & Tech' },
    { id: 'local', label: 'Comércio Local' },
    { id: 'leisure', label: 'Lazer & Diversão' },
];

export default function Rewards() {
    const { civiCoins } = useGameStore();
    const [selectedCategory, setSelectedCategory] = useState('all');

    const filteredRewards = selectedCategory === 'all'
        ? rewards
        : rewards.filter(r => r.category === selectedCategory);

    const handleRedeem = (reward: Reward) => {
        if (civiCoins >= reward.cost) {
            alert(`Parabéns! Você resgatou: ${reward.title}. O voucher foi enviado para seu email.`);
            // In a real app, we would deduct coins here
        } else {
            alert(`Saldo insuficiente! Você precisa de mais ${reward.cost - civiCoins} CiviCoins.`);
        }
    };

    return (
        <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-8">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-slate-900">Recompensas</h1>
                    <p className="text-slate-500">Troque seus CiviCoins por benefícios exclusivos</p>
                </div>
                <div className="bg-amber-100 px-6 py-3 rounded-full flex items-center gap-3 border border-amber-200">
                    <div className="h-8 w-8 rounded-full bg-amber-400 border-2 border-amber-600 flex items-center justify-center text-sm font-bold text-white">$</div>
                    <div>
                        <p className="text-xs text-amber-800 font-medium uppercase tracking-wider">Seu Saldo</p>
                        <p className="text-xl font-bold text-amber-900">{civiCoins}</p>
                    </div>
                </div>
            </div>

            {/* Category Filter */}
            <div className="flex overflow-x-auto pb-4 gap-2 no-scrollbar">
                {categories.map(cat => (
                    <button
                        key={cat.id}
                        onClick={() => setSelectedCategory(cat.id)}
                        className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${selectedCategory === cat.id
                            ? 'bg-primary text-white'
                            : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
                            }`}
                    >
                        {cat.label}
                    </button>
                ))}
            </div>

            {/* Rewards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredRewards.map(reward => (
                    <Card key={reward.id} className="hover:shadow-md transition-shadow border-slate-200">
                        <CardContent className="p-6 flex flex-col h-full">
                            <div className="flex justify-between items-start mb-4">
                                <div className="p-3 bg-slate-100 rounded-xl text-slate-600">
                                    <reward.icon className="w-6 h-6" />
                                </div>
                                <span className="px-3 py-1 bg-amber-50 text-amber-700 text-xs font-bold rounded-full border border-amber-100">
                                    {reward.cost} CiviCoins
                                </span>
                            </div>
                            <h3 className="font-bold text-lg text-slate-900 mb-2">{reward.title}</h3>
                            <p className="text-sm text-slate-500 mb-6 flex-1">{reward.description}</p>
                            <Button
                                onClick={() => handleRedeem(reward)}
                                className={`w-full ${civiCoins >= reward.cost ? 'bg-primary hover:bg-primary/90' : 'bg-slate-200 text-slate-400 hover:bg-slate-200 cursor-not-allowed'}`}
                                disabled={civiCoins < reward.cost}
                            >
                                {civiCoins >= reward.cost ? 'Resgatar' : 'Saldo Insuficiente'}
                            </Button>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
