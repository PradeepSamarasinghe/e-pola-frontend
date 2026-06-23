import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
} from 'react-native';
import { Plus, Minus, Heart } from 'lucide-react-native';
import { colors, spacing, radius, typography } from '@/constants/theme';
import { Product } from '@/lib/api';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import { formatLKR } from '@/lib/utils';

type Props = {
  product: Product;
  onPress?: () => void;
};

export default function ProductListItem({ product, onPress }: Props) {
  const { addToCart, getQuantity, updateQuantity } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const qty = getQuantity(product.id);
  const wishlisted = isInWishlist(product.id);

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.85}>
      <View style={styles.imageWrapper}>
        {product.image_url ? (
          <Image
            source={{ uri: product.image_url }}
            style={styles.image}
            resizeMode="cover"
          />
        ) : (
          <View style={[styles.image, styles.imagePlaceholder]} />
        )}
        {(product.discount_percentage ?? 0) > 0 && (
          <View style={styles.discountBadge}>
            <Text style={styles.discountText}>{(product.discount_percentage ?? 0)}% Off</Text>
          </View>
        )}
        {product.is_new && (
          <View style={styles.newBadge}>
            <Text style={styles.newBadgeText}>New</Text>
          </View>
        )}
      </View>
      <View style={styles.info}>
        <View style={styles.nameRow}>
          <Text style={styles.name} numberOfLines={2}>{product.name}</Text>
          <TouchableOpacity
            onPress={(e) => {
              e.stopPropagation?.();
              toggleWishlist(product);
            }}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Heart
              size={16}
              color={wishlisted ? colors.error : colors.text.muted}
              fill={wishlisted ? colors.error : 'none'}
            />
          </TouchableOpacity>
        </View>
        <Text style={styles.desc} numberOfLines={1}>{product.description}</Text>
        <Text style={styles.variantHint}>Tap to select quantity</Text>
        <View style={styles.priceRow}>
          <Text style={styles.price}>{formatLKR(product.price)}</Text>
          <View style={styles.qtyRow}>
            {qty > 0 ? (
              <>
                <TouchableOpacity
                  style={styles.qtyBtn}
                  onPress={(e) => {
                    e.stopPropagation?.();
                    updateQuantity(product.id, qty - 1);
                  }}
                >
                  <Minus size={12} color={colors.primary} />
                </TouchableOpacity>
                <Text style={styles.qty}>{qty}</Text>
                <TouchableOpacity
                  style={[styles.qtyBtn, styles.qtyBtnAdd]}
                  onPress={(e) => {
                    e.stopPropagation?.();
                    addToCart(product);
                  }}
                >
                  <Plus size={12} color={colors.text.white} />
                </TouchableOpacity>
              </>
            ) : (
              <TouchableOpacity
                style={styles.addBtn}
                onPress={(e) => {
                  e.stopPropagation?.();
                  addToCart(product);
                }}
              >
                <Plus size={14} color={colors.text.white} />
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    overflow: 'hidden',
    marginBottom: spacing.md,
  },
  imageWrapper: {
    width: 100,
    height: 110,
    position: 'relative',
  },
  image: { width: '100%', height: '100%' },
  imagePlaceholder: { backgroundColor: colors.surfaceAlt },
  discountBadge: {
    position: 'absolute',
    top: spacing.xs,
    left: spacing.xs,
    backgroundColor: colors.primary,
    borderRadius: radius.sm,
    paddingHorizontal: 5,
    paddingVertical: 2,
  },
  discountText: { color: colors.text.white, fontSize: 9, fontWeight: typography.weights.bold },
  newBadge: {
    position: 'absolute',
    top: spacing.xs,
    right: spacing.xs,
    backgroundColor: colors.error,
    borderRadius: radius.sm,
    paddingHorizontal: 5,
    paddingVertical: 2,
  },
  newBadgeText: { color: colors.text.white, fontSize: 9, fontWeight: typography.weights.bold },
  info: {
    flex: 1,
    padding: spacing.md,
    justifyContent: 'space-between',
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  name: {
    flex: 1,
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
    color: colors.text.primary,
    lineHeight: 20,
  },
  desc: { fontSize: typography.sizes.sm, color: colors.text.muted, marginTop: 2 },
  variantHint: {
    fontSize: typography.sizes.xs,
    color: colors.primary,
    marginTop: 2,
    fontStyle: 'italic',
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.xs,
  },
  price: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
    color: colors.primary,
  },
  qtyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  qtyBtn: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 1.5,
    borderColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qtyBtnAdd: { backgroundColor: colors.primary, borderColor: colors.primary },
  qty: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
    minWidth: 18,
    textAlign: 'center',
  },
  addBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
