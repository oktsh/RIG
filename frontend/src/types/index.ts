export interface Prompt {
  id: number;
  title: string;
  desc: string;
  author?: string;
  author_name?: string | null;
  copies: string;
  tags: string[];
  tech: string;
  content: string;
  status?: string;
  created_at?: string;
}

export interface Guide {
  id: number;
  title: string;
  desc: string;
  author?: string;
  author_name?: string | null;
  category: string;
  time: string;
  views: string;
  date: string;
  content?: string | null;
  status?: string;
  created_at?: string;
}

export interface Ruleset {
  id: number;
  title: string;
  desc: string;
  language: string;
}

export interface Agent {
  id: number;
  number: string;
  title: string;
  desc: string;
  status: "active" | "beta";
}

export interface Event {
  id: number;
  date: string;
  title: string;
  time: string;
  location: string;
}

export type ContentStatus = "published" | "draft" | "pending" | "rejected";

export interface ContentItem {
  emoji: string;
  title: string;
  status: ContentStatus;
  id: string;
  type: string;
  updated: string;
  copies: number;
}

export interface ContentProposal {
  type: string;
  title: string;
  description: string;
  content: string;
  email: string;
  tags: string[];
  timestamp: string;
}

export interface Proposal {
  id: number;
  type: string;
  title: string;
  description: string | null;
  content: string | null;
  email: string;
  tags: string[];
  status: string;
  created_at: string;
}

export interface HeaderConfig {
  title: string;
  subtitle: string;
  showSearch: boolean;
}

export type UserRole = "USER" | "MODERATOR" | "ADMIN";
export type UserStatus = "ACTIVE" | "INACTIVE";

export interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  is_active: boolean;
  requires_approval: boolean;
  created_at: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  pages: number;
}
