import React, { useState, useEffect } from 'react';
import { FaMapMarkedAlt, FaWallet, FaClock, FaUserCheck, FaCompass, FaHeart, FaStar } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { getRecommendations } from '../../service/RecommenderApi';
// Note: In your actual React Router setup, replace this with:
// import { useNavigate } from 'react-router-dom';
// const navigate = useNavigate();
// onClick={() => navigate('/create-trip')}

// Color palette from the image
const colors = {
  cream: '#FFFFFF',
  beige: '#F3F3F3',
  terracotta: '#B25E39',
  darkGray: '#473D3A'
};

function Hero() {
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const [recommendations, setRecommendations] = useState([]);
  const [selectedStyle, setSelectedStyle] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Handle navigation to create trip page
  const handleGetStarted = () => {
    // For demo purposes, showing an alert
    // In your actual app, use: navigate('/create-trip')
    alert('Navigating to Create Trip page...');
    console.log('Navigate to /create-trip');
    // window.location.href = '/create-trip'; // Alternative if not using React Router
  };

  const testimonials = [
    {
      name: "Sarah Mitchell",
      location: "New York, USA",
      text: "This AI planner transformed our Italy trip into an unforgettable experience. Every detail was perfect!",
      rating: 5
    },
    {
      name: "David Chen",
      location: "Singapore",
      text: "I saved hours of research time. The personalized itinerary matched my budget and interests perfectly.",
      rating: 5
    },
    {
      name: "Emma Rodriguez",
      location: "Barcelona, Spain",
      text: "As a solo traveler, having a custom plan gave me confidence. Highly recommend!",
      rating: 5
    }
  ];

  const [travelStyles, setTravelStyles] = useState([]);

  useEffect(() => {
    const allTravelStyles = [
      { title: "Off the Beaten Path", image: "🏔️", desc: "Explore hidden gems away from tourist crowds", category: "mountain nature adventure" },
      { title: "Beach Relaxation", image: "🏖️", desc: "Sunny beaches and pristine waters", category: "beach relaxation" },
      { title: "City & Culture", image: "🏙️", desc: "Bustling streets, art, and vibrant city life", category: "city culture entertainment" },
      { title: "Luxury Romance", image: "🍷", desc: "Premium experiences for couples", category: "luxury romantic" },
      { title: "Historical Wonders", image: "🏛️", desc: "Step back in time through ancient ruins", category: "history culture" },
      { title: "Foodie Paradise", image: "🍜", desc: "Taste authentic local cuisines and culinary delights", category: "food culinary" },
      { title: "Family Fun", image: "👪", desc: "Kid-friendly activities and family moments", category: "family friendly amusement" },
      { title: "Wildlife Safari", image: "🦁", desc: "Get close to nature's most magnificent creatures", category: "wildlife nature safari" },
      { title: "Wellness Retreat", image: "🧘", desc: "Rejuvenate your body and mind in tranquil settings", category: "wellness spa relaxation" },
      { title: "Winter Sports", image: "⛷️", desc: "Hit the slopes for skiing and snowboarding", category: "winter sports snow" }
    ];
    
    // Shuffle and pick 4
    const shuffled = [...allTravelStyles].sort(() => 0.5 - Math.random());
    setTravelStyles(shuffled.slice(0, 4));
  }, []);

  const fetchRecommendations = async (style) => {
    setIsLoading(true);
    setSelectedStyle(style.title);
    const recs = await getRecommendations(style.category, 3);
    setRecommendations(recs);
    setIsLoading(false);
  };

  return (
    <div className="bg-gradient-to-b from-white to-gray-50">
      {/* Hero Section */}
      <div className="flex flex-col items-center px-5 md:px-20 lg:px-56 gap-9 py-16">
        <h1 className="font-extrabold text-4xl md:text-[60px] text-center mt-8 leading-tight">
          <span style={{ color: colors.terracotta }}>Discover Your Next Adventure with AI:</span>
          <br />
          <span style={{ color: colors.darkGray }}>Personalized Itineraries at Your Fingertips</span>
        </h1>
        <p className="text-base md:text-xl text-gray-600 text-center max-w-3xl">
          Your Personal trip planner and travel curator, creating custom itineraries tailored to your interests and budget.
        </p>

<Link to="/create-trip">

        <button 
          className="px-8 py-4 text-base md:text-lg font-semibold text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
          style={{ backgroundColor: colors.terracotta }}
        >
          Get Started, It's Free
        </button>
</Link>

        {/* Feature Highlights */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mt-20 w-full">
          {[
            { icon: FaMapMarkedAlt, title: "Tailored Itineraries", desc: "Get personalized trip plans that match your preferences and travel goals." },
            { icon: FaWallet, title: "Budget-Friendly", desc: "Enjoy trips that are designed to fit your budget without compromise." },
            { icon: FaClock, title: "Save Time", desc: "Plan your trips effortlessly with AI doing the heavy lifting for you." },
            { icon: FaUserCheck, title: "Trusted by Travelers", desc: "Join a community of satisfied travelers who love their custom trips." }
          ].map((feature, idx) => (
            <div key={idx} className="flex flex-col items-center text-center px-4 py-6 rounded-lg hover:shadow-lg transition-shadow duration-300" style={{ backgroundColor: colors.beige }}>
              <feature.icon className="text-5xl mb-4" style={{ color: colors.terracotta }} />
              <h3 className="font-semibold text-lg md:text-xl mb-2" style={{ color: colors.darkGray }}>{feature.title}</h3>
              <p className="text-sm md:text-base text-gray-600">{feature.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Travel Styles Section */}
      <div className="py-20 px-5 md:px-20 lg:px-56" style={{ backgroundColor: colors.beige }}>
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-5xl font-bold mb-4" style={{ color: colors.darkGray }}>
            Our Travel Styles
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Choose your adventure style and let AI craft the perfect journey for you
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {travelStyles.map((style, idx) => (
            <div 
              key={idx}
              onClick={() => fetchRecommendations(style)}
              className={`bg-white rounded-xl p-6 shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 cursor-pointer border-2 ${selectedStyle === style.title ? 'border-terracotta' : 'border-transparent'}`}
            >
              <div className="text-5xl mb-4 text-center">{style.image}</div>
              <h3 className="font-bold text-xl mb-3 text-center" style={{ color: colors.darkGray }}>
                {style.title}
              </h3>
              <p className="text-gray-600 text-center text-sm">{style.desc}</p>
            </div>
          ))}
        </div>

        {/* AI Recommendations Display */}
        {(isLoading || recommendations.length > 0) && (
          <div className="mt-16 bg-white rounded-2xl p-8 shadow-xl border border-gray-100">
            <h3 className="text-2xl font-bold mb-6 text-center" style={{ color: colors.terracotta }}>
              AI Recommendations for {selectedStyle}
            </h3>
            
            {isLoading ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-terracotta"></div>
              </div>
            ) : (
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
            )}
          </div>
        )}
      </div>

      {/* How It Works Section */}
      <div className="py-20 px-5 md:px-20 lg:px-56">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold mb-4" style={{ color: colors.darkGray }}>
            How It Works
          </h2>
          <p className="text-lg text-gray-600">Three simple steps to your perfect trip</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {[
            { step: "01", title: "Share Your Preferences", desc: "Tell us your destination, budget, travel dates, and interests", icon: FaCompass },
            { step: "02", title: "AI Creates Your Plan", desc: "Our intelligent system crafts a personalized itinerary just for you", icon: FaStar },
            { step: "03", title: "Start Exploring", desc: "Get your detailed trip plan and embark on your adventure", icon: FaHeart }
          ].map((item, idx) => (
            <div key={idx} className="text-center relative">
              <div 
                className="w-20 h-20 rounded-full mx-auto mb-6 flex items-center justify-center text-white text-2xl font-bold shadow-lg"
                style={{ backgroundColor: colors.terracotta }}
              >
                <item.icon />
              </div>
              <div 
                className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-3 text-6xl font-bold opacity-10"
                style={{ color: colors.terracotta }}
              >
                {item.step}
              </div>
              <h3 className="text-xl font-bold mb-3" style={{ color: colors.darkGray }}>
                {item.title}
              </h3>
              <p className="text-gray-600">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Testimonials Section */}
      <div className="py-20 px-5 md:px-20 lg:px-56" style={{ backgroundColor: colors.beige }}>
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-5xl font-bold mb-4" style={{ color: colors.darkGray }}>
            What Travelers Say
          </h2>
          <p className="text-lg text-gray-600">Real experiences from real adventurers</p>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12">
            <div className="flex justify-center mb-4">
              {[...Array(testimonials[activeTestimonial].rating)].map((_, i) => (
                <FaStar key={i} className="text-2xl mx-1" style={{ color: colors.terracotta }} />
              ))}
            </div>
            <p className="text-xl md:text-2xl text-gray-700 text-center mb-6 italic">
              "{testimonials[activeTestimonial].text}"
            </p>
            <div className="text-center">
              <p className="font-bold text-lg" style={{ color: colors.darkGray }}>
                {testimonials[activeTestimonial].name}
              </p>
              <p className="text-gray-500">{testimonials[activeTestimonial].location}</p>
            </div>
          </div>

          <div className="flex justify-center mt-8 gap-3">
            {testimonials.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setActiveTestimonial(idx)}
                className="w-3 h-3 rounded-full transition-all duration-300"
                style={{ 
                  backgroundColor: activeTestimonial === idx ? colors.terracotta : '#D1D5DB'
                }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-20 px-5 md:px-20 lg:px-56">
        <div 
          className="rounded-3xl p-12 md:p-16 text-center shadow-2xl"
          style={{ backgroundColor: colors.darkGray }}
        >
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
            Ready to Plan Your Dream Trip?
          </h2>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Join thousands of travelers who've discovered smarter, more personalized ways to explore the world
          </p>
          <Link to="/create-trip">

          <button 
            className="px-10 py-5 text-lg font-semibold rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
            style={{ backgroundColor: colors.terracotta, color: 'white' }}
          >
            Start Planning Now
          </button>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Hero;
