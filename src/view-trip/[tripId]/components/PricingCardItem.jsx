import React from 'react';
import { Link } from 'react-router-dom';

// Color palette
const colors = {
  terracotta: '#B25E39',
  darkGray: '#473D3A',
  beige: '#F3F3F3',
  green: '#22c55e',
  red: '#ef4444',
  blue: '#3b82f6',
  yellow: '#eab308'
};

function PricingCardItem({
  title,
  subtitle,
  imageUrl,
  icon: Icon,
  currentPrice,
  averagePrice,
  bookingLink,
  rating,
  type // "hotel", "flight", "train", "road"
}) {
  // Parsing numeric price from string if necessary
  const parsePrice = (priceStr) => {
    if (!priceStr) return 0;
    if (typeof priceStr === 'number') return priceStr;
    const numericStr = priceStr.toString().replace(/[^0-9.]/g, '');
    return parseFloat(numericStr) || 0;
  };

  const curr = parsePrice(currentPrice);
  const avg = parsePrice(averagePrice);

  let recommendation = "Average Price -> Your Choice";
  let percentDiffMsg = "Priced as usual";
  let recButton = "Book Now";
  let diffColor = colors.darkGray;
  let recState = "average"; // average, best, expensive, cheaper, slightly_higher

  let diffPercentage = 0;
  if (avg > 0) {
    diffPercentage = Math.round(Math.abs((curr - avg) / avg) * 100);

    if (curr < avg) {
      percentDiffMsg = `${diffPercentage}% cheaper than usual`;
      diffColor = colors.green;
      if (diffPercentage >= 10) {
        recommendation = "BEST DEAL \u2192 BOOK NOW";
        recState = "best";
        recButton = "Book Now";
      } else {
        recommendation = "BOOK NOW";
        recState = "cheaper";
        recButton = "Book Now";
      }
    } else if (curr > avg) {
      percentDiffMsg = `${diffPercentage}% higher than usual`;
      diffColor = colors.red;
      if (diffPercentage >= 10) {
        recommendation = "EXPENSIVE \u2192 WAIT";
        recState = "expensive";
        recButton = "Book Anyway";
      } else {
        recommendation = "WAIT";
        recState = "slightly_higher";
        recButton = "Book Anyway";
      }
    }
  }

  // Fallback defaults for missing prices
  if (curr === 0 || avg === 0) {
    recommendation = "Prices Vary";
    percentDiffMsg = "Average not available";
    diffColor = colors.darkGray;
    recButton = "View Options";
  }

  const getRecColor = () => {
    switch (recState) {
      case "best": return colors.green;
      case "cheaper": return colors.green;
      case "expensive": return colors.red;
      case "slightly_higher": return colors.yellow;
      default: return colors.blue;
    }
  };

  return (
    <Link to={bookingLink || '#'} target="_blank" className="block">
      <div className="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 cursor-pointer flex flex-col h-full border border-gray-100">
        
        {/* Image Section */}
        {imageUrl && (
          <div className="relative h-48 overflow-hidden flex-shrink-0">
            <img src={imageUrl} className="w-full h-full object-cover transition-transform duration-300 hover:scale-110" alt={title} />
            {rating && (
              <div className="absolute top-3 right-3 px-3 py-1 rounded-full flex items-center gap-1 shadow-lg" style={{ backgroundColor: colors.terracotta }}>
                <span className="text-white font-bold text-sm">⭐ {rating}</span>
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
          </div>
        )}

        {/* Details Section */}
        <div className="p-5 flex flex-col flex-grow">
          <div className="flex items-start gap-3 mb-3">
            {Icon && (
              <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${colors.terracotta}20` }}>
                <Icon className="text-xl" style={{ color: colors.terracotta }} />
              </div>
            )}
            <div>
              <h2 className="font-bold text-lg line-clamp-2" style={{ color: colors.darkGray }}>{title}</h2>
              {subtitle && <p className="text-sm text-gray-500 line-clamp-1">{subtitle}</p>}
            </div>
          </div>

          <div className="mt-4 flex flex-col gap-3">
            <div className="flex justify-between items-center bg-gray-50 p-3 rounded-lg">
              <div>
                <p className="text-xs text-gray-500 font-semibold mb-1 uppercase tracking-wide">Current Price</p>
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-xl" style={{ color: diffColor }}>
                    ₹{curr.toLocaleString()}
                  </span>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-500 font-semibold mb-1 uppercase tracking-wide">Average</p>
                <span className="font-semibold text-md line-through text-gray-400">
                  ₹{avg.toLocaleString()}
                </span>
              </div>
            </div>

            {/* Smart Pricing Logic Area */}
            <div className={`p-4 rounded-xl border`} style={{ borderColor: `${getRecColor()}40`, backgroundColor: `${getRecColor()}10` }}>
              <div className="flex items-center gap-2 mb-2">
                 <span className="text-xl">
                   {recState === 'best' || recState === 'cheaper' ? '📉' : 
                    recState === 'expensive' || recState === 'slightly_higher' ? '📈' : '📊'}
                 </span>
                 <p className="font-semibold text-sm" style={{ color: diffColor }}>{percentDiffMsg}</p>
              </div>

              <div className="flex items-center gap-2 mb-2">
                 <span className="text-lg">
                   {recState === 'best' || recState === 'cheaper' ? '✅' : 
                    recState === 'expensive' || recState === 'slightly_higher' ? '⏳' : '💡'}
                 </span>
                 <p className="font-bold text-sm" style={{ color: getRecColor() }}>Recommendation: <span className="uppercase">{recommendation}</span></p>
              </div>

              <p className="text-xs text-gray-600 mt-2 italic">Based on average pricing trends</p>
            </div>
            
          </div>

          {/* Spacer to push button to bottom if cards vary in size */}
          <div className="flex-grow"></div>

          {/* Action Button */}
          <button 
            className="w-full mt-4 py-3 rounded-xl font-bold transition-colors duration-200 shadow hover:shadow-md"
            style={{ 
              backgroundColor: getRecColor(),
              color: 'white'
            }}
          >
            {recButton}
          </button>
        </div>
      </div>
    </Link>
  );
}

export default PricingCardItem;
