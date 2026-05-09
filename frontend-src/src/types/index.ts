export interface Technology {
  id: number;
  name: string;
  category: string;
  confidence_level: number;
  bytes_count: number;
}

export interface User {
  id: number;
  email: string;
  name: string;
  role: string;
  created_at: string;
}

export interface Project {
  id: number;
  user_id: number;
  title: string;
  description: string;
  year: number;
  role: string;
  repo_url: string | null;
  doc_file_path: string | null;
  difficulty_score: number;
  difficulty_level: string;
  has_cicd: boolean;
  github_last_commit_at: string | null;
  github_stars: number | null;
  github_file_count: number | null;
  created_at: string;
  updated_at: string;
  owner: User;
  technologies: Technology[];
}

export interface ProjectList {
  items: Project[];
  total: number;
  page: number;
  per_page: number;
  pages: number;
}

export interface SkillItem {
  technology: string;
  category: string;
  weight: number;
  project_count: number;
  avg_difficulty: number;
}

export interface Profile {
  user: User;
  skills: SkillItem[];
  total_projects: number;
  top_technologies: string[];
  recommendations: string[];
}

export interface Portfolio {
  id: number;
  user_id: number;
  public_slug: string;
  title: string;
  description: string;
  created_at: string;
  owner: User;
  projects: { id: number; order_index: number; project: Project }[];
}
