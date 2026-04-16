import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = import.meta.env.VITE_GOOGLE_GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey);

export const model = genAI.getGenerativeModel({
  model: "gemini-2.0-flash",
});

export const generationConfig = {
  temperature: 1,
  topP: 0.95,
  topK: 40,
  maxOutputTokens: 12000,
  responseMimeType: "application/json",
};

export const AI_PROMPT_HISTORY = [
    {
      role: "user",
      parts: [
        { text: "Generate Travel Plan for Location : Las Vegas, for 3 Days for Couple with a Cheap budget ,Give me a Hotels options list with\nHotelName, Hotel address, Price, hotel image url, geo coordinates, rating, descriptions and suggest itinerary with placeName, Place\nDetails, Place Image Url, Geo Coordinates, ticket Pricing,rating, Time travel each of the location for 3 days with each day plan with best\ntime to visit in JSON format.\n" },
      ],
    },
    {
      role: "model",
      parts: [
        { text: `Okay, here's a budget-friendly 3-day Las Vegas itinerary for a couple, along with hotel options and detailed daily plans, all in JSON format:

\`\`\`json
{
  "tripDetails": {
    "location": "Las Vegas, Nevada",
    "duration": "3 Days",
    "travelers": "Couple",
     "budget": "Cheap"
  },
  "hotelOptions": [
    {
      "hotelName": "Circus Circus Hotel & Casino",
       "hotelAddress": "2880 S Las Vegas Blvd, Las Vegas, NV 89109",
       "price": "60-120 USD per night",
      "hotelImageUrl": "https://dynamic-media-cdn.tripadvisor.com/media/photo-o/20/65/b5/2d/circus-circus-hotel-casino.jpg?w=700&h=-1&s=1",
      "geoCoordinates": {
        "latitude": 36.1360,
        "longitude": -115.1658
        },
      "rating": 3.5,
       "description": "A classic Vegas hotel with a circus theme, offering affordable rooms and a variety of entertainment including a theme park."
    },
    {
      "hotelName": "Excalibur Hotel & Casino",
      "hotelAddress": "3850 S Las Vegas Blvd, Las Vegas, NV 89109",
       "price": "70-130 USD per night",
      "hotelImageUrl": "https://dynamic-media-cdn.tripadvisor.com/media/photo-o/25/1f/87/6e/excalibur-hotel-casino.jpg?w=700&h=-1&s=1",
     "geoCoordinates": {
        "latitude": 36.0984,
        "longitude": -115.1743
      },
       "rating": 4.0,
      "description": "A medieval-themed hotel on the Strip, offering budget-friendly accommodations, a variety of dining options and a lively atmosphere."
    },
     {
      "hotelName": "OYO Hotel and Casino Las Vegas",
      "hotelAddress": "115 E Tropicana Ave, Las Vegas, NV 89109",
       "price": "50-100 USD per night",
      "hotelImageUrl": "https://dynamic-media-cdn.tripadvisor.com/media/photo-o/28/e1/56/08/oyo-hotel-casino-las-vegas.jpg?w=700&h=-1&s=1",
       "geoCoordinates": {
        "latitude": 36.1017,
        "longitude": -115.1694
        },
       "rating": 3.3,
      "description": "A value-focused option near the heart of the Strip, providing basic rooms and access to a casino, ideal for budget travelers."
    }
  ],
  "itinerary": {
    "day1": {
       "theme": "Exploring the Strip & Free Shows",
       "bestTimeToVisit": "Afternoon/Evening",
      "places": [
        {
          "placeName": "The Las Vegas Strip",
          "placeDetails": "Walk the famous Las Vegas Strip, enjoying the sights, sounds and free attractions. See the Bellagio fountains, walk through themed hotels like Caesars Palace and the Venetian.",
           "placeImageUrl": "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7c/Bellagio_Fountains_Las_Vegas.jpg/1280px-Bellagio_Fountains_Las_Vegas.jpg",
          "geoCoordinates": {
            "latitude": 36.1146,
            "longitude": -115.1728
          },
          "ticketPricing": "Free",
           "rating": 4.8,
          "timeTravel": "Walking"
        },
         {
          "placeName": "Bellagio Fountains",
           "placeDetails": "Witness the spectacular water show set to music at the Bellagio fountains. Shows run every 30 minutes in the afternoon and every 15 minutes in the evening.",
           "placeImageUrl": "https://upload.wikimedia.org/wikipedia/commons/thumb/4/42/Bellagio_Fountains_2022_04_01.jpg/1280px-Bellagio_Fountains_2022_04_01.jpg",
           "geoCoordinates": {
              "latitude": 36.1127,
              "longitude": -115.1742
            },
          "ticketPricing": "Free",
          "rating": 4.9,
          "timeTravel": "Walking (on the Strip)"
        },
        {
          "placeName": "Fremont Street Experience",
          "placeDetails": "Experience the vibrant Fremont Street in Downtown Las Vegas, featuring a light show on a canopy screen and free live music.",
           "placeImageUrl":"https://upload.wikimedia.org/wikipedia/commons/thumb/9/99/Fremont_Street_Experience_night.jpg/1280px-Fremont_Street_Experience_night.jpg",
          "geoCoordinates": {
            "latitude": 36.1707,
            "longitude": -115.1425
          },
          "ticketPricing": "Free",
           "rating": 4.6,
          "timeTravel": "15-20 minutes by car/rideshare from the Strip"
        }
      ]
    },
    "day2": {
       "theme": "Downtown History & Thrills",
      "bestTimeToVisit": "Morning/Afternoon",
      "places": [
        {
          "placeName": "The Mob Museum",
         "placeDetails": "Discover the history of organized crime in America at the Mob Museum, a highly rated historical experience.",
          "placeImageUrl": "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c9/Mob_Museum_Entrance.jpg/1280px-Mob_Museum_Entrance.jpg",
           "geoCoordinates": {
             "latitude": 36.1699,
             "longitude": -115.1416
           },
          "ticketPricing": "29.95 USD per person",
            "rating": 4.7,
          "timeTravel": "Walking from Fremont Street"
        },
         {
          "placeName": "Gold and Silver Pawn Shop",
           "placeDetails": "Visit the famous Gold and Silver Pawn Shop from the show 'Pawn Stars,' located in downtown Las Vegas.",
            "placeImageUrl":"https://upload.wikimedia.org/wikipedia/commons/thumb/e/e3/Gold_and_Silver_Pawn_Shop.jpg/1280px-Gold_and_Silver_Pawn_Shop.jpg",
           "geoCoordinates": {
             "latitude": 36.1629,
             "longitude": -115.1441
           },
          "ticketPricing": "Free to visit (purchases optional)",
           "rating": 4.2,
          "timeTravel": "5 minutes by car/rideshare from The Mob Museum"
        },
        {
          "placeName": "Container Park",
          "placeDetails": "Explore a unique open-air shopping and entertainment center made of shipping containers, featuring dining, shops and a playground.",
          "placeImageUrl": "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c3/Downtown_Container_Park_Las_Vegas.jpg/1280px-Downtown_Container_Park_Las_Vegas.jpg",
           "geoCoordinates": {
              "latitude": 36.1695,
              "longitude": -115.1402
            },
           "ticketPricing": "Free (charges for activities and food)",
            "rating": 4.5,
          "timeTravel": "Walking from the Mob Museum"
        }
      ]
    },
    "day3": {
      "theme": "Nature & Views",
      "bestTimeToVisit": "Morning/Afternoon",
      "places": [
          {
            "placeName": "Red Rock Canyon National Conservation Area",
             "placeDetails": "Take a scenic drive through Red Rock Canyon, enjoying stunning desert landscapes, hiking trails and natural beauty.",
              "placeImageUrl":"https://upload.wikimedia.org/wikipedia/commons/thumb/a6/Red_Rock_Canyon_-_Nevada_-_panoramic_view.jpg/1280px-Red_Rock_Canyon_-_Nevada_-_panoramic_view.jpg",
             "geoCoordinates": {
                "latitude": 36.1321,
                "longitude": -115.4140
                },
           "ticketPricing": "15 USD per vehicle",
           "rating": 4.8,
            "timeTravel": "20-30 minutes by car/rideshare from the Strip"
        },
       {
        "placeName": "High Roller Observation Wheel",
        "placeDetails": "Experience breathtaking panoramic views of the Las Vegas skyline and surrounding area from the High Roller.",
        "placeImageUrl":"https://upload.wikimedia.org/wikipedia/commons/thumb/1/12/High_Roller_Las_Vegas.jpg/1280px-High_Roller_Las_Vegas.jpg",
          "geoCoordinates": {
            "latitude": 36.1167,
            "longitude": -115.1699
             },
          "ticketPricing": "25-35 USD per person",
           "rating": 4.6,
         "timeTravel": "30-40 minutes by car/rideshare from Red Rock Canyon"
         }
      ]
    }
  }
}
\`\`\`
**Notes:**

*   **Prices:** Hotel and ticket prices are estimates and can vary based on the time of year, demand, and specific promotions.
*   **Transportation:**  The itinerary suggests using walking and rideshare services. Consider using public transportation (buses) for additional savings.
*   **Food:** Eating off the Strip can be more budget-friendly. Look for local restaurants and consider grocery stores for snacks and breakfast items.
*   **Flexibility:** This is a suggested itinerary, feel free to customize based on your interests.
*   **Free Entertainment:** There are many free activities to do in Vegas including the fountain shows, Bellagio Conservatory, wildlife habitats, and walking the Strip.

Enjoy your budget-friendly trip to Las Vegas! Let me know if you have any other questions.
` },
      ],
    },
  ];
