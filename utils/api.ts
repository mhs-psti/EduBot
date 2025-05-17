const API_URL = process.env.EXPO_PUBLIC_API_URL;
const API_KEY = process.env.EXPO_PUBLIC_API_KEY;

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
      headers: {
        Authorization: `Bearer ${API_KEY}`,
      },
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

export async function fetchDocuments(datasetId: string) {
  const res = await fetch(`${API_URL}/api/v1/datasets/${datasetId}/documents?page=1&page_size=20`, {
    headers: { Authorization: `Bearer ${API_KEY}` },
  });
  const json = await res.json();
  return json.data?.docs || [];
}