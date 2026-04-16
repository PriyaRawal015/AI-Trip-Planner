export const getRecommendations = async (preferences, numRecommendations = 3) => {
  try {
    const response = await fetch('http://127.0.0.1:8000/api/recommend', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        preferences,
        num_recommendations: numRecommendations,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Could not fetch recommendations:", error);
    return [];
  }
};
