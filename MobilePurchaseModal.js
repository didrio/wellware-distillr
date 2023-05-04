import React, { useEffect, useState } from 'react';
import {
  Text,
  View,
  StyleSheet,
  Pressable,
  Modal,
  Platform,
  ActivityIndicator,
} from 'react-native';
import Purchases from 'react-native-purchases';

import useFunctions from './hooks/useFunctions';

const API_KEYS = {
  apple: 'appl_tPkYIIXEKhtnNGVcHaHiTaznWSA',
  google: 'goog_wkpzLifedLKoLssweohYSVcuxgQ',
};

export default function PurchaseModal({ deviceId, onClose, visible }) {
  const [showPurchaseError, setShowPurchaseError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const { callFunction } = useFunctions();

  useEffect(() => {
    const setup = async () => {
      console.log('Purchases', Purchases);
      if (Purchases) {
        Purchases.setDebugLogsEnabled(true);
        if (Platform.OS == 'android') {
          await Purchases.configure({ apiKey: API_KEYS.google });
        } else {
          await Purchases.configure({ apiKey: API_KEYS.apple });
        }
        setIsLoading(false);
      } else {
        onClose();
      }
    };
    setup().catch(console.log);
  }, [onClose]);

  const handlePurchase = () => {
    setIsLoading(true);
    const purchase = async () => {
      if (Purchases) {
        try {
          let purchaseResult;
          if (Platform.OS == 'android') {
            purchaseResult = await Purchases.purchaseProduct('distillr.pro.1');
          } else {
            purchaseResult = await Purchases.purchaseProduct('pro');
          }
          console.log('purchase result', purchaseResult);
          const confirmResult = await callFunction('confirmPurchase', {
            deviceId,
            receipt: purchaseResult?.receipt ?? 'receiptId',
          });
          console.log('confirm result', confirmResult);
          if (!confirmResult.success) {
            throw Error('Unable to confirm purchase.');
          }
        } catch (error) {
          console.error('Error when purchasing:', error.message);
          setShowPurchaseError(true);
        }
      }
      onClose();
    };
    purchase();
  };

  return (
    <Modal animationType="fade" transparent={true} visible={visible} onRequestClose={onClose}>
      <View style={styles.centeredView}>
        <View style={styles.modalView}>
          <View></View>
          {isLoading ? (
            <View>
              <ActivityIndicator size="large" color="#ffffff" style={styles.activityIndicator} />
            </View>
          ) : (
            <View style={styles.purchaseContainer}>
              {showPurchaseError ? (
                <Text style={styles.errorText}>Error when making purchase.</Text>
              ) : null}
              <Text style={[styles.modalText, styles.modalTextStrong]}>Distillr PRO - $4.99</Text>
              <Text style={styles.modalText}>
                Purchase PRO access and get unlimited daily uses.
              </Text>
              <Text style={styles.modalText}>One-time purchase, no subscription.</Text>
              <Pressable style={[styles.button, styles.buttonPurchase]} onPress={handlePurchase}>
                <Text style={styles.textStyle}>Purchase</Text>
              </Pressable>
            </View>
          )}
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
    width: '80%',
    position: 'relative',
  },
  purchaseContainer: {
    paddingTop: 25,
    width: '100%',
  },
  buttonClose: {
    justifyContent: 'center',
    alignItems: 'center',
    height: 50,
    width: 50,
  },
  buttonPurchase: {
    backgroundColor: '#7892c2',
    justifyContent: 'center',
    alignItems: 'center',
    height: 50,
    borderRadius: 5,
    marginTop: 30,
    width: '100%',
  },
  textStyle: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
    fontSize: 17,
  },
  closeTextStyle: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
    fontSize: 18,
  },
  modalText: {
    color: '#D1D5DA',
    textAlign: 'center',
    marginBottom: 10,
  },
  modalTextStrong: {
    fontWeight: 'bold',
    marginBottom: 25,
    fontSize: 17,
  },
  errorText: {
    marginBottom: 30,
    color: '#D1322D',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  activityIndicator: {
    marginTop: 30,
    marginBottom: 30,
  },
  closeContainer: {
    position: 'absolute',
    top: 0,
    right: 0,
  },
});
