
import type { Timestamp } from 'firebase/firestore';

// This type is for data coming directly from Firestore
interface FirestoreDoc {
  createdAt: Timestamp;
  updatedAt: Timestamp;
  publishedAt: Timestamp;
}

interface SerializedDoc {
  createdAt: Timestamp | string;
  updatedAt: Timestamp | string;
  publishedAt: Timestamp | string;
}

type WithSerialization<T> = Omit<T, keyof FirestoreDoc> & SerializedDoc;

// --- AUTH ---

export interface AppUser {
  uid: string;
  email: string;
  username?: string;
  role: 'superadmin' | 'admin' | 'editor' | 'user';
  photoUrl?: string;
  name?: string;
  createdAt: Timestamp | string;
}


export interface Subscriber {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  subscribedAt?: any;
  source?: string;
}

// --- SITE SETTINGS ---

export interface BrandingSettings {
  siteName: string;
  tagline: string;
  logoUrl: string;
  logoWidth: number;
  logoHeight: number;
  logoFooterUrl?: string;
  logoFooterWidth?: number;
  logoFooterHeight?: number;
  showSiteNameInHeader: boolean;
  showSiteNameInFooter: boolean;
}

export interface NavItem {
  id: string;
  label: string;
  slug: string;
  order: number;
  isVisible: boolean;
}

export interface SocialLinksSettings {
  facebookUrl?: string;
  twitterUrl?: string;
  instagramUrl?: string;
  youtubeUrl?: string;
  tiktokUrl?: string;
}

export interface HomePageSettings {
  // hero property is now deprecated and managed on a per-article basis
}

export interface AdSlotSetting {
    enabled: boolean;
    imageUrl?: string;
    linkUrl?: string;
    label?: string;
    size?: {
        width: number;
        height: number;
    }
}

export interface PopupAdSetting extends AdSlotSetting {
  duration?: number;
}

export interface AdsSettings {
    homeHeroSide?: AdSlotSetting;
    sidebarMiddle?: AdSlotSetting;
    sidebarBottom?: AdSlotSetting;
    homeHorizontal?: AdSlotSetting;
    articleBottom?: AdSlotSetting;
    popup?: PopupAdSetting;
    footerHorizontal?: AdSlotSetting;
    homeVerticalLeft?: AdSlotSetting;
    homeVerticalLeftBottom?: AdSlotSetting;
    inArticle?: AdSlotSetting;
}

export interface WeatherSettings {
  enabled: boolean;
  apiKey?: string;
  defaultLocation?: string;
}

export interface FooterLink {
  id: string;
  label: string;
  href: string;
  order: number;
  isVisible: boolean;
}

export interface FooterSettings {
  copyrightText: string;
  showCopyright: boolean;
  links?: FooterLink[];
}

export interface ArticlePageSettings {
    showBreadcrumbs: boolean;
    showAuthor: boolean;
    showPublishDate: boolean;
    showReadTime: boolean;
    showRelatedArticles: boolean;
    relatedLimit: number;
    commentsEnabled: boolean;
}

export interface CommunityValue {
  title: string;
  desc: string;
}

export interface CommunityGalleryItem {
  title: string;
  imageUrl: string;
}

export interface CommunitySettings {
  logoUrl?: string;
  logoHeight?: number;
  bannerImage?: string;
  title?: string;
  subtitle?: string;
  values?: CommunityValue[];
  gallery?: CommunityGalleryItem[];
}

export interface TickerSettings {
  enabled: boolean;
  hoursLimit: number;
  customText?: string;
  customUrl?: string;
}

export interface SiteSettings {
  _id?: 'site';
  branding: BrandingSettings;
  socialLinks: SocialLinksSettings;
  homePage: HomePageSettings;
  ads: AdsSettings;
  weather: WeatherSettings;
  footer: FooterSettings;
  articlePage: ArticlePageSettings;
  navigation?: { items: NavItem[] };
  community?: CommunitySettings;
  ticker?: TickerSettings;
}


// --- OTHER TYPES ---

export interface Reel {
    _id: string;
    title: string;
    url: string;
    createdAt: string;
}

export interface Category {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  parentCategoryId?: string | null;
  order: number;
  isVisible: boolean;
  defaultHeroImageUrl?: string | null;
}

export interface Author {
  _id: string;
  name: string;
  slug: string;
  bio: string;
  avatarUrl: string;
  role: string;
  socialLinks: {
    twitter: string;
    website: string;
  };
}

export type Article = WithSerialization<{
  _id?: string;
  id?: string;
  title: string;
  slug: string;
  summary: string;
  content: string;
  categoryId: string;
  subCategoryId: string | null;
  authorId: string;
  heroImageUrl: string; imageCaption?: string;
  heroVideoUrl?: string;
  thumbnailUrl: string;
  status: 'draft' | 'published' | 'archived';
  publishedAt: Timestamp;
  updatedAt: Timestamp;
  createdAt: Timestamp;
  readingTimeMinutes: number;
  tags: string[];
  allowComments: boolean;
  
  // Homepage placement controls
  isMainHero?: boolean;
  heroOrder?: number;
  showOnMostRead?: boolean;
  mostReadOrder?: number | null;
}>;


export type Comment = WithSerialization<{
  _id: string;
  authorName: string;
  authorAvatarUrl: string | null;
  message: string;
  createdAt: Timestamp;
  isApproved: boolean;
}>;

export interface Homepage {
  _id: 'config';
  hero: {
    mainArticleId: string;
    secondaryArticleIds: string[];
  };
  latestNews: {
    mode: 'auto' | 'manual';
    maxItems: number;
    manualArticleIds: string[];
  };
  bottomGrid: {
    mode: 'auto' | 'manual';
    maxItems: number;
    manualArticleIds: string[];
  };
  mostRead: {
    mode: 'auto' | 'manual';
    maxItems: number;
    manualArticleIds: string[];
  };
  layoutOptions: {
    showWeather: boolean;
    showTopAd: boolean;
    showMiddleAd: boolean;
    showRightColumnAd: boolean;
  };
}

export interface AdSlot {
  _id: string;
  name: string;
  slug: string;
  position: string;
  size: { width: number; height: number };
  imageUrl: string | null;
  htmlCode: string | null;
  linkUrl: string | null;
  isActive: boolean;
  notes: string | null;
}

export interface AdClick {
    _id: string;
    adName: string;
    page: string;
    clickedAt: string;
    adUrl: string;
}

export interface WeatherConfig {
  _id: 'home';
  enabled: boolean;
  cityName: string;
  countryName: string;
  source: 'manual' | 'api';
  manualTemperatureC: number;
  manualDescription: string;
  icon: string;
  apiProvider: string | null;
  apiCityId: string | null;
}

export interface ArticlePageConfig {
  _id: 'default';
  showBreadcrumbs: boolean;
  showHeroImage: boolean;
  showShareButtons: boolean;
  shareNetworks: string[];
  showAuthorBox: boolean;
  showRelatedArticles: boolean;
  relatedSource: 'sameCategory' | 'manual';
  relatedMaxItems: number;
  manualRelatedArticleIds: string[];
  enableCommentsByDefault: boolean;
  commentsModerationRequired: boolean;
  orderComments: 'newestFirst' | 'oldestFirst';
}

// Component Prop Types
export type NavItemProps = {
  label: string;
  href: string;
};

export type SocialNetwork = 'facebook' | 'twitter' | 'instagram' | 'youtube' | 'tiktok' | 'linkedin' | 'whatsapp';

    
