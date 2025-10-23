export type Range = 'day' | 'week' | 'month' | 'quarter' | 'year';
export type View = 'day' | 'month';

export type UiJob = {
  id: string;
  clientId: string | null;
  title: string;
  date: string;   // YYYY-MM-DD
  start: string;  // HH:mm
  end: string;    // HH:mm
  amount: number;
  completed: boolean;
  clientName?: string | null;
};