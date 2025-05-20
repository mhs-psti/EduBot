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
  const response = await fetch(imageUrl, {
    headers: HEADERS,
  });

  const blob = await response.blob();
  return await blobToBase64(blob);
}

export async function fetchPdfWithAuth(pdfUrl: string): Promise<string> {
  const response = await fetch(pdfUrl, {
    headers: HEADERS,
  });

  const blob = await response.blob();
  return URL.createObjectURL(blob);
}

function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = () => {
      resolve(reader.result as string);
    };
    reader.readAsDataURL(blob);
  });
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

export async function fetchInitialMessage({
  page = 1,
  pageSize = 20,
  orderBy = 'create_time',
  desc = true,
  name, // now required
  id,
}: {
  page?: number;
  pageSize?: number;
  orderBy?: string;
  desc?: boolean;
  name: string; // ← required now
  id?: string;
}) {
  try {
    const params = new URLSearchParams({
      page: page.toString(),
      page_size: pageSize.toString(),
      orderby: orderBy,
      desc: desc.toString(),
      name, // ← always included
      ...(id && { id }),
    });

    const response = await fetch(`${API_URL}/api/v1/chats?${params}`, {
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
    console.error('Error fetching chats:', error);
    throw error;
  }
}

export async function sendChatMessage({
  chatId,
  question,
  sessionId,
  userId
}: {
  chatId: string;
  question: string;
  sessionId?: string;
  userId?: string;
}) {
  const response = await fetch(`${API_URL}/api/v1/chats/${chatId}/completions`, {
    method: 'POST',
    headers: HEADERS,
    body: JSON.stringify({
      question,
      stream: false,
      ...(sessionId ? { session_id: sessionId } : {}),
      ...(userId ? { user_id: userId } : {}),
    }),
  });

  const result = await response.json();

  if (result.code === 0 && typeof result.data === 'string') {
    // Parse inner JSON string (note: might need to strip "data:" prefix)
    const cleaned = result.data.replace(/^data:/, '');
    const parsed = JSON.parse(cleaned);

    return parsed.data; // { answer, session_id, etc. }
  }

  throw new Error(result.message || 'Failed to get chat response');
}