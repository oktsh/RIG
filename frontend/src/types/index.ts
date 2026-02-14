export interface Prompt {
  id: number;
  title: string;
  desc: string;
  author: string;
  copies: string;
  tags: string[];
  tech: string;
  content: string;
}

export interface Guide {
  id: number;
  title: string;
  desc: string;
  author: string;
  category: string;
  time: string;
  views: string;
  date: string;
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

export type ContentStatus = "published" | "draft" | "pending";

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

export interface HeaderConfig {
  title: string;
  subtitle: string;
  showSearch: boolean;
}

export type UserRole = "USER" | "MODERATOR" | "ADMIN";
export type UserStatus = "ACTIVE" | "INACTIVE";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
}
