import 'dotenv/config';

export default {
  expo: {
    name: 'wellware-distillr',
    slug: 'wellware-distillr',
    version: '1.0.0',
    orientation: 'portrait',
    icon: './assets/icon.png',
    userInterfaceStyle: 'light',
    splash: {
      image: './assets/splash.png',
      resizeMode: 'contain',
      backgroundColor: '#ffffff',
    },
    assetBundlePatterns: ['**/*'],
    ios: {
      supportsTablet: true,
      bundleIdentifier: 'com.abhpro.wellwaredistillr',
    },
    android: {
      adaptiveIcon: {
        foregroundImage: './assets/adaptive-icon.png',
        backgroundColor: '#ffffff',
      },
      package: 'com.abhpro.wellwaredistillr',
    },
    web: {
      favicon: './assets/favicon.png',
    },
    extra: {
      eas: {
        projectId: '8152337d-0139-4da6-92b3-75990435d7bc',
      },
      STRIPE_PUBLISHABLE_KEY_TEST: process.env.STRIPE_PUBLISHABLE_KEY_TEST,
      STRIPE_PUBLISHABLE_KEY_LIVE: process.env.STRIPE_PUBLISHABLE_KEY_LIVE,
      IS_LIVE_ENVIRONMENT: process.env.IS_LIVE_ENVIRONMENT === 'true',
    },
  },
};
