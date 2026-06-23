import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { ChevronLeft, ShieldCheck } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { verifyOtp, sendOtp } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { colors, spacing, radius, typography } from '@/constants/theme';

const OTP_LENGTH = 6;

export default function OtpScreen() {
  const insets = useSafeAreaInsets();
  const { phone } = useLocalSearchParams<{ phone: string }>();
  const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(''));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resendCooldown, setResendCooldown] = useState(30);
  const inputRefs = useRef<Array<TextInput | null>>(Array(OTP_LENGTH).fill(null));
  const { signIn } = useAuth();

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const t = setTimeout(() => setResendCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [resendCooldown]);

  function handleDigit(text: string, index: number) {
    const digit = text.replace(/\D/g, '').slice(-1);
    const next = [...otp];
    next[index] = digit;
    setOtp(next);
    if (digit && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  }

  function handleKeyPress(key: string, index: number) {
    if (key === 'Backspace' && !otp[index] && index > 0) {
      const next = [...otp];
      next[index - 1] = '';
      setOtp(next);
      inputRefs.current[index - 1]?.focus();
    }
  }

  async function handleVerify() {
    const token = otp.join('');
    if (token.length < OTP_LENGTH) {
      setError('Please enter all 6 digits');
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const result = await verifyOtp(phone!, token);
      await signIn(phone!, result.token || 'dummy_token', result.user);
      router.replace('/(tabs)/profile');
    } catch (e: any) {
      setError(e.message ?? 'Invalid code. Please try again.');
      setOtp(Array(OTP_LENGTH).fill(''));
      inputRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  }

  async function handleResend() {
    if (resendCooldown > 0) return;
    try {
      await sendOtp(phone!);
      setResendCooldown(30);
      setError(null);
    } catch {
      setError('Failed to resend. Please try again.');
    }
  }

  const isComplete = otp.every((d) => d !== '');

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
            <ShieldCheck size={36} color={colors.text.white} />
          </View>
          <Text style={styles.headerTitle}>Verify Code</Text>
          <Text style={styles.headerSub}>
            We sent a 6-digit code to{'\n'}
            <Text style={styles.phoneHighlight}>{phone}</Text>
          </Text>
        </LinearGradient>

        <View style={styles.body}>
          {/* OTP boxes */}
          <View style={styles.otpRow}>
            {otp.map((digit, i) => (
              <TextInput
                key={i}
                ref={(el) => { inputRefs.current[i] = el; }}
                style={[styles.otpBox, digit && styles.otpBoxFilled]}
                value={digit}
                onChangeText={(t) => handleDigit(t, i)}
                onKeyPress={({ nativeEvent }) => handleKeyPress(nativeEvent.key, i)}
                keyboardType="number-pad"
                maxLength={1}
                textAlign="center"
                selectionColor={colors.primary}
              />
            ))}
          </View>

          {error && <Text style={styles.errorText}>{error}</Text>}

          <TouchableOpacity
            style={[
              styles.verifyBtn,
              (!isComplete || loading) && styles.verifyBtnDisabled,
            ]}
            onPress={handleVerify}
            disabled={!isComplete || loading}
          >
            <Text style={styles.verifyBtnText}>
              {loading ? 'Verifying...' : 'Verify & Sign In'}
            </Text>
          </TouchableOpacity>

          <View style={styles.resendRow}>
            <Text style={styles.resendLabel}>Didn't receive a code? </Text>
            <TouchableOpacity onPress={handleResend} disabled={resendCooldown > 0}>
              <Text
                style={[
                  styles.resendLink,
                  resendCooldown > 0 && styles.resendLinkDisabled,
                ]}
              >
                {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
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
    lineHeight: 24,
  },
  phoneHighlight: {
    fontWeight: typography.weights.bold,
    color: colors.text.white,
  },
  body: {
    flex: 1,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xxxl,
  },
  otpRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.sm,
    marginBottom: spacing.xl,
  },
  otpBox: {
    width: 48,
    height: 56,
    borderRadius: radius.md,
    borderWidth: 2,
    borderColor: colors.border,
    fontSize: typography.sizes.xxl,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
    backgroundColor: colors.surface,
  },
  otpBoxFilled: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryMuted,
  },
  errorText: {
    color: colors.error,
    fontSize: typography.sizes.sm,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  verifyBtn: {
    backgroundColor: colors.primary,
    borderRadius: radius.full,
    paddingVertical: spacing.lg,
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  verifyBtnDisabled: {
    opacity: 0.5,
  },
  verifyBtnText: {
    color: colors.text.white,
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.semibold,
  },
  resendRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  resendLabel: {
    color: colors.text.secondary,
    fontSize: typography.sizes.md,
  },
  resendLink: {
    color: colors.primary,
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
  },
  resendLinkDisabled: {
    color: colors.text.muted,
  },
});
