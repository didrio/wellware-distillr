import React from 'react';
import { Text, View, StyleSheet, Pressable, Modal } from 'react-native';

export default function ResponseModal({ isMobileWeb, onClose, percent, response }) {
  return (
    <Modal animationType="fade" transparent={true} visible={response} onRequestClose={onClose}>
      <View style={styles.centeredView}>
        <View style={[styles.modalView, isMobileWeb && styles.mobileWebModalView]}>
          <View style={styles.percentContainer}>
            <Text
              style={styles.percentText}
            >{`Distilled to ${percent}% the length of the original.`}</Text>
          </View>
          <View style={styles.responseContainer}>
            <Text style={styles.responseText}>{response}</Text>
          </View>
          <View style={styles.closeContainer}>
            <Pressable style={styles.buttonClose} onPress={onClose}>
              <Text style={styles.closeTextStyle}>X</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
  },
  modalView: {
    backgroundColor: '#333540',
    borderRadius: 10,
    padding: 10,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    elevation: 5,
    width: 600,
    position: 'relative',
    transform: 'translateY(-50px)',
    border: '1px solid rgba(255, 255, 255, 0.6)',
  },
  mobileWebModalView: {
    width: '94%',
    padding: 0,
  },
  buttonClose: {
    justifyContent: 'center',
    alignItems: 'center',
    height: 50,
    width: 50,
    outlineColor: '#fff',
  },
  closeTextStyle: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
    fontSize: 18,
  },
  closeContainer: {
    position: 'absolute',
    top: 0,
    right: 0,
  },
  responseContainer: {
    padding: 20,
    marginBottom: 10,
  },
  responseText: {
    fontSize: 14,
    color: '#fff',
  },
  percentContainer: {
    padding: 20,
    marginTop: 10,
  },
  percentText: {
    fontSize: 14,
    color: '#fff',
    fontWeight: 'bold',
  },
});
