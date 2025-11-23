import { create } from 'zustand';
import API_CONFIG from '@/config/api';
import { persist } from 'zustand/middleware';

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  condition: (stats: UserStats) => boolean;
}

interface UserStats {
  civiCoins: number;
  xp: number;
  level: number;
  nextLevelXp: number;
  reportsSubmitted: number;
  votesCast: number;
}

interface GameStore extends UserStats {
  achievements: Achievement[];
  fetchUserData: (userId: string) => Promise<void>;
  addXp: (amount: number) => void; // These will now be handled by backend mostly, but kept for optimistic UI
  addCoins: (amount: number) => void;
}

const initialAchievements: Achievement[] = [
  {
    id: 'first-report',
    title: 'Olho de Águia',
    description: 'Fez sua primeira denúncia.',
    icon: '🦅',
    unlocked: false,
    condition: (stats) => stats.reportsSubmitted >= 1,
  },
  {
    id: 'active-voter',
    title: 'Juiz Imparcial',
    description: 'Votou em 5 denúncias.',
    icon: '⚖️',
    unlocked: false,
    condition: (stats) => stats.votesCast >= 5,
  },
  {
    id: 'level-5',
    title: 'Guardião Urbano',
    description: 'Alcançou o nível 5.',
    icon: '🛡️',
    unlocked: false,
    condition: (stats) => stats.level >= 5,
  },
  {
    id: 'first-prop-vote',
    title: 'Legislador',
    description: 'Votou em 1 projeto de lei.',
    icon: '📜',
    unlocked: false,
    condition: (stats) => stats.votesCast >= 1, // Simplified check
  },
  {
    id: 'five-prop-votes',
    title: 'Senador',
    description: 'Votou em 5 projetos de lei.',
    icon: '🏛️',
    unlocked: false,
    condition: (stats) => stats.votesCast >= 5, // Simplified check
  }
];

export const useGameStore = create<GameStore>()(
  persist(
    (set, get) => ({
      civiCoins: 0,
      xp: 0,
      level: 1,
      nextLevelXp: 100,
      reportsSubmitted: 0,
      votesCast: 0,
      achievements: initialAchievements,

      fetchUserData: async (userId) => {
          try {
              const response = await fetch(API_CONFIG.ENDPOINTS.USER.GET(userId));
              if (response.ok) {
                  const user = await response.json();
                  set({
                      civiCoins: user.civiCoins,
                      xp: user.xp,
                      level: user.level,
                      nextLevelXp: user.nextLevelXp,
                      reportsSubmitted: user.reportsSubmitted,
                      votesCast: user.votesCast,
                      achievements: initialAchievements.map(ach => {
                          const unlocked = user.achievements.some((ua: any) => ua.achievementId === ach.id);
                          return { ...ach, unlocked };
                      })
                  });
              }
          } catch (error) {
              console.error("Failed to fetch user data", error);
          }
      },

      addXp: (amount) => {
        // Optimistic update, real logic is on server
        const { xp, level, nextLevelXp } = get();
        let newXp = xp + amount;
        let newLevel = level;
        let newNextLevelXp = nextLevelXp;

        if (newXp >= nextLevelXp) {
          newLevel += 1;
          newXp -= nextLevelXp;
          newNextLevelXp = Math.floor(nextLevelXp * 1.5);
        }

        set({ xp: newXp, level: newLevel, nextLevelXp: newNextLevelXp });
      },

      addCoins: (amount) => {
        set((state) => ({ civiCoins: state.civiCoins + amount }));
      },
    }),
    {
      name: 'game-storage',
    }
  )
);
