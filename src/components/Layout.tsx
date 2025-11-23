import { cn } from '@/lib/utils';
import { useAuthStore } from '@/store/useAuthStore';
import { Camera, CheckCircle, Home, LogOut, MessageSquare, Trophy, User, Vote, FileText, MoreHorizontal, X, Gift } from 'lucide-react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { useState } from 'react';

export default function Layout() {
    const location = useLocation();
    const { user, logout } = useAuthStore();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const primaryNavItems = [
        { icon: Home, label: 'Início', path: '/' },
        { icon: Camera, label: 'Fiscalizar', path: '/audit' },
        { icon: CheckCircle, label: 'Validar', path: '/feed' },
        { icon: User, label: 'Perfil', path: '/profile' },
    ];

    const secondaryNavItems = [
        { icon: Vote, label: 'Projetos de Lei', path: '/propositions' },
        { icon: FileText, label: 'Diário Oficial', path: '/official-diary' },
        { icon: Trophy, label: 'Ranking', path: '/ranking' },
        { icon: Gift, label: 'Recompensas', path: '/rewards' },
        { icon: MessageSquare, label: 'Mentor', path: '/chat' },
    ];

    const allNavItems = [...primaryNavItems, ...secondaryNavItems];

    return (
        <div className="min-h-screen bg-background flex flex-col">
            {/* Mobile Header */}
            <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 md:hidden">
                <div className="flex h-14 items-center justify-center relative">
                    <img src="/logo-civicux.webp" alt="Civicux" className="w-[140px]" />
                    {user && (
                        <button
                            onClick={logout}
                            className="absolute right-4 text-slate-400 hover:text-red-500"
                            aria-label="Sair"
                        >
                            <LogOut className="h-5 w-5" />
                        </button>
                    )}
                </div>
            </header>

            {/* Desktop Sidebar (Hidden on Mobile) */}
            <aside className="hidden md:flex w-64 flex-col fixed inset-y-0 z-50 border-r bg-white">
                <div className="p-6">
                    <img src="/logo-civicux.webp" alt="Civicux" className="w-[80%] max-h-[121px]" />
                </div>
                <nav className="flex-1 px-4 space-y-2">
                    {allNavItems.map((item) => (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={cn(
                                "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                                location.pathname === item.path
                                    ? "bg-primary/10 text-primary"
                                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                            )}
                        >
                            <item.icon className="h-5 w-5" />
                            {item.label}
                        </Link>
                    ))}
                </nav>

                {user ? (
                    <div className="p-4 border-t bg-slate-50">
                        <div className="flex items-center gap-3">
                            <img src={user.avatar} alt={user.name} className="h-8 w-8 rounded-full" />
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-slate-900 truncate">{user.name}</p>
                                <p className="text-xs text-slate-500 truncate">{user.email}</p>
                            </div>
                            <button onClick={logout} className="text-slate-400 hover:text-red-500">
                                <LogOut className="h-4 w-4" />
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="p-4 border-t">
                        <Link to="/login" className="flex items-center justify-center w-full bg-primary text-white py-2 rounded-md text-sm font-medium hover:bg-primary/90">
                            Entrar
                        </Link>
                    </div>
                )}
            </aside>

            {/* Main Content */}
            <main className="flex-1 md:pl-64 pb-16 md:pb-0">
                <Outlet />
            </main>

            {/* Mobile Bottom Nav */}
            <nav className="fixed bottom-0 left-0 right-0 z-50 border-t bg-white md:hidden">
                <div className="flex justify-around items-center h-16">
                    {primaryNavItems.map((item) => (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={cn(
                                "flex flex-col items-center justify-center w-full h-full gap-1 text-xs font-medium transition-colors",
                                location.pathname === item.path
                                    ? "text-primary"
                                    : "text-slate-500 hover:text-slate-900"
                            )}
                        >
                            <item.icon className="h-5 w-5" />
                            <span>{item.label}</span>
                        </Link>
                    ))}
                    <button
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        className={cn(
                            "flex flex-col items-center justify-center w-full h-full gap-1 text-xs font-medium transition-colors",
                            mobileMenuOpen ? "text-primary" : "text-slate-500 hover:text-slate-900"
                        )}
                    >
                        {mobileMenuOpen ? <X className="h-5 w-5" /> : <MoreHorizontal className="h-5 w-5" />}
                        <span>Mais</span>
                    </button>
                </div>

                {/* Expandable Menu */}
                {mobileMenuOpen && (
                    <div className="absolute bottom-16 left-0 right-0 bg-white border-t shadow-lg animate-in slide-in-from-bottom-2">
                        <div className="grid grid-cols-2 gap-2 p-4">
                            {secondaryNavItems.map((item) => (
                                <Link
                                    key={item.path}
                                    to={item.path}
                                    onClick={() => setMobileMenuOpen(false)}
                                    className={cn(
                                        "flex flex-col items-center justify-center p-4 rounded-lg border transition-colors",
                                        location.pathname === item.path
                                            ? "bg-primary/10 text-primary border-primary/20"
                                            : "text-slate-600 hover:bg-slate-50 border-slate-200"
                                    )}
                                >
                                    <item.icon className="h-6 w-6 mb-2" />
                                    <span className="text-xs font-medium text-center">{item.label}</span>
                                </Link>
                            ))}
                        </div>
                    </div>
                )}
            </nav>
        </div>
    );
}
