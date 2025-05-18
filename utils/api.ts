const API_URL = process.env.EXPO_PUBLIC_API_URL;
const API_KEY = process.env.EXPO_PUBLIC_API_KEY;

// utils/api.ts
import RNFetchBlob from 'react-native-blob-util';

const HEADERS = {
  Authorization: `Bearer ${API_KEY}`,
  'ngrok-skip-browser-warning': 'true',
  'User-Agent': 'ExpoApp/1.0',
};

/**
 * Mengambil gambar dari URL dengan header otentikasi dan mengembalikannya dalam format base64
 * @param imageUrl URL gambar yang ingin diambil
 * @returns string data URI (base64) untuk digunakan sebagai `Image.source.uri`
 */
export async function fetchImageWithAuth(imageUrl: string): Promise<string> {
  try {
    const res = await RNFetchBlob.config({ fileCache: false }).fetch('GET', imageUrl, HEADERS);
    const base64 = await res.base64();
    return `data:image/jpeg;base64,${base64}`;
  } catch (error) {
    console.error('Failed to fetch protected image:', error);
    throw error;
  }
}

export async function fetchDatasets({
  page = 1,
  pageSize = 20,
  orderBy = 'create_time',
  desc = true,
  name,
  id,
}: {
  page?: number;
  pageSize?: number;
  orderBy?: string;
  desc?: boolean;
  name?: string;
  id?: string;
} = {}) {
  try {
    const params = new URLSearchParams({
      page: page.toString(),
      page_size: pageSize.toString(),
      orderby: orderBy,
      desc: desc.toString(),
      ...(name && { name }),
      ...(id && { id }),
    });

    const response = await fetch(`${API_URL}/api/v1/datasets?${params}`, {
      headers: HEADERS,
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.code === 102) {
      return { code: data.code, data: [] };
    }

    return data;
  } catch (error) {
    console.error('Error fetching datasets:', error);
    throw error;
  }
}

export async function getDocumentsByDatasetId({
  datasetId,
  page = 1,
  pageSize = 20,
  orderBy = 'create_time',
  desc = true,
  name,
  documentId,
}: {
  datasetId: string;
  page?: number;
  pageSize?: number;
  orderBy?: string;
  desc?: boolean;
  name?: string;
  documentId?: string;
}) {
  try {
    const params = new URLSearchParams({
      page: page.toString(),
      page_size: pageSize.toString(),
      orderby: orderBy,
      desc: desc.toString(),
      ...(name && { name }),
      ...(documentId && { id: documentId }),
    });

    if (!datasetId) {
  throw new Error('datasetId is required');
}
    
    const response = await fetch(`${API_URL}/api/v1/datasets/${datasetId}/documents?${params}`, {
      headers: HEADERS,
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`);
    }

    const data = await response.json();

    if (data.code === 102) {
      return { code: data.code, message: data.message };
    }

    return data;
  } catch (error) {
    console.error('Error fetching documents:', error);
    throw error;
  }
}