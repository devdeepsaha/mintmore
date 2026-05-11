/**
 * Feature registry — single source of truth for all platform features.
 * 
 * status:
 *   'enabled'      → fully available
 *   'beta'         → available to specific roles/users only
 *   'coming_soon'  → rendered as a polished coming soon page
 *   'disabled'     → not rendered at all (navigation item hidden)
 * 
 * When adding a new phase from the backend, add it here first.
 * The rest of the system (navigation, routing, guards) reads from this.
 */

export type FeatureStatus = 'enabled' | 'beta' | 'coming_soon' | 'disabled';

export type FeatureId =
  // Core features — always enabled
  | 'auth'
  | 'jobs'
  | 'negotiations'
  | 'wallet'
  | 'chat'
  | 'notifications'
  | 'kyc'
  | 'matching'
  | 'admin_users'
  | 'admin_kyc'
  | 'admin_deals'
  | 'admin_categories'
  | 'admin_wallet'
  | 'profile'
  // Phase 8 — Social Media Publishing
  | 'social_publishing'
  // Phase 9 — AI Tools
  | 'ai_tools'
  | 'ai_writer'
  | 'ai_designer'
  | 'ai_video'
  | 'ai_repurpose'
  | 'ai_caption';

export interface FeatureDefinition {
  id: FeatureId;
  status: FeatureStatus;
  label: string;
  description: string;
  /** Longer pitch used on the Coming Soon page */
  pitch: string;
  /** Which roles can access this feature (empty = all roles) */
  roles?: Array<'admin' | 'client' | 'freelancer'>;
  /** Which roles can bypass coming_soon/beta (admin bypass is always true) */
  betaRoles?: Array<'admin' | 'client' | 'freelancer'>;
  /** Icon name from lucide-react */
  icon: string;
  /** ETA string shown on coming soon page */
  eta?: string;
}

export const FEATURE_REGISTRY: Record<FeatureId, FeatureDefinition> = {
  // ── Core ──────────────────────────────────────────────────────────────────
  auth: {
    id: 'auth',
    status: 'enabled',
    label: 'Authentication',
    description: 'Login, register, and session management.',
    pitch: '',
    icon: 'Lock',
  },
  jobs: {
    id: 'jobs',
    status: 'enabled',
    label: 'Jobs',
    description: 'Post and manage creative work.',
    pitch: '',
    icon: 'Briefcase',
  },
  negotiations: {
    id: 'negotiations',
    status: 'enabled',
    label: 'Negotiations',
    description: 'Structured 2-round pricing negotiation.',
    pitch: '',
    icon: 'MessageSquare',
  },
  wallet: {
    id: 'wallet',
    status: 'enabled',
    label: 'Wallet',
    description: 'Balance, escrow, and transactions.',
    pitch: '',
    icon: 'Wallet',
  },
  chat: {
    id: 'chat',
    status: 'enabled',
    label: 'Chat',
    description: 'Real-time messaging with WhatsApp bridge.',
    pitch: '',
    icon: 'MessageCircle',
  },
  notifications: {
    id: 'notifications',
    status: 'enabled',
    label: 'Notifications',
    description: 'Real-time SSE notifications.',
    pitch: '',
    icon: 'Bell',
  },
  kyc: {
    id: 'kyc',
    status: 'enabled',
    label: 'KYC',
    description: 'Progressive 3-level identity verification.',
    pitch: '',
    icon: 'ShieldCheck',
  },
  matching: {
    id: 'matching',
    status: 'enabled',
    label: 'AI Matching',
    description: 'Automatic freelancer scoring and ranking.',
    pitch: '',
    icon: 'Zap',
    roles: ['admin'],
  },
  admin_users: {
    id: 'admin_users',
    status: 'enabled',
    label: 'User Management',
    description: 'Approve, suspend, and manage users.',
    pitch: '',
    icon: 'Users',
    roles: ['admin'],
  },
  admin_kyc: {
    id: 'admin_kyc',
    status: 'enabled',
    label: 'KYC Queue',
    description: 'Review and approve KYC submissions.',
    pitch: '',
    icon: 'ShieldCheck',
    roles: ['admin'],
  },
  admin_deals: {
    id: 'admin_deals',
    status: 'enabled',
    label: 'Deals',
    description: 'Approve negotiated deals before escrow.',
    pitch: '',
    icon: 'Handshake',
    roles: ['admin'],
  },
  admin_categories: {
    id: 'admin_categories',
    status: 'enabled',
    label: 'Categories',
    description: 'Manage job categories and price ranges.',
    pitch: '',
    icon: 'Tag',
    roles: ['admin'],
  },
  admin_wallet: {
    id: 'admin_wallet',
    status: 'enabled',
    label: 'Platform Wallet',
    description: 'Escrow monitoring, withdrawals, adjustments.',
    pitch: '',
    icon: 'DollarSign',
    roles: ['admin'],
  },
  profile: {
    id: 'profile',
    status: 'enabled',
    label: 'Profile',
    description: 'User profile and settings.',
    pitch: '',
    icon: 'User',
  },

  // ── Phase 8 — Social Media Publishing ────────────────────────────────────
  social_publishing: {
    id: 'social_publishing',
    status: 'coming_soon',
    label: 'Social Publishing',
    description: 'Publish content directly to Facebook, Instagram, and YouTube.',
    pitch:
      'Connect your social accounts and publish content across all platforms simultaneously — directly from Mint More. No switching apps, no copy-pasting. Schedule posts, track engagement, and manage your entire social presence in one place.',
    icon: 'Share2',
    roles: ['client'],
    eta: 'Q3 2025',
  },

  // ── Phase 9 — AI Tools ────────────────────────────────────────────────────
  ai_tools: {
    id: 'ai_tools',
    status: 'coming_soon',
    label: 'AI Tools',
    description: 'AI-powered content creation tools.',
    pitch:
      'Generate professional content in seconds using state-of-the-art AI. Write blog posts, create social graphics, script videos, and repurpose content across formats — all within Mint More, billed directly to your wallet.',
    icon: 'Sparkles',
    roles: ['client'],
    eta: 'Q3 2025',
  },
  ai_writer: {
    id: 'ai_writer',
    status: 'coming_soon',
    label: 'AI Writer',
    description: 'Generate blog posts, captions, and ad copy.',
    pitch:
      'Produce high-quality written content in seconds. Blog posts, social captions, ad copy, email campaigns — just describe what you need and the AI delivers.',
    icon: 'PenLine',
    roles: ['client'],
    eta: 'Q3 2025',
  },
  ai_designer: {
    id: 'ai_designer',
    status: 'coming_soon',
    label: 'AI Designer',
    description: 'Generate social graphics, thumbnails, and banners.',
    pitch:
      'Create stunning visuals for your brand without a design brief. Generate social media graphics, YouTube thumbnails, and promotional banners using AI — sized perfectly for every platform.',
    icon: 'Palette',
    roles: ['client'],
    eta: 'Q3 2025',
  },
  ai_video: {
    id: 'ai_video',
    status: 'coming_soon',
    label: 'AI Video Script',
    description: 'Generate scripts for Reels, Shorts, and ads.',
    pitch:
      'Never start from a blank page again. Generate compelling video scripts for Instagram Reels, YouTube Shorts, brand ads, and explainer videos — complete with hooks, structure, and calls to action.',
    icon: 'Video',
    roles: ['client'],
    eta: 'Q3 2025',
  },
  ai_repurpose: {
    id: 'ai_repurpose',
    status: 'coming_soon',
    label: 'Content Repurposer',
    description: 'Turn one piece of content into many.',
    pitch:
      'Take a single blog post and turn it into 5 social captions, an email newsletter, a tweet thread, and a short video script — automatically. Maximize every piece of content you create.',
    icon: 'RefreshCw',
    roles: ['client'],
    eta: 'Q3 2025',
  },
  ai_caption: {
    id: 'ai_caption',
    status: 'coming_soon',
    label: 'Caption Generator',
    description: 'Auto-generate captions and hashtags.',
    pitch:
      'Upload an image or describe your post and get perfectly crafted captions with optimized hashtags for every platform — Instagram, LinkedIn, Twitter, and more.',
    icon: 'Hash',
    roles: ['client'],
    eta: 'Q3 2025',
  },
};