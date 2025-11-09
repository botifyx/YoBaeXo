// Location and currency detection utilities

export interface CountryInfo {
  code: string;
  name: string;
  currency: 'INR' | 'USD' | 'EUR' | 'GBP';
  symbol: string;
}

// Country to currency mapping
const countryCurrencyMap: Record<string, CountryInfo> = {
  'IN': { code: 'IN', name: 'India', currency: 'INR', symbol: '₹' },
  'US': { code: 'US', name: 'United States', currency: 'USD', symbol: '$' },
  'GB': { code: 'GB', name: 'United Kingdom', currency: 'GBP', symbol: '£' },
  'DE': { code: 'DE', name: 'Germany', currency: 'EUR', symbol: '€' },
  'FR': { code: 'FR', name: 'France', currency: 'EUR', symbol: '€' },
  'IT': { code: 'IT', name: 'Italy', currency: 'EUR', symbol: '€' },
  'ES': { code: 'ES', name: 'Spain', currency: 'EUR', symbol: '€' },
  'NL': { code: 'NL', name: 'Netherlands', currency: 'EUR', symbol: '€' },
  'BE': { code: 'BE', name: 'Belgium', currency: 'EUR', symbol: '€' },
  'AT': { code: 'AT', name: 'Austria', currency: 'EUR', symbol: '€' },
  'FI': { code: 'FI', name: 'Finland', currency: 'EUR', symbol: '€' },
  'IE': { code: 'IE', name: 'Ireland', currency: 'EUR', symbol: '€' },
  'PT': { code: 'PT', name: 'Portugal', currency: 'EUR', symbol: '€' },
  'GR': { code: 'GR', name: 'Greece', currency: 'EUR', symbol: '€' },
  'LU': { code: 'LU', name: 'Luxembourg', currency: 'EUR', symbol: '€' },
  'SI': { code: 'SI', name: 'Slovenia', currency: 'EUR', symbol: '€' },
  'SK': { code: 'SK', name: 'Slovakia', currency: 'EUR', symbol: '€' },
  'EE': { code: 'EE', name: 'Estonia', currency: 'EUR', symbol: '€' },
  'LV': { code: 'LV', name: 'Latvia', currency: 'EUR', symbol: '€' },
  'LT': { code: 'LT', name: 'Lithuania', currency: 'EUR', symbol: '€' },
  'MT': { code: 'MT', name: 'Malta', currency: 'EUR', symbol: '€' },
  'CY': { code: 'CY', name: 'Cyprus', currency: 'EUR', symbol: '€' },
  'CA': { code: 'CA', name: 'Canada', currency: 'USD', symbol: '$' },
  'AU': { code: 'AU', name: 'Australia', currency: 'USD', symbol: '$' },
  'NZ': { code: 'NZ', name: 'New Zealand', currency: 'USD', symbol: '$' },
  'SG': { code: 'SG', name: 'Singapore', currency: 'USD', symbol: '$' },
  'HK': { code: 'HK', name: 'Hong Kong', currency: 'USD', symbol: '$' },
  'JP': { code: 'JP', name: 'Japan', currency: 'USD', symbol: '$' },
  'KR': { code: 'KR', name: 'South Korea', currency: 'USD', symbol: '$' },
  'TW': { code: 'TW', name: 'Taiwan', currency: 'USD', symbol: '$' },
};

// Default fallback for unknown countries
const DEFAULT_COUNTRY: CountryInfo = { 
  code: 'IN', 
  name: 'India', 
  currency: 'INR', 
  symbol: '₹' 
};

// Get user's country code from various sources
const getUserCountryCode = async (): Promise<string> => {
  try {
    // Try to get from localStorage first (cache)
    const cached = localStorage.getItem('userCountry');
    if (cached) {
      return cached;
    }

    // Try multiple methods to detect location
    let countryCode = 'IN'; // Default fallback

    // Method 1: Try freegeoip.app (no API key required)
    try {
      const response = await fetch('https://freegeoip.app/json/');
      if (response.ok) {
        const data = await response.json();
        if (data.country_code) {
          countryCode = data.country_code;
          localStorage.setItem('userCountry', countryCode);
          return countryCode;
        }
      }
    } catch (error) {
      console.warn('Failed to detect location from freegeoip:', error);
    }

    // Method 2: Try ipapi.co (no API key required for basic usage)
    try {
      const response = await fetch('https://ipapi.co/json/');
      if (response.ok) {
        const data = await response.json();
        if (data.country_code) {
          countryCode = data.country_code;
          localStorage.setItem('userCountry', countryCode);
          return countryCode;
        }
      }
    } catch (error) {
      console.warn('Failed to detect location from ipapi:', error);
    }

    // Method 3: Try ip-api.com (no API key required)
    try {
      const response = await fetch('http://ip-api.com/json/');
      if (response.ok) {
        const data = await response.json();
        if (data.countryCode) {
          countryCode = data.countryCode;
          localStorage.setItem('userCountry', countryCode);
          return countryCode;
        }
      }
    } catch (error) {
      console.warn('Failed to detect location from ip-api:', error);
    }

    // Method 4: Fallback to browser timezone as hint
    try {
      const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      if (timeZone) {
        // Common timezone to country mappings for fallback
        if (timeZone.includes('Asia/Kolkata') || timeZone.includes('Asia/Calcutta')) {
          countryCode = 'IN';
        } else if (timeZone.includes('America/New_York') || timeZone.includes('America/Chicago') || 
                   timeZone.includes('America/Denver') || timeZone.includes('America/Los_Angeles')) {
          countryCode = 'US';
        } else if (timeZone.includes('Europe/London')) {
          countryCode = 'GB';
        } else if (timeZone.includes('Europe/')) {
          countryCode = 'DE'; // Default European country
        }
        localStorage.setItem('userCountry', countryCode);
        return countryCode;
      }
    } catch (error) {
      console.warn('Failed to detect location from timezone:', error);
    }

    return countryCode;
  } catch (error) {
    console.error('Error detecting user location:', error);
    return DEFAULT_COUNTRY.code;
  }
};

// Get country information based on detected location
export const getUserLocation = async (): Promise<CountryInfo> => {
  try {
    const countryCode = await getUserCountryCode();
    return countryCurrencyMap[countryCode] || DEFAULT_COUNTRY;
  } catch (error) {
    console.error('Error getting user location:', error);
    return DEFAULT_COUNTRY;
  }
};

// Get currency symbol for a given currency code
export const getCurrencySymbol = (currency: 'INR' | 'USD' | 'EUR' | 'GBP'): string => {
  const symbols = {
    INR: '₹',
    USD: '$',
    EUR: '€',
    GBP: '£',
  };
  return symbols[currency] || '$';
};

// Format currency with proper symbol and locale
export const formatCurrency = (
  amount: number, 
  currency: 'INR' | 'USD' | 'EUR' | 'GBP',
  locale: string = 'en-US'
): string => {
  const symbol = getCurrencySymbol(currency);
  const formatter = new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: currency === 'INR' ? 0 : 2,
    maximumFractionDigits: currency === 'INR' ? 0 : 2,
  });
  
  // For INR, we want to show the symbol first (₹) followed by the number
  if (currency === 'INR') {
    return `${symbol}${amount.toLocaleString('en-IN')}`;
  }
  
  return formatter.format(amount);
};