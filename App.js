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

import { auth } from './firebase';
import useFunctions from './hooks/useFunctions';

import MobilePurchaseModal from './MobilePurchaseModal';
import WebPurchaseModal from './WebPurchaseModal';

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

  const { callFunction } = useFunctions();

  const isWeb = Platform.OS === 'web';
  const isMobile = useMediaQuery({ query: '(max-width: 600px)' });
  const isMobileWeb = isWeb && isMobile;

  useEffect(() => {
    const handleDeviceId = async () => {
      const fetchUUID = await AsyncStorage.getItem('deviceId');
      const uuid = fetchUUID || uuidv4();
      setDeviceId(uuid);
      if (!fetchUUID) {
        await AsyncStorage.setItem('deviceId', JSON.stringify(uuid));
      }
    };
    handleDeviceId();
  }, []);

  useEffect(() => {
    const checkAuth = setInterval(async () => {
      if (deviceId && auth.currentUser) {
        const result = await callFunction('checkUserStatus', { deviceId });
        setIsPro(result.isPro);
        setRemaining(result.remaining);
        clearInterval(checkAuth);
      }
    }, 1000);
    return () => {
      clearInterval(checkAuth);
    };
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

  useEffect(() => {
    signInAnonymously(auth);
  }, []);

  const isOutOfUses = isPro !== null && !isPro && remaining <= 0;
  const clearDisabled = !url;
  const disabled = !isValidUrl(url) || isLoading || isOutOfUses;

  return (
    <View style={styles.container}>
      <View style={[styles.contentContainer, isWeb && !isMobileWeb && styles.webContentContainer]}>
        <StatusBar backgroundColor="#333540" barStyle="light-content" />
        {isPro === null ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator
              size="large"
              color="#ffffff"
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
              <Text style={styles.label}>Paste Link Below:</Text>
              <View style={styles.inputContainer}>
                <TextInput
                  onChangeText={onChangeUrl}
                  value={url}
                  style={styles.input}
                  placeholderTextColor="#888"
                  placeholder="Enter URL Address"
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
              {percent ? (
                <View style={styles.percentContainer}>
                  <Text
                    style={styles.percent}
                  >{`Distilled to ${percent}% the length of the original.`}</Text>
                </View>
              ) : null}
              {response ? (
                <View style={styles.responseContainer}>
                  <Text style={styles.response}>{response}</Text>
                </View>
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
                    <Text style={styles.getProButtonText}>Get PRO</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </KeyboardAwareScrollView>
        )}
        {modalVisible ? (
          isWeb ? (
            <WebPurchaseModal
              deviceId={deviceId}
              onClose={() => {
                setModalVisible(!modalVisible);
              }}
              visible={modalVisible}
            />
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#333540',
    alignItems: 'center',
    width: '100%',
  },
  contentContainer: {
    width: '100%',
  },
  webContentContainer: {
    marginTop: 50,
    width: 600,
  },
  scrollContainer: {
    padding: 20,
    paddingBottom: 60,
  },
  view: {
    flex: 1,
    marginTop: 65,
  },
  headerContainer: {
    marginBottom: 60,
  },
  header: {
    color: '#D1D5DA',
    fontSize: 60,
    alignSelf: 'center',
  },
  proContainer: {
    display: 'flex',
    width: '100%',
    alignItems: 'center',
    transform: 'translateY(-10px)',
  },
  proLabel: {
    color: '#FBE69E',
    fontSize: 17,
  },
  label: {
    color: '#D1D5DA',
    fontSize: 12,
    marginBottom: 10,
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
  },
  clearButton: {
    backgroundColor: '#7892c2',
    justifyContent: 'center',
    alignItems: 'center',
    height: 45,
    borderRadius: 5,
    marginLeft: 10,
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
  percentContainer: {
    marginTop: 10,
    padding: 15,
    borderRadius: 5,
  },
  responseContainer: {
    marginTop: 10,
    padding: 15,
    borderRadius: 5,
    backgroundColor: '#444654',
  },
  response: {
    color: '#D1D5DA',
    fontSize: 14,
  },
  percent: {
    color: '#D1D5DA',
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
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
    marginTop: 40,
  },
  webActivityIndicator: {
    marginTop: 300,
  },
  activityIndicatorDistill: {
    marginTop: 30,
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
});
