import React from 'react';
import { Text, View, StyleSheet, Pressable, Modal } from 'react-native';

import PaymentForm from './PaymentForm';

export default function WebPurchaseModal({ deviceId, onClose, visible }) {
  return (
    <Modal animationType="fade" transparent={true} visible={visible} onRequestClose={onClose}>
      <View style={styles.centeredView}>
        <View style={styles.modalView}>
          <View>
            <PaymentForm deviceId={deviceId} />
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
    marginTop: 22,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalView: {
    margin: 20,
    backgroundColor: '#333540',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    elevation: 5,
    height: 400,
    width: 400,
    position: 'relative',
  },
  buttonClose: {
    justifyContent: 'center',
    alignItems: 'center',
    height: 50,
    width: 50,
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
});
