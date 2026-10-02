export type TeamStatus = 'pool' | 'pitching' | 'completed';

export interface Team {
  id: string;
  name: string;
  project_name: string;
  pitcher: string;
  status: TeamStatus;
  order_num?: number;
  created_at?: string;
}

export type TimerPhase = 'normal' | 'warning' | 'danger' | 'overtime';
