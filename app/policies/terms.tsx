import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, spacing, radius, typography } from '@/constants/theme';

export default function TermsScreen() {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.iconBtn} onPress={() => router.back()}>
          <ChevronLeft size={22} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.topTitle}>Terms of Service</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.content}>
        <Text style={styles.paragraph}>
          Welcome to e-pola. By using our application, you agree to comply with and be bound by the following terms and conditions.
        </Text>
        <Text style={styles.heading}>1. Acceptance of Terms</Text>
        <Text style={styles.paragraph}>
          By accessing or using e-pola, you agree to be bound by these Terms of Service and all applicable laws and regulations of Sri Lanka.
        </Text>
        <Text style={styles.heading}>2. Use License</Text>
        <Text style={styles.paragraph}>
          Permission is granted to temporarily download one copy of the materials on e-pola for personal, non-commercial transitory viewing only.
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
