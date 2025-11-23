import { useState } from 'react';
import { CameraCapture } from '@/components/audit/CameraCapture';
import { LocationPicker } from '@/components/audit/LocationPicker';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { analyzeImage, type AnalysisResult } from '@/services/ai';
import { reverseGeocode } from '@/services/geocoding';
import { Loader2, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useReportStore } from '@/store/useReportStore';
import { useGameStore } from '@/store/useGameStore';
import { useAuthStore } from '@/store/useAuthStore';
import API_CONFIG from '@/config/api';

export default function Audit() {
    const navigate = useNavigate();
    const addReport = useReportStore((state) => state.addReport);
    const { addXp, addCoins } = useGameStore();
    const { user } = useAuthStore();
    const [step, setStep] = useState<1 | 2 | 3>(1);
    const [image, setImage] = useState<File | null>(null);
    const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
    const [address, setAddress] = useState<string | null>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [isGeocodingAddress, setIsGeocodingAddress] = useState(false);
    const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);

    const handleCapture = async (file: File) => {
        setImage(file);
        setIsAnalyzing(true);
        try {
            const result = await analyzeImage(file);
            setAnalysis(result);
            setStep(2);
        } catch (error) {
            console.error("Analysis failed", error);
        } finally {
            setIsAnalyzing(false);
        }
    };

    const handleLocationSelect = async (lat: number, lng: number) => {
        setLocation({ lat, lng });
        setIsGeocodingAddress(true);
        try {
            const result = await reverseGeocode(lat, lng);
            setAddress(result.address);
        } catch (error) {
            console.error("Geocoding failed", error);
            setAddress(null);
        } finally {
            setIsGeocodingAddress(false);
        }
    };

    const handleSubmit = async () => {
        if (analysis && location && image) {
            try {
                // Upload image first
                const formData = new FormData();
                formData.append('image', image);

                const uploadResponse = await fetch(API_CONFIG.ENDPOINTS.UPLOAD, {
                    method: 'POST',
                    body: formData,
                });

                if (!uploadResponse.ok) {
                    throw new Error('Failed to upload image');
                }

                const { imageUrl } = await uploadResponse.json();

                // Create report with uploaded image URL and address
                await addReport({
                    title: analysis.title,
                    description: analysis.description,
                    severity: analysis.severity,
                    department: analysis.department,
                    location: location,
                    address: address || undefined,
                    imageUrl: imageUrl,
                    authorName: user?.name || 'Usuário Anônimo',
                });

                // Award rewards
                addXp(100);
                addCoins(50);

                navigate('/feed');
            } catch (error) {
                console.error('Failed to submit report:', error);
                alert('Erro ao enviar denúncia. Tente novamente.');
            }
        }
    };

    return (
        <div className="p-4 md:p-8 max-w-3xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-slate-900">Nova Auditoria</h1>
                <span className="text-sm text-slate-500">Passo {step} de 3</span>
            </div>

            {/* Step 1: Capture & Analyze */}
            {step === 1 && (
                <Card>
                    <CardHeader>
                        <CardTitle>O que você encontrou?</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <CameraCapture onCapture={handleCapture} />
                        {isAnalyzing && (
                            <div className="flex flex-col items-center justify-center py-8 text-primary">
                                <Loader2 className="h-8 w-8 animate-spin mb-2" />
                                <p className="text-sm font-medium">A IA está analisando sua denúncia...</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}

            {/* Step 2: Review Analysis & Location */}
            {step === 2 && analysis && (
                <div className="space-y-6">
                    <Card className="border-primary/20 bg-primary/5">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-primary">
                                <CheckCircle className="h-5 w-5" />
                                Análise da IA
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            <h3 className="font-bold text-lg">{analysis.title}</h3>
                            <p className="text-slate-600">{analysis.description}</p>
                            <div className="flex gap-4 mt-2">
                                <div className="bg-white px-3 py-1 rounded-full text-xs font-bold border shadow-sm">
                                    Severidade: <span className="text-red-500">{analysis.severity}/10</span>
                                </div>
                                <div className="bg-white px-3 py-1 rounded-full text-xs font-bold border shadow-sm">
                                    {analysis.department}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Confirmar Localização</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <p className="text-sm text-slate-500">Toque no mapa para ajustar a localização exata.</p>
                            <LocationPicker onLocationSelect={handleLocationSelect} />
                            {isGeocodingAddress && (
                                <p className="text-xs text-slate-400 italic">Buscando endereço...</p>
                            )}
                            {address && !isGeocodingAddress && (
                                <p className="text-sm text-slate-700">📍 {address}</p>
                            )}
                            <Button
                                className="w-full"
                                onClick={() => setStep(3)}
                                disabled={!location}
                            >
                                Confirmar Local e Continuar
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Step 3: Final Review */}
            {step === 3 && (
                <Card>
                    <CardHeader>
                        <CardTitle>Revisão Final</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="bg-slate-50 p-4 rounded-lg space-y-2">
                            <p><strong>Problema:</strong> {analysis?.title}</p>
                            <p><strong>Local:</strong> {address || `${location?.lat.toFixed(4)}, ${location?.lng.toFixed(4)}`}</p>
                            <p className="text-xs text-slate-500">Ao enviar, você declara que as informações são verdadeiras.</p>
                        </div>
                        <Button className="w-full bg-green-600 hover:bg-green-700" onClick={handleSubmit}>
                            Enviar Denúncia (+100 CiviCoins)
                        </Button>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
