import React, { useState, useEffect } from 'react';
import { Modal, Text, TouchableOpacity, View, StyleSheet } from 'react-native';

const API_URL = process.env.EXPO_PUBLIC_API_URL;
const BASE_IMAGE_URL = `${API_URL}/v1/document/image`;

export const ReferenceTooltip = ({ chunk }: { chunk: any }) => {
  const [visible, setVisible] = useState(false);
  const [imageUri, setImageUri] = useState<string | null>(null);

  useEffect(() => {
    if (visible && chunk.image_id) {
      const imageUrl = `${BASE_IMAGE_URL}/${chunk.image_id}`;
      fetchImageWithAuth(imageUrl)
        .then((base64) => setImageUri(`data:image/png;base64,${base64}`))
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
        {imageUri && (
              <Image
                source={{ uri: imageUri }}
                style={{ width: '100%', height: 200, marginBottom: 12, borderRadius: 6 }}
                resizeMode="contain"
              />
            )}
        <Text style={styles.chunkContent}>{chunk.content}</Text>
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
  },
  docName: {
    fontFamily: 'Inter-Bold', // ganti sesuai font yang kamu pakai
    fontSize: 16,
    marginBottom: 8,
  },
  chunkContent: {
    fontFamily: 'Inter-Regular',
    fontSize: 15,
    lineHeight: 22,
    color: '#212121',
  },
  closeBtn: {
    marginTop: 12,
    color: '#3F51B5',
    fontWeight: '600',
    textAlign: 'right',
    fontSize: 14,
  },
});