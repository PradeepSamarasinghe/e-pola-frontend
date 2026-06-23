import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, spacing, radius, typography } from '@/constants/theme';

export default function RefundScreen() {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.iconBtn} onPress={() => router.back()}>
          <ChevronLeft size={22} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.topTitle}>Refund Policy</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.content}>
        <Text style={styles.paragraph}>
          Thank you for shopping at e-pola. If you are not entirely satisfied with your purchase, we're here to help.
        </Text>
        <Text style={styles.heading}>1. Returns</Text>
        <Text style={styles.paragraph}>
          For grocery items, returns are generally not accepted due to the perishable nature of the goods, unless the items are defective or expired upon delivery. You must notify us within 24 hours of delivery.
        </Text>
        <Text style={styles.heading}>2. Refunds</Text>
        <Text style={styles.paragraph}>
          If your return is approved, we will initiate a refund to your credit card (or original method of payment) via PayHere. Cash on Delivery refunds will be issued as store credit or transferred to your bank account.
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
