import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { ShoppingCart } from 'lucide-react-native';
import { colors, radius, spacing, typography } from '@/constants/theme';
import { useCart } from '@/context/CartContext';

type Props = {
  onPress?: () => void;
  dark?: boolean;
};

export default function CartBadge({ onPress, dark = false }: Props) {
  const { totalCount } = useCart();

  return (
    <TouchableOpacity style={[styles.wrapper, dark && styles.wrapperDark]} onPress={onPress}>
      <ShoppingCart size={18} color={dark ? colors.text.white : colors.primary} />
      <Text style={[styles.count, dark && styles.countDark]}>{totalCount}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.text.white,
    borderRadius: radius.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    gap: 4,
  },
  wrapperDark: {
    backgroundColor: colors.primaryDark,
  },
  count: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
  },
  countDark: {
    color: colors.text.white,
  },
});
