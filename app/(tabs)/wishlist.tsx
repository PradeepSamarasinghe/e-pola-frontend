import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
} from 'react-native';
import { router } from 'expo-router';
import { Heart, Trash2, ShoppingCart, ArrowRight } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, spacing, radius, typography } from '@/constants/theme';
import { useWishlist } from '@/context/WishlistContext';
import { useCart } from '@/context/CartContext';
import { Product } from '@/lib/api';
import { formatLKR } from '@/lib/utils';

export default function WishlistScreen() {
  const insets = useSafeAreaInsets();
  const { items, removeFromWishlist } = useWishlist();
  const { addToCart, getQuantity } = useCart();

  if (items.length === 0) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <Text style={styles.header}>Wishlist</Text>
        <View style={styles.empty}>
          <View style={styles.emptyIcon}>
            <Heart size={48} color={colors.primary} />
          </View>
          <Text style={styles.emptyTitle}>Your wishlist is empty</Text>
          <Text style={styles.emptySub}>
            Save products you love by tapping the heart icon on any product
          </Text>
          <TouchableOpacity
            style={styles.browseBtn}
            onPress={() => router.push('/(tabs)/shop')}
          >
            <Text style={styles.browseBtnText}>Browse Products</Text>
            <ArrowRight size={16} color={colors.text.white} />
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.headerRow}>
        <Text style={styles.header}>Wishlist</Text>
        <View style={styles.countBadge}>
          <Text style={styles.countText}>{items.length}</Text>
        </View>
      </View>

      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <WishlistCard
            product={item}
            qty={getQuantity(item.id)}
            onAddToCart={() => addToCart(item)}
            onRemove={() => removeFromWishlist(item.id)}
            onPress={() => router.push(`/product/${item.id}`)}
          />
        )}
        ListFooterComponent={<View style={{ height: spacing.xxl }} />}
      />
    </View>
  );
}

function WishlistCard({
  product,
  qty,
  onAddToCart,
  onRemove,
  onPress,
}: {
  product: Product;
  qty: number;
  onAddToCart: () => void;
  onRemove: () => void;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.88}>
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
        {product.is_new && (
          <View style={styles.newBadge}>
            <Text style={styles.newBadgeText}>New</Text>
          </View>
        )}
        {(product.discount_percentage ?? 0) > 0 && (
          <View style={styles.discountBadge}>
            <Text style={styles.discountText}>{(product.discount_percentage ?? 0)}% Off</Text>
          </View>
        )}
      </View>

      <View style={styles.cardBody}>
        <View style={styles.cardTop}>
          <Text style={styles.name} numberOfLines={2}>{product.name}</Text>
          <TouchableOpacity
            style={styles.removeBtn}
            onPress={onRemove}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Trash2 size={16} color={colors.error} />
          </TouchableOpacity>
        </View>

        <Text style={styles.desc} numberOfLines={1}>{product.description}</Text>

        <View style={styles.cardFooter}>
          <View>
            <Text style={styles.price}>{formatLKR(product.price)}</Text>
            <Text style={styles.priceHint}>from / select quantity</Text>
          </View>
          <TouchableOpacity
            style={[styles.addBtn, qty > 0 && styles.addBtnActive]}
            onPress={onAddToCart}
          >
            <ShoppingCart size={15} color={colors.text.white} />
            <Text style={styles.addBtnText}>
              {qty > 0 ? `In cart (${qty})` : 'Add to Cart'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    fontSize: typography.sizes.xxl,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  countBadge: {
    backgroundColor: colors.primary,
    borderRadius: radius.full,
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  countText: {
    color: colors.text.white,
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
    gap: spacing.md,
  },
  emptyIcon: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#FFF1F2',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  emptyTitle: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
    textAlign: 'center',
  },
  emptySub: {
    fontSize: typography.sizes.md,
    color: colors.text.muted,
    textAlign: 'center',
    lineHeight: 22,
  },
  browseBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: radius.full,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  browseBtnText: {
    color: colors.text.white,
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
  },
  list: {
    paddingHorizontal: spacing.lg,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    marginBottom: spacing.md,
    overflow: 'hidden',
    flexDirection: 'row',
  },
  imageWrapper: {
    width: 110,
    height: 120,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imagePlaceholder: {
    backgroundColor: colors.surfaceAlt,
  },
  newBadge: {
    position: 'absolute',
    top: spacing.xs,
    left: spacing.xs,
    backgroundColor: colors.error,
    borderRadius: radius.sm,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  newBadgeText: {
    color: colors.text.white,
    fontSize: 9,
    fontWeight: typography.weights.bold,
  },
  discountBadge: {
    position: 'absolute',
    bottom: spacing.xs,
    left: spacing.xs,
    backgroundColor: colors.primary,
    borderRadius: radius.sm,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  discountText: {
    color: colors.text.white,
    fontSize: 9,
    fontWeight: typography.weights.bold,
  },
  cardBody: {
    flex: 1,
    padding: spacing.md,
    justifyContent: 'space-between',
  },
  cardTop: {
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
  removeBtn: {
    padding: 4,
  },
  desc: {
    fontSize: typography.sizes.sm,
    color: colors.text.muted,
    marginTop: 2,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    marginTop: spacing.xs,
  },
  price: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colors.primary,
  },
  priceHint: {
    fontSize: typography.sizes.xs,
    color: colors.text.muted,
    marginTop: 1,
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: colors.primary,
    borderRadius: radius.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  addBtnActive: {
    backgroundColor: colors.primaryDark,
  },
  addBtnText: {
    color: colors.text.white,
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.semibold,
  },
});
