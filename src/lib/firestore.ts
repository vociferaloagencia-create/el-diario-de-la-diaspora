

import { db, storage } from './firebase';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { 
  collection, 
  getDocs, 
  getDoc,
  doc, 
  addDoc, 
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where, 
  orderBy,
  limit,
  DocumentData,
  QueryDocumentSnapshot,
  Timestamp,
  serverTimestamp,
} from 'firebase/firestore';
import type { Article, Author, Category, Homepage, SiteSettings, AdClick, Reel } from './types';
import { defaultArticles, defaultAuthors, defaultReels } from './mock-data';


// Helper function to convert snapshot to data with ID
function fromSnapshot<T extends { _id?: string }>(snapshot: QueryDocumentSnapshot<DocumentData>): T {
  const data = snapshot.data();
  return {
    _id: snapshot.id,
    ...data,
  } as T;
}

export function serializeFirestoreDoc(doc: any): any {
    if (doc === null || doc === undefined) return null;

    if (doc instanceof Timestamp) {
        return doc.toDate().toISOString();
    }
    
    if (Array.isArray(doc)) {
        return doc.map(item => serializeFirestoreDoc(item));
    }

    if (typeof doc === 'object' && doc !== null && !('toDate' in doc)) { // Ensure it's not a Timestamp-like object
        const data = { ...doc };
        for (const key in data) {
            data[key] = serializeFirestoreDoc(data[key]);
        }
        return data;
    }

    return doc;
}

const adPlaceholderImage = "https://images.unsplash.com/photo-1529641484336-ef35140babfe?q=80&w=1287&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D";
const adPlaceholderVerticalImage = "https://images.unsplash.com/photo-1559567549-c422f6d5f74b?q=80&w=1287&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D";
const adPlaceholderInArticleImage = "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D";

export const defaultCategories: Category[] = [
  { _id: 'actualidad', name: 'Actualidad', slug: 'actualidad', order: 1, isVisible: true },
  { _id: 'la-diaspora', name: 'La Diáspora', slug: 'la-diaspora', order: 2, isVisible: true },
  { _id: 'nacional', name: 'Nacional', slug: 'nacional', order: 3, isVisible: true },
  { _id: 'internacional', name: 'Internacional', slug: 'internacional', order: 4, isVisible: true },
  { _id: 'economia', name: 'Economía', slug: 'economia', order: 5, isVisible: true },
  { _id: 'deportes', name: 'Deportes', slug: 'deportes', order: 6, isVisible: true },
  { _id: 'cultura', name: 'Cultura', slug: 'cultura', order: 7, isVisible: true },
  { _id: 'opinion', name: 'Editorial / Opinión', slug: 'opinion', order: 8, isVisible: true },
];

const defaultSettings: SiteSettings = {
    _id: 'site',
    branding: {
      siteName: "El Diario de la Diáspora",
      tagline: "InformaciÃ³n independiente para la comunidad hispana e internacional",
      logoUrl: "/logo-horizontal.png",
      logoWidth: 260,
      logoHeight: 55,
      logoFooterUrl: "/logo-horizontal.png",
      logoFooterWidth: 260,
      logoFooterHeight: 55,
      showSiteNameInHeader: false,
      showSiteNameInFooter: false,
    },

    socialLinks: {
      facebookUrl: "https://facebook.com",
      instagramUrl: "https://instagram.com",
      twitterUrl: "https://twitter.com",
      youtubeUrl: "https://youtube.com",
    },
    homePage: {
      hero: { mode: "auto" },
      showSecondaryHeroes: true,
      latestSection: { enabled: true, limit: 6 },
    },
    ads: {
        homeHeroSide: { enabled: true, imageUrl: '/images/ad_banner_travel.jpg', linkUrl: '#', label: 'Patrocinado', size: { width: 300, height: 250 } },
        sidebarMiddle: { enabled: true, imageUrl: '/images/ad_banner_travel.jpg', linkUrl: '#', label: 'Patrocinado', size: { width: 300, height: 250 } },
        sidebarBottom: { enabled: true, imageUrl: '/images/ad_banner_travel.jpg', linkUrl: '#', label: 'Patrocinado', size: { width: 300, height: 250 } },
        homeHorizontal: { enabled: true, imageUrl: '/images/ad_banner_travel.jpg', linkUrl: '#', label: 'Patrocinado', size: { width: 728, height: 90 } },
        articleBottom: { enabled: true, imageUrl: '/images/ad_banner_travel.jpg', linkUrl: '#', label: 'Patrocinado', size: { width: 728, height: 90 } },
        popup: { enabled: false, imageUrl: '/images/ad_banner_travel.jpg', linkUrl: '#', duration: 5, size: { width: 400, height: 400 } },
        footerHorizontal: { enabled: true, imageUrl: '/images/ad_banner_travel.jpg', linkUrl: '#', label: 'Patrocinado', size: { width: 970, height: 90 } },
        homeVerticalLeft: { enabled: true, imageUrl: '/images/ad_banner_travel.jpg', linkUrl: '#', label: 'Patrocinado', size: { width: 160, height: 600 } },
        homeVerticalLeftBottom: { enabled: true, imageUrl: '/images/ad_banner_travel.jpg', linkUrl: '#', label: 'Patrocinado', size: { width: 160, height: 600 } },
        inArticle: { enabled: true, imageUrl: '/images/ad_banner_travel.jpg', linkUrl: '#', label: 'Patrocinado', size: { width: 300, height: 250 } },
    },
    weather: {
      enabled: true,
      apiKey: "",
      defaultLocation: "Santo Domingo, DO"
    },
    footer: {
      copyrightText: `Â© ${new Date().getFullYear()} El Diario de la Diáspora. Todos los derechos reservados.`,
      showCopyright: true,

      links: [
        { id: "footer-1", label: "Contacto", href: "/contacto", order: 1, isVisible: true },
        { id: "footer-2", label: "PolÃ­tica de Privacidad", href: "/privacidad", order: 2, isVisible: true },
      ]
    },
    articlePage: {
        showBreadcrumbs: true,
        showAuthor: true,
        showPublishDate: true,
        showReadTime: true,
        showRelatedArticles: true,
        relatedLimit: 3,
        commentsEnabled: true,
    },
    navigation: {
      items: [
        { id: "nav-1", label: "Actualidad", slug: "actualidad", order: 1, isVisible: true },
        { id: "nav-2", label: "La Diáspora", slug: "la-diaspora", order: 2, isVisible: true },
        { id: "nav-3", label: "Nacional", slug: "nacional", order: 3, isVisible: true },
        { id: "nav-4", label: "Internacional", slug: "internacional", order: 4, isVisible: true },
        { id: "nav-5", label: "Economía", slug: "economia", order: 5, isVisible: true },
        { id: "nav-6", label: "Deportes", slug: "deportes", order: 6, isVisible: true },
        { id: "nav-7", label: "Cultura", slug: "cultura", order: 7, isVisible: true },
        { id: "nav-8", label: "Editorial / Opinión", slug: "opinion", order: 8, isVisible: true },
      ]
    }
};


const isIsolatedMode = !process.env.NEXT_PUBLIC_FIREBASE_API_KEY || 
  process.env.NEXT_PUBLIC_FIREBASE_API_KEY.includes('mock') ||
  process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID === 'demo-isolated';

function withTimeout<T>(promise: Promise<T>, ms: number = 2000): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error(`Firestore operation timed out after ${ms}ms`));
    }, ms);
    promise
      .then((res) => {
        clearTimeout(timer);
        resolve(res);
      })
      .catch((err) => {
        clearTimeout(timer);
        reject(err);
      });
  });
}

// --- Generic Functions ---

// Get a single document by ID
async function getDocument<T>(collectionName: string, id: string): Promise<T | null> {
  if (isIsolatedMode) return null;
  try {
    const docRef = doc(db, collectionName, id);
    const docSnap = await withTimeout(getDoc(docRef), 2000);
    if (docSnap.exists()) {
      return serializeFirestoreDoc({ _id: docSnap.id, ...docSnap.data() }) as T;
    }
    return null;
  } catch (error) {
    console.warn(`[Firestore Safe] Error fetching ${collectionName}/${id}:`, error);
    return null;
  }
}

// --- Specific Functions ---

export async function getCategories(): Promise<Category[]> {
  if (isIsolatedMode) return defaultCategories;
  try {
    const q = query(collection(db, 'categories'), orderBy('order'));
    const querySnapshot = await withTimeout(getDocs(q), 2000);
    const docs = querySnapshot.docs.map(d => serializeFirestoreDoc({ _id: d.id, ...d.data() }) as Category);
    docs.forEach(cat => {
      if (cat.name) {
        cat.name = cat.name.replace(/DiÃ¡spora/g, 'Diáspora')
                           .replace(/EconomÃ.a/g, 'Economía')
                           .replace(/EconomÃa/g, 'Economía')
                           .replace(/OpiniÃ³n/g, 'Opinión')
                           .replace(/RepÃºblica/g, 'República')
                           .replace(/MÃ©xico/g, 'México')
                           .replace(/EspaÃ±a/g, 'España')
                           .replace(/CanadÃ¡/g, 'Canadá')
                           .replace(/Ã.ltima/g, 'Última');
      }
    });
    const dbIds = new Set(docs.map(c => c._id));
    const remainingDefaults = defaultCategories.filter(c => !dbIds.has(c._id));
    return [...docs, ...remainingDefaults].sort((a,b) => a.order - b.order);
  } catch (error) {
    console.warn("[Firestore Safe] Error fetching categories, using defaults:", error);
    return defaultCategories;
  }
}


export async function getCategoryBySlug(slug: string): Promise<Category | null> {
  const match = defaultCategories.find(c => c.slug === slug || c._id === slug);
  if (match) return match;

  if (!isIsolatedMode) {
    try {
      const q = query(collection(db, "categories"), where("slug", "==", slug), limit(1));
      const snapshot = await withTimeout(getDocs(q), 2000);
      if (!snapshot.empty) {
        const categoryDoc = snapshot.docs[0];
        return serializeFirestoreDoc({ _id: categoryDoc.id, ...categoryDoc.data() }) as Category;
      }
    } catch (error) {
      console.warn("[Firestore Safe] Error fetching category by slug:", error);
    }
  }

  // Fallback category so no category page ever yields 404
  const formattedName = slug.charAt(0).toUpperCase() + slug.slice(1).replace(/-/g, ' ');
  return { _id: slug, name: formattedName, slug: slug, order: 99, isVisible: true };
}

export async function addCategory(categoryData: Omit<Category, '_id'>): Promise<string> {
  if (isIsolatedMode) {
    console.warn("[Seguridad] Escritura bloqueada en modo aislado.");
    return 'mock-category-id';
  }
  const docRef = await addDoc(collection(db, 'categories'), categoryData);
  return docRef.id;
}

export async function deleteCategory(categoryId: string): Promise<{ success: boolean, message: string }> {
  if (isIsolatedMode) {
    console.warn("[Seguridad] EliminaciÃ³n bloqueada en modo aislado.");
    return { success: true, message: 'OperaciÃ³n simulada en modo seguro aislado.' };
  }
  const articlesQuery = query(collection(db, 'articles'), where('categoryId', '==', categoryId), limit(1));
  const articlesSnapshot = await withTimeout(getDocs(articlesQuery), 2000);

  if (!articlesSnapshot.empty) {
    return { success: false, message: 'No se puede eliminar la categorÃ­a porque hay artÃ­culos que la estÃ¡n utilizando.' };
  }

  const categoryRef = doc(db, 'categories', categoryId);
  await deleteDoc(categoryRef);
  return { success: true, message: 'CategorÃ­a eliminada exitosamente.' };
}

export async function getHomepageConfig(): Promise<Homepage | null> {
  return getDocument<Homepage>('homepage', 'config');
}

export async function getSiteSettings(): Promise<SiteSettings> {
  if (isIsolatedMode) {
    return defaultSettings;
  }
  try {
    const docRef = doc(db, 'settings', 'site');
    let docSnap = await withTimeout(getDoc(docRef), 1800);

    if (!docSnap.exists()) {
      console.log("Site settings not found, using default data...");
      return defaultSettings;
    }

    const storedData = docSnap.data();
    const mergedSettings = {
      ...defaultSettings,
      ...storedData,
      branding: { ...defaultSettings.branding, ...storedData.branding },
      socialLinks: { ...defaultSettings.socialLinks, ...storedData.socialLinks },
      homePage: { ...defaultSettings.homePage, ...storedData.homePage },
      ads: { ...defaultSettings.ads, ...storedData.ads },
      weather: { ...defaultSettings.weather, ...storedData.weather },
      footer: { ...defaultSettings.footer, ...storedData.footer },
      articlePage: { ...defaultSettings.articlePage, ...storedData.articlePage },
    };

    return serializeFirestoreDoc({ _id: docSnap.id, ...mergedSettings }) as SiteSettings;
  } catch (error) {
    console.warn("[Firestore Safe] Error fetching site settings, falling back to defaults:", error);
    return defaultSettings;
  }
}


export async function updateSiteSettings(values: Partial<SiteSettings>): Promise<void> {
  if (isIsolatedMode) {
    console.warn("[Seguridad] ActualizaciÃ³n de configuraciÃ³n bloqueada en modo aislado.");
    return;
  }
  const docRef = doc(db, 'settings', 'site');
  await setDoc(docRef, values, { merge: true });
}

export async function getArticlesByIds(ids: string[]): Promise<Article[]> {
  if (isIsolatedMode || ids.length === 0) {
    return ids.map(id => defaultArticles.find(article => article._id === id)).filter((a): a is Article => !!a);
  }
  try {
    const q = query(collection(db, 'articles'), where('__name__', 'in', ids));
    const querySnapshot = await withTimeout(getDocs(q), 2000);
    const articles = querySnapshot.docs.map(d => serializeFirestoreDoc({ _id: d.id, ...d.data() }) as Article);
    return ids.map(id => articles.find(article => article._id === id) || defaultArticles.find(article => article._id === id)).filter((a): a is Article => !!a);
  } catch (error) {
    console.warn("[Firestore Safe] Error fetching articles by ids:", error);
    return ids.map(id => defaultArticles.find(article => article._id === id)).filter((a): a is Article => !!a);
  }
}

export async function getAllArticles(): Promise<Article[]> {
  if (isIsolatedMode) return defaultArticles;
  try {
    const q = query(collection(db, "articles"), orderBy('publishedAt', 'desc'));
    const snapshot = await withTimeout(getDocs(q), 2000);
    const articles = snapshot.docs.map(d => {
      const data = d.data();
      const defaultMatch = defaultArticles.find(def => def._id === d.id);
      return serializeFirestoreDoc({ ...(defaultMatch || {}), ...data, _id: d.id }) as Article;
    });
    const dbArticleIds = new Set(articles.map(a => a._id));
    const remainingDefaults = defaultArticles.filter(a => !dbArticleIds.has(a._id));
    return [...articles, ...remainingDefaults].sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
  } catch (error) {
    console.warn("[Firestore Safe] Error fetching all articles:", error);
    return defaultArticles;
  }
}

export async function getHeroArticles(): Promise<Article[]> {
  if (isIsolatedMode) {
    return defaultArticles.filter(a => a.isMainHero || a.heroOrder === 1);
  }
  try {
    const q = query(collection(db, "articles"), where("isMainHero", "==", true));
    const snapshot = await withTimeout(getDocs(q), 2000);
    const articles = snapshot.docs.map(d => {
      const data = d.data();
      const defaultMatch = defaultArticles.find(def => def._id === d.id);
      return serializeFirestoreDoc({ ...(defaultMatch || {}), ...data, _id: d.id }) as Article;
    });
    const filtered = articles
      .filter(a => a.status === 'published')
      .sort((a, b) => (a.heroOrder ?? 99) - (b.heroOrder ?? 99));
    if (filtered.length > 0) {
      return filtered;
    }
    return defaultArticles.filter(a => a.isMainHero).sort((a, b) => (a.heroOrder ?? 99) - (b.heroOrder ?? 99));
  } catch (error) {
    console.warn("[Firestore Safe] Error fetching hero articles:", error);
    return defaultArticles.filter(a => a.isMainHero);
  }
}

export async function getMostReadArticles(): Promise<Article[]> {
  if (isIsolatedMode) {
    return defaultArticles
      .filter(a => a.showOnMostRead)
      .sort((a, b) => (a.mostReadOrder || 99) - (b.mostReadOrder || 99))
      .slice(0, 4);
  }
  try {
    const q = query(collection(db, "articles"), where("showOnMostRead", "==", true));
    const snapshot = await withTimeout(getDocs(q), 2000);
    const articles = snapshot.docs.map(d => serializeFirestoreDoc({ _id: d.id, ...d.data() }) as Article);
    const filtered = articles
      .filter(a => a.status === 'published')
      .sort((a, b) => (a.mostReadOrder || 99) - (b.mostReadOrder || 99))
      .slice(0, 4);
    const dbIds = new Set(filtered.map(a => a._id));
    const remainingDefaults = defaultArticles.filter(a => a.showOnMostRead && !dbIds.has(a._id));
    return [...filtered, ...remainingDefaults].slice(0, 4);
  } catch (error) {
    console.warn("[Firestore Safe] Error fetching most read articles:", error);
    return defaultArticles.filter(a => a.showOnMostRead).slice(0, 4);
  }
}

export async function getLatestArticles(limitCount: number = 50): Promise<Article[]> {
  if (isIsolatedMode) return defaultArticles.slice(0, limitCount);
  try {
    const q = query(collection(db, "articles"), orderBy("publishedAt", "desc"), limit(limitCount));
    const snapshot = await withTimeout(getDocs(q), 2000);
    const articles = snapshot.docs.map(d => serializeFirestoreDoc({ _id: d.id, ...d.data() }) as Article);
    const filtered = articles.filter(a => a.status === 'published');
    const dbIds = new Set(filtered.map(a => a._id));
    const remainingDefaults = defaultArticles.filter(a => !dbIds.has(a._id));
    return [...filtered, ...remainingDefaults].slice(0, limitCount);
  } catch (error) {
    console.warn("[Firestore Safe] Error fetching latest articles:", error);
    return defaultArticles.slice(0, limitCount);
  }
}

export async function getArticlesByCategory(categorySlug: string): Promise<Article[]> {
  let list: Article[] = [];
  if (!isIsolatedMode) {
    try {
      const q = query(
        collection(db, "articles"),
        where("categoryId", "==", categorySlug)
      );
      const snapshot = await withTimeout(getDocs(q), 2000);
      const articles = snapshot.docs.map(d => serializeFirestoreDoc({ _id: d.id, ...d.data() }) as Article);
      list = articles.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
    } catch (error) {
      console.warn("[Firestore Safe] Error fetching articles by category:", error);
    }
  }

  if (list.length === 0) {
    list = defaultArticles.filter(a => a.categoryId === categorySlug);
  }

  if (list.length === 0) {
    // If still empty, supply default articles so the page is always full and complete
    list = defaultArticles.map((a, idx) => ({
      ...a,
      _id: `cat-art-${categorySlug}-${idx}`,
      categoryId: categorySlug,
    }));
  }

  return list;
}

export async function getArticleBySlug(slug: string): Promise<Article | null> {
  if (isIsolatedMode) {
    return defaultArticles.find(a => a.slug === slug) || defaultArticles[0] || null;
  }
  try {
    const q = query(collection(db, "articles"), where("slug", "==", slug), limit(1));
    const snapshot = await withTimeout(getDocs(q), 2000);
    if (snapshot.empty) {
      return defaultArticles.find(a => a.slug === slug) || null;
    }
    const articleDoc = snapshot.docs[0];
    return serializeFirestoreDoc({ _id: articleDoc.id, ...articleDoc.data() }) as Article;
  } catch (error) {
    console.warn("[Firestore Safe] Error fetching article by slug:", error);
    return defaultArticles.find(a => a.slug === slug) || null;
  }
}


export async function getAuthorById(id: string): Promise<Author | null> {
  return getDocument<Author>('authors', id);
}

export async function getRelatedArticles(categoryId: string, currentArticleId: string): Promise<Article[]> {
  if (isIsolatedMode) return [];
  try {
    const q = query(
      collection(db, "articles"), 
      where("categoryId", "==", categoryId),
      where("__name__", "!=", currentArticleId),
      orderBy("__name__", "desc"),
      limit(4)
    );
    const snapshot = await getDocs(q);
    const articles = snapshot.docs.map(d => serializeFirestoreDoc({ _id: d.id, ...d.data() }) as Article);
    return articles.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()).slice(0, 3);
  } catch (error) {
    console.warn("[Firestore Safe] Error fetching related articles:", error);
    return [];
  }
}

export async function addArticle(articleData: Omit<Article, '_id' | 'id'>): Promise<string> {
  if (isIsolatedMode) {
    console.warn("[Seguridad] CreaciÃ³n de artÃ­culo bloqueada en modo aislado.");
    return 'mock-article-id';
  }
  const docRef = await addDoc(collection(db, 'articles'), articleData);
  return docRef.id;
}

export async function updateArticle(articleId: string, articleData: Partial<Article>): Promise<void> {
  if (isIsolatedMode) {
    console.warn("[Seguridad] Edición de artículo bloqueada en modo aislado.");
    return;
  }
  const cleanData: Record<string, any> = {};
  for (const [key, value] of Object.entries(articleData)) {
    if (value !== undefined) {
      cleanData[key] = value;
    }
  }
  const articleRef = doc(db, 'articles', articleId);
  await setDoc(articleRef, cleanData, { merge: true });
}

export async function deleteArticle(articleId: string): Promise<void> {
  if (isIsolatedMode) {
    console.warn("[Seguridad] EliminaciÃ³n de artÃ­culo bloqueada en modo aislado.");
    return;
  }
  const articleRef = doc(db, 'articles', articleId);
  await deleteDoc(articleRef);
}

export async function uploadImage(file: File): Promise<string> {
  if (isIsolatedMode) {
    console.warn("[Seguridad] Subida de imagen bloqueada en modo aislado.");
    return "https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=800&auto=format&fit=crop";
  }
  if (!file) {
    throw new Error("No file provided for upload.");
  }
  const storageRef = ref(storage, `site-assets/${Date.now()}_${file.name}`);
  await uploadBytes(storageRef, file);
  const downloadURL = await getDownloadURL(storageRef);
  return downloadURL;
}

// --- Ad Click Tracking ---
export async function trackAdClick(adName: string, page: string, adUrl: string) {
  if (isIsolatedMode) {
    window.open(adUrl, '_blank');
    return;
  }
  try {
    await addDoc(collection(db, 'ad_clicks'), {
      adName,
      page,
      clickedAt: serverTimestamp(),
      adUrl,
    });
    window.open(adUrl, '_blank');
  } catch (error) {
    console.error("Error tracking ad click: ", error);
    window.open(adUrl, '_blank');
  }
}

export async function getAdClicks(): Promise<AdClick[]> {
  if (isIsolatedMode) return [];
  try {
    const q = query(collection(db, 'ad_clicks'), orderBy('clickedAt', 'desc'));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(d => serializeFirestoreDoc({ _id: d.id, ...d.data() }) as AdClick);
  } catch (error) {
    return [];
  }
}

// --- Reels ---

export async function uploadVideo(file: File): Promise<string> {
  if (isIsolatedMode) {
    console.warn("[Seguridad] Subida de video bloqueada en modo aislado.");
    return "https://example.com/mock-video.mp4";
  }
  if (!file) {
    throw new Error("No file provided for upload.");
  }
  const storageRef = ref(storage, `reels/${Date.now()}_${file.name}`);
  await uploadBytes(storageRef, file);
  const downloadURL = await getDownloadURL(storageRef);
  return downloadURL;
}

export async function addReel(reelData: Omit<Reel, '_id'>): Promise<string> {
  if (isIsolatedMode) {
    console.warn("[Seguridad] CreaciÃ³n de reel bloqueada en modo aislado.");
    return 'mock-reel-id';
  }
  const docRef = await addDoc(collection(db, 'reels'), {
    ...reelData,
    createdAt: serverTimestamp(),
  });
  return docRef.id;
}

export async function getAllReels(): Promise<Reel[]> {
  if (isIsolatedMode) return defaultReels;
  try {
    const q = query(collection(db, 'reels'), orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    const reels = snapshot.docs.map(d => serializeFirestoreDoc({ _id: d.id, ...d.data() }) as Reel);
    const dbIds = new Set(reels.map(r => r._id));
    const remainingDefaults = defaultReels.filter(r => !dbIds.has(r._id));
    return [...reels, ...remainingDefaults];
  } catch (error) {
    return defaultReels;
  }
}


export async function deleteReel(reelId: string, reelUrl: string): Promise<void> {
  if (isIsolatedMode) {
    console.warn("[Seguridad] EliminaciÃ³n de reel bloqueada en modo aislado.");
    return;
  }
  const reelRef = doc(db, 'reels', reelId);
  await deleteDoc(reelRef);
  const videoRef = ref(storage, reelUrl);
  await deleteObject(videoRef);
}


    
