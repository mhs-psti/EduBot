import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Platform,
  SafeAreaView,
  TouchableOpacity,
  Text,
  Modal,
  ScrollView,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { ArrowLeft, Download, FileText } from 'lucide-react-native';
import { PdfViewer } from '../../../../components/pdf-viewer/PdfViewer';
import { LoadingIndicator } from '../../../../components/LoadingIndicator';
import { ErrorMessage } from '../../../../components/ErrorMessage';
import { FloatingActionButton } from '../../../../components/FloatingActionButton';
import { downloadPdf } from '../../../../utils/downloadPdf';
import { fetchPdfWithAuth, fetchDocumentChunks } from '../../../../utils/api';
import { generateDocumentSummary } from '../../../../utils/openai';
import { supabase } from '../../../../utils/app';

const API_URL = process.env.EXPO_PUBLIC_API_URL;
const BASE_DOCUMENT_URL = `${API_URL}/v1/document/get`;

export default function DocumentPreviewScreen() {
  const { id, name, dataset_id } = useLocalSearchParams<{ id: string; name?: string; dataset_id?: string }>();
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [downloading, setDownloading] = useState(false);
  const [summaryVisible, setSummaryVisible] = useState(false);
  const [summary, setSummary] = useState<string | null>(null);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [summaryError, setSummaryError] = useState<string | null>(null);
  const [addLoading, setAddLoading] = useState(false);

  useEffect(() => {
    loadDocument();
  }, [id]);

  useEffect(() => {
    if (summaryVisible && id) {
      setSummaryLoading(true);
      setSummaryError(null);
      setSummary(null);
      (async () => {
        try {
          const { data, error } = await supabase
            .from('summaries')
            .select('summary')
            .eq('document_id', id)
            .single();
          if (error) {
            if (error.code === 'PGRST116' || error.code === '406') {
              // Not found, allow add
              setSummaryError('No summary found. You can add one.');
            } else {
              setSummaryError('Failed to fetch summary');
            }
            setSummary(null);
          } else {
            setSummary(data?.summary || null);
          }
        } catch (e) {
          console.error(e);
          setSummaryError('Failed to fetch summary');
          setSummary(null);
        } finally {
          setSummaryLoading(false);
        }
      })();
    }
  }, [summaryVisible, id]);

  const loadDocument = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const pdfUrl = `${BASE_DOCUMENT_URL}/${id}`;
      setPdfUrl(pdfUrl);
      
    } catch (err: any) {
      setError(err.message || 'Failed to load document');
    } finally {
      setIsLoading(false);
    }
  };

  const handleError = (error: Error) => {
    setError('Failed to load PDF: ' + error.message);
  };

  const handleDownload = async () => {
    if (!pdfUrl || !id) return;
    setDownloading(true);
    try {
      const result = await downloadPdf(pdfUrl, id);
      if (result.success) {
        // Optionally show a success message or open the file
        if (Platform.OS === 'web') {
          const url = await fetchPdfWithAuth(pdfUrl);
          window.open(url, '_blank');
          // Optionally, revoke the object URL after some time
          setTimeout(() => window.URL.revokeObjectURL(url), 10000);
        } else {
          // Optionally use a sharing module to open the file
          // For now, just alert
          alert('PDF downloaded to: ' + result.localUri);
        }
      } else {
        alert(result.error || 'Failed to download PDF');
      }
    } catch (e) {
      alert('Failed to download PDF');
    } finally {
      setDownloading(false);
    }
  };

  async function handleGenerateSummary() {
    setAddLoading(true);
    setSummaryError(null);
  
    try {
      if (!dataset_id) {
        setSummaryError('Missing dataset_id');
        setAddLoading(false);
        return;
      }
      const data = await fetchDocumentChunks({
        datasetId: dataset_id,
        documentId: id
      });
      if (data.code !== 0) {
        setSummaryError(data.message || "Failed to fetch document chunks");
        setAddLoading(false);
        return;
      }
      const allContent = data.data.chunks.map((c: any) => c.content).join("\n\n");
  
            // 3. Generate summary with OpenAI (OpenRouter)
      const summaryText = await generateDocumentSummary(allContent);
  
      // 4. Save summary to Supabase
      const { error } = await supabase
        .from("summaries")
        .insert([{ document_id: id, summary: summaryText }]);
      if (error) {
        setSummaryError("Failed to save summary");
        setAddLoading(false);
        return;
      }
  
      setSummary(summaryText);
      setSummaryError(null);
    } catch (e: any) {
      setSummaryError(e.message || "Unexpected error");
    } finally {
      setAddLoading(false);
    }
  }

  if (isLoading) {
    return <LoadingIndicator message="Loading document..." />;
  }

  if (error) {
    return (
      <ErrorMessage
        message={error}
        onRetry={loadDocument}
      />
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <ArrowLeft size={24} color="#212121" />
        </TouchableOpacity>
        <Text style={styles.title}>{name || 'Document Preview'}</Text>
      </View>

      <View style={styles.pdfContainer}>
        <PdfViewer
          uri={pdfUrl}
          onError={handleError}
        />
      </View>
      {/* Summary Modal */}
      <Modal
        visible={summaryVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setSummaryVisible(false)}
      >
        <View style={styles.overlay}>
          <View style={styles.popup}>
            <Text style={styles.summaryTitle}>Document Summary</Text>
            {summaryLoading ? (
              <Text style={styles.summaryContent}>Loading...</Text>
            ) : summaryError && summaryError.includes('add one') ? (
              <>
                  <Text style={styles.summaryContent}>{summaryError}</Text>
                  <TouchableOpacity onPress={handleGenerateSummary} disabled={addLoading} style={[styles.addBtn, addLoading && { opacity: 0.6 }]}>
                    <Text style={styles.addBtnText}>{addLoading ? 'Generating...' : 'Generate Summary'}</Text>
                  </TouchableOpacity>
                </>
            ) : summaryError ? (
              <Text style={styles.summaryContent}>{summaryError}</Text>
            ) : (
              <ScrollView style={styles.summaryScroll} contentContainerStyle={{ paddingVertical: 4 }}>
                <Text style={styles.summaryContent}>
                  {addLoading
                    ? 'Generating...'
                    : summary
                      ? summary
                      : 'No summary available.'}
                </Text>
              </ScrollView>
            )}
            <TouchableOpacity onPress={() => setSummaryVisible(false)}>
              <Text style={styles.closeBtn}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      {/* Floating Action Buttons */}
      <View style={styles.fabStack}>
        <FloatingActionButton
          onPress={() => setSummaryVisible(true)}
          title="Summary"
          icon={<FileText color="#FFF" size={24} />}
        />
        <View style={{ height: 16 }} />
        <FloatingActionButton
          onPress={handleDownload}
          title={downloading ? 'Downloading...' : 'Download'}
          icon={<Download color="#FFF" size={24} />}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  backButton: {
    marginRight: 16,
  },
  title: {
    fontSize: 20,
    color: '#212121',
  },
  pdfContainer: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  overlay: {
    flex: 1,
    backgroundColor: '#00000088',
    justifyContent: 'center',
    alignItems: 'center',
  },
  popup: {
    backgroundColor: 'white',
    padding: 24,
    borderRadius: 16,
    width: '90%',
    maxWidth: 400,
    alignItems: 'center',
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#212121',
  },
  summaryContent: {
    fontSize: 15,
    color: '#212121',
    marginBottom: 20,
    textAlign: 'center',
  },
  closeBtn: {
    color: '#3F51B5',
    fontWeight: '600',
    fontSize: 16,
    marginTop: 8,
  },
  fabStack: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    alignItems: 'flex-end',
  },
  addBtn: {
    backgroundColor: '#3F51B5',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  addBtnText: {
    color: '#FFF',
    fontWeight: '600',
    fontSize: 16,
  },
  summaryScroll: {
    maxHeight: 240,
    width: '100%',
    marginBottom: 12,
  },
});