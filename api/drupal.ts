// ============================================
// TYPES
// ============================================

export interface DrupalUser {
  uid: string;
  name: string;
  url?: string;
  picture?: {
    url: string;
  };
}

export interface DrupalIssue {
  nid: string;
  title: string;
  type: string;
  created: number;
  changed: number;
  url: string;
  comment_count: number;
  field_issue_status: number;
  field_issue_priority: number;
  field_issue_category: number;
  field_project?: {
    id: string;
    machine_name?: string;
  };
}

// Simple structure for the AI endpoint
export interface DrupalAiRecord {
  nid: string;
  title: string;
  url: string;
  created: string | number; // API might return ISO string or timestamp
}

export interface DrupalApiResponse {
  user: DrupalUser;
  issues: DrupalIssue[];
  aiIssues: DrupalAiRecord[]; 
  drupalCoreIssues: DrupalAiRecord[]; // New field for Core
  totalCount: number;
  activityByMonth: number[];
  topProject: {
    name: string;
    count: number;
  } | null;
}

// JSON:API Internal Types
interface JsonApiRelationshipData { type: string; id: string; }
interface JsonApiResource {
  type: string;
  id: string;
  attributes: Record<string, any>;
  relationships?: Record<string, { data: JsonApiRelationshipData | JsonApiRelationshipData[] }>;
  links?: { self?: { href: string }; next?: { href: string } };
}

interface JsonApiResponse<T = JsonApiResource[]> {
  data: T;
  included?: JsonApiResource[];
  links?: { next?: { href: string } };
  meta?: any;
}

const API_BASE = 'https://www.drupal.org/jsonapi';

// List of CORS Proxies to try in order.
const PROXIES = [
  // CorsProxy.io is usually the most robust and supports headers
  (url: string) => `https://corsproxy.io/?${encodeURIComponent(url)}`,
  // CodeTabs - reliable fallback
  (url: string) => `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(url)}`,
  // ThingProxy - another fallback
  (url: string) => `https://thingproxy.freeboard.io/fetch/${url}`,
  // AllOrigins Raw (Note: May strip headers, causing 406, but worth a try as last resort)
  (url: string) => `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`,
];

// ============================================
// REUSABLE API UTILITIES
// ============================================

// Generic fetcher that handles proxy rotation
const fetchWithProxy = async (targetUrl: string, customHeaders: Record<string, string> = {}): Promise<any> => {
  const doFetch = async (fetchUrl: string) => {
    // We omit credentials and referrer to avoid triggering anti-hotlink or auth checks on proxies
    const res = await fetch(fetchUrl, { 
      method: 'GET', 
      headers: customHeaders,
      credentials: 'omit',
      referrerPolicy: 'no-referrer'
    });
    
    if (res.status === 403 || res.status === 401) {
       throw { status: res.status, message: 'Access Denied (CORS/Auth)', isNetworkLike: true };
    }
    
    if (!res.ok) {
      const is404 = res.status === 404;
      const isHeaderIssue = res.status === 406; 
      
      throw { 
        status: res.status, 
        message: res.statusText, 
        isNetworkLike: !is404 && !isHeaderIssue 
      };
    }
    
    return await res.json();
  };

  // 1. Try Direct first if not drupal.org (or if CORS is allowed)
  // For drupal.org, we generally need proxy for browser-based fetch
  const needsProxy = targetUrl.includes('drupal.org');

  if (!needsProxy) {
    try {
      return await doFetch(targetUrl);
    } catch (e: any) {
      console.warn("Direct fetch failed, falling back to proxies.");
    }
  }

  // 2. Iterate through proxies
  let lastError: any = null;
  
  for (const proxyGenerator of PROXIES) {
    try {
      const proxyUrl = proxyGenerator(targetUrl);
      const data = await doFetch(proxyUrl);
      return data;
    } catch (proxyError: any) {
      lastError = proxyError;
    }
  }

  console.error("All proxies failed. Last error:", lastError);
  throw new Error(
    lastError?.message || 
    'Failed to connect to API. Please check your internet connection or try disabling ad-blockers.'
  );
};

// Specialized JSON:API fetcher
const fetchJsonApi = async <T = JsonApiResource | JsonApiResource[]>(endpoint: string): Promise<JsonApiResponse<T>> => {
  const targetUrl = endpoint.startsWith('http') ? endpoint : `${API_BASE}${endpoint}`;
  const headers = { 'Accept': 'application/vnd.api+json' };
  return fetchWithProxy(targetUrl, headers);
};

// specialized Simple JSON fetcher
const fetchSimpleJson = async (url: string): Promise<any> => {
  const headers = { 'Accept': 'application/json' };
  return fetchWithProxy(url, headers);
};

const resolveDrupalImageUrl = (uri: string) => {
  if (!uri) return undefined;
  
  // Handle public:// stream wrapper
  if (uri.startsWith('public://')) {
    // As per user request, replacing standard sites/default/files with assets
    return uri.replace('public://', 'https://www.drupal.org/assets/');
  }
  
  // Handle relative paths (e.g. /sites/...)
  if (uri.startsWith('/')) {
    return `https://www.drupal.org${uri}`;
  }
  
  return uri;
};

// ============================================
// CORE FETCHING LOGIC
// ============================================

export const fetchUserByUsername = async (username: string): Promise<DrupalUser> => {
  const endpoint = `/user/user?filter[name]=${encodeURIComponent(username)}&include=user_picture`;
  const response = await fetchJsonApi<JsonApiResource[]>(endpoint);

  if (!response.data || !Array.isArray(response.data) || response.data.length === 0) {
    throw new Error('User not found');
  }

  const userRes = response.data[0];
  let pictureUrl = undefined;

  // Extract User Picture from Included Resources
  if (response.included) {
    const picRel = userRes.relationships?.user_picture?.data as JsonApiRelationshipData;
    if (picRel) {
      const fileRes = response.included.find(inc => inc.id === picRel.id);
      if (fileRes) {
        if (fileRes.attributes?.url) {
          pictureUrl = resolveDrupalImageUrl(fileRes.attributes.url);
        } else if (fileRes.attributes?.uri?.value) {
          pictureUrl = resolveDrupalImageUrl(fileRes.attributes.uri.value);
        }
      }
    }
  }

  return {
    uid: userRes.id,
    name: userRes.attributes.display_name || userRes.attributes.name,
    url: userRes.links?.self?.href,
    picture: pictureUrl ? { url: pictureUrl } : undefined
  };
};

export const fetchProjectContributions = async (username: string, machineName: string): Promise<DrupalAiRecord[]> => {
  // Fetch last 12 months
  const url = `https://new.drupal.org/contribution-records-by-user?username=${encodeURIComponent(username)}&months=12&machine_name=${machineName}`;
  try {
    const data = await fetchSimpleJson(url);
    if (Array.isArray(data)) {
      return data;
    }
    return [];
  } catch (e) {
    console.warn(`Failed to fetch ${machineName} contributions`, e);
    return [];
  }
};

export const fetchAiContributions = (username: string) => fetchProjectContributions(username, 'ai');
export const fetchDrupalCoreContributions = (username: string) => fetchProjectContributions(username, 'drupal');

export const fetchIssuesWithCommentsByUsername = async (username: string, year = 2025): Promise<DrupalApiResponse> => {
  // Fetch user basics
  const user = await fetchUserByUsername(username);

  // Fetch contributions in parallel
  const [aiIssues, drupalCoreIssues] = await Promise.all([
    fetchProjectContributions(username, 'ai'),
    fetchProjectContributions(username, 'drupal')
  ]);
  
  // Calculate a rudimentary total count based on what we found + dummy base if needed
  // Since we aren't scraping everything, we'll sum these up + a random factor for "other" projects 
  // or just use these if > 0.
  const knownContributions = aiIssues.length + drupalCoreIssues.length;
  const totalCount = knownContributions > 0 ? knownContributions : 0;

  return {
    user,
    issues: [], // Not fetching generic issues list in this simplified flow
    aiIssues,
    drupalCoreIssues,
    totalCount: totalCount,
    activityByMonth: new Array(12).fill(0),
    topProject: null
  };
};

export const fetchIssuesByUsername = fetchIssuesWithCommentsByUsername;
