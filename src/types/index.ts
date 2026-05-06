export type Priority = 'low' | 'medium' | 'high' | 'critical';
export type Status = 'open' | 'in_progress' | 'resolved' | 'closed';

export interface Issue {
  id: string;
  title: string;
  description: string;
  priority: Priority;
  status: Status;
  assignee?: string;
  createdAt: string;
  updatedAt: string;
  isLocalOnly?: boolean;   // created offline
  pendingSync?: boolean;   // edited offline, needs push
}

export interface User {
  id: string;
  email: string;
  name: string;
  token: string;
}

export interface FilterOptions {
  search: string;
  status: Status | 'all';
  priority: Priority | 'all';
}

export interface DashboardCounts {
  open: number;
  in_progress: number;
  resolved: number;
  closed: number;
  total: number;
}

export type RootStackParamList = {
  Login: undefined;
  Main: undefined;
  IssueDetail: { issueId: string };
  CreateEditIssue: { issueId?: string };
};

export type MainTabParamList = {
  Dashboard: undefined;
  IssueList: undefined;
};
