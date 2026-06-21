import axios from 'axios';

export interface EnrichmentResult {
  email: string | null;
  phone: string | null;
  website: string | null;
  socialLinks: {
    facebook?: string;
    instagram?: string;
    linkedin?: string;
    twitter?: string;
  };
  source: 'osm_tag' | 'website_homepage' | 'website_contact_page' | 'none';
  confidence: number;
}

/**
 * Normalizes website URLs to include http prefix if missing.
 */
function normalizeUrl(url: string): string {
  let cleaned = url.trim();
  if (!cleaned) return '';
  if (!/^https?:\/\//i.test(cleaned)) {
    cleaned = `http://${cleaned}`;
  }
  return cleaned;
}

/**
 * Extracts and filters emails from HTML content to exclude assets and noise.
 */
function extractEmails(html: string): string[] {
  const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}/g;
  const matches = html.match(emailRegex);
  if (!matches) return [];

  const invalidEnds = ['.png', '.jpg', '.jpeg', '.gif', '.svg', '.webp', '.css', '.js'];
  const uniqueEmails = Array.from(new Set(matches.map(e => e.trim())));

  return uniqueEmails.filter(email => {
    const lower = email.toLowerCase();
    const isAsset = invalidEnds.some(ext => lower.endsWith(ext));
    const isSentry = lower.includes('sentry.io');
    const isPlaceholder = lower.includes('yourname@') || lower.includes('example@') || lower.includes('email@');
    return !isAsset && !isSentry && !isPlaceholder;
  });
}

/**
 * Enriches contact details for a lead by checking OSM tags and website crawl.
 */
export const enrichLeadContact = async (
  websiteUrl?: string | null,
  rawOsmTags?: Record<string, unknown> | null
): Promise<EnrichmentResult> => {
  let email: string | null = null;
  let phone: string | null = null;
  let website: string | null = websiteUrl || null;
  let source: EnrichmentResult['source'] = 'none';
  let confidence = 0;
  const socialLinks: EnrichmentResult['socialLinks'] = {};

  // 1. Inspect OpenStreetMap tags first
  if (rawOsmTags) {
    const emailTag = rawOsmTags['email'] || rawOsmTags['contact:email'] || rawOsmTags['email:official'];
    const phoneTag = rawOsmTags['phone'] || rawOsmTags['contact:phone'] || rawOsmTags['mobile'] || rawOsmTags['contact:mobile'];
    const websiteTag = rawOsmTags['website'] || rawOsmTags['contact:website'] || rawOsmTags['url'];

    if (emailTag) {
      email = String(emailTag).trim();
      source = 'osm_tag';
      confidence = 1.0;
    }
    if (phoneTag) {
      phone = String(phoneTag).trim();
    }
    if (websiteTag && !website) {
      website = String(websiteTag).trim();
    }
  }

  // 2. If website URL exists and we don't have an email yet, crawl the website
  if (website && !email) {
    const targetUrl = normalizeUrl(website);
    try {
      console.log(`[Enrichment] Attempting to crawl website homepage: ${targetUrl}`);
      const response = await axios.get(targetUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) ClientPilotAI/1.0',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        },
        timeout: 6000,
        validateStatus: () => true, // capture redirects and non-200 responses
      });

      if (response.status === 200 && typeof response.data === 'string') {
        const html = response.data;

        // Check for emails on homepage
        const homepageEmails = extractEmails(html);
        if (homepageEmails.length > 0) {
          email = homepageEmails[0];
          source = 'website_homepage';
          confidence = 0.8;
          console.log(`[Enrichment] Discovered email on homepage: ${email}`);
        }

        // Check for phone number if missing
        const phoneRegex = /(?:\+92|0)\s?3[0-9]{2}\s?[0-9]{7}|\+?[0-9]{1,4}[-.\s]?[0-9]{1,10}[-.\s]?[0-9]{1,10}/;
        const phoneMatch = html.match(phoneRegex);
        if (phoneMatch && !phone) {
          phone = phoneMatch[0].trim();
        }

        // Extract social URLs
        const socialPatterns = {
          facebook: /https?:\/\/(www\.)?facebook\.com\/[a-zA-Z0-9._-]+/i,
          instagram: /https?:\/\/(www\.)?instagram\.com\/[a-zA-Z0-9._-]+/i,
          linkedin: /https?:\/\/(www\.)?linkedin\.com\/(company|in)\/[a-zA-Z0-9._-]+/i,
          twitter: /https?:\/\/(www\.)?(twitter\.com|x\.com)\/[a-zA-Z0-9._-]+/i,
        };

        for (const [platform, regex] of Object.entries(socialPatterns)) {
          const match = html.match(regex);
          if (match) {
            socialLinks[platform as keyof typeof socialLinks] = match[0];
          }
        }

        // 3. If email still not found on homepage, search for contact/about pages
        if (!email) {
          const linkRegex = /<a\s+(?:[^>]*?\s+)?href="([^"]*)"[^>]*>(.*?)<\/a>/gi;
          let match;
          const matchedPaths: string[] = [];

          while ((match = linkRegex.exec(html)) !== null) {
            const href = match[1];
            const text = match[2].toLowerCase();
            if (href && (href.includes('contact') || href.includes('about') || text.includes('contact') || text.includes('about'))) {
              matchedPaths.push(href);
            }
          }

          if (matchedPaths.length > 0) {
            let contactUrl = matchedPaths[0].trim();
            if (!/^https?:\/\//i.test(contactUrl)) {
              // Resolve relative URL against home page URL
              const base = new URL(targetUrl);
              contactUrl = new URL(contactUrl, base.origin).toString();
            }

            console.log(`[Enrichment] Attempting to crawl contact/about page: ${contactUrl}`);
            const contactRes = await axios.get(contactUrl, {
              headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) ClientPilotAI/1.0',
              },
              timeout: 4000,
              validateStatus: () => true,
            });

            if (contactRes.status === 200 && typeof contactRes.data === 'string') {
              const contactHtml = contactRes.data;
              const contactEmails = extractEmails(contactHtml);
              if (contactEmails.length > 0) {
                email = contactEmails[0];
                source = 'website_contact_page';
                confidence = 0.9;
                console.log(`[Enrichment] Discovered email on contact page: ${email}`);
              }

              // Supplement social links
              for (const [platform, regex] of Object.entries(socialPatterns)) {
                if (!socialLinks[platform as keyof typeof socialLinks]) {
                  const sMatch = contactHtml.match(regex);
                  if (sMatch) {
                    socialLinks[platform as keyof typeof socialLinks] = sMatch[0];
                  }
                }
              }
            }
          }
        }
      }
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      console.warn(`[Enrichment] Scraper failed for website: ${targetUrl}. Error: ${msg}`);
    }
  }

  return {
    email,
    phone,
    website,
    socialLinks,
    source,
    confidence,
  };
};
