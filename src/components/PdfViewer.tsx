import { useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  ChevronLeft,
  ChevronRight,
  RotateCw,
  ZoomIn,
  ZoomOut,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.js',
  import.meta.url,
).toString();

interface PdfViewerProps {
  fileUrl: string;
}

const PdfViewer = ({ fileUrl }: PdfViewerProps) => {
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [scale, setScale] = useState(1.0);
  const [rotation, setRotation] = useState(0);
  const { toast } = useToast();

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    setPageNumber(1);
  };

  const onDocumentLoadError = (error: Error) => {
    console.error('Error while loading document:', error);
    toast({
      title: 'Error',
      description: 'Failed to load PDF file. The file might be corrupted or the URL is incorrect.',
      variant: 'destructive',
    });
  };

  const goToPrevPage = () =>
    setPageNumber((prevPageNumber) => Math.max(prevPageNumber - 1, 1));

  const goToNextPage = () =>
    setPageNumber((prevPageNumber) =>
      Math.min(prevPageNumber + 1, numPages || 1)
    );

  const handlePageInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newPage = Number(e.target.value);
    if (newPage > 0 && newPage <= (numPages || 1)) {
      setPageNumber(newPage);
    }
  };

  return (
    <div className="w-full flex flex-col items-center">
      <div className="bg-gray-100 dark:bg-gray-800 p-2 rounded-lg mb-4 w-full flex flex-wrap items-center justify-center gap-2">
        <Button onClick={goToPrevPage} disabled={pageNumber <= 1} size="sm">
          <ChevronLeft className="h-4 w-4" />
          Prev
        </Button>
        <div className="flex items-center gap-1">
          <span>Page</span>
          <Input
            type="number"
            value={pageNumber}
            onChange={handlePageInputChange}
            className="w-16 h-8 text-center"
            min={1}
            max={numPages || 1}
          />
          <span>of {numPages || '...'}</span>
        </div>
        <Button onClick={goToNextPage} disabled={pageNumber >= (numPages || 1)} size="sm">
          Next
          <ChevronRight className="h-4 w-4" />
        </Button>
        <div className="flex items-center gap-2 ml-4">
          <Button onClick={() => setScale(s => s - 0.2)} size="icon" variant="outline">
            <ZoomOut className="h-4 w-4" />
          </Button>
          <span className="text-sm font-medium">{Math.round(scale * 100)}%</span>
          <Button onClick={() => setScale(s => s + 0.2)} size="icon" variant="outline">
            <ZoomIn className="h-4 w-4" />
          </Button>
          <Button onClick={() => setRotation(r => (r + 90) % 360)} size="icon" variant="outline">
            <RotateCw className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <div
        className="overflow-auto w-full border rounded-lg bg-gray-50"
        style={{ maxHeight: 'calc(100vh - 200px)' }}
      >
        <Document
          file={fileUrl}
          onLoadSuccess={onDocumentLoadSuccess}
          onLoadError={onDocumentLoadError}
          loading={<p>Loading PDF...</p>}
          error={<p>Error loading PDF.</p>}
          className="flex justify-center"
        >
          <Page
            pageNumber={pageNumber}
            scale={scale}
            rotate={rotation}
            renderTextLayer={true}
            renderAnnotationLayer={true}
          />
        </Document>
      </div>
    </div>
  );
};

export default PdfViewer;