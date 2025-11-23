import { useState, useEffect } from 'react';
import { useGameStore } from '@/store/useGameStore';
import { useAuthStore } from '@/store/useAuthStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trophy, User, Star, Camera, CheckCircle, Edit2, X } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Profile() {
    const { xp, level, civiCoins, achievements, reportsSubmitted, votesCast } = useGameStore();
    const { user, updateProfile, fetchUser } = useAuthStore();

    useEffect(() => {
        if (user?.id) {
            fetchUser(user.id);
        }
    }, [user?.id]);

    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    // Form state
    const [formData, setFormData] = useState({
        name: user?.name || '',
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
        address: user?.address || '',
        education: user?.education || '',
        profession: user?.profession || '',
        age: user?.age?.toString() || '',
        whatsapp: user?.whatsapp || '',
        receiveUpdates: user?.receiveUpdates || false,
        notificationChannel: user?.notificationChannel || 'WHATSAPP',
        interests: user?.interests || [] as string[],
        subscribedThemes: user?.subscribedThemes || [] as string[]
    });

    const INTERESTS = [
        'Saúde', 'Educação', 'Segurança', 'Transporte', 'Meio Ambiente',
        'Cultura', 'Esporte', 'Lazer', 'Habitação', 'Assistência Social'
    ];

    const handleEdit = () => {
        setIsEditing(true);
        setFormData({
            name: user?.name || '',
            currentPassword: '',
            newPassword: '',
            confirmPassword: '',
            address: user?.address || '',
            education: user?.education || '',
            profession: user?.profession || '',
            age: user?.age?.toString() || '',
            whatsapp: user?.whatsapp || '',
            receiveUpdates: user?.receiveUpdates || false,
            notificationChannel: user?.notificationChannel || 'WHATSAPP',
            interests: user?.interests || [],
            subscribedThemes: user?.subscribedThemes || []
        });
        setError(null);
        setSuccess(false);
    };

    const handleCancel = () => {
        setIsEditing(false);
        setFormData({
            name: user?.name || '',
            currentPassword: '',
            newPassword: '',
            confirmPassword: '',
            address: user?.address || '',
            education: user?.education || '',
            profession: user?.profession || '',
            age: user?.age?.toString() || '',
            whatsapp: user?.whatsapp || '',
            receiveUpdates: user?.receiveUpdates || false,
            notificationChannel: user?.notificationChannel || 'WHATSAPP',
            interests: user?.interests || [],
            subscribedThemes: user?.subscribedThemes || []
        });
        setError(null);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSuccess(false);

        // Validation
        if (!formData.name.trim()) {
            setError('Nome é obrigatório');
            return;
        }

        if (formData.newPassword) {
            if (!formData.currentPassword) {
                setError('Senha atual é obrigatória para alterar a senha');
                return;
            }
            if (formData.newPassword.length < 6) {
                setError('Nova senha deve ter no mínimo 6 caracteres');
                return;
            }
            if (formData.newPassword !== formData.confirmPassword) {
                setError('As senhas não coincidem');
                return;
            }
        }

        setLoading(true);

        try {
            const updateData: any = {
                address: formData.address,
                education: formData.education,
                profession: formData.profession,
                age: formData.age ? parseInt(formData.age) : undefined,
                whatsapp: formData.whatsapp,
                receiveUpdates: formData.receiveUpdates,
                notificationChannel: formData.notificationChannel,
                interests: formData.interests,
                subscribedThemes: formData.subscribedThemes
            };

            if (formData.name !== user?.name) {
                updateData.name = formData.name;
            }

            if (formData.newPassword) {
                updateData.currentPassword = formData.currentPassword;
                updateData.newPassword = formData.newPassword;
            }

            await updateProfile(user!.id, updateData);

            setSuccess(true);
            setIsEditing(false);
            setTimeout(() => setSuccess(false), 3000);
        } catch (err: any) {
            setError(err.message || 'Erro ao atualizar perfil');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-4 md:p-8 max-w-3xl mx-auto space-y-6">
            {/* Header Profile */}
            <div className="flex items-center gap-4 mb-6">
                <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center border-4 border-white shadow-md overflow-hidden">
                    {user?.avatar ? (
                        <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                    ) : (
                        <User className="h-10 w-10 text-primary" />
                    )}
                </div>
                <div className="flex-1">
                    <h1 className="text-2xl font-bold text-slate-900">{user?.name || 'Visitante'}</h1>
                    <p className="text-slate-500">Cidadão Auditor Nível {level}</p>
                    <div className="flex items-center gap-2 mt-1">
                        <span className="bg-yellow-100 text-yellow-800 text-xs font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                            <Star className="h-3 w-3" /> {xp} XP
                        </span>
                        <span className="bg-amber-100 text-amber-800 text-xs font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                            <div className="h-3 w-3 rounded-full bg-amber-500 flex items-center justify-center text-[8px] text-white">$</div> {civiCoins}
                        </span>
                    </div>
                </div>
                {!isEditing && (
                    <Button onClick={handleEdit} variant="outline" className="gap-2">
                        <Edit2 className="h-4 w-4" />
                        Editar
                    </Button>
                )}
            </div>

            {/* Success Message */}
            {success && (
                <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-center gap-2">
                    <CheckCircle className="h-5 w-5" />
                    <span>Perfil atualizado com sucesso!</span>
                </div>
            )}

            {/* Profile Details View */}
            {!isEditing && (
                <Card>
                    <CardContent className="p-6 space-y-6">
                        {/* Personal Data */}
                        <div>
                            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-3">Dados Pessoais</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                <div>
                                    <span className="block text-slate-500 mb-1">Idade</span>
                                    <span className="font-medium text-slate-900">{user?.age || '-'}</span>
                                </div>
                                <div>
                                    <span className="block text-slate-500 mb-1">Profissão</span>
                                    <span className="font-medium text-slate-900">{user?.profession || '-'}</span>
                                </div>
                                <div>
                                    <span className="block text-slate-500 mb-1">Formação</span>
                                    <span className="font-medium text-slate-900">{user?.education || '-'}</span>
                                </div>
                                <div>
                                    <span className="block text-slate-500 mb-1">Endereço</span>
                                    <span className="font-medium text-slate-900">{user?.address || '-'}</span>
                                </div>
                            </div>
                        </div>

                        <div className="border-t pt-4">
                            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-3">Contato & Notificações</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                <div>
                                    <span className="block text-slate-500 mb-1">WhatsApp</span>
                                    <span className="font-medium text-slate-900">{user?.whatsapp || '-'}</span>
                                </div>
                                <div>
                                    <span className="block text-slate-500 mb-1">Preferência de Contato</span>
                                    <span className="font-medium text-slate-900">
                                        {user?.receiveUpdates
                                            ? `Receber via ${user?.notificationChannel === 'WHATSAPP' ? 'WhatsApp' : 'Telegram'}`
                                            : 'Não receber atualizações'}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {user?.interests && user.interests.length > 0 && (
                            <div className="border-t pt-4">
                                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-3">Interesses</h3>
                                <div className="flex flex-wrap gap-2">
                                    {user.interests.map((interest: string) => (
                                        <span key={interest} className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-medium">
                                            {interest}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}

            {/* Edit Form */}
            {isEditing && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center justify-between">
                            <span>Editar Perfil</span>
                            <Button onClick={handleCancel} variant="ghost" size="sm">
                                <X className="h-4 w-4" />
                            </Button>
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            {error && (
                                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                                    {error}
                                </div>
                            )}

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                    Nome
                                </label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="Seu nome"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                    Senha Atual <span className="text-slate-400 text-xs font-normal">(Necessário apenas para alterar senha)</span>
                                </label>
                                <input
                                    type="password"
                                    value={formData.currentPassword}
                                    onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="Digite sua senha atual"
                                />
                            </div>

                            <div className="border-t pt-4">
                                <h3 className="text-lg font-bold text-slate-700 mb-3">Dados Pessoais</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Idade</label>
                                        <input
                                            type="number"
                                            value={formData.age}
                                            onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            placeholder="Sua idade"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Profissão</label>
                                        <input
                                            type="text"
                                            value={formData.profession}
                                            onChange={(e) => setFormData({ ...formData, profession: e.target.value })}
                                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            placeholder="Sua profissão"
                                        />
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Endereço</label>
                                        <input
                                            type="text"
                                            value={formData.address}
                                            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            placeholder="Seu endereço completo"
                                        />
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Formação</label>
                                        <select
                                            value={formData.education}
                                            onChange={(e) => setFormData({ ...formData, education: e.target.value })}
                                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        >
                                            <option value="">Selecione...</option>
                                            <option value="Ensino Fundamental">Ensino Fundamental</option>
                                            <option value="Ensino Médio">Ensino Médio</option>
                                            <option value="Ensino Superior">Ensino Superior</option>
                                            <option value="Pós-graduação">Pós-graduação</option>
                                            <option value="Mestrado/Doutorado">Mestrado/Doutorado</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            <div className="border-t pt-4">
                                <h3 className="text-lg font-bold text-slate-700 mb-3">Contato & Notificações</h3>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">WhatsApp</label>
                                        <input
                                            type="text"
                                            value={formData.whatsapp}
                                            onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            placeholder="(00) 00000-0000"
                                        />
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <input
                                            type="checkbox"
                                            id="receiveUpdates"
                                            checked={formData.receiveUpdates}
                                            onChange={(e) => setFormData({ ...formData, receiveUpdates: e.target.checked })}
                                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                        />
                                        <label htmlFor="receiveUpdates" className="text-sm text-slate-700">
                                            Quero receber atualizações sobre minhas denúncias e temas de interesse
                                        </label>
                                    </div>

                                    {formData.receiveUpdates && (
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-1">Canal de Preferência</label>
                                            <div className="flex gap-4">
                                                <label className="flex items-center gap-2">
                                                    <input
                                                        type="radio"
                                                        name="notificationChannel"
                                                        value="WHATSAPP"
                                                        checked={formData.notificationChannel === 'WHATSAPP'}
                                                        onChange={(e) => setFormData({ ...formData, notificationChannel: e.target.value })}
                                                        className="text-blue-600 focus:ring-blue-500"
                                                    />
                                                    <span className="text-sm text-slate-700">WhatsApp</span>
                                                </label>
                                                <label className="flex items-center gap-2">
                                                    <input
                                                        type="radio"
                                                        name="notificationChannel"
                                                        value="TELEGRAM"
                                                        checked={formData.notificationChannel === 'TELEGRAM'}
                                                        onChange={(e) => setFormData({ ...formData, notificationChannel: e.target.value })}
                                                        className="text-blue-600 focus:ring-blue-500"
                                                    />
                                                    <span className="text-sm text-slate-700">Telegram</span>
                                                </label>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="border-t pt-4">
                                <h3 className="text-lg font-bold text-slate-700 mb-3">Interesses</h3>
                                <p className="text-sm text-slate-500 mb-3">Selecione os temas que você quer acompanhar:</p>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                                    {INTERESTS.map((interest) => (
                                        <label key={interest} className="flex items-center gap-2 p-2 border rounded-lg hover:bg-slate-50 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={formData.interests.includes(interest)}
                                                onChange={(e) => {
                                                    const newInterests = e.target.checked
                                                        ? [...formData.interests, interest]
                                                        : formData.interests.filter(i => i !== interest);

                                                    // Auto-subscribe if checked
                                                    const newSubscribed = e.target.checked
                                                        ? [...formData.subscribedThemes, interest]
                                                        : formData.subscribedThemes.filter(i => i !== interest);

                                                    setFormData({
                                                        ...formData,
                                                        interests: newInterests,
                                                        subscribedThemes: newSubscribed
                                                    });
                                                }}
                                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                            />
                                            <span className="text-sm text-slate-700">{interest}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            <div className="border-t pt-4">
                                <h3 className="text-lg font-bold text-slate-700 mb-3">Alterar Senha (Opcional)</h3>

                                <div className="space-y-3">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">
                                            Nova Senha
                                        </label>
                                        <input
                                            type="password"
                                            value={formData.newPassword}
                                            onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            placeholder="Mínimo 6 caracteres"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">
                                            Confirmar Nova Senha
                                        </label>
                                        <input
                                            type="password"
                                            value={formData.confirmPassword}
                                            onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            placeholder="Digite a nova senha novamente"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-3 pt-4">
                                <Button
                                    type="submit"
                                    disabled={loading}
                                    className="flex-1 bg-blue-600 hover:bg-blue-700"
                                >
                                    {loading ? 'Salvando...' : 'Salvar Alterações'}
                                </Button>
                                <Button
                                    type="button"
                                    onClick={handleCancel}
                                    variant="outline"
                                    disabled={loading}
                                >
                                    Cancelar
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            )}

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-4">
                <Card>
                    <CardContent className="p-4 flex flex-col items-center justify-center text-center gap-2">
                        <div className="bg-blue-100 p-2 rounded-full">
                            <Camera className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                            <h3 className="font-bold text-2xl">{reportsSubmitted}</h3>
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
                            <h3 className="font-bold text-2xl">{votesCast}</h3>
                            <p className="text-xs text-slate-500">Votos</p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Achievements Section */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Trophy className="h-5 w-5 text-yellow-500" />
                        Conquistas
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {achievements.map((achievement) => (
                            <div
                                key={achievement.id}
                                className={`flex items-center gap-3 p-3 rounded-lg border ${achievement.unlocked
                                    ? 'bg-yellow-50 border-yellow-200'
                                    : 'bg-slate-50 border-slate-100 opacity-60 grayscale'
                                    }`}
                            >
                                <div className="text-2xl">{achievement.icon}</div>
                                <div>
                                    <h4 className={`font-bold text-sm ${achievement.unlocked ? 'text-slate-900' : 'text-slate-500'}`}>
                                        {achievement.title}
                                    </h4>
                                    <p className="text-xs text-slate-500">{achievement.description}</p>
                                </div>
                                {achievement.unlocked && (
                                    <div className="ml-auto">
                                        <CheckCircle className="h-4 w-4 text-green-500" />
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            <div className="text-center pt-4">
                <Link to={`/profile/${user?.id}`} className="text-blue-600 hover:underline text-sm font-medium">
                    Ver meu perfil público
                </Link>
            </div>
        </div>
    );
}
