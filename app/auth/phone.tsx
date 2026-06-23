import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { router } from 'expo-router';
import { ChevronLeft, Phone } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';

import { sendOtp } from '@/lib/api';
import { colors, spacing, radius, typography } from '@/constants/theme';

const COUNTRY_CODES = [
  { label: '+94', country: 'LK' }
];

export default function PhoneScreen() {
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const [countryCode, setCountryCode] = useState('+94');
  const [phone, setPhone] = useState('');
  const [consent, setConsent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fullPhone = `${countryCode}${phone.replace(/\D/g, '')}`;

  async function handleSendOtp() {
    if (!phone.trim()) {
      setError(t('auth.invalidPhone'));
      return;
    }
    if (!consent) {
      setError('You must agree to the Terms of Service and Privacy Policy to continue.');
      return;
    }
    setError(null);
    setLoading(true);
    try {
      await sendOtp(fullPhone);
      router.push({ pathname: '/auth/otp', params: { phone: fullPhone } });
    } catch (e: any) {
      setError(e.message ?? 'Failed to send OTP. Check your phone number.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={[styles.container, { paddingTop: insets.top }]}>
        {/* Header */}
        <LinearGradient
          colors={[colors.primaryDark, colors.primary]}
          style={styles.header}
        >
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <ChevronLeft size={22} color={colors.text.white} />
          </TouchableOpacity>
          <View style={styles.headerIcon}>
            <Phone size={36} color={colors.text.white} />
          </View>
          <Text style={styles.headerTitle}>{t('auth.loginTitle')}</Text>
          <Text style={styles.headerSub}>
            {t('auth.loginSubtitle')}
          </Text>
        </LinearGradient>

        <ScrollView
          style={styles.body}
          contentContainerStyle={styles.bodyContent}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={styles.label}>Phone Number</Text>
          <View style={styles.phoneRow}>
            {/* Country code picker (simplified) */}
            <View style={styles.codeBox}>
              <Text style={styles.codeText}>{countryCode}</Text>
            </View>
            <TextInput
              style={styles.phoneInput}
              placeholder={t('auth.phonePlaceholder')}
              placeholderTextColor={colors.text.muted}
              keyboardType="phone-pad"
              value={phone}
              onChangeText={setPhone}
              maxLength={12}
            />
          </View>

          <Text style={styles.hint}>
            We'll send a 6-digit code to this number via SMS
          </Text>

          {error && <Text style={styles.errorText}>{error}</Text>}

          <TouchableOpacity
            style={styles.consentRow}
            onPress={() => setConsent(!consent)}
          >
            <View style={[styles.checkbox, consent && styles.checkboxChecked]}>
              {consent && <View style={styles.checkboxInner} />}
            </View>
            <Text style={styles.termsText}>
              I agree to the <Text style={styles.linkText} onPress={() => router.push('/policies/terms')}>Terms of Service</Text>,{' '}
              <Text style={styles.linkText} onPress={() => router.push('/policies/privacy')}>Privacy Policy</Text>, and consent to the storage of my phone number and address data.
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.sendBtn, (!consent || loading) && styles.sendBtnDisabled]}
            onPress={handleSendOtp}
            disabled={!consent || loading}
          >
            <Text style={styles.sendBtnText}>
              {loading ? '...' : t('auth.sendOtp')}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxxl,
    alignItems: 'center',
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  backBtn: {
    alignSelf: 'flex-start',
    marginBottom: spacing.xl,
    width: 40,
    height: 40,
    borderRadius: radius.full,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  headerTitle: {
    fontSize: typography.sizes.xxl,
    fontWeight: typography.weights.bold,
    color: colors.text.white,
    marginBottom: spacing.sm,
  },
  headerSub: {
    fontSize: typography.sizes.md,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
    lineHeight: 22,
  },
  body: {
    flex: 1,
  },
  bodyContent: {
    padding: spacing.xl,
  },
  label: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
    color: colors.text.primary,
    marginBottom: spacing.sm,
    marginTop: spacing.xl,
  },
  phoneRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  codeBox: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    justifyContent: 'center',
  },
  codeText: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
    color: colors.text.primary,
  },
  phoneInput: {
    flex: 1,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    fontSize: typography.sizes.lg,
    color: colors.text.primary,
    letterSpacing: 1,
  },
  hint: {
    fontSize: typography.sizes.sm,
    color: colors.text.muted,
    marginTop: spacing.sm,
    marginBottom: spacing.xl,
  },
  errorText: {
    color: colors.error,
    fontSize: typography.sizes.sm,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  sendBtn: {
    backgroundColor: colors.primary,
    borderRadius: radius.full,
    paddingVertical: spacing.lg,
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  sendBtnDisabled: {
    opacity: 0.6,
  },
  sendBtnText: {
    color: colors.text.white,
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.semibold,
  },
  consentRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.xl,
    paddingHorizontal: spacing.xs,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: colors.border,
    marginRight: spacing.sm,
    marginTop: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    borderColor: colors.primary,
    backgroundColor: colors.primary,
  },
  checkboxInner: {
    width: 10,
    height: 10,
    backgroundColor: colors.text.white,
  },
  termsText: {
    flex: 1,
    fontSize: typography.sizes.sm,
    color: colors.text.secondary,
    lineHeight: 20,
  },
  linkText: {
    color: colors.primary,
    fontWeight: typography.weights.medium,
  },
});
