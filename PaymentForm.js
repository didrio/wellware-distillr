import React from 'react';
import { Text, View, StyleSheet } from 'react-native';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import useFunctions from './hooks/useFunctions';

const CARD_ELEMENT_OPTIONS = {
  iconStyle: 'solid',
  style: {
    base: {
      color: '#ffffff',
      fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
      fontSmoothing: 'antialiased',
      fontSize: '16px',
      iconColor: '#c4f0ff',
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

export default function PaymentForm({ deviceId }) {
  const stripe = useStripe();
  const elements = useElements();

  const { callFunction } = useFunctions();

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    const { clientSecret } = await callFunction('createPaymentIntent');

    const result = await stripe.confirmCardPayment(clientSecret, {
      payment_method: {
        card: elements.getElement(CardElement),
      },
    });

    if (result.error) {
      // Show error to your customer (e.g., insufficient funds)
      console.log(result.error.message);
    } else {
      if (result.paymentIntent.status === 'succeeded') {
        // Show a success message to your customer
        console.log('Payment succeeded');
      }
      const confirmResult = await callFunction('confirmPurchase', {
        deviceId,
        receipt: 'receiptId',
      });
      console.log('confirm result', confirmResult);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <View style={styles.cardContainer}></View>
      <CardElement options={CARD_ELEMENT_OPTIONS} />
      <button type="submit" disabled={!stripe}>
        <Text>Pay</Text>
      </button>
    </form>
  );
}
const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: 'white',
    width: 400,
  },
});
