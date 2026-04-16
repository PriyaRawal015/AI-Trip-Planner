import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import linear_kernel
import os

# Load the dataset
# Adjusted path to account for running from the backend directory
data_path = os.path.join(os.path.dirname(__file__), '../data/destinations.csv')
destinations_df = pd.read_csv(data_path)

# Fill any NA values in categories with empty strings, just in case
destinations_df['categories'] = destinations_df['categories'].fillna('')

# Initialize TF-IDF Vectorizer to convert categories to a matrix of TF-IDF features
tfidf = TfidfVectorizer(stop_words='english')

# Construct the required TF-IDF matrix by fitting and transforming the data
tfidf_matrix = tfidf.fit_transform(destinations_df['categories'])

# Compute the cosine similarity matrix using the linear_kernel (which is equivalent to cosine similarity for TF-IDF)
cosine_sim = linear_kernel(tfidf_matrix, tfidf_matrix)

# Construct a reverse map of indices and destination IDs
indices = pd.Series(destinations_df.index, index=destinations_df['id']).drop_duplicates()

def get_recommendations(preferred_categories: str, num_recommendations: int = 3):
    """
    Given a string of preferred categories (e.g., 'beach romantic'),
    return the top `num_recommendations` destinations that match.
    """
    # Create a simple temporary DataFrame with the user's preference
    temp_df = pd.DataFrame({'id': [999], 'categories': [preferred_categories]})
    
    # Combine with original to vectorize
    combined_df = pd.concat([destinations_df, temp_df], ignore_index=True)
    
    # Re-vectorize
    temp_tfidf = tfidf.fit_transform(combined_df['categories'])
    
    # Compute similarities for the last item (the user preference) against all others
    user_sim = linear_kernel(temp_tfidf[-1:], temp_tfidf[:-1]).flatten()
    
    # Get indices of the top matches
    sim_scores = list(enumerate(user_sim))
    sim_scores = sorted(sim_scores, key=lambda x: x[1], reverse=True)
    sim_scores = sim_scores[:num_recommendations]
    
    destination_indices = [i[0] for i in sim_scores]
    
    # Return the top destinations as a list of dictionaries
    return destinations_df.iloc[destination_indices].to_dict('records')

# Example usage (uncomment to test locally)
# if __name__ == '__main__':
#     print(get_recommendations("mountain adventure", 2))
