import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { CartProvider } from '@/context/CartContext';
import { AuthProvider } from '@/context/AuthContext';
import { WishlistProvider } from '@/context/WishlistContext';
import * as Sentry from '@sentry/react-native';
import '@/lib/i18n';

const sentryDsn = process.env.EXPO_PUBLIC_SENTRY_DSN;

if (sentryDsn) {
  Sentry.init({
    dsn: sentryDsn,
    tracesSampleRate: 1.0,
  });
}

function RootLayout() {
  useFrameworkReady();

  return (
    <AuthProvider>
      <WishlistProvider>
        <CartProvider>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="product/[id]" options={{ presentation: 'card' }} />
            <Stack.Screen name="cart" options={{ presentation: 'card' }} />
            <Stack.Screen name="checkout" options={{ presentation: 'card' }} />
            <Stack.Screen name="search" options={{ presentation: 'card' }} />
            <Stack.Screen name="category/[id]" options={{ presentation: 'card' }} />
            <Stack.Screen name="auth/phone" options={{ presentation: 'card' }} />
            <Stack.Screen name="auth/otp" options={{ presentation: 'card' }} />
            <Stack.Screen name="+not-found" />
          </Stack>
          <StatusBar style="auto" />
        </CartProvider>
      </WishlistProvider>
    </AuthProvider>
  );
}

export default sentryDsn ? Sentry.wrap(RootLayout) : RootLayout;
