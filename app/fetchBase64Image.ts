import { BASE_URL } from './apiConfig';
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Fetches a base64 image from /files/get/{filename}
 * Returns a data URI that can be used directly in <Image source={{ uri }} />
 *
 * @param filename - The filename returned by the backend (e.g. "profile_123.jpg")
 * @returns Promise<string> - "data:image/jpeg;base64,..." or fallback image URL
 */
export const fetchBase64Image = async (
  filename?: string | null
): Promise<string> => {
  const FALLBACK_IMAGE =
    'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTb_oySS2-AZYC97VkAwMB1NKY1Wm1qHy_CeQ&s';

  if (!filename) return FALLBACK_IMAGE;

  try {
    const token = await AsyncStorage.getItem('userToken');
    if (!token) {
      console.warn('No token found for image fetch');
      return FALLBACK_IMAGE;
    }

    const response = await fetch(`${BASE_URL}/files/get/${filename}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        // no 'Accept: application/json' — backend might send pure base64 or binary
      },
    });

    // If response is not OK, fallback
    if (!response.ok) {
      console.warn(`Image fetch failed: ${response.status}`);
      return FALLBACK_IMAGE;
    }

    // 🧠 Handle backend returning pure base64 or a JSON structure
    const contentType = response.headers.get('content-type');

    if (contentType?.includes('application/json')) {
      const json = await response.json();

      if (json.success && typeof json.data === 'string' && json.data.trim()) {
        // Prefer to use correct MIME type if backend provides it
        const mimeType = json.mime_type || 'image/jpeg';
        return `data:${mimeType};base64,${json.data}`;
      } else {
        console.warn('Invalid JSON structure for image:', json);
        return FALLBACK_IMAGE;
      }
    } else {
      // 🧩 If backend sends raw base64 text (no JSON)
      const base64Data = await response.text();
      if (base64Data && base64Data.trim().length > 100) {
        return `data:image/jpeg;base64,${base64Data.trim()}`;
      } else {
        console.warn('Empty or invalid base64 text data');
        return FALLBACK_IMAGE;
      }
    }
  } catch (error) {
    console.error('Error fetching base64 image:', error);
    return FALLBACK_IMAGE;
  }
};
