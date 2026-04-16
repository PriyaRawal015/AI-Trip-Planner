import React from 'react';
import { FaPlane, FaTrain, FaCar, FaBus, FaWalking, FaTaxi, FaSubway } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

function getDistanceLevel(sourceLabel, destLabel) {
  if (!sourceLabel || !destLabel) return 'medium'; // fallback
  
  const srcTrim = sourceLabel.toLowerCase().split(',').map(s => s.trim());
  const dstTrim = destLabel.toLowerCase().split(',').map(s => s.trim());
  
  if (sourceLabel.toLowerCase() === destLabel.toLowerCase()) return 'very_short';
  if (srcTrim[0] === dstTrim[0]) return 'short';
  
  // Specific overrides for known adjacent cities that often get classified as different cities
  const isAdjacent = (s, d) => {
    const pair = [s, d].sort().join('-');
    return pair.includes('mumbai-thane') || pair.includes('brooklyn-new york') || pair.includes('jersey city-new york');
  };
  if (isAdjacent(srcTrim[0], dstTrim[0])) {
    return 'short';
  }

  // Same State check
  if (srcTrim.length > 1 && dstTrim.length > 1 && srcTrim[srcTrim.length-2] === dstTrim[dstTrim.length-2]) {
    return 'medium';
  }

  // Different state/country
  return 'long';
}

function getCountryCtx(label) {
  if (!label) return 'default';
  const check = label.toLowerCase();
  if (check.includes('india')) return 'india';
  if (check.includes('usa') || check.includes('united states')) return 'usa';
  const europe = ['uk', 'united kingdom', 'france', 'germany', 'italy', 'spain', 'netherlands', 'switzerland', 'europe'];
  if (europe.some(c => check.includes(c))) return 'europe';
  return 'default';
}

const metroCities = [
  "mumbai", "delhi", "bangalore", "hyderabad", "chennai",
  "kolkata", "pune", "ahmedabad",
  "new york", "london", "paris", "tokyo"
];

function isMetroCity(label) {
  if (!label) return false;
  return metroCities.some(m => label.toLowerCase().includes(m));
}

function getHubViaLabel(sourceLabel) {
  if (!sourceLabel) return "";
  const lower = sourceLabel.toLowerCase();
  if (lower.includes("mumbai")) return " (Via CST, Mumbai)";
  if (lower.includes("delhi")) return " (Via New Delhi Station)";
  if (lower.includes("bangalore") || lower.includes("bengaluru")) return " (Via KSR Bengaluru)";
  return "";
}

function getTransportOptions(sourceLabel, destLabel) {
  const distanceLevel = getDistanceLevel(sourceLabel, destLabel);
  const sourceCountry = getCountryCtx(sourceLabel);
  const destCountry = getCountryCtx(destLabel);
  
  let options = [];
  
  // STEP 3: INTERNATIONAL RULE (HIGHEST PRIORITY)
  if (sourceCountry !== destCountry) {
    options.push({ id: 'flight', title: 'Flight', icon: FaPlane, highlight: 'Fastest ✈️', color: '#06B6D4' });
    const hubLabel = getHubViaLabel(sourceLabel);
    options.push({ id: 'train', title: `Train${hubLabel}`, icon: FaTrain, highlight: 'Budget Option 🚆', color: '#3B82F6' });
    return options;
  }

  // DOMESTIC RULES
  const isSourceMetro = isMetroCity(sourceLabel);
  const isDestMetro = isMetroCity(destLabel);
  const isMumbai = sourceLabel.toLowerCase().includes('mumbai') || destLabel.toLowerCase().includes('mumbai');

  if (distanceLevel === 'very_short') {
    // Very Short (<10 km): Walking, Taxi, Metro (if metro city)
    options.push({ id: 'walk', title: 'Walking', icon: FaWalking, highlight: 'Recommended', color: '#10B981' });
    options.push({ id: 'taxi', title: 'Taxi', icon: FaTaxi, highlight: '', color: '#F59E0B' });
    if (isSourceMetro || isDestMetro) {
      options.push({ id: 'metro', title: 'Metro', icon: FaSubway, highlight: 'If available nearby', color: '#8B5CF6' });
    }
  } 
  else if (distanceLevel === 'short') {
    // Short (10-50 km): Metro (if metro city), Local Train (Mumbai only), Bus, Taxi
    if (isSourceMetro || isDestMetro) {
      options.push({ id: 'metro', title: 'Metro', icon: FaSubway, highlight: 'If available nearby', color: '#8B5CF6' });
    }
    if (sourceCountry === 'india' && isMumbai) {
      options.push({ id: 'local-train', title: 'Local Train', icon: FaTrain, highlight: 'Best for Mumbai', color: '#3B82F6' });
    }
    options.push({ id: 'bus', title: 'Bus', icon: FaBus, highlight: 'Budget Option', color: '#EF4444' });
    options.push({ id: 'taxi', title: 'Taxi / Cab', icon: FaTaxi, highlight: 'Most Convenient 🚕', color: '#F59E0B' });
  }
  else if (distanceLevel === 'medium') {
    // Medium (50-300 km): Train, Bus, Taxi
    const hubLabel = getHubViaLabel(sourceLabel);
    options.push({ id: 'train', title: `Train${hubLabel}`, icon: FaTrain, highlight: 'Recommended 🚆', color: '#3B82F6' });
    options.push({ id: 'bus', title: 'Bus', icon: FaBus, highlight: 'Budget Option', color: '#EF4444' });
    options.push({ id: 'taxi', title: 'Taxi / Cab', icon: FaCar, highlight: 'Most Convenient 🚕', color: '#F59E0B' });
  }
  else if (distanceLevel === 'long') {
    // Long (>300 km): Flight, Train
    const hubLabel = getHubViaLabel(sourceLabel);
    options.push({ id: 'flight', title: 'Flight', icon: FaPlane, highlight: 'Fastest ✈️', color: '#06B6D4' });
    options.push({ id: 'train', title: `Train${hubLabel}`, icon: FaTrain, highlight: 'Budget Option 🚆', color: '#3B82F6' });
  }
  
  return options;
}

function TransportOptions({ trip }) {
  const sourceLabel = trip?.userSelection?.sourceLocation?.label || '';
  const destLabel = trip?.userSelection?.location?.label || '';

  const options = getTransportOptions(sourceLabel, destLabel);
  const navigate = useNavigate();
  
  // Clean names for display
  const destCityCap = destLabel ? destLabel.split(',')[0] : "Destination";
  const sourceCityCap = sourceLabel ? sourceLabel.split(',')[0] : "Your Location";

  if (!sourceLabel || !destLabel) return null; // Wait until data is loaded

  function handleTransportClick(type, from, to) {
    const country = getCountryCtx(destLabel);
    navigate(`/transport/${type}?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}&country=${encodeURIComponent(country)}`);
  }

  return (
    <div className="mt-10 mb-10">
      <div className="bg-white rounded-2xl shadow-md p-6 mb-6">
        <h2 className="font-bold text-2xl md:text-3xl" style={{ color: '#473D3A' }}>
          Smart Travel Options
        </h2>
        <p className="text-gray-500 mt-2">
          From <strong>{sourceCityCap}</strong> to <strong>{destCityCap}</strong>
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {options.map((opt) => (
          <button 
            onClick={() => handleTransportClick(opt.id, sourceCityCap, destCityCap)}
            key={opt.id} 
            className="block h-full group w-full text-left"
          >
            <div className="bg-white border-2 border-gray-100 rounded-2xl p-6 shadow-sm group-hover:shadow-lg transition-all duration-300 transform group-hover:-translate-y-1 relative overflow-hidden h-full">
              <div className="flex items-start justify-between mb-4">
                <div 
                  className="w-14 h-14 rounded-full flex items-center justify-center transition-transform duration-500 group-hover:scale-110"
                  style={{ backgroundColor: `${opt.color}15`, color: opt.color }}
                >
                  <opt.icon className="text-3xl" />
                </div>
                
                {opt.highlight && (
                  <div 
                    className="px-3 py-1 text-xs font-bold rounded-full border"
                    style={{ 
                      backgroundColor: `${opt.color}10`, 
                      color: opt.color,
                      borderColor: `${opt.color}30`
                    }}
                  >
                    {opt.highlight}
                  </div>
                )}
              </div>

              <h3 className="font-bold text-xl mb-1 text-gray-800">{opt.title}</h3>
              <p className="text-sm text-gray-500 mb-4">
                Optimal choice based on route distance and location context.
              </p>
              
              <div className="mt-auto flex items-center text-sm font-semibold transition-colors duration-300" style={{ color: opt.color }}>
                Select Option <span className="ml-1 group-hover:translate-x-1 transition-transform">→</span>
              </div>
            </div>
          </button>
        ))}
      </div>
      
      {/* Disclaimer Section */}
      <div className="mt-6 bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
        <div className="text-amber-500 mt-0.5 text-lg">💡</div>
        <p className="text-sm text-amber-800 font-medium leading-snug">
          Transport suggestions are based on general travel patterns and distance estimates. Availability and times may vary depending on real-time conditions.
        </p>
      </div>
    </div>
  );
}

export default TransportOptions;

