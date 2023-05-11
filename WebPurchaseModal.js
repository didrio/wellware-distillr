import React from 'react';
import { Text, View, StyleSheet, Pressable, Modal } from 'react-native';

import PaymentForm from './PaymentForm';

export default function WebPurchaseModal({ clientSecret, deviceId, onClose, visible }) {
  return (
    <Modal animationType="fade" transparent={true} visible={visible} onRequestClose={onClose}>
      <View style={styles.centeredView}>
        <View style={styles.modalView}>
          <Text style={styles.headerText}>Purchase Distillr Pro for $4.99</Text>
          <Text style={styles.p1Text}>Use Distillr up to 15 times a day.</Text>
          <Text style={styles.p2Text}>One-time lifetime purchase, no subscription required.</Text>
          <View>
            <PaymentForm clientSecret={clientSecret} deviceId={deviceId} onClose={onClose} />
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
  headerText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 30,
    marginTop: 20,
  },
  p1Text: {
    color: '#fff',
    fontSize: 14,
    marginBottom: 10,
  },
  p2Text: {
    color: '#fff',
    fontSize: 14,
    marginBottom: 40,
  },
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
    width: 400,
    position: 'relative',
    color: '#fff',
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
