import React, { useState } from 'react';
import { Modal, Text, TouchableOpacity, View, StyleSheet } from 'react-native';

export const ReferenceTooltip = ({ chunk }: { chunk: any }) => {
  const [visible, setVisible] = useState(false);

  return (
    <>
  <Text onPress={() => setVisible(true)} style={styles.infoIcon}> ℹ️ </Text>
  <Modal visible={visible} transparent animationType="fade">
    <View style={styles.overlay}>
      <View style={styles.popup}>
        <Text style={styles.docName}>{chunk.document_name}</Text>
        <Text>{chunk.content}</Text>
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
    width: '85%',
  },
  docName: {
    fontWeight: 'bold',
    marginBottom: 8,
  },
  closeBtn: {
    marginTop: 12,
    color: '#3F51B5',
    textAlign: 'right',
  },
});