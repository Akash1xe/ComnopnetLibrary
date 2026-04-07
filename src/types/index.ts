export type SubscriptionTier = "free" | "pro" | "team";
export type BillingPeriod = "monthly" | "annual";
export type PlanName = "free" | "pro" | "team";
export type SubscriptionStatus = "active" | "canceled" | "past_due" | "trialing";
export type ComponentFramework = "react" | "vue" | "svelte" | "angular" | "html";
export type ComponentSort = "newest" | "popular" | "trending";
export type ComponentViewMode = "grid" | "list";
export type ComponentStatus = "draft" | "published" | "rejected" | "archived";
export type TrustBadgeType =
  | "team_curated"
  | "verified_creator"
  | "accessible"
  | "responsive"
  | "dark_mode_ready"
  | "recently_updated"
  | "popular"
  | "trending"
  | "typescript"
  | "tested";

export interface User {
  id: string;
  email: string;
  username: string;
  full_name: string | null;
  avatar_url: string | null;
  subscription_tier: SubscriptionTier;
  is_verified: boolean;
  created_at: string;
  is_superuser?: boolean;
  github_username?: string | null;
}

export interface ComponentAuthor {
  id?: string;
  username: string;
  full_name?: string | null;
  avatar_url?: string | null;
  is_verified?: boolean | null;
}

export interface TrustBadge {
  id?: string;
  badge_type: TrustBadgeType;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  icon?: string | null;
  parent_id?: string | null;
  order?: number;
  count?: number | null;
}

export interface Tag {
  id: string;
  name: string;
  slug: string;
  count?: number | null;
}

export interface CodeFile {
  id?: string;
  filename: string;
  language: "tsx" | "jsx" | "css" | "ts" | "js" | "json" | "html" | "python" | "md";
  code: string;
  is_primary: boolean;
  order: number;
}

export interface ComponentVersion {
  id: string;
  version_string: string;
  changelog?: string | null;
  created_at: string;
}

export interface Component {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  category: string | null;
  category_slug?: string | null;
  framework: ComponentFramework;
  tags: string[];
  is_pro: boolean;
  is_free: boolean;
  preview_image_url: string | null;
  preview_video_url?: string | null;
  views_count: number;
  copies_count: number;
  downloads_count: number;
  author: ComponentAuthor;
  created_at: string;
  relevance?: number | null;
  version: string;
  trust_badges: TrustBadge[];
}

export interface ComponentDetail extends Component {
  long_description: string | null;
  code_files: CodeFile[];
  versions: ComponentVersion[];
  requires_pro?: boolean;
  preview_url?: string | null;
  install_command?: string | null;
  dependencies: string[];
  compatibility_notes?: string | null;
  updated_at: string;
  published_at?: string | null;
}

export interface Collection {
  id: string;
  user_id?: string;
  name: string;
  description: string | null;
  is_public: boolean;
  slug: string;
  component_count: number;
  components?: Component[];
  created_at?: string;
  updated_at?: string;
}

export interface Subscription {
  id: string;
  plan: PlanName;
  status: SubscriptionStatus;
  current_period_end: string | null;
  cancel_at_period_end: boolean;
}

export interface PlanInfo {
  name: PlanName;
  price_monthly: number;
  price_annual: number;
  features: string[];
  stripe_price_id_monthly?: string | null;
  stripe_price_id_annual?: string | null;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  per_page: number;
  pages: number;
}

export interface BackendPaginatedResponse<T> {
  items: T[];
  meta: {
    total: number;
    page: number;
    per_page: number;
    pages: number;
  };
}

export interface ComponentFilters {
  page?: number;
  per_page?: number;
  category?: string | null;
  framework?: ComponentFramework | null;
  tags?: string[];
  is_free?: boolean | null;
  is_featured?: boolean | null;
  search?: string | null;
  sort?: ComponentSort;
  creator?: string | null;
  status?: ComponentStatus | null;
  view?: ComponentViewMode;
}

export interface ComponentCreate {
  name: string;
  short_description?: string | null;
  long_description?: string | null;
  category_slug: string;
  tag_slugs: string[];
  framework: ComponentFramework;
  code_files: CodeFile[];
  is_free?: boolean;
  status?: ComponentStatus;
  is_featured?: boolean;
  is_trending?: boolean;
  preview_image_url?: string | null;
  preview_video_url?: string | null;
  preview_url?: string | null;
  install_command?: string | null;
  dependencies?: string[];
  compatibility_notes?: string | null;
  trust_badges?: TrustBadgeType[];
}

export interface ComponentUpdate extends Partial<ComponentCreate> {
  changelog?: string | null;
}

export interface ComponentSubmission {
  id: string;
  name: string;
  slug: string;
  short_description?: string | null;
  framework: ComponentFramework;
  status: "pending_review" | "approved" | "rejected";
  reviewer_notes?: string | null;
  reviewed_at?: string | null;
  created_at: string;
}

export interface ValidationError {
  loc: Array<string | number>;
  msg: string;
  type: string;
}

export interface DashboardAnalytics {
  total_views: number;
  total_views_trend: number;
  total_copies: number;
  total_copies_trend: number;
  collections_count: number;
  copies_today: number;
  copies_limit: number;
  views_by_day: Array<{ date: string; views: number }>;
  top_components: Array<{ slug: string; name: string; views: number; copies: number }>;
}

export interface AdminOverview {
  users_count: number;
  pending_components: number;
  active_subscriptions: number;
  mrr: number;
}

export interface AuthResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  user: User;
}

export interface AuthUserMessage {
  user: User;
  message: string;
}
