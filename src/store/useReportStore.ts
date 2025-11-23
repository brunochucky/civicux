import { create } from 'zustand';
import { useAuthStore } from './useAuthStore';
import API_CONFIG from '@/config/api';

export interface Report {
  id: string;
  title: string;
  description: string;
  severity: number;
  department: string;
  location: { lat: number; lng: number };
  address?: string;
  imageUrl?: string;
  status: 'pending' | 'validated' | 'rejected' | 'resolved';
  votes: { valid: number; fake: number };
  createdAt: Date;
  authorName: string;
  userVote?: 'valid' | 'fake' | null;
}

interface ReportStore {
  reports: Report[];
  page: number;
  totalPages: number;
  loading: boolean;
  loadingMore: boolean;
  fetchReports: (pageNum?: number) => Promise<void>;
  addReport: (report: Omit<Report, 'id' | 'createdAt' | 'votes' | 'status'>) => Promise<void>;
  voteReport: (id: string, type: 'valid' | 'fake', userId: string, comment: string) => Promise<void>;
}

export const useReportStore = create<ReportStore>((set, get) => ({
  reports: [],
  page: 1,
  totalPages: 1,
  loading: false,
  loadingMore: false,
  
  fetchReports: async (pageNum = 1) => {
    try {
      if (pageNum === 1) {
        set({ loading: true });
      } else {
        set({ loadingMore: true });
      }

      const userId = useAuthStore.getState().user?.id;
      const url = userId 
        ? `${API_CONFIG.ENDPOINTS.REPORTS.LIST}?page=${pageNum}&limit=5&userId=${userId}`
        : `${API_CONFIG.ENDPOINTS.REPORTS.LIST}?page=${pageNum}&limit=5`;
      
      const response = await fetch(url);
      const data = await response.json();
      
      // Transform data to match frontend model
      const newReports = data.items.map((r: any) => ({
        ...r,
        location: { lat: r.latitude, lng: r.longitude },
        votes: { 
            valid: r.votes.filter((v: any) => v.type === 'valid').length,
            fake: r.votes.filter((v: any) => v.type === 'fake').length
        },
        createdAt: new Date(r.createdAt),
        authorName: r.author?.name || 'Usuário Anônimo'
      }));

      // Append or replace reports based on page
      if (pageNum === 1) {
        set({ 
          reports: newReports,
          page: pageNum,
          totalPages: data.totalPages,
          loading: false
        });
      } else {
        set({ 
          reports: [...get().reports, ...newReports],
          page: pageNum,
          totalPages: data.totalPages,
          loadingMore: false
        });
      }
    } catch (error) {
      console.error('Failed to fetch reports:', error);
      set({ loading: false, loadingMore: false });
    }
  },

  addReport: async (report) => {
    try {
      const response = await fetch(API_CONFIG.ENDPOINTS.REPORTS.LIST, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            ...report,
            authorId: useAuthStore.getState().user?.id || 'anonymous' 
        }),
      });
      
      if (response.ok) {
        get().fetchReports(1); // Reset to page 1 after adding
      }
    } catch (error) {
      console.error('Failed to add report:', error);
    }
  },

  voteReport: async (id: string, type: 'valid' | 'fake', userId: string, comment: string) => {
    try {
      await fetch(API_CONFIG.ENDPOINTS.REPORTS.VOTE(id), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, type, comment }),
      });
      
      // Update local state instead of refetching to preserve scroll position
      set(state => ({
        reports: state.reports.map(report => {
          if (report.id === id) {
            return {
              ...report,
              userVote: type,
              votes: {
                valid: type === 'valid' ? report.votes.valid + 1 : report.votes.valid,
                fake: type === 'fake' ? report.votes.fake + 1 : report.votes.fake
              }
            };
          }
          return report;
        })
      }));
    } catch (error) {
      console.error('Failed to vote:', error);
    }
  },
}));
