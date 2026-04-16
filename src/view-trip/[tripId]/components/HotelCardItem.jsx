import { GetPlaceDetails, PHOTO_REF_URL } from '@/service/GlobalApi';
import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { FaBuilding, FaCheckCircle, FaExclamationCircle } from 'react-icons/fa';
import axios from 'axios';

// Color palette
const colors = {
  terracotta: '#B25E39',
  darkGray: '#473D3A',
  beige: '#F3F3F3',
  green: '#22c55e',
  red: '#ef4444'
};

function HotelCardItem({hotel}) {

    const [photoUrl, setPhotoUrl] = useState()
    
// ... (keeping GetPlacePhoto logic exactly as is except tracking sentiment data)
    const [sentimentData, setSentimentData] = useState(null);

    useEffect(() => {
      hotel && GetPlacePhoto();
      if (hotel?.hotelName) {
        axios.get(`http://localhost:8000/api/sentiment/hotel?name=${encodeURIComponent(hotel.hotelName)}`)
             .then(res => setSentimentData(res.data))
             .catch(err => console.error("Could not fetch sentiment preview:", err));
      }
    }, [hotel])

    const GetPlacePhoto = async () => {
      const data = {
        textQuery: hotel?.hotelName
      }

      const result = await GetPlaceDetails(data).then(resp => {
        console.log(resp.data.places[0].photos[3].name);

        const PhotoUrl = PHOTO_REF_URL.replace('{NAME}', resp.data.places[0].photos[3].name);
        setPhotoUrl(PhotoUrl)
      })
    }

  // Extract dynamic fields from the API payload (or fallback to loading text while fetching)
  const mockHighlight = sentimentData?.highlights?.[0] || 'Fetching highlight...';
  const mockIssue = sentimentData?.issues?.[0] || 'Fetching issues...';
  const mockScore = sentimentData?.sentiment_score || '...';
  const mockSentiment = sentimentData 
    ? (sentimentData.sentiment_score >= 0.7 ? "Positive" : sentimentData.sentiment_score <= 0.4 ? "Negative" : "Neutral") 
    : "Analyzing";
  
  const scoreColor = sentimentData 
    ? (sentimentData.sentiment_score >= 0.7 ? colors.green : sentimentData.sentiment_score <= 0.4 ? colors.red : '#eab308') 
    : colors.green;

  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 flex flex-col h-full border border-gray-100">
      
      {/* Hotel Image */}
      <div className="relative h-48 overflow-hidden flex-shrink-0">
        <img
          src={photoUrl}
          className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
          alt={hotel?.hotelName || "Hotel"}
        />
        <div className="absolute top-3 right-3 px-3 py-1 rounded-full shadow-lg" style={{ backgroundColor: scoreColor }}>
          <span className="text-white font-bold text-sm">Score: {mockScore} ({mockSentiment})</span>
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
      </div>

      <div className="p-5 flex flex-col flex-grow">
        <div className="flex items-start gap-3 mb-4">
            <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${colors.terracotta}20` }}>
              <FaBuilding className="text-xl" style={{ color: colors.terracotta }} />
            </div>
            <h2 className="font-bold text-lg line-clamp-2" style={{ color: colors.darkGray }}>
              {hotel?.hotelName || "Hotel Name"}
            </h2>
        </div>

        {/* Sentiment Preview Area */}
        <div className="flex flex-col gap-3 mt-2">
           <div className="flex items-start gap-2">
             <FaCheckCircle className="text-green-500 mt-1 flex-shrink-0" />
             <p className="text-sm text-gray-700 font-medium"><strong>Highlight:</strong> {mockHighlight}</p>
           </div>
           <div className="flex items-start gap-2">
             <FaExclamationCircle className="text-red-500 mt-1 flex-shrink-0" />
             <p className="text-sm text-gray-700 font-medium"><strong>Issue:</strong> {mockIssue}</p>
           </div>
        </div>

        <div className="flex-grow"></div>

        {/* Action Button */}
        <Link to={`/hotel-detail/${encodeURIComponent(hotel?.hotelName || 'Hotel')}`} className="w-full mt-5 block">
          <button 
            className="w-full py-3 rounded-xl font-bold transition-colors duration-200 shadow hover:shadow-md"
            style={{ backgroundColor: colors.terracotta, color: 'white' }}
          >
            View Details
          </button>
        </Link>
      </div>
    </div>
  )
}

export default HotelCardItem