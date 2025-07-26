// Shared types for blog and portfolio

export interface BlogPost {
  id: number;
  title: string;
  content: string;
  created_at: string;
  html?: string;
  tags?: string;
}

export interface PortfolioItem {
  id: number;
  title: string;
  description: string;
  link?: string;
  image?: string;
  created_at: string;
}
