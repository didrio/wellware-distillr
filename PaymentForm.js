import React, { useState } from 'react';
import { Text, View, StyleSheet, Linking, ActivityIndicator } from 'react-native';
import {
  CardNumberElement,
  CardExpiryElement,
  CardCvcElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import Constants from 'expo-constants';

import useFunctions from './hooks/useFunctions';

const isLiveEnvironment = Constants.manifest.extra.IS_LIVE_ENVIRONMENT;

const openEmailClient = () => {
  const email = 'abhpro@gmail.com';
  const subject = 'Payment or membership issue';
  const body = 'Please describe your issue here:';
  const url = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(
    body
  )}`;

  Linking.canOpenURL(url).then((supported) => {
    if (supported) {
      Linking.openURL(url);
    } else {
      console.log("Can't open email client");
    }
  });
};

const createOptions = (fontSize, color) => {
  return {
    style: {
      base: {
        fontSize: fontSize + 'px',
        color: color,
        fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
        fontSmoothing: 'antialiased',
        '::placeholder': {
          color: '#aaaaaa',
        },
      },
      invalid: {
        color: '#ff0000',
        iconColor: '#fa755a',
      },
    },
  };
};

export default function PaymentForm({ clientSecret, deviceId, onClose }) {
  const [processing, setProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showSucceededMessage, setShowSucceededMessage] = useState(false);

  const stripe = useStripe();
  const elements = useElements();

  const { callFunction } = useFunctions();

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setProcessing(true);

    const card = elements.getElement(CardNumberElement);
    const result = await stripe.confirmCardPayment(clientSecret, {
      payment_method: { card },
    });

    if (result.error) {
      setErrorMessage(`Error: ${result.error.message}`);
    } else {
      const confirmResponse = await callFunction('confirmPurchase', {
        deviceId,
        receipt: result.paymentIntent.id,
        isLiveEnvironment,
      });
      if (result.paymentIntent.status === 'succeeded' && confirmResponse.success) {
        setShowSucceededMessage(true);
        setTimeout(onClose, 4000);
      }
    }

    setProcessing(false);
  };

  return (
    <form onSubmit={handleSubmit}>
      <View style={styles.cardContainer}>
        <Text>Card number:</Text>
        <CardNumberElement options={createOptions(16, '#333')} />
      </View>
      <View style={styles.cardContainer}>
        <Text>Expiration date:</Text>
        <CardExpiryElement options={createOptions(16, '#333')} />
      </View>
      <View style={styles.cardContainer}>
        <Text>CVC:</Text>
        <CardCvcElement options={createOptions(16, '#333')} />
      </View>
      {showSucceededMessage ? null : processing ? (
        <ActivityIndicator size="large" color="#fff" style={styles.activityIndicator} />
      ) : (
        <button style={styles.payButton} type="submit" disabled={!stripe || processing}>
          <Text style={styles.payText}>Pay</Text>
        </button>
      )}
      <View style={styles.supportInfo}>
        <Text style={styles.contactText}>
          <Text>If you experience any issues with your payment or membership, please </Text>
          <Text onClick={openEmailClient} style={styles.email}>
            contact us
          </Text>
          <Text>.</Text>
        </Text>
      </View>
      {showSucceededMessage ? (
        <View style={styles.succeededContainer}>
          <Text style={styles.succeededText}>Payment Succeeded!</Text>
        </View>
      ) : null}
      {errorMessage ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{errorMessage}</Text>
        </View>
      ) : null}
    </form>
  );
}

const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: 'white',
    marginBottom: 20,
  },
  supportInfo: {
    marginTop: 20,
  },
  email: {
    color: '#7892c2',
    textDecorationLine: 'underline',
    fontWeight: 'bold',
  },
  contactText: {
    color: '#fff',
    marginBottom: 10,
  },
  succeededContainer: {
    marginTop: 30,
    alignItems: 'center',
    marginBottom: 20,
  },
  succeededText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  errorContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
  errorText: {
    marginBottom: 10,
    color: '#f1322D',
    fontWeight: 'bold',
    fontSize: 17,
  },
  payButton: {
    backgroundColor: '#7892c2',
    justifyContent: 'center',
    alignItems: 'center',
    height: 50,
    borderRadius: 5,
    width: '100%',
    border: 'none',
    cursor: 'pointer',
  },
  payText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 17,
  },
  activityIndicator: {
    marginBottom: 40,
    marginTop: 40,
  },
});
