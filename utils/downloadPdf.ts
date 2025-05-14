import * as FileSystem from 'expo-file-system';
import { Platform } from 'react-native';

interface DownloadResult {
  success: boolean;
  localUri?: string;
  error?: string;
}

export const downloadPdf = async (
  pdfUrl: string,
  bookId: string
): Promise<DownloadResult> => {
  // For web platform, return the PDF URL directly
  if (Platform.OS === 'web') {
    return { success: true, localUri: pdfUrl };
  }

  try {
    const fileUri = `${FileSystem.cacheDirectory}${bookId}.pdf`;
    
    // Check if file already exists
    const fileInfo = await FileSystem.getInfoAsync(fileUri);
    
    if (fileInfo.exists) {
      return { success: true, localUri: fileUri };
    }
    
    // Download file
    const downloadResumable = FileSystem.createDownloadResumable(
      pdfUrl,
      fileUri,
      {},
      (downloadProgress) => {
        const progress = downloadProgress.totalBytesWritten / downloadProgress.totalBytesExpectedToWrite;
        // You can use this progress value to update a progress indicator if needed
      }
    );
    
    const { uri } = await downloadResumable.downloadAsync();
    
    return { success: true, localUri: uri };
  } catch (error) {
    console.error('Error downloading PDF:', error);
    return { 
      success: false, 
      error: 'Failed to download PDF. Please check your internet connection and try again.' 
    };
  }
};