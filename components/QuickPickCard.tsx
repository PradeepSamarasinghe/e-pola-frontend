import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
} from 'react-native';
import { colors, radius, spacing, typography } from '@/constants/theme';
import { Product } from '@/lib/api';
import { useCart } from '@/context/CartContext';

type Props = {
  product: Product;
  onPress?: () => void;
};

export default function QuickPickCard({ product, onPress }: Props) {
  const { getQuantity } = useCart();
  const qty = getQuantity(product.id);

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.85}>
      {product.is_new && (
        <View style={styles.newBadge}>
          <Text style={styles.newBadgeText}>New</Text>
        </View>
      )}
      {qty > 0 && (
        <View style={styles.countBadge}>
          <Text style={styles.countBadgeText}>{qty}</Text>
        </View>
      )}
      {product.image_url ? (
        <Image
          source={{ uri: product.image_url }}
          style={styles.image}
          resizeMode="cover"
        />
      ) : (
        <View style={styles.imagePlaceholder} />
      )}
      <Text style={styles.name} numberOfLines={1}>
        {product.name}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 80,
    alignItems: 'center',
    marginRight: spacing.sm,
  },
  newBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: colors.badge.new,
    borderRadius: radius.full,
    paddingHorizontal: 6,
    paddingVertical: 2,
    zIndex: 1,
  },
  newBadgeText: {
    color: colors.badge.newText,
    fontSize: 9,
    fontWeight: typography.weights.bold,
  },
  countBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: colors.text.primary,
    borderRadius: radius.full,
    width: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  countBadgeText: {
    color: colors.text.white,
    fontSize: 10,
    fontWeight: typography.weights.bold,
  },
  image: {
    width: 72,
    height: 72,
    borderRadius: radius.lg,
    backgroundColor: colors.surfaceAlt,
  },
  imagePlaceholder: {
    width: 72,
    height: 72,
    borderRadius: radius.lg,
    backgroundColor: colors.surfaceAlt,
  },
  name: {
    fontSize: typography.sizes.xs,
    color: colors.text.secondary,
    textAlign: 'center',
    marginTop: spacing.xs,
  },
});
