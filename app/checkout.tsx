import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { router } from 'expo-router';
import { ChevronLeft, MapPin, CreditCard, Banknote, CheckCircle } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { placeOrder, calculateDeliveryFee } from '@/lib/api';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { colors, spacing, radius, typography } from '@/constants/theme';
import { formatLKR } from '@/lib/utils';
import { useTranslation } from 'react-i18next';

type PaymentMethod = 'cash_on_delivery' | 'card';

export default function CheckoutScreen() {
  const insets = useSafeAreaInsets();
  const { items, totalPrice, clearCart } = useCart();
  const { session } = useAuth();
  const { t } = useTranslation();

  const [houseNumber, setHouseNumber] = useState('');
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash_on_delivery');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [successOrderId, setSuccessOrderId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [deliveryFee, setDeliveryFee] = useState(350);
  const [distanceKm, setDistanceKm] = useState<string | null>(null);

  React.useEffect(() => {
    async function getFee() {
      if (!session) return;
      try {
        // Mocking user coordinates for Colombo for now
        const res = await calculateDeliveryFee(6.9271, 79.8612, session.access_token);
        if (res.success) {
          setDeliveryFee(res.fee);
          setDistanceKm(res.distanceKm);
        }
      } catch (e) {
        console.log('Failed to fetch fee', e);
      }
    }
    if (street.length > 5 && city.length > 2) {
      getFee();
    }
  }, [street, city, session]);

  const grandTotal = totalPrice + deliveryFee;

  async function handlePlaceOrder() {
    if (!houseNumber.trim() || !street.trim() || !city.trim() || !postalCode.trim()) {
      setError(t('checkout.fillAllFields'));
      return;
    }
    if (!session) {
      Alert.alert(
        'Sign In Required',
        'Please sign in to place an order.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Sign In', onPress: () => router.push('/auth/phone') },
        ]
      );
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const orderItems = items.map(({ product, variant, quantity }) => {
        const unitPrice = variant ? variant.price_lkr : product.price;
        return {
          product_id: product.id,
          name: product.name,
          variant_label: variant?.weight_label ?? null,
          price_lkr: unitPrice,
          quantity,
          subtotal_lkr: unitPrice * quantity,
        };
      });

      const createdOrder = await placeOrder({
        items: orderItems,
        total: grandTotal,
        delivery_address: `${houseNumber}, ${street}, ${city}, ${postalCode}`,
        payment_method: paymentMethod,
        status: 'pending',
      }, session.access_token);
      setSuccessOrderId(createdOrder._id);
      setSuccess(true);
      clearCart();
    } catch (e: any) {
      setError(e.message ?? 'Failed to place order. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  if (success && successOrderId) {
    return (
      <View style={[styles.container, styles.successContainer, { paddingTop: insets.top }]}>
        <CheckCircle size={80} color={colors.primary} />
        <Text style={styles.successTitle}>Order Placed!</Text>
        <Text style={styles.successSub}>
          Your order has been confirmed and will be delivered soon.
        </Text>
        <TouchableOpacity
          style={styles.trackOrderBtn}
          onPress={() => router.replace({ pathname: "/order/[id]", params: { id: successOrderId } })}
        >
          <Text style={styles.trackOrderBtnText}>Track Order</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.homeBtn}
          onPress={() => router.replace('/(tabs)')}
        >
          <Text style={styles.homeBtnText}>Back to Home</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={[styles.container, { paddingTop: insets.top }]}>
        {/* Top bar */}
        <View style={styles.topBar}>
          <TouchableOpacity style={styles.iconBtn} onPress={() => router.back()}>
            <ChevronLeft size={22} color={colors.text.primary} />
          </TouchableOpacity>
          <Text style={styles.topTitle}>{t('checkout.title')}</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          {/* Delivery address */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <MapPin size={18} color={colors.primary} />
              <Text style={styles.sectionTitle}>{t('checkout.deliveryAddress')}</Text>
            </View>

            <Text style={styles.fieldLabel}>{t('checkout.houseNumber')}</Text>
            <TextInput
              style={styles.input}
              placeholder="123"
              placeholderTextColor={colors.text.muted}
              value={houseNumber}
              onChangeText={setHouseNumber}
            />

            <Text style={styles.fieldLabel}>{t('checkout.street')}</Text>
            <TextInput
              style={styles.input}
              placeholder="Main Street"
              placeholderTextColor={colors.text.muted}
              value={street}
              onChangeText={setStreet}
            />

            <View style={{ flexDirection: 'row', gap: spacing.md }}>
              <View style={{ flex: 1 }}>
                <Text style={styles.fieldLabel}>{t('checkout.city')}</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Colombo"
                  placeholderTextColor={colors.text.muted}
                  value={city}
                  onChangeText={setCity}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.fieldLabel}>{t('checkout.postalCode')}</Text>
                <TextInput
                  style={styles.input}
                  placeholder="00100"
                  placeholderTextColor={colors.text.muted}
                  keyboardType="number-pad"
                  value={postalCode}
                  onChangeText={setPostalCode}
                />
              </View>
            </View>
          </View>

          {/* Payment method */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <CreditCard size={18} color={colors.primary} />
              <Text style={styles.sectionTitle}>Payment Method</Text>
            </View>

            <PaymentOption
              icon={<Banknote size={20} color={paymentMethod === 'cash_on_delivery' ? colors.primary : colors.text.muted} />}
              label="Cash on Delivery"
              description="Pay when your order arrives"
              selected={paymentMethod === 'cash_on_delivery'}
              onPress={() => setPaymentMethod('cash_on_delivery')}
            />
            <PaymentOption
              icon={<CreditCard size={20} color={paymentMethod === 'card' ? colors.primary : colors.text.muted} />}
              label="Credit / Debit Card"
              description="PayHere, Visa, Mastercard"
              selected={paymentMethod === 'card'}
              onPress={() => setPaymentMethod('card')}
            />
          </View>

          {/* Order summary */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Order Summary</Text>
            {items.map(({ product, variant, quantity }) => {
              const unitPrice = variant ? variant.price_lkr : product.price;
              const key = `${product.id}:${variant?.id ?? 'default'}`;
              return (
                <View key={key} style={styles.summaryRow}>
                  <Text style={styles.summaryItem} numberOfLines={1}>
                    {product.name}{variant ? ` (${variant.weight_label})` : ''} × {quantity}
                  </Text>
                  <Text style={styles.summaryPrice}>
                    {formatLKR(unitPrice * quantity)}
                  </Text>
                </View>
              );
            })}
            <View style={styles.divider} />
            <View style={styles.summaryRow}>
              <Text style={styles.summaryItem}>Delivery {distanceKm ? `(${distanceKm} km)` : ''}</Text>
              <Text style={[styles.summaryPrice, deliveryFee === 0 && styles.freeText]}>
                {deliveryFee === 0 ? 'FREE' : formatLKR(deliveryFee)}
              </Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.grandLabel}>Grand Total</Text>
              <Text style={styles.grandValue}>{formatLKR(grandTotal)}</Text>
            </View>
          </View>

          {error && (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          <View style={{ height: 120 }} />
        </ScrollView>

        {/* Place order button */}
        <View style={[styles.bottomBar, { paddingBottom: insets.bottom + spacing.md }]}>
          <TouchableOpacity
            style={[styles.placeBtn, loading && styles.placeBtnDisabled]}
            onPress={handlePlaceOrder}
            disabled={loading}
          >
            <Text style={styles.placeBtnText}>
              {loading ? '...' : `${t('checkout.placeOrder')}  ${formatLKR(grandTotal)}`}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

function PaymentOption({
  icon,
  label,
  description,
  selected,
  onPress,
}: {
  icon: React.ReactNode;
  label: string;
  description: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      style={[styles.payOption, selected && styles.payOptionSelected]}
      onPress={onPress}
    >
      {icon}
      <View style={{ flex: 1 }}>
        <Text style={[styles.payLabel, selected && styles.payLabelSelected]}>{label}</Text>
        <Text style={styles.payDesc}>{description}</Text>
      </View>
      <View style={[styles.radio, selected && styles.radioSelected]}>
        {selected && <View style={styles.radioDot} />}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  successContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.lg,
    paddingHorizontal: spacing.xl,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: radius.full,
    backgroundColor: colors.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },
  topTitle: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
  },
  section: {
    margin: spacing.lg,
    marginBottom: 0,
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: spacing.lg,
    gap: spacing.sm,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  sectionTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
  },
  fieldLabel: {
    fontSize: typography.sizes.sm,
    color: colors.text.secondary,
    fontWeight: typography.weights.medium,
    marginTop: spacing.xs,
  },
  input: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    fontSize: typography.sizes.md,
    color: colors.text.primary,
  },
  payOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: colors.border,
    marginTop: spacing.xs,
  },
  payOptionSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryMuted,
  },
  payLabel: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.medium,
    color: colors.text.primary,
  },
  payLabelSelected: {
    color: colors.primary,
  },
  payDesc: {
    fontSize: typography.sizes.sm,
    color: colors.text.muted,
    marginTop: 2,
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioSelected: {
    borderColor: colors.primary,
  },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.primary,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryItem: {
    flex: 1,
    fontSize: typography.sizes.md,
    color: colors.text.secondary,
    marginRight: spacing.sm,
  },
  summaryPrice: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.medium,
    color: colors.text.primary,
  },
  freeText: {
    color: colors.primary,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.xs,
  },
  grandLabel: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
  },
  grandValue: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    color: colors.primary,
  },
  errorBox: {
    margin: spacing.lg,
    backgroundColor: '#FEF2F2',
    borderRadius: radius.md,
    padding: spacing.md,
  },
  errorText: {
    color: colors.error,
    fontSize: typography.sizes.sm,
    textAlign: 'center',
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.background,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  placeBtn: {
    backgroundColor: colors.primary,
    borderRadius: radius.full,
    paddingVertical: spacing.lg,
    alignItems: 'center',
  },
  placeBtnDisabled: {
    opacity: 0.6,
  },
  placeBtnText: {
    color: colors.text.white,
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
  },
  successTitle: {
    fontSize: typography.sizes.xxxl,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
    textAlign: 'center',
  },
  successSub: {
    fontSize: typography.sizes.md,
    color: colors.text.secondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  homeBtn: {
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.full,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    marginTop: spacing.sm,
  },
  homeBtnText: {
    color: colors.text.primary,
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.semibold,
  },
  trackOrderBtn: {
    backgroundColor: colors.primary,
    borderRadius: radius.full,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    marginTop: spacing.md,
    width: '100%',
    alignItems: 'center'
  },
  trackOrderBtnText: {
    color: colors.text.white,
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.semibold,
  },
});
