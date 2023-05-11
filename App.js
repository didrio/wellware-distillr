import React, { useEffect, useState } from 'react';
import {
  Text,
  TextInput,
  TouchableOpacity,
  View,
  StyleSheet,
  Keyboard,
  Alert,
  ActivityIndicator,
  StatusBar,
  Platform,
} from 'react-native';
import { signInAnonymously } from 'firebase/auth';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import AsyncStorage from '@react-native-async-storage/async-storage';
import 'react-native-get-random-values';
import { v4 as uuidv4 } from 'uuid';
import { useMediaQuery } from 'react-responsive';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import FingerprintJS from '@fingerprintjs/fingerprintjs';
import Constants from 'expo-constants';

import { auth } from './firebase';
import useFunctions from './hooks/useFunctions';

import MobilePurchaseModal from './MobilePurchaseModal';
import ResponseModal from './ResponseModal';
import WebPurchaseModal from './WebPurchaseModal';

const fpPromise = FingerprintJS.load({ monitoring: false });

const isLiveEnvironment = Constants.manifest.extra.IS_LIVE_ENVIRONMENT;
const stripePublishableKey = isLiveEnvironment
  ? Constants.manifest.extra.STRIPE_PUBLISHABLE_KEY_LIVE
  : Constants.manifest.extra.STRIPE_PUBLISHABLE_KEY_TEST;
const stripePromise = loadStripe(stripePublishableKey);

const isValidUrl = (urlString) => {
  const urlPattern = new RegExp(
    '^(https?:\\/\\/)?' + // validate protocol
      '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|' + // validate domain name
      '((\\d{1,3}\\.){3}\\d{1,3}))' + // validate OR ip (v4) address
      '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' + // validate port and path
      '(\\?[;&a-z\\d%_.~+=-]*)?' + // validate query string
      '(\\#[-a-z\\d_]*)?$',
    'i'
  ); // validate fragment locator
  return !!urlPattern.test(urlString);
};

export default function App() {
  const [url, setUrl] = useState('');
  const [response, setResponse] = useState('');
  const [percent, setPercent] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [inputError, setInputError] = useState('');
  const [isPro, setIsPro] = useState(null);
  const [remaining, setRemaining] = useState(null);
  const [deviceId, setDeviceId] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [clientSecret, setClientSecret] = useState('');

  const { callFunction } = useFunctions();

  const isWeb = Platform.OS === 'web';
  const isMobile = useMediaQuery({ query: '(max-width: 600px)' });
  const isMobileWeb = isWeb && isMobile;

  useEffect(() => {
    const handlePaymentIntent = async () => {
      const { clientSecret } = await callFunction('createPaymentIntent', { isLiveEnvironment });
      setClientSecret(clientSecret);
    };
    if (!clientSecret) {
      handlePaymentIntent();
    }
  }, [callFunction, clientSecret]);

  useEffect(() => {
    const handleDeviceId = async () => {
      const fetchUUID = await AsyncStorage.getItem('deviceId');
      let uuid = fetchUUID;
      if (!uuid && isWeb) {
        const fp = await fpPromise;
        const result = await fp.get();
        uuid = result.visitorId;
      } else if (!uuid) {
        uuid = uuidv4();
      }
      setDeviceId(uuid);
      if (!fetchUUID) {
        await AsyncStorage.setItem('deviceId', uuid);
      }
    };
    handleDeviceId();
  }, [isWeb]);

  useEffect(() => {
    const checkAuth = async () => {
      if (deviceId && auth.currentUser) {
        const result = await callFunction('checkUserStatus', { deviceId });
        setIsPro(result.isPro);
        setRemaining(result.remaining);
      }
    };
    checkAuth();
  }, [deviceId, callFunction]);

  const onChangeUrl = (value) => {
    setUrl(value);
    if (value && !isValidUrl(value)) {
      setInputError('Invalid URL');
    } else {
      setInputError('');
    }
  };

  const clearInput = () => {
    setUrl('');
  };

  const handleDistill = async () => {
    if ((isPro || remaining > 0) && deviceId && isValidUrl(url) && !isLoading && auth.currentUser) {
      setIsLoading(true);
      Keyboard.dismiss();
      try {
        const result = await callFunction('distill', { deviceId, url });
        if (!result) {
          throw Error('No result from distill call.');
        }
        if (typeof result.percent === 'string' && result.percent) {
          setPercent(result.percent);
        }
        if (typeof result.text === 'string' && result.text) {
          setResponse(result.text);
        }
        setRemaining(result.remaining);
      } catch (error) {
        console.error(error);
        Alert.alert('Error', 'Could not process request');
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleCloseResponse = () => {
    setResponse('');
    setPercent('');
  };

  useEffect(() => {
    signInAnonymously(auth);
  }, []);

  const isOutOfUses = isPro !== null && !isPro && remaining <= 0;
  const clearDisabled = !url;
  const disabled = !isValidUrl(url) || isLoading || isOutOfUses;

  const stripeAppearance = {
    theme: 'stripe',
  };
  const stripeOptions = {
    clientSecret,
    appearance: stripeAppearance,
  };

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.contentContainer,
          isWeb && !isMobileWeb && styles.webContentContainer,
          isWeb && response && styles.webResponse,
        ]}
      >
        <StatusBar backgroundColor="#333540" barStyle="light-content" />
        {isPro === null ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator
              size="large"
              color="#fff"
              style={[styles.activityIndicator, isWeb && styles.webActivityIndicator]}
            />
          </View>
        ) : (
          <KeyboardAwareScrollView
            contentContainerStyle={styles.scrollContainer}
            keyboardShouldPersistTaps="always"
          >
            <View style={styles.view}>
              <View style={styles.headerContainer}>
                <Text style={styles.header}>Distillr</Text>
                {isPro ? (
                  <View style={styles.proContainer}>
                    <Text style={styles.proLabel}>PRO</Text>
                  </View>
                ) : null}
              </View>
              <View>
                <Text style={styles.taglineText}>
                  A ChatGPT-powered tool that gives a concise summary of any URL provided.
                </Text>
              </View>
              <View style={styles.inputContainer}>
                <TextInput
                  onChangeText={onChangeUrl}
                  value={url}
                  style={styles.input}
                  placeholderTextColor="#888"
                  placeholder="Paste Link Here"
                />
                <TouchableOpacity
                  onPress={clearDisabled ? null : clearInput}
                  style={[styles.clearButton, clearDisabled && styles.disabledClearButton]}
                  disabled={clearDisabled}
                >
                  <Text style={styles.clearButtonText}>Clear</Text>
                </TouchableOpacity>
              </View>
              {inputError ? <Text style={styles.errorText}>{inputError}</Text> : null}
              {isLoading ? (
                <ActivityIndicator
                  size="large"
                  color="#ffffff"
                  style={styles.activityIndicatorDistill}
                />
              ) : (
                <View>
                  <TouchableOpacity
                    onPress={disabled ? null : handleDistill}
                    disabled={disabled}
                    style={[styles.generateButton, disabled && styles.disabledButton]}
                  >
                    <Text style={styles.generateButtonText}>Distill</Text>
                  </TouchableOpacity>
                </View>
              )}
              {response ? (
                <ResponseModal
                  isMobileWeb={isMobileWeb}
                  onClose={handleCloseResponse}
                  percent={percent}
                  response={response}
                />
              ) : null}
              {isPro ? null : (
                <View style={styles.nonProContainer}>
                  <View style={styles.remainingContainer}>
                    <Text style={[styles.remainingText, isOutOfUses && styles.remainingTextOut]}>
                      You have {remaining} daily {remaining == 1 ? 'use' : 'uses'} left.
                    </Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => setModalVisible(true)}
                    style={styles.getProButton}
                  >
                    <Text style={styles.getProButtonText}>Get Pro</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </KeyboardAwareScrollView>
        )}
        {modalVisible && clientSecret ? (
          isWeb ? (
            <Elements options={stripeOptions} stripe={stripePromise}>
              <WebPurchaseModal
                clientSecret={clientSecret}
                deviceId={deviceId}
                onClose={() => {
                  setModalVisible(!modalVisible);
                }}
                visible={modalVisible}
              />
            </Elements>
          ) : (
            <MobilePurchaseModal
              deviceId={deviceId}
              onClose={() => {
                setModalVisible(!modalVisible);
              }}
              visible={modalVisible}
            />
          )
        ) : null}
      </View>
      <Text style={styles.policyText}>
        No Data Collection Policy - We value your privacy. We want to assure you that our app,
        Distillr, does not collect, use, or share any personal data or information from its users.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#333540',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  contentContainer: {
    width: '100%',
  },
  webContentContainer: {
    width: 600,
    marginTop: -200,
  },
  scrollContainer: {
    padding: 20,
  },
  view: {
    flex: 1,
  },
  headerContainer: {
    marginBottom: 15,
  },
  header: {
    color: '#fff',
    fontSize: 60,
    alignSelf: 'center',
  },
  proContainer: {
    display: 'flex',
    width: '100%',
    alignItems: 'center',
    transform: 'translateY(-5px)',
  },
  proLabel: {
    color: '#FBE69E',
    fontSize: 17,
    fontWeight: 600,
  },
  inputContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    backgroundColor: '#444654',
    color: '#D1D5DA',
    paddingHorizontal: 15,
    height: 45,
    borderRadius: 5,
    outlineColor: '#fff',
  },
  clearButton: {
    backgroundColor: '#7892c2',
    justifyContent: 'center',
    alignItems: 'center',
    height: 45,
    borderRadius: 5,
    marginLeft: 10,
    outlineColor: '#fff',
  },
  clearButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
    paddingHorizontal: 10,
  },
  generateButton: {
    backgroundColor: '#7892c2',
    justifyContent: 'center',
    alignItems: 'center',
    height: 50,
    borderRadius: 5,
    marginTop: 20,
  },
  disabledButton: {
    opacity: 0.2,
  },
  disabledClearButton: {
    opacity: 0.2,
  },
  generateButtonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: 'bold',
  },
  errorText: {
    color: '#f1322D',
    fontSize: 12,
    marginTop: 5,
    fontWeight: 'bold',
  },
  loadingContainer: {
    width: '100%',
    height: '100%',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  activityIndicator: {
    transform: 'translateY(-140px)',
  },
  webActivityIndicator: {
    marginTop: 300,
  },
  activityIndicatorDistill: {
    marginTop: 50,
  },
  nonProContainer: {
    marginTop: 10,
  },
  remainingContainer: {
    paddingLeft: 10,
    paddingRight: 10,
    paddingTop: 5,
    paddingBottom: 5,
    borderRadius: 3,
    alignSelf: 'center',
    marginBottom: 10,
    marginTop: 30,
  },
  remainingText: {
    color: '#D1D5DA',
    fontSize: 14,
  },
  remainingTextOut: {
    color: '#f1322D',
    fontWeight: 'bold',
  },
  getProButton: {
    backgroundColor: '#7892c2',
    justifyContent: 'center',
    alignItems: 'center',
    height: 50,
    borderRadius: 5,
    marginBottom: 30,
  },
  getProButtonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: 'bold',
  },
  policyText: {
    color: '#fff',
    fontSize: 13,
    textAlign: 'center',
    position: 'fixed',
    bottom: 10,
    padding: 10,
  },
  taglineText: {
    color: '#fff',
    fontSize: 13,
    textAlign: 'center',
    marginBottom: 30,
  },
});
