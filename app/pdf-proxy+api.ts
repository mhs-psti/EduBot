import { type Readable } from 'node:stream';

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const pdfUrl = url.searchParams.get('url');
    
    if (!pdfUrl) {
      return new Response('PDF URL is required', { status: 400 });
    }

    const response = await fetch(pdfUrl);
    
    if (!response.ok) {
      throw new Error(`PDF fetch failed: ${response.status} ${response.statusText}`);
    }

    // Get the PDF content
    const pdfContent = await response.arrayBuffer();

    // Return the PDF with appropriate headers
    return new Response(pdfContent, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Length': pdfContent.byteLength.toString(),
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'public, max-age=3600'
      }
    });
  } catch (error: any) {
    console.error('PDF proxy error:', error);
    return new Response(`Failed to fetch PDF: ${error.message}`, { status: 500 });
  }
}