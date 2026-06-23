import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import {
  User,
  ChevronRight,
  LogOut,
  Package,
  MapPin,
  CreditCard,
  Bell,
  HelpCircle,
  Phone,
} from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { getOrders } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { colors, spacing, radius, typography } from '@/constants/theme';
import { formatLKR } from '@/lib/utils';

type Order = {
  id: string;
  total: number;
  status: string;
  created_at: string;
  items: Array<{ name: string; quantity: number }>;
};

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const { session, signOut } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);

  useEffect(() => {
    if (session) loadOrders();
  }, [session]);

  async function loadOrders() {
    setLoadingOrders(true);
    try {
      const data = await getOrders(session?.access_token || '');
      setOrders(data ?? []);
    } finally {
      setLoadingOrders(false);
    }
  }

  function handleSignOut() {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          await signOut();
          setOrders([]);
        },
      },
    ]);
  }

  const isSignedIn = !!session;

  return (
    <ScrollView
      style={[styles.container, { paddingTop: insets.top }]}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.header}>Profile</Text>

      {/* Avatar section */}
      <View style={styles.avatarSection}>
        <View style={styles.avatar}>
          <User size={40} color={colors.primary} />
        </View>
        {isSignedIn ? (
          <View style={styles.userInfo}>
            <Text style={styles.userName}>Welcome back!</Text>
            <View style={styles.phoneRow}>
              <Phone size={14} color={colors.text.muted} />
              <Text style={styles.userPhone}>{session.user.phone ?? 'Phone user'}</Text>
            </View>
          </View>
        ) : (
          <View style={styles.userInfo}>
            <Text style={styles.userName}>Guest User</Text>
            <Text style={styles.userSub}>Sign in to access your account</Text>
          </View>
        )}
      </View>

      {/* Sign in / Sign out button */}
      {isSignedIn ? (
        <TouchableOpacity style={styles.signOutBtn} onPress={handleSignOut}>
          <LogOut size={18} color={colors.error} />
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity
          style={styles.signInBtn}
          onPress={() => router.push('/auth/phone')}
        >
          <Text style={styles.signInText}>Sign In with Phone</Text>
        </TouchableOpacity>
      )}

      {/* Order history */}
      {isSignedIn && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Orders</Text>
          {loadingOrders ? (
            <ActivityIndicator color={colors.primary} style={{ marginVertical: spacing.md }} />
          ) : orders.length === 0 ? (
            <View style={styles.emptyOrders}>
              <Package size={32} color={colors.border} />
              <Text style={styles.emptyOrdersText}>No orders yet</Text>
            </View>
          ) : (
            orders.map((order) => (
              <View key={order.id} style={styles.orderCard}>
                <View style={styles.orderRow}>
                  <Package size={16} color={colors.primary} />
                  <Text style={styles.orderId}>
                    #{order.id.slice(0, 8).toUpperCase()}
                  </Text>
                  <View style={[styles.statusBadge, order.status === 'confirmed' && styles.statusConfirmed]}>
                    <Text style={styles.statusText}>{order.status}</Text>
                  </View>
                </View>
                <Text style={styles.orderItems} numberOfLines={1}>
                  {(order.items as Array<{ name: string; quantity: number }>)
                    .map((i) => `${i.name} ×${i.quantity}`)
                    .join(', ')}
                </Text>
                <Text style={styles.orderTotal}>{formatLKR(order.total)}</Text>
              </View>
            ))
          )}
        </View>
      )}

      {/* Settings menu */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account</Text>
        {[
          { icon: <MapPin size={18} color={colors.primary} />, label: 'Delivery Addresses' },
          { icon: <CreditCard size={18} color={colors.primary} />, label: 'Payment Methods' },
          { icon: <Bell size={18} color={colors.primary} />, label: 'Notifications' },
          { icon: <HelpCircle size={18} color={colors.primary} />, label: 'Help & Support' },
        ].map(({ icon, label }) => (
          <TouchableOpacity key={label} style={styles.menuRow}>
            <View style={styles.menuIcon}>{icon}</View>
            <Text style={styles.menuLabel}>{label}</Text>
            <ChevronRight size={18} color={colors.text.muted} />
          </TouchableOpacity>
        ))}
      </View>

      <View style={{ height: spacing.xxxl }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: spacing.lg,
  },
  header: {
    fontSize: typography.sizes.xxl,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
    marginBottom: spacing.xl,
  },
  avatarSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
    marginBottom: spacing.lg,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.primaryMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  userInfo: {
    flex: 1,
    gap: spacing.xs,
  },
  userName: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
  },
  phoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  userPhone: {
    fontSize: typography.sizes.md,
    color: colors.text.muted,
  },
  userSub: {
    fontSize: typography.sizes.md,
    color: colors.text.muted,
  },
  signInBtn: {
    backgroundColor: colors.primary,
    borderRadius: radius.full,
    paddingVertical: spacing.md,
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  signInText: {
    color: colors.text.white,
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.semibold,
  },
  signOutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    borderWidth: 1.5,
    borderColor: colors.error,
    borderRadius: radius.full,
    paddingVertical: spacing.md,
    marginBottom: spacing.xl,
  },
  signOutText: {
    color: colors.error,
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.semibold,
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  emptyOrders: {
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.lg,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
  },
  emptyOrdersText: {
    color: colors.text.muted,
    fontSize: typography.sizes.md,
  },
  orderCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
    gap: spacing.xs,
  },
  orderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  orderId: {
    flex: 1,
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
    color: colors.text.primary,
    fontVariant: ['tabular-nums'],
  },
  statusBadge: {
    backgroundColor: colors.primaryMuted,
    borderRadius: radius.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
  },
  statusConfirmed: {
    backgroundColor: '#D1FAE5',
  },
  statusText: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.medium,
    color: colors.primary,
    textTransform: 'capitalize',
  },
  orderItems: {
    fontSize: typography.sizes.sm,
    color: colors.text.muted,
    paddingLeft: spacing.md + 18,
  },
  orderTotal: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
    color: colors.primary,
    paddingLeft: spacing.md + 18,
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    gap: spacing.md,
  },
  menuIcon: {
    width: 36,
    height: 36,
    borderRadius: radius.sm,
    backgroundColor: colors.primaryMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuLabel: {
    flex: 1,
    fontSize: typography.sizes.base,
    color: colors.text.primary,
    fontWeight: typography.weights.medium,
  },
});
