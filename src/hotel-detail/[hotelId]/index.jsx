import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { FaBuilding, FaArrowLeft, FaCheckCircle, FaExclamationCircle } from 'react-icons/fa';

// Color palette
const colors = {
  terracotta: '#B25E39',
  darkGray: '#473D3A',
  beige: '#F3F3F3',
  green: '#22c55e',
  red: '#ef4444',
  yellow: '#eab308'
};

function HotelDetail() {
  const { hotelId } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSentimentData();
  }, [hotelId]);

  const fetchSentimentData = async () => {
    try {
      const response = await axios.get(`http://localhost:8000/api/sentiment/hotel?name=${encodeURIComponent(hotelId)}`);
      setData(response.data);
    } catch (error) {
      console.error("Failed to fetch sentiment analysis:", error);
    } finally {
      setLoading(false);
    }
  };

  const getLabelColor = (score) => {
    if (score >= 0.7) return colors.green;
    if (score <= 0.4) return colors.red;
    return colors.yellow;
  };
  
  const getLabelText = (score) => {
    if (score >= 0.7) return 'Positive';
    if (score <= 0.4) return 'Negative';
    return 'Neutral';
  };

  if (loading) {
    return <div className="flex justify-center items-center h-screen bg-gray-50"><p className="text-xl text-gray-500">Loading AI Analysis...</p></div>;
  }

  if (!data) {
    return <div className="flex justify-center items-center h-screen bg-gray-50"><p className="text-xl text-red-500">Analysis Not Found!</p></div>;
  }

  return (
    <div className="min-h-screen pb-20" style={{ backgroundColor: colors.beige }}>
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-4xl mx-auto px-5 py-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to={-1} className="p-3 bg-gray-100 rounded-full hover:bg-gray-200 transition">
              <FaArrowLeft className="text-gray-600" />
            </Link>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full flex items-center justify-center bg-orange-100">
                <FaBuilding style={{ color: colors.terracotta }} className="text-2xl" />
              </div>
              <h1 className="text-2xl font-bold" style={{ color: colors.darkGray }}>
                {data.name}
              </h1>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-5 mt-8 flex flex-col gap-8">
        
        {/* Core Analysis Top Section */}
        <div className="bg-white rounded-2xl shadow-md p-8 md:p-10 flex flex-col md:flex-row gap-10">
          
          {/* Main Score & Summary */}
          <div className="flex-1 border-r border-gray-100 md:pr-10">
            <h2 className="text-lg font-semibold text-gray-500 uppercase tracking-widest mb-4">Overall Sentiment</h2>
            <div className="flex items-end gap-3 mb-6">
              <span className="text-6xl font-extrabold" style={{ color: getLabelColor(data.sentiment_score) }}>
                {data.sentiment_score}
              </span>
              <span className="text-2xl font-semibold pb-1" style={{ color: getLabelColor(data.sentiment_score) }}>
                {getLabelText(data.sentiment_score)}
              </span>
            </div>
            <div className="bg-orange-50 border-l-4 p-4 rounded-r-xl italic" style={{ borderColor: colors.terracotta, color: colors.darkGray }}>
              "{data.summary}"
            </div>
          </div>

          {/* Breakdown Bars */}
          <div className="flex-1">
             <h2 className="text-lg font-semibold text-gray-500 uppercase tracking-widest mb-4">Score Breakdown</h2>
             <div className="flex flex-col gap-5">
               
               <div>
                 <div className="flex justify-between mb-1">
                   <span className="font-bold text-gray-600 flex items-center gap-2">👍 Positive</span>
                   <span className="font-bold">{data.positive}%</span>
                 </div>
                 <div className="w-full bg-gray-200 rounded-full h-3 max-w-sm">
                   <div className="bg-green-500 h-3 rounded-full" style={{ width: `${data.positive}%` }}></div>
                 </div>
               </div>

               <div>
                 <div className="flex justify-between mb-1">
                   <span className="font-bold text-gray-600 flex items-center gap-2">😐 Neutral</span>
                   <span className="font-bold">{data.neutral}%</span>
                 </div>
                 <div className="w-full bg-gray-200 rounded-full h-3 max-w-sm">
                   <div className="bg-yellow-400 h-3 rounded-full" style={{ width: `${data.neutral}%` }}></div>
                 </div>
               </div>

               <div>
                 <div className="flex justify-between mb-1">
                   <span className="font-bold text-gray-600 flex items-center gap-2">👎 Negative</span>
                   <span className="font-bold">{data.negative}%</span>
                 </div>
                 <div className="w-full bg-gray-200 rounded-full h-3 max-w-sm">
                   <div className="bg-red-500 h-3 rounded-full" style={{ width: `${data.negative}%` }}></div>
                 </div>
               </div>
             </div>
          </div>

        </div>

        {/* Highlights & Issues Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white rounded-2xl shadow-md p-8">
             <h3 className="text-xl font-bold mb-6 flex items-center gap-3 text-green-600">
               <FaCheckCircle /> Top Highlights
             </h3>
             <ul className="space-y-3">
               {data.highlights.map((h, i) => (
                 <li key={i} className="flex gap-3 items-start">
                   <span className="text-green-500 text-lg mt-0.5">✓</span>
                   <span className="font-medium text-gray-700">{h}</span>
                 </li>
               ))}
             </ul>
          </div>
          <div className="bg-white rounded-2xl shadow-md p-8">
             <h3 className="text-xl font-bold mb-6 flex items-center gap-3 text-red-500">
               <FaExclamationCircle /> Common Issues
             </h3>
             <ul className="space-y-3">
               {data.issues.map((issue, i) => (
                 <li key={i} className="flex gap-3 items-start">
                   <span className="text-red-400 text-lg mt-0.5">✕</span>
                   <span className="font-medium text-gray-700">{issue}</span>
                 </li>
               ))}
             </ul>
          </div>
        </div>

        {/* Sample Reviews */}
        <div className="bg-white rounded-2xl shadow-md p-8">
          <h2 className="text-xl font-bold mb-6" style={{ color: colors.darkGray }}>Sample Reviews</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {data.reviews.map((r, i) => (
              <div key={i} className="p-5 border border-gray-100 rounded-xl bg-gray-50 relative">
                <span className={`absolute -top-3 left-4 px-3 py-1 rounded-full text-xs font-bold text-white shadow-sm ${r.sentiment === 'positive' ? 'bg-green-500' : r.sentiment === 'negative' ? 'bg-red-500' : 'bg-yellow-400'}`}>
                  {r.sentiment.toUpperCase()}
                </span>
                <p className="mt-2 text-gray-700 italic">"{r.text}"</p>
              </div>
            ))}
          </div>
        </div>

        {/* Final CTA action */}
        <div className="mt-4 flex justify-center pb-10">
          <Link to={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(data.name)}`} target="_blank">
             <button
               className="px-8 py-4 text-lg font-bold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
               style={{ backgroundColor: colors.terracotta, color: 'white' }}
             >
               View on Google / Book Now
             </button>
          </Link>
        </div>

      </div>
    </div>
  );
}

export default HotelDetail;
