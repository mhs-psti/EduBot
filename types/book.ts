export interface Book {
  id: string;
  title: string;
  subject: string;
  classLevel: 'VII' | 'VIII' | 'IX';
  description: string;
  coverImage: string;
  pdfUrl: string;
}