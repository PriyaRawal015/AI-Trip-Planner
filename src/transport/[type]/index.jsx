import React from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { FaPlane, FaTrain, FaCar, FaBus, FaWalking, FaTaxi, FaSubway, FaArrowLeft } from 'react-icons/fa';

const transportIcons = {
  flight: FaPlane,
  train: FaTrain,
  'local-train': FaTrain,
  bus: FaBus,
  car: FaCar,
  cab: FaCar,
  taxi: FaTaxi,
  subway: FaSubway,
  metro: FaSubway,
  walk: FaWalking,
  transit: FaBus
};

const transportNames = {
  flight: 'Flight',
  train: 'Train',
  'local-train': 'Local Train',
  bus: 'Bus',
  cab: 'Cab / Self-Drive',
  taxi: 'Taxi / Cab',
  subway: 'Subway',
  metro: 'Metro',
  walk: 'Walking',
  transit: 'Public Transport'
};

function TransportDetails() {
  const { type } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const from = searchParams.get('from') || 'Origin';
  const to = searchParams.get('to') || 'Destination';
  const country = searchParams.get('country') || 'default';

  const Icon = transportIcons[type] || FaCar;
  const name = transportNames[type] || 'Transport';

  const transportPlatforms = {
    india: {
      train: { url: "https://www.irctc.co.in/nget/train-search", name: "IRCTC" },
      bus: { url: "https://www.redbus.in/", name: "RedBus" },
      flight: { url: "https://www.makemytrip.com/flights/", name: "MakeMyTrip" },
      taxi: { url: "https://www.uber.com/in/en/", name: "Uber" },
      cab: { url: "https://www.uber.com/in/en/", name: "Uber" }
    },
    usa: {
      train: { url: "https://www.amtrak.com/", name: "Amtrak" },
      bus: { url: "https://www.greyhound.com/", name: "Greyhound" },
      flight: { url: "https://www.skyscanner.com/", name: "Skyscanner" },
      taxi: { url: "https://www.uber.com/", name: "Uber" },
      cab: { url: "https://www.uber.com/", name: "Uber" }
    },
    default: {
      flight: { url: "https://www.skyscanner.com/", name: "Skyscanner" },
      taxi: { url: "https://www.uber.com/", name: "Uber" },
      cab: { url: "https://www.uber.com/", name: "Uber" }
    }
  };

  const currentSettings = transportPlatforms[country] || transportPlatforms['default'];
  let targetPlatform = currentSettings[type];

  if (!targetPlatform) {
    if (type === 'flight') targetPlatform = { url: "https://www.skyscanner.com/", name: "Skyscanner" };
    else targetPlatform = { url: `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(from)}&destination=${encodeURIComponent(to)}`, name: "Google Maps" };
  }

  let finalUrl = targetPlatform.url;
  let finalPlatformName = targetPlatform.name;

  const isMumbai = from.toLowerCase().includes('mumbai') || to.toLowerCase().includes('mumbai');
  
  if (isMumbai && (type === 'local-train' || type === 'metro')) {
    finalUrl = `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(from)}&destination=${encodeURIComponent(to)}&travelmode=transit`;
    finalPlatformName = "Google Maps";
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center py-12 px-6">
      <div className="w-full max-w-2xl bg-white rounded-3xl shadow-xl p-8 relative overflow-hidden">
        {/* Decorative background element */}
        <div className="absolute top-0 right-0 p-12 -mt-10 -mr-10 rounded-full bg-blue-50 opacity-50 pointer-events-none" />

        <button 
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-500 hover:text-gray-900 transition mb-6 rounded-full px-4 py-2 hover:bg-gray-100"
        >
          <FaArrowLeft />
          <span className="font-semibold">Back to Itinerary</span>
        </button>

        <div className="flex flex-col items-center text-center mt-6 mb-10">
          <div className="w-24 h-24 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 mb-6 shadow-sm">
            <Icon className="text-5xl" />
          </div>
          <h1 className="text-4xl font-extrabold text-gray-800 mb-2">{name} Route</h1>
          <p className="text-lg text-gray-500">Dedicated navigation guide</p>
        </div>

        <div className="bg-gray-50 border border-gray-100 rounded-2xl p-6 mb-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm">
          <div className="flex-1 text-center md:text-left">
            <p className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-1">From</p>
            <h3 className="text-2xl font-bold text-gray-800">{from}</h3>
          </div>
          
          <div className="flex items-center justify-center relative w-full md:w-32 py-4">
            <div className="absolute w-full h-[2px] bg-gray-300" />
            <div className="relative z-10 w-8 h-8 rounded-full bg-white border-2 border-gray-300 flex items-center justify-center text-gray-400">
               <Icon className="text-sm" />
            </div>
          </div>

          <div className="flex-1 text-center md:text-right">
            <p className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-1">To</p>
            <h3 className="text-2xl font-bold text-gray-800">{to}</h3>
          </div>
        </div>

        <div className="bg-white border-l-4 border-blue-500 rounded-r-xl p-5 shadow-sm text-gray-600 mb-8 leading-relaxed">
          You are preparing to travel from <strong>{from}</strong> to <strong>{to}</strong> utilizing <strong>{name}</strong>. Please ensure you review local timings, availability, and prepare necessary ticketing or preparations beforehand.
        </div>

        <div className="flex gap-4 w-full">
          <a 
            href={finalUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 flex items-center justify-center py-6 text-lg font-bold rounded-xl shadow-md transition-transform hover:scale-105 bg-gray-900 text-white hover:bg-gray-800"
          >
            {finalPlatformName === "Google Maps" ? "View on Google Maps" : `Book on ${finalPlatformName}`}
          </a>
        </div>
      </div>
    </div>
  );
}

export default TransportDetails;
