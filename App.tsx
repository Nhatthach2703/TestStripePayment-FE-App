import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Button, Alert, TextInput, Text } from 'react-native';
import axios from 'axios';
import { StripeProvider, useStripe } from '@stripe/stripe-react-native';
import { STRIPE_PUBLISHABLE_KEY } from './config/env';

export default function App() {
  // const [publishableKey, setPublishableKey] = useState<string | null>(null);

  // useEffect(() => {
  //   const fetchPublishableKey = async () => {
  //     try {
  //       const response = await axios.get('http://192.168.1.3:3000/api/payment/get-publishable-key');
  //       setPublishableKey(response.data.publishableKey);
  //     } catch (error) {
  //       Alert.alert('Lỗi', 'Không thể lấy publishable key từ server');
  //     }
  //   };

  //   fetchPublishableKey();
  // }, []);

  // if (!publishableKey) {
  //   return <Text style={{ marginTop: 50, textAlign: 'center' }}>Đang tải...</Text>;
  // }

  return (
    <StripeProvider publishableKey={STRIPE_PUBLISHABLE_KEY}>
      <PaymentScreen />
    </StripeProvider>
  );
}

const PaymentScreen = () => {
  const { initPaymentSheet, presentPaymentSheet } = useStripe();

  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');

  const fetchPaymentSheetParams = async () => {
    const response = await axios.post('http://192.168.1.10:3000/api/payment/create-payment-intent', {
      amount: parseInt(amount) * 100, // Stripe sử dụng cent để tránh lỗi làm tròn số, vnd thì bth
      name,
      description,
    });

    const { clientSecret } = response.data;
    return { clientSecret };
  };

  const initializePaymentSheet = async () => {
    if (!name || !amount) {
      Alert.alert('Lỗi', 'Vui lòng nhập tên và số tiền');
      return;
    }

    try {
      const { clientSecret } = await fetchPaymentSheetParams();

      const { error } = await initPaymentSheet({
        paymentIntentClientSecret: clientSecret,
        merchantDisplayName: 'Travelmate',
        googlePay: {
          testEnv: true,
          merchantCountryCode: 'US',
        },
      });

      if (error) {
        Alert.alert('Lỗi khi khởi tạo thanh toán', error.message);
      } else {
        openPaymentSheet();
      }
    } catch (error) {
      Alert.alert('Lỗi kết nối', error.message || 'Không thể tạo thanh toán');
    }
  };

  const openPaymentSheet = async () => {
    const { error } = await presentPaymentSheet();

    if (error) {
      Alert.alert(`Thanh toán thất bại`, error.message);
    } else {
      Alert.alert('Thành công', 'Thanh toán thành công!');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Tên khách hàng:</Text>
      <TextInput
        placeholder="Nguyễn Văn A"
        style={styles.input}
        value={name}
        onChangeText={setName}
      />

      <Text style={styles.label}>Số tiền (USD):</Text>
      <TextInput
        placeholder="50"
        style={styles.input}
        keyboardType="numeric"
        value={amount}
        onChangeText={setAmount}
      />

      <Text style={styles.label}>Mô tả:</Text>
      <TextInput
        placeholder="Thanh toán tour Đà Lạt"
        style={styles.input}
        value={description}
        onChangeText={setDescription}
      />

      <Button title="Thanh toán" onPress={initializePaymentSheet} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },
  input: {
    height: 48,
    borderColor: '#ccc',
    borderWidth: 1,
    marginBottom: 12,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  label: {
    marginBottom: 4,
    fontWeight: 'bold',
  },
});
