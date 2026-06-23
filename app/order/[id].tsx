import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity, Linking, Alert } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { ChevronLeft, MapPin, CheckCircle, Package, Truck, Clock } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { getOrderById } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { colors, spacing, radius, typography } from '@/constants/theme';
import { formatLKR } from '@/lib/utils';

export default function OrderTrackingScreen() {
  const { id } = useLocalSearchParams();
  const insets = useSafeAreaInsets();
  const { session } = useAuth();
  
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchOrder() {
      if (!session) return;
      try {
        const data = await getOrderById(id as string, session.access_token);
        setOrder(data);
      } catch (err) {
        setError('Failed to load order details');
      } finally {
        setLoading(false);
      }
    }
    fetchOrder();
  }, [id, session]);

  if (loading) {
    return (
      <View style={[styles.container, styles.centered, { paddingTop: insets.top }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (error || !order) {
    return (
      <View style={[styles.container, styles.centered, { paddingTop: insets.top }]}>
        <Text style={styles.errorText}>{error || 'Order not found'}</Text>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backBtnText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const statuses = [
    { key: 'pending', label: 'Order Placed', icon: Clock },
    { key: 'preparing', label: 'Preparing', icon: Package },
    { key: 'out_for_delivery', label: 'Out for Delivery', icon: Truck },
    { key: 'delivered', label: 'Delivered', icon: CheckCircle },
  ];

  const currentStatusIndex = statuses.findIndex(s => s.key === order.fulfillmentStatus);

  const openTracking = async () => {
    if (order.thirdPartyDelivery?.trackingUrl) {
      const supported = await Linking.canOpenURL(order.thirdPartyDelivery.trackingUrl);
      if (supported) {
        await Linking.openURL(order.thirdPartyDelivery.trackingUrl);
      } else {
        Alert.alert("Error", "Cannot open tracking URL");
      }
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Top bar */}
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.iconBtn} onPress={() => router.back()}>
          <ChevronLeft size={22} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.topTitle}>Order Tracking</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.content}>
        <View style={styles.card}>
          <Text style={styles.orderIdLabel}>Order ID: {order._id.substring(order._id.length - 8).toUpperCase()}</Text>
          <Text style={styles.totalValue}>{formatLKR(order.totalValue)}</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Status Tracking</Text>
          <View style={styles.timeline}>
            {statuses.map((s, index) => {
              const isActive = index <= currentStatusIndex;
              const isLast = index === statuses.length - 1;
              const Icon = s.icon;
              return (
                <View key={s.key} style={styles.timelineRow}>
                  <View style={styles.timelineIconContainer}>
                    <View style={[styles.iconCircle, isActive && styles.iconCircleActive]}>
                      <Icon size={18} color={isActive ? colors.text.white : colors.text.muted} />
                    </View>
                    {!isLast && <View style={[styles.line, isActive && styles.lineActive]} />}
                  </View>
                  <View style={styles.timelineTextContainer}>
                    <Text style={[styles.statusLabel, isActive && styles.statusLabelActive]}>{s.label}</Text>
                  </View>
                </View>
              );
            })}
          </View>

          {order.thirdPartyDelivery?.trackingUrl && (
            <TouchableOpacity style={styles.trackBtn} onPress={openTracking}>
              <Text style={styles.trackBtnText}>Track Driver on Map</Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.card}>
          <View style={styles.addressHeader}>
            <MapPin size={18} color={colors.primary} />
            <Text style={styles.sectionTitle}>Delivery Address</Text>
          </View>
          <Text style={styles.addressText}>{order.deliveryAddress?.street}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  centered: { justifyContent: 'center', alignItems: 'center' },
  topBar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: spacing.lg, paddingVertical: spacing.md,
  },
  iconBtn: {
    width: 40, height: 40, borderRadius: radius.full, backgroundColor: colors.surfaceAlt,
    alignItems: 'center', justifyContent: 'center',
  },
  topTitle: { fontSize: typography.sizes.xl, fontWeight: typography.weights.bold, color: colors.text.primary },
  content: { padding: spacing.lg, gap: spacing.md },
  card: { backgroundColor: colors.surface, borderRadius: radius.xl, padding: spacing.lg },
  orderIdLabel: { fontSize: typography.sizes.md, color: colors.text.secondary },
  totalValue: { fontSize: typography.sizes.xxl, fontWeight: typography.weights.bold, color: colors.primary, marginTop: spacing.xs },
  sectionTitle: { fontSize: typography.sizes.lg, fontWeight: typography.weights.bold, color: colors.text.primary, marginBottom: spacing.md },
  addressHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.xs },
  addressText: { fontSize: typography.sizes.md, color: colors.text.secondary, lineHeight: 22 },
  errorText: { fontSize: typography.sizes.lg, color: colors.error, marginBottom: spacing.md },
  backBtn: { backgroundColor: colors.primary, paddingHorizontal: spacing.xl, paddingVertical: spacing.md, borderRadius: radius.full },
  backBtnText: { color: colors.text.white, fontSize: typography.sizes.md, fontWeight: typography.weights.bold },
  timeline: { marginVertical: spacing.sm },
  timelineRow: { flexDirection: 'row', alignItems: 'flex-start' },
  timelineIconContainer: { alignItems: 'center', width: 40 },
  iconCircle: { width: 32, height: 32, borderRadius: 16, backgroundColor: colors.surfaceAlt, alignItems: 'center', justifyContent: 'center', zIndex: 2 },
  iconCircleActive: { backgroundColor: colors.primary },
  line: { width: 2, height: 40, backgroundColor: colors.border, marginTop: -4, marginBottom: -4, zIndex: 1 },
  lineActive: { backgroundColor: colors.primary },
  timelineTextContainer: { flex: 1, marginLeft: spacing.md, paddingTop: 4 },
  statusLabel: { fontSize: typography.sizes.md, color: colors.text.muted, fontWeight: typography.weights.medium },
  statusLabelActive: { color: colors.text.primary, fontWeight: typography.weights.bold },
  trackBtn: { backgroundColor: colors.primary, borderRadius: radius.full, paddingVertical: spacing.md, alignItems: 'center', marginTop: spacing.lg },
  trackBtnText: { color: colors.text.white, fontSize: typography.sizes.md, fontWeight: typography.weights.bold },
});
