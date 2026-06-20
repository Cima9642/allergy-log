'use client';
import { useState, useEffect, useRef } from 'react';

// ============= TYPE DEFINITIONS =============
interface Restaurant {
  _id: string;
  name: string;
  oilType: string;
  submittedDate: string;
  __v?: number;
  createdAt?: string;
  updatedAt?: string;
  verified?: boolean;
  voteCount?: number;
  verificationStatus?: string;
  verificationBadge?: string;
}

interface RestaurantWithRisk extends Restaurant {
  risk: RiskAssessment;
}

interface RiskAssessment {
  riskLevel: string;
  message: string;
  color: string;
}

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  count?: number;
}

// ============= CONSTANTS =============
const OIL_TYPES = [
  'Peanut',
  'Canola',
  'Vegetable',
  'Olive',
  'Coconut',
  'Sunflower',
  'Sesame',
  'Avocado',
  'Grapeseed',
  'Walnut',
  'Almond',
  'Corn',
  'Soybean',
  'Mixed/Other'
] as const;

type OilType = typeof OIL_TYPES[number];

// ============= COMPONENT =============
export default function Home() {
  // ===== FORM STATES =====
  const [name, setName] = useState<string>('');
  const [oilType, setOilType] = useState<OilType | ''>('');

  // ===== SEARCH STATES =====
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searchResults, setSearchResults] = useState<RestaurantWithRisk[]>([]);
  const [allResults, setAllResults] = useState<RestaurantWithRisk[]>([]);
  const [riskFilter, setRiskFilter] = useState<string>('all');

  // ===== UI STATES =====
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [submittedMessage, setSubmitMessage] = useState<string>('');
  const [searchMessage, setSearchMessage] = useState<string>('');

  // ===== DEBOUNCE REFERENCE =====
  const debounceTimeout = useRef<NodeJS.Timeout | null>(null);

  // ===== HELPER FUNCTIONS =====
  const getRiskClasses = (color: string): string => {
    const classes: Record<string, string> = {
      red: 'bg-red-100 text-red-800 border-red-300',
      yellow: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      orange: 'bg-orange-100 text-orange-800 border-orange-300',
      green: 'bg-green-100 text-green-800 border-green-300',
      gray: 'bg-gray-100 text-gray-800 border-gray-300',
    };
    return classes[color] || classes.gray;
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // ===== FORM SUBMIT HANDLER =====
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/restaurants', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, oilType })
      });

      const data = await response.json();

      if (data.success) {
        // Show success message with custom message from API
        setSubmitMessage(data.message || 'Restaurant submitted successfully!');
        
        // Clear form
        setName('');
        setOilType('');
        
        // Hide message after 5 seconds
        setTimeout(() => setSubmitMessage(''), 5000);
      } else {
        setSubmitMessage(`❌ Error: ${data.error}`);
        setTimeout(() => setSubmitMessage(''), 5000);
      }
    } catch (error) {
      setSubmitMessage('❌ Failed to submit restaurant');
      setTimeout(() => setSubmitMessage(''), 5000);
    } finally {
      setIsSubmitting(false);
    }
  };

  // ===== REAL-TIME SEARCH HANDLER =====
  const handleRealtimeSearch = (query: string): void => {
    setSearchQuery(query);

    const trimmedQuery = query.trim();
    
    // If search is empty, clear everything
    if (!trimmedQuery) {
      setSearchResults([]);
      setAllResults([]);
      setSearchMessage('');
      setRiskFilter('all');
      return;
    }
    
    // Clear any existing timeout
    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current);
    }
    
    // Set new timeout - searches after 300ms of inactivity
    debounceTimeout.current = setTimeout(async () => {
      setIsSearching(true);
      setSearchMessage('');
      
      try {
        const response = await fetch(
          `/api/restaurants/search?name=${encodeURIComponent(trimmedQuery)}`
        );
        
        const data: ApiResponse<RestaurantWithRisk[]> = await response.json();
        
        if (data.success && data.data) {
          setAllResults(data.data);
          setSearchResults(data.data);
          
          if (data.data.length === 0) {
            setSearchMessage('No restaurants found');
          } else {
            setSearchMessage(`Found ${data.count} result(s)`);
          }
        } else {
          setSearchMessage(`Error: ${data.error || 'Unknown error'}`);
          setAllResults([]);
          setSearchResults([]);
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        setSearchMessage(`Error: ${errorMessage}`);
        setAllResults([]);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 300);
  };

  // ===== RISK FILTER HANDLER =====
  const handleRiskFilterChange = (filter: string): void => {
    setRiskFilter(filter);
    
    if (filter === 'all') {
      setSearchResults(allResults);
      if (allResults.length > 0) {
        setSearchMessage(`Found ${allResults.length} result(s)`);
      }
    } else {
      const filtered = allResults.filter(restaurant => 
        restaurant.risk.riskLevel.toLowerCase() === filter.toLowerCase()
      );
      
      setSearchResults(filtered);
      
      if (filtered.length === 0 && allResults.length > 0) {
        setSearchMessage(`No ${filter} risk restaurants found. Showing 0 of ${allResults.length} results.`);
      } else {
        setSearchMessage(`Showing ${filtered.length} of ${allResults.length} result(s)`);
      }
    }
  };

  // ===== CLEAR SEARCH HANDLER =====
  const clearSearch = (): void => {
    setSearchQuery('');
    setSearchResults([]);
    setAllResults([]);
    setSearchMessage('');
    setRiskFilter('all');
  };

  // ===== JSX =====
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">

        {/* ===== HEADER ===== */}
        <header className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Restaurant Peanut Allergy Tracker
          </h1>
          <p className="text-gray-600">
            Track cooking oils and peanut allergy risks
          </p>
        </header>

        {/* ===== TWO-COLUMN GRID ===== */}
        <div className="grid md:grid-cols-2 gap-8">
          
          {/* ===== LEFT COLUMN: ADD RESTAURANT FORM ===== */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Add Restaurant
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4 min-h-[220px]">
              
              {/* Restaurant Name Input */}
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-gray-900 mb-1"
                >
                  Restaurant Name
                </label>
                <input
                  type="text"
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g., Joe's Diner"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors text-gray-900 placeholder:text-gray-400"
                  required
                />
              </div>

              {/* Oil Type Dropdown */}
              <div>
                <label
                  htmlFor="oilType"
                  className="block text-sm font-medium text-gray-900 mb-1"
                >
                  Oil Type
                </label>
                <select
                  id="oilType"
                  value={oilType}
                  onChange={(e) => setOilType(e.target.value as OilType)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors bg-white text-gray-900"
                  required
                >
                  <option value="">Select an oil type...</option>
                  {OIL_TYPES.map((oil) => (
                    <option key={oil} value={oil}>
                      {oil}
                    </option>
                  ))}
                </select>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isSubmitting ? 'Adding...' : 'Submit Restaurant'}
              </button>

              {/* Success/Error Message */}
              {submittedMessage && (
  <div className={`p-3 rounded-lg text-sm animate-fade-out ${
    submittedMessage.includes('❌')
      ? 'bg-red-50 text-red-800 border border-red-200'
      : 'bg-green-50 text-green-800 border border-green-200'
  }`}>
    {submittedMessage}
  </div>
)}
            </form>
          </div>

          {/* ===== RIGHT COLUMN: SEARCH SECTION ===== */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Search Restaurants
            </h2>
            
            {/* Real-Time Search Input */}
            <div className="mb-4">
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => handleRealtimeSearch(e.target.value)}
                  placeholder="Search by restaurant name..."
                  className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors text-gray-900 placeholder:text-gray-400"
                />
                
                {/* Clear Button */}
                {searchQuery && (
                  <button
                    onClick={clearSearch}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    aria-label="Clear search"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
              
              {/* Loading Indicator */}
              {isSearching && (
                <p className="text-sm text-blue-600 mt-2">Searching...</p>
              )}
            </div>
            
            {/* Risk Filter Dropdown */}
            {allResults.length > 0 && (
              <div className="mb-4">
                <label htmlFor="riskFilter" className="block text-sm font-medium text-gray-700 mb-2">
                  Filter by Risk Level:
                </label>
                <select
                  id="riskFilter"
                  value={riskFilter}
                  onChange={(e) => handleRiskFilterChange(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors bg-white text-gray-900"
                >
                  <option value="all">All Risk Levels</option>
                  <option value="high">High Risk Only</option>
                  <option value="medium">Medium Risk Only</option>
                  <option value="low">Low Risk Only</option>
                </select>
              </div>
            )}
            
            {/* Search Message */}
            {searchMessage && (
              <div className={`mb-4 p-3 rounded-lg text-sm ${
                searchMessage.includes('Error')
                  ? 'bg-red-50 text-red-800 border border-red-200'
                  : 'bg-blue-50 text-blue-800 border border-blue-200'
              }`}>
                {searchMessage}
              </div>
            )}
            
            {/* Search Results List */}
            <div className="space-y-3">
              {searchResults.length > 0 ? (
                searchResults.map((restaurant) => (
                  <div
                    key={restaurant._id}
                    className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
                  >
                    {/* ===== RESTAURANT NAME + VERIFICATION BADGE ===== */}
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {restaurant.name || 'Unnamed Restaurant'}
                      </h3>
                      {restaurant.verified ? (
                        <span className="ml-2 text-green-600 font-bold text-sm">✅ Verified</span>
                      ) : (
                        <span className="ml-2 text-yellow-600 text-sm">⚠️ Pending</span>
                      )}
                    </div>
                    
                    {/* ===== OIL TYPE ===== */}
                    <p className="text-sm text-gray-600 mb-2">
                      Cooking Oil: <span className="font-medium">{restaurant.oilType}</span>
                    </p>
                    
                    {/* ===== VERIFICATION PROGRESS (if not verified) ===== */}
                    {!restaurant.verified && (
                      <div className="bg-yellow-50 border border-yellow-200 rounded p-2 mb-3">
                        <p className="text-sm text-yellow-800">
                          🗳️ {restaurant.verificationStatus}
                        </p>
                        <div className="w-full bg-yellow-200 rounded h-2 mt-1">
                          <div 
                            className="bg-yellow-500 h-2 rounded transition-all"
                            style={{ width: `${(restaurant.voteCount! / 2) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    )}
                    
                    {/* ===== SUBMITTED DATE ===== */}
                    <p className="text-xs text-gray-500 mb-3">
                      Added {formatDate(restaurant.submittedDate)}
                    </p>
                    
                    {/* ===== RISK BADGE ===== */}
                    <div className={`inline-block px-3 py-1 rounded-full text-sm font-medium border ${getRiskClasses(restaurant.risk.color)}`}>
                      {restaurant.risk.riskLevel.toUpperCase()} RISK
                    </div>
                    
                    {/* ===== RISK MESSAGE ===== */}
                    <p className="text-sm text-gray-600 mt-2">
                      {restaurant.risk.message}
                    </p>
                    
                    {/* ===== VOTE COUNT ===== */}
                    <p className="text-xs text-gray-500 mt-2">
                      {restaurant.voteCount} {restaurant.voteCount === 1 ? 'vote' : 'votes'}
                    </p>
                  </div>
                ))
              ) : (
                // Empty state
                <div className="text-center py-8 text-gray-500">
                  {searchQuery
                    ? 'No results found. Try a different search term.'
                    : 'Enter a restaurant name to search.'}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}