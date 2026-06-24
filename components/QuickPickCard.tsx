import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
} from 'react-native';
import { ShoppingCart } from 'lucide-react-native';
import { colors, radius, spacing, typography } from '@/constants/theme';
import { Product } from '@/lib/api';
import { useCart } from '@/context/CartContext';

type Props = {
  product: Product;
  index?: number;
  onPress?: () => void;
};

const bgColors = [
  '#FEE2E2', // pink
  '#FEF08A', // yellow
  '#FECACA', // red
  '#BBF7D0', // green
  '#E5E7EB', // grey
  '#FEE2E2', // pink
  '#FEF08A', // yellow
  '#DBEAFE', // blue
];

export default function QuickPickCard({ product, index = 0, onPress }: Props) {
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
          <ShoppingCart size={10} color="#fff" />
          <Text style={styles.countBadgeText}>{qty}</Text>
        </View>
      )}
      {product.image_url ? (
        <Image
          source={{ uri: product.image_url }}
          style={[styles.image, { backgroundColor: bgColors[index % bgColors.length] }]}
          resizeMode="contain"
        />
      ) : (
        <View style={[styles.imagePlaceholder, { backgroundColor: bgColors[index % bgColors.length] }]} />
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
    top: -4,
    right: -4,
    backgroundColor: colors.text.primary,
    borderRadius: radius.full,
    flexDirection: 'row',
    paddingHorizontal: 6,
    paddingVertical: 2,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
    gap: 2,
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
