// import React, { useEffect } from 'react';
import { StyleSheet, View, Button, Alert } from 'react-native';
import axios from 'axios';
import { StripeProvider, useStripe } from '@stripe/stripe-react-native';

export default function App() {
  return (
    <StripeProvider publishableKey="pk_test_51RMJkBFJCBE9lsl6ZgxFUYOStB3aejR4Xsgg6W7DSzdIRGIKVpqv9MfEWmO88GKiF3ls12eWaWQp0iQ0eOUy0CKX00f0tN7dd4">
      <PaymentScreen />
    </StripeProvider>
  );
}

const PaymentScreen = () => {
  const { initPaymentSheet, presentPaymentSheet } = useStripe();

  const fetchPaymentSheetParams = async () => {
    const response = await axios.post('http://192.168.1.3:3000/api/payment/create-payment-intent', {
      amount: 5000, // 50 USD
    });

    const { clientSecret } = response.data;
    return { clientSecret };
  };

  const initializePaymentSheet = async () => {
    const { clientSecret } = await fetchPaymentSheetParams();

    const { error } = await initPaymentSheet({
      paymentIntentClientSecret: clientSecret,
    });

    if (!error) {
      openPaymentSheet();
    } else {
      Alert.alert('Error', error.message);
    }
  };

  const openPaymentSheet = async () => {
    const { error } = await presentPaymentSheet();

    if (error) {
      Alert.alert(`Payment failed`, error.message);
    } else {
      Alert.alert('Success', 'Your payment is confirmed!');
    }
  };

  return (
    <View style={styles.container}>
      <Button title="Thanh toán $50" onPress={initializePaymentSheet} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  }
});
