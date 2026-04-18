import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AI_PROMPT, SelectBudgetOptions, SelectTravelsList } from '@/constants/options';
import { model, generationConfig, AI_PROMPT_HISTORY } from '@/service/AIModel';
import { generateFallbackPlan } from '@/service/FallbackPlanner';
import React, { useEffect, useState } from 'react'
import GooglePlacesAutocomplete from 'react-google-places-autocomplete'
import { toast } from 'sonner';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
} from "@/components/ui/dialog"

import { FcGoogle } from "react-icons/fc";
import { useGoogleLogin } from '@react-oauth/google';
import axios from 'axios';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '@/service/firebaseConfig';

import { AiOutlineLoading3Quarters } from "react-icons/ai";
import { useNavigate } from 'react-router-dom';
import { FaMapMarkerAlt, FaCalendarAlt, FaWallet, FaUsers } from 'react-icons/fa';

// Color palette
const colors = {
  terracotta: '#B25E39',
  darkGray: '#473D3A',
  beige: '#F3F3F3'
};

function CreateTrip() {
  const [place, setPlace]=useState();
  const [sourcePlace, setSourcePlace]=useState();
  const [formData, setFormData]=useState([]);
  const [openDialog, setOpenDialog]=useState(false);

  const [loading, setLoading]=useState(false);

  const navigate=useNavigate();

  const handleInputChange=(name,value)=>{
    setFormData({
      ...formData,
      [name]:value
    })
  }

  useEffect(()=>{
    console.log(formData)
  },[formData])

  useEffect(() => {
    if (formData?.startDate && formData?.endDate) {
      const start = new Date(formData.startDate);
      const end = new Date(formData.endDate);
      const diffTime = end - start;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
      
      if (diffDays > 0 && formData?.noOfDays !== diffDays.toString()) {
        setFormData(prev => ({
          ...prev,
          noOfDays: diffDays.toString()
        }));
      }
    }
  }, [formData?.startDate, formData?.endDate]);

  const OnGenerateTrip=async()=>{

    const user=localStorage.getItem('user');
    if(!user)
    {
      setOpenDialog(true)
      return;
    }

    if (!formData?.location || !formData?.budget || !formData?.traveler || !formData?.sourceLocation || !formData?.startDate || !formData?.endDate) {
      toast("Please fill all details including your travel dates")
      return;
    }

    const start = new Date(formData.startDate);
    const end = new Date(formData.endDate);
    if (end < start) {
      toast("End date cannot be before start date");
      return;
    }

    if (formData?.noOfDays > 10) {
      toast("We currently support trips up to 10 days only")
      return;
    }

    setLoading(true);
    const FINAL_PROMPT=AI_PROMPT
    .replace('{location}',formData?.location?.label)
    .replace('{traveler}',formData?.traveler)
    .replace('{budget}',formData?.budget)
    .replaceAll('{totalDays}',formData?.noOfDays)

    // ── Step 1: Try Gemini (one silent attempt, no retries) ──────────────────
    let geminiSucceeded = false;
    try {
      const chatSession = model.startChat({
        generationConfig,
        history: AI_PROMPT_HISTORY,
      });
      const result = await chatSession.sendMessage(FINAL_PROMPT);
      const tripText = result?.response?.text();
      if (tripText) {
        console.log("-- Gemini succeeded:", tripText);
        geminiSucceeded = true;
        await SaveAiTrip(tripText);
        return;
      }
    } catch (error) {
      // Silently swallow the Gemini error — fallback will handle it
      console.warn("Gemini unavailable, switching to rule-based planner:", error?.message);
    }

    // ── Step 2: Rule-Based Fallback ──────────────────────────────────────────
    if (!geminiSucceeded) {
      try {
        toast('Generating your itinerary...');
        const fallbackTrip = await generateFallbackPlan({
          location: formData?.location?.label,
          noOfDays: formData?.noOfDays,
          budget: formData?.budget,
          traveler: formData?.traveler,
        });
        console.log("-- Fallback Trip Data:", fallbackTrip);
        await SaveAiTrip(fallbackTrip);
      } catch (fallbackError) {
        console.error("Fallback planner also failed:", fallbackError);
        toast.error("Could not generate a trip plan. Please check your internet connection and try again.");
        setLoading(false);
      }
    }
  }

  const SaveAiTrip=async(TripData)=>{
    setLoading(true)
    const user=JSON.parse(localStorage.getItem('user'));
    const docId=Date.now().toString();
    await setDoc(doc(db, "AITrip", docId), {
      userSelection:formData,
      tripData:JSON.parse(TripData),
      userEmail:user?.email,
      id:docId
    });
    setLoading(false);
    navigate('/view-trip/' + docId)
  }

  const login = useGoogleLogin({
    onSuccess: (tokenResponse) => {
      console.log("Login successful:", tokenResponse);
      GetUserProfile(tokenResponse);
    },
    onError: (error) => console.error("Login failed:", error),
  });
  
  const GetUserProfile = (tokenInfo) => {
    axios
      .get(`https://www.googleapis.com/oauth2/v1/userinfo?access_token=${tokenInfo?.access_token}`, {
        headers: {
          Authorization: `Bearer ${tokenInfo?.access_token}`,
          Accept: 'application/json',
        },
      })
      .then((response) => {
        console.log("User profile:", response.data);
        localStorage.setItem('user', JSON.stringify(response.data));
        setOpenDialog(false);
        OnGenerateTrip();
      })
      .catch((error) => {
        console.error("Failed to fetch user profile:", error);
      });
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: colors.beige }}>
      <div className='sm:px-10 md:px-32 lg:px-56 xl:px-72 px-5 py-10'>
        
        {/* Header Section with modern card */}
        <div className="bg-white rounded-3xl shadow-lg p-8 md:p-12 mb-8">
          <div className="text-center">
            <h2 className='font-bold text-3xl md:text-5xl mb-4' style={{ color: colors.darkGray }}>
              Tell us your travel preferences 🌴
            </h2>
            <p className='text-lg md:text-xl text-gray-600 max-w-3xl mx-auto'>
              Just provide some basic information, and our trip planner will generate a customized itinerary based on your preferences.
            </p>
          </div>

          {/* Progress Indicator */}
          <div className="flex justify-center mt-8">
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4].map((step, idx) => (
                <React.Fragment key={step}>
                  <div 
                    className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-white text-sm"
                    style={{ 
                      backgroundColor: Object.keys(formData).length >= step ? colors.terracotta : '#D1D5DB' 
                    }}
                  >
                    {step}
                  </div>
                  {idx < 3 && (
                    <div 
                      className="w-8 md:w-12 h-1 rounded"
                      style={{ 
                        backgroundColor: Object.keys(formData).length > step ? colors.terracotta : '#D1D5DB' 
                      }}
                    />
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>

        {/* Form Sections */}
        <div className='flex flex-col gap-8'>
          
          {/* Source Location Section */}
          <div className="bg-white rounded-2xl shadow-md p-6 md:p-8">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: `${colors.terracotta}20` }}>
                <FaMapMarkerAlt className="text-xl" style={{ color: colors.terracotta }} />
              </div>
              <h2 className='text-xl md:text-2xl font-semibold' style={{ color: colors.darkGray }}>
                What is your current location? (Source)
              </h2>
            </div>
            <GooglePlacesAutocomplete
              apiKey={import.meta.env.VITE_GOOGLE_PLACE_API_KEY}
              selectProps={{
                place: sourcePlace,
                onChange:(v)=>{setSourcePlace(v); handleInputChange('sourceLocation', v)},
                styles: {
                  control: (provided) => ({
                    ...provided,
                    padding: '6px',
                    borderRadius: '12px',
                    borderColor: formData?.sourceLocation ? colors.terracotta : '#D1D5DB',
                    borderWidth: '2px',
                    '&:hover': {
                      borderColor: colors.terracotta
                    }
                  })
                }
              }}
            />
          </div>

          {/* Destination Section */}
          <div className="bg-white rounded-2xl shadow-md p-6 md:p-8">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: `${colors.terracotta}20` }}>
                <FaMapMarkerAlt className="text-xl" style={{ color: colors.terracotta }} />
              </div>
              <h2 className='text-xl md:text-2xl font-semibold' style={{ color: colors.darkGray }}>
                What is your destination of choice?
              </h2>
            </div>
            <GooglePlacesAutocomplete
              apiKey={import.meta.env.VITE_GOOGLE_PLACE_API_KEY}
              selectProps={{
                place,
                onChange:(v)=>{setPlace(v); handleInputChange('location', v)},
                styles: {
                  control: (provided) => ({
                    ...provided,
                    padding: '6px',
                    borderRadius: '12px',
                    borderColor: formData?.location ? colors.terracotta : '#D1D5DB',
                    borderWidth: '2px',
                    '&:hover': {
                      borderColor: colors.terracotta
                    }
                  })
                }
              }}
            />
          </div>



          {/* Budget Section */}
          <div className="bg-white rounded-2xl shadow-md p-6 md:p-8">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: `${colors.terracotta}20` }}>
                <FaWallet className="text-xl" style={{ color: colors.terracotta }} />
              </div>
              <h2 className='text-xl md:text-2xl font-semibold' style={{ color: colors.darkGray }}>
                What is your budget?
              </h2>
            </div>
            <div className='grid grid-cols-1 md:grid-cols-3 gap-4 mt-5'>
              {SelectBudgetOptions.map((item,index)=>(
                <div key={index}
                  onClick={()=>handleInputChange('budget', item.title)}
                  className='p-6 border-2 cursor-pointer rounded-xl hover:shadow-lg transition-all duration-300'
                  style={{
                    borderColor: formData?.budget==item.title ? colors.terracotta : '#E5E7EB',
                    backgroundColor: formData?.budget==item.title ? `${colors.terracotta}10` : 'white',
                    transform: formData?.budget==item.title ? 'scale(1.02)' : 'scale(1)'
                  }}
                > 
                  <h2 className='text-4xl mb-3'>{item.icon}</h2>
                  <h2 className='font-bold text-lg mb-2' style={{ color: colors.darkGray }}>{item.title}</h2>
                  <h2 className='text-sm text-gray-600 font-medium'>{item.desc}</h2>
                </div>
              ))}
            </div>
          </div>

          {/* Travel Dates Section */}
          <div className="bg-white rounded-2xl shadow-md p-6 md:p-8">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: `${colors.terracotta}20` }}>
                <FaCalendarAlt className="text-xl" style={{ color: colors.terracotta }} />
              </div>
              <h2 className='text-xl md:text-2xl font-semibold' style={{ color: colors.darkGray }}>
                When are you planning to travel?
              </h2>
            </div>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-6 mt-5'>
              <div className='flex flex-col gap-2'>
                <label className='text-sm font-semibold' style={{ color: colors.darkGray }}>📅 Start Date</label>
                <Input 
                  type="date"
                  onChange={(e)=>handleInputChange('startDate', e.target.value)}
                  className="text-lg p-6 rounded-xl"
                  style={{
                    borderColor: formData?.startDate ? colors.terracotta : '#D1D5DB',
                    borderWidth: '2px'
                  }}
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>
              <div className='flex flex-col gap-2'>
                <label className='text-sm font-semibold' style={{ color: colors.darkGray }}>📅 End Date</label>
                <Input 
                  type="date"
                  onChange={(e)=>handleInputChange('endDate', e.target.value)}
                  className="text-lg p-6 rounded-xl"
                  style={{
                    borderColor: formData?.endDate ? colors.terracotta : '#D1D5DB',
                    borderWidth: '2px'
                  }}
                  min={formData?.startDate || new Date().toISOString().split('T')[0]}
                />
              </div>
            </div>
            {formData?.noOfDays > 0 && (
              <p className='mt-4 text-sm font-medium' style={{ color: colors.terracotta }}>
                Total Duration: <strong>{formData.noOfDays} Days</strong>
              </p>
            )}
          </div>
          
          {/* Travelers Section */}
          <div className="bg-white rounded-2xl shadow-md p-6 md:p-8">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: `${colors.terracotta}20` }}>
                <FaUsers className="text-xl" style={{ color: colors.terracotta }} />
              </div>
              <h2 className='text-xl md:text-2xl font-semibold' style={{ color: colors.darkGray }}>
                Who do you plan on traveling with?
              </h2>
            </div>
            <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-5'>
              {SelectTravelsList.map((item,index)=>(
                <div key={index} 
                  onClick={()=>{
                    if(item.title !== 'Family') {
                      handleInputChange('traveler', item.people)
                    }
                  }}
                  className='p-6 border-2 cursor-pointer rounded-xl hover:shadow-lg transition-all duration-300'
                  style={{
                    borderColor: (formData?.traveler==item.people || (item.title == 'Family' && formData?.traveler?.includes('Family'))) ? colors.terracotta : '#E5E7EB',
                    backgroundColor: (formData?.traveler==item.people || (item.title == 'Family' && formData?.traveler?.includes('Family'))) ? `${colors.terracotta}10` : 'white',
                    transform: (formData?.traveler==item.people || (item.title == 'Family' && formData?.traveler?.includes('Family'))) ? 'scale(1.02)' : 'scale(1)'
                  }}
                > 
                  <h2 className='text-4xl mb-3'>{item.icon}</h2>
                  <h2 className='font-bold text-base mb-2' style={{ color: colors.darkGray }}>{item.title}</h2>
                  {item.title === 'Family' ? (
                    <div onClick={(e)=>e.stopPropagation()}>
                      <Input 
                        type="number" 
                        placeholder="Members"
                        min="1"
                        onChange={(e)=>handleInputChange('traveler', `Family of ${e.target.value} People`)}
                        className="mt-2 h-10 border-gray-300 focus:border-orange-400"
                      />
                    </div>
                  ) : (
                    <h2 className='text-sm text-gray-600'>{item.desc}</h2>
                  )}
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Generate Button */}
        <div className='my-10 flex justify-center'>
          <Button 
            disabled={loading} 
            onClick={OnGenerateTrip}
            className="px-10 py-6 text-lg font-semibold rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
            style={{ 
              backgroundColor: colors.terracotta,
              color: 'white'
            }}
          >
            {loading ? (
              <div className="flex items-center gap-3">
                <AiOutlineLoading3Quarters className='h-6 w-6 animate-spin'/>
                <span>Generating Your Trip...</span>
              </div>
            ) : (
              'Generate My Perfect Trip'
            )}
          </Button>
        </div>

      </div>

      {/* Sign In Dialog */}
      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogDescription>
              <div className="text-center">
                <div className="mb-6">
                  <div 
                    className="w-16 h-16 rounded-full mx-auto flex items-center justify-center text-white text-2xl font-bold"
                    style={{ backgroundColor: colors.terracotta }}
                  >
                    ✈️
                  </div>
                </div>
                <h2 className='font-bold text-2xl mb-3' style={{ color: colors.darkGray }}>
                  Sign In with Google
                </h2>
                <p className='text-gray-600 mb-6'>
                  Sign in to the app with Google authentication securely
                </p>

                <Button 
                  onClick={login} 
                  className="w-full py-6 text-base font-semibold rounded-xl flex gap-3 items-center justify-center hover:shadow-lg transition-all"
                  style={{
                    backgroundColor: 'white',
                    color: colors.darkGray,
                    border: `2px solid ${colors.terracotta}`
                  }}
                > 
                  <FcGoogle className='h-7 w-7'/> 
                  Sign In With Google 
                </Button>
              </div>
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>

    </div>
  )
}

export default CreateTrip