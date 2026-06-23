import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, spacing, radius, typography } from '@/constants/theme';

export default function PrivacyScreen() {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.iconBtn} onPress={() => router.back()}>
          <ChevronLeft size={22} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.topTitle}>Privacy Policy</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.content}>
        <Text style={styles.paragraph}>
          Your privacy is important to us. It is e-pola's policy to respect your privacy regarding any information we may collect from you across our application.
        </Text>
        <Text style={styles.heading}>1. Information We Collect</Text>
        <Text style={styles.paragraph}>
          We only ask for personal information when we truly need it to provide a service to you, such as your phone number and delivery address to fulfill your orders.
        </Text>
        <Text style={styles.heading}>2. How We Use Information</Text>
        <Text style={styles.paragraph}>
          We use the information we collect to operate and maintain our app, process your transactions, and communicate with you about your orders.
        </Text>
        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  topBar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: spacing.lg, paddingVertical: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.border
  },
  iconBtn: { width: 40, height: 40, borderRadius: radius.full, backgroundColor: colors.surfaceAlt, alignItems: 'center', justifyContent: 'center' },
  topTitle: { fontSize: typography.sizes.xl, fontWeight: typography.weights.bold, color: colors.text.primary },
  content: { padding: spacing.xl },
  heading: { fontSize: typography.sizes.lg, fontWeight: typography.weights.bold, color: colors.text.primary, marginTop: spacing.lg, marginBottom: spacing.sm },
  paragraph: { fontSize: typography.sizes.md, color: colors.text.secondary, lineHeight: 24 }
});
