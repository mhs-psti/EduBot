import { useEffect, useRef } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

export const PdfViewerWeb = ({ pdfUrl }: { pdfUrl: string }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const renderPDF = async () => {
      const loadingTask = pdfjsLib.getDocument(pdfUrl);
      const pdf = await loadingTask.promise;
      const page = await pdf.getPage(1);

      const viewport = page.getViewport({ scale: 1.5 });
      const canvas = canvasRef.current!;
      const context = canvas.getContext('2d')!;
      canvas.height = viewport.height;
      canvas.width = viewport.width;

      await page.render({ canvasContext: context, viewport }).promise;
    };

    renderPDF();
  }, [pdfUrl]);

  return <canvas ref={canvasRef} style={{ width: '100%' }} />;
};