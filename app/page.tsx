'use client';
import { useState } from 'react';

interface Restaurant {
  _id: string;
  name: string;
  oilType: string;
  submittedDate: string;
  __v?: number;
  createdAt?: string;
  updatedAt?: string;
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
// ========== Constants ========== 
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

// ====== Component ======
export default function Home() {
  //Form states
  const [name, setName] = useState<string>('');
  const [oilType, setOilType] = useState<OilType | ''>('');

  //Search states
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searchResults, setSearchResults] = useState<RestaurantWithRisk[]>([]);

  //UI states
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [submittedMessage, setSubmitMessage] = useState<string>('');
  const [searchMessage, setSearchMessage] = useState<string>('');

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

  const formatDate = (dateString:string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // ===== EVENT HANDLERS =====
  const handleSubmit = async(e:React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();

    if(!name.trim() || !oilType) {
      setSubmitMessage('Please fill in all fields.');
      return;

    }

    setIsSubmitting(true);
    setSubmitMessage('');

    try {
      const response = await fetch('/api/restaurants', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ name: name.trim(), oilType: oilType })
      });
      const data: ApiResponse<Restaurant> = await response.json();

      if(data.success) {
        setSubmitMessage('Restaurant submitted successfully!');
        setName('');
        setOilType('');
      }else {
        setSubmitMessage(`Error: ${data.error}`);
      }
      }catch(error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        setSubmitMessage(`Error: ${errorMessage}`);
      }
      finally {
        setIsSubmitting(false);
      }
  };
  const handleSearch = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setSearchMessage('');
      return;
    }
    
    setIsSearching(true);
    setSearchMessage('');
    
    try {
      const response = await fetch(
        `/api/restaurants/search?name=${encodeURIComponent(searchQuery)}`
      );
      
      const data: ApiResponse<RestaurantWithRisk[]> = await response.json();
      
      if (data.success && data.data) {
        setSearchResults(data.data);
        if (data.data.length === 0) {
          setSearchMessage('No restaurants found');
        } else {
          setSearchMessage(`Found ${data.count} result(s)`);
        }
      } else {
        setSearchMessage(`Error: ${data.error || 'Unknown error'}`);
        setSearchResults([]);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setSearchMessage(`Error: ${errorMessage}`);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  // ===== TYPESCRIPT =====

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">

        <header className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Restaurant Peanut Allergy Tracker
          </h1>
          <p className="text-gray-600">
            Track cooking oils and peanut allergy risks
          </p>
        </header>

        <div className="grid md:grid-cols-2 gap-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Add Restaurant
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
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
        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors text-gray-600 placeholder:text-gray-400"
                />
             </div>
            {/* Oil Type DropDown */}
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
        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors bg-white text-gray-600"
                 >
                  <option value="">Select an oil type...</option>
                  {OIL_TYPES.map((oil) => (
                    <option key={oil} value={oil}>{oil}
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

      {/*Error or Success Message */}
      {submittedMessage && (
        <div className={`p-3 rounded-lg text-sm ${
          submittedMessage.includes('successfully') 
            ? 'bg-green-50 text-green-800 border border-green-200' 
            : 'bg-red-50 text-red-800 border border-red-200'
        }`}>
          {submittedMessage}
        </div>
      )}
            </form>
            



          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Search Restaurants
            </h2>
            
            {/* Search coming next */}
            
          </div>
        </div>
      </div>
    </div>
  );
}