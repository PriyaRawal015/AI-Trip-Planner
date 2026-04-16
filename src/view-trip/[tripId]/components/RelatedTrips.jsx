import React, { useState, useEffect } from 'react';
import { GetPlaceDetails, PHOTO_REF_URL } from '@/service/GlobalApi';
import { FaStar } from 'react-icons/fa';
import { Link } from 'react-router-dom';

const colors = {
  terracotta: '#B25E39',
  darkGray: '#473D3A',
  beige: '#F3F3F3'
};

const PREFERENCE_STYLES = [
  { id: 'adventure', label: 'Adventure 🧗', query: 'Adventure and thrill' },
  { id: 'relaxation', label: 'Relaxation 🌴', query: 'Relaxing resorts and nature' },
  { id: 'explore', label: 'Explore 🌍', query: 'Culture and historical sightseeing' },
  { id: 'lifestyle', label: 'Lifestyle ✨', query: 'Luxury lifestyle, shopping and food' },
];

function RelatedTrips({ trip }) {
  const [recommendations, setRecommendations] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activePref, setActivePref] = useState(PREFERENCE_STYLES[0]);

  useEffect(() => {
    if (trip && trip.userSelection) {
      fetchRecommendations(activePref);
    }
  }, [trip, activePref]);

  const fetchRecommendations = async (pref) => {
    setIsLoading(true);
    const baseLocation = trip?.userSelection?.location?.label || '';
    const query = `${pref.query} places near ${baseLocation}`;
    
    if (baseLocation) {
      try {
        const resp = await GetPlaceDetails({ textQuery: query });
        const places = resp.data?.places || [];
        
        // Take top 3 and map them to our card structure
        const mappedRecs = places.slice(0, 3).map((p, idx) => ({
          id: p.id || idx,
          name: p.displayName?.text || 'Unknown Place',
          location: p.formattedAddress || baseLocation,
          description: `Highly rated ${pref.label.split(' ')[0]} spot!`, // Description placeholder
          rating: p.rating || 4.5,
          image_url: p.photos && p.photos.length > 0 
            ? PHOTO_REF_URL.replace('{NAME}', p.photos[0].name)
            : '/placeholder.jpg'
        }));
        
        setRecommendations(mappedRecs);
      } catch (err) {
        console.error("Error fetching related trips from Google:", err);
      }
    }
    setIsLoading(false);
  };

  if (!trip?.userSelection) return null;

  return (
    <div className="mt-16 mb-10 bg-white rounded-2xl p-8 shadow-xl border border-gray-100">
      <h3 className="text-2xl font-bold mb-6 text-center" style={{ color: colors.terracotta }}>
        Related Trips
      </h3>

      {/* 4 Preference Buttons */}
      <div className="flex flex-wrap justify-center gap-3 mb-8">
        {PREFERENCE_STYLES.map((pref) => (
          <button
            key={pref.id}
            onClick={() => setActivePref(pref)}
            className={`px-6 py-3 rounded-full font-medium transition-all duration-300 shadow-sm hover:shadow-md ${
              activePref.id === pref.id
                ? 'text-white transform scale-105'
                : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
            }`}
            style={activePref.id === pref.id ? { backgroundColor: colors.terracotta } : {}}
          >
            {pref.label}
          </button>
        ))}
      </div>
      
      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-terracotta"></div>
        </div>
      ) : recommendations.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {recommendations.map((rec) => (
            <div key={rec.id} className="rounded-xl overflow-hidden shadow-lg flex flex-col transition-transform hover:scale-[1.02]">
              <div className="h-48 overflow-hidden relative">
                <img src={rec.image_url} alt={rec.name} className="w-full h-full object-cover" />
                <div className="absolute top-2 right-2 bg-white px-2 py-1 rounded-full text-sm font-bold shadow flex items-center gap-1">
                  <FaStar className="text-yellow-400" /> {rec.rating}
                </div>
              </div>
              <div className="p-5 flex-1 flex flex-col bg-gray-50">
                <h4 className="font-bold text-lg mb-1">{rec.name}</h4>
                <p className="text-sm text-gray-500 mb-3">{rec.location}</p>
                <p className="text-sm text-gray-700 flex-1">{rec.description}</p>
                <Link to="/create-trip" className="mt-4">
                  <button className="w-full py-2 rounded-lg text-white font-medium transition-colors hover:bg-opacity-90" style={{ backgroundColor: colors.terracotta }}>
                    Plan Trip Here
                  </button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-center text-gray-500">No related trips found at the moment.</p>
      )}
    </div>
  );
}

export default RelatedTrips;
