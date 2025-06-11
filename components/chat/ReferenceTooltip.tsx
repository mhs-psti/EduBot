import React, { useState, useEffect } from 'react';
import { Modal, Text, TouchableOpacity, View, Image, StyleSheet, ScrollView } from 'react-native';
import { fetchImageWithAuth } from '../../utils/api';

const API_URL = process.env.EXPO_PUBLIC_API_URL;
const BASE_IMAGE_URL = `${API_URL}/v1/document/image`;

// Component to render formatted text
const FormattedText = ({ content }: { content: string }) => {
  const renderFormattedContent = () => {
    const lines = content.split('\n');
    const elements: React.ReactNode[] = [];
    
    lines.forEach((line, index) => {
      const trimmedLine = line.trim();
      
      // Skip empty lines
      if (!trimmedLine) {
        elements.push(<Text key={index} style={styles.lineBreak}>{'\n'}</Text>);
        return;
      }
      
      // Handle headings (### text)
      if (trimmedLine.startsWith('###')) {
        const headingText = trimmedLine.replace(/^###\s*/, '');
        elements.push(
          <Text key={index} style={styles.heading}>
            {headingText}{'\n'}
          </Text>
        );
        return;
      }
      
      // Handle page markers (--- Page X ---)
      if (trimmedLine.startsWith('---') && trimmedLine.includes('Page')) {
        elements.push(
          <Text key={index} style={styles.pageMarker}>
            {trimmedLine}{'\n'}
          </Text>
        );
        return;
      }
      
      // Handle numbered lists (1. 2. 3. etc.)
      if (/^\d+\.\s/.test(trimmedLine)) {
        const listText = parseInlineFormatting(trimmedLine);
        elements.push(
          <Text key={index} style={styles.numberedList}>
            {listText}{'\n'}
          </Text>
        );
        return;
      }
      
      // Handle lettered sub-lists (a. b. c. etc.)
      if (/^[a-z]\.\s/.test(trimmedLine)) {
        const listText = parseInlineFormatting(trimmedLine);
        elements.push(
          <Text key={index} style={styles.letteredList}>
            {listText}{'\n'}
          </Text>
        );
        return;
      }
      
      // Handle regular paragraphs
      const formattedText = parseInlineFormatting(trimmedLine);
      elements.push(
        <Text key={index} style={styles.paragraph}>
          {formattedText}{'\n'}
        </Text>
      );
    });
    
    return elements;
  };
  
  // Parse inline formatting like **bold text**
  const parseInlineFormatting = (text: string) => {
    const parts = text.split(/(\*\*[^*]+\*\*)/g);
    return parts.map((part, index) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        const boldText = part.slice(2, -2);
        return (
          <Text key={index} style={styles.boldText}>
            {boldText}
          </Text>
        );
      }
      return part;
    });
  };
  
  return <View>{renderFormattedContent()}</View>;
};

export const ReferenceTooltip = ({ chunk }: { chunk: any }) => {
  const [visible, setVisible] = useState(false);
  const [imageUri, setImageUri] = useState<string | null>(null);

  useEffect(() => {
    if (visible && chunk.image_id) {
      const imageUrl = `${BASE_IMAGE_URL}/${chunk.image_id}`;
      fetchImageWithAuth(imageUrl)
        .then((base64) => setImageUri(base64))
        .catch(console.error);
    }
  }, [visible, chunk.image_id]);

  return (
    <>
  <Text onPress={() => setVisible(true)} style={styles.infoIcon}> ℹ️ </Text>
  <Modal visible={visible} transparent animationType="fade">
    <View style={styles.overlay}>
      <View style={styles.popup}>
        <Text style={styles.docName}>{chunk.document_name}</Text>
        <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {imageUri && (
                <Image
                  source={{ uri: imageUri }}
                  style={{ width: '100%', height: 200, marginBottom: 12, borderRadius: 6 }}
                  resizeMode="contain"
                />
              )}
          <FormattedText content={chunk.content} />
        </ScrollView>
        <TouchableOpacity onPress={() => setVisible(false)}>
          <Text style={styles.closeBtn}>Tutup</Text>
        </TouchableOpacity>
      </View>
    </View>
  </Modal>
</>
  );
};

const styles = StyleSheet.create({
  infoIcon: { fontSize: 16 },
  overlay: {
    flex: 1,
    backgroundColor: '#00000088',
    justifyContent: 'center',
    alignItems: 'center',
  },
  popup: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    width: '90%',
    maxHeight: '80%',
  },
  docName: {
    fontWeight: 'bold',
    fontSize: 16,
    fontFamily: 'System',
    marginBottom: 8,
  },
  scrollContent: {
    flex: 1,
    marginBottom: 8,
  },
  // Formatted text styles
  heading: {
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: 'System',
    color: '#212121',
    marginTop: 8,
    marginBottom: 4,
  },
  paragraph: {
    fontSize: 15,
    lineHeight: 22,
    fontFamily: 'System',
    color: '#212121',
    marginBottom: 4,
  },
  numberedList: {
    fontSize: 15,
    lineHeight: 22,
    fontFamily: 'System',
    color: '#212121',
    marginBottom: 4,
    fontWeight: '500',
  },
  letteredList: {
    fontSize: 15,
    lineHeight: 22,
    fontFamily: 'System',
    color: '#212121',
    marginBottom: 2,
    marginLeft: 16,
  },
  boldText: {
    fontWeight: 'bold',
    fontFamily: 'System',
  },
  pageMarker: {
    fontSize: 13,
    fontFamily: 'System',
    color: '#757575',
    fontStyle: 'italic',
    textAlign: 'center',
    marginVertical: 8,
  },
  lineBreak: {
    height: 8,
  },
  closeBtn: {
    marginTop: 12,
    color: '#3F51B5',
    fontWeight: '600',
    fontFamily: 'System',
    textAlign: 'right',
    fontSize: 14,
  },
});