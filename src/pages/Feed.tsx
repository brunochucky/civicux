import { useEffect } from "react";
import { useReportStore } from "@/store/useReportStore";
import { FeedItem } from "@/components/feed/FeedItem";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

export default function Feed() {
    const reports = useReportStore((state) => state.reports);
    const page = useReportStore((state) => state.page);
    const totalPages = useReportStore((state) => state.totalPages);
    const loading = useReportStore((state) => state.loading);
    const loadingMore = useReportStore((state) => state.loadingMore);
    const fetchReports = useReportStore((state) => state.fetchReports);

    useEffect(() => {
        fetchReports(1);
    }, [fetchReports]);

    return (
        <div className="p-4 md:p-8 max-w-2xl mx-auto space-y-6">
            <div className="flex flex-col gap-2">
                <h1 className="text-2xl font-bold text-slate-900">Feed de Validação</h1>
                <p className="text-slate-500">Ajude a validar denúncias e ganhe CiviCoins.</p>
            </div>

            {loading && page === 1 ? (
                <div className="flex justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
                </div>
            ) : (
                <>
                    <div className="space-y-6">
                        {reports.map((report) => (
                            <FeedItem key={report.id} report={report} />
                        ))}
                        {reports.length === 0 && (
                            <p className="text-center text-slate-500 py-8">
                                Nenhuma denúncia encontrada no momento.
                            </p>
                        )}
                    </div>

                    {page < totalPages && (
                        <div className="flex justify-center pt-6 pb-4">
                            <Button
                                onClick={() => fetchReports(page + 1)}
                                disabled={loadingMore}
                                variant="outline"
                                className="w-full md:w-auto min-w-[200px]"
                            >
                                {loadingMore ? (
                                    <>
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        Carregando mais...
                                    </>
                                ) : (
                                    'Carregar mais'
                                )}
                            </Button>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
