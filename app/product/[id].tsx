import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { ChevronLeft, Info, ShoppingCart, Heart } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, spacing, radius, typography } from '@/constants/theme';
import { fetchProductById, fetchVariants } from '@/lib/api';
import { Product, ProductVariant } from '@/lib/api';
import { formatLKR } from '@/lib/utils';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const THUMBNAIL_IMAGES = [
  'https://images.pexels.com/photos/33783/olive-oil-salad-dressing-france-cuisine.jpg?auto=compress&cs=tinysrgb&w=100',
  'https://images.pexels.com/photos/1537169/pexels-photo-1537169.jpeg?auto=compress&cs=tinysrgb&w=100',
  'https://images.pexels.com/photos/1640772/pexels-photo-1640772.jpeg?auto=compress&cs=tinysrgb&w=100',
  'https://images.pexels.com/photos/1213710/pexels-photo-1213710.jpeg?auto=compress&cs=tinysrgb&w=100',
];

export default function ProductDetailScreen() {
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { addToCart, getQuantity } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();

  const [product, setProduct] = useState<Product | null>(null);
  const [variants, setVariants] = useState<ProductVariant[]>([]);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedThumb, setSelectedThumb] = useState(0);

  useEffect(() => {
    if (id) loadData(id);
  }, [id]);

  async function loadData(productId: string) {
    try {
      const [productData, variantData] = await Promise.all([
        fetchProductById(productId),
        fetchVariants(productId),
      ]);
      setProduct(productData);
      setVariants(variantData);
      const defaultVariant = variantData.find((v) => v.is_default) ?? variantData[0] ?? null;
      setSelectedVariant(defaultVariant);
    } catch {
      setError('Failed to load product');
    } finally {
      setLoading(false);
    }
  }

  const wishlisted = product ? isInWishlist(product.id) : false;
  const qty = product
    ? getQuantity(product.id, selectedVariant?.id)
    : 0;

  const currentPrice = selectedVariant
    ? selectedVariant.price_lkr
    : product?.price ?? 0;

  const handleAddToCart = () => {
    if (product) addToCart(product, selectedVariant);
  };

  if (loading) {
    return (
      <View style={[styles.centered, { paddingTop: insets.top }]}>
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    );
  }

  if (error || !product) {
    return (
      <View style={[styles.centered, { paddingTop: insets.top }]}>
        <Text style={styles.errorText}>{error ?? 'Product not found'}</Text>
        <TouchableOpacity onPress={() => router.back()} style={styles.goBackBtn}>
          <Text style={styles.goBackText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const discountedPrice = (product.discount_percentage ?? 0) > 0
    ? currentPrice * (1 - (product.discount_percentage ?? 0) / 100)
    : currentPrice;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Top bar */}
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.iconBtn} onPress={() => router.back()}>
          <ChevronLeft size={22} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.topTitle}>Details</Text>
        <TouchableOpacity
          style={styles.iconBtn}
          onPress={() => product && toggleWishlist(product)}
        >
          <Heart
            size={20}
            color={wishlisted ? colors.error : colors.text.secondary}
            fill={wishlisted ? colors.error : 'none'}
          />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} style={{ flex: 1 }}>
        {/* Main image */}
        <View style={styles.mainImageWrapper}>
          <Image
            source={{
              uri:
                selectedThumb === 0 && product.image_url
                  ? product.image_url
                  : THUMBNAIL_IMAGES[Math.max(0, selectedThumb - 1)],
            }}
            style={styles.mainImage}
            resizeMode="cover"
          />
          {(product.discount_percentage ?? 0) > 0 && (
            <View style={styles.discountBadge}>
              <Text style={styles.discountText}>{(product.discount_percentage ?? 0)}% Off</Text>
            </View>
          )}
        </View>

        {/* Thumbnails */}
        <View style={styles.thumbnails}>
          {[product.image_url, ...THUMBNAIL_IMAGES.slice(0, 3)].map((uri, i) => (
            <TouchableOpacity
              key={i}
              style={[styles.thumb, selectedThumb === i && styles.thumbActive]}
              onPress={() => setSelectedThumb(i)}
            >
              <Image
                source={{ uri: uri ?? THUMBNAIL_IMAGES[0] }}
                style={styles.thumbImage}
                resizeMode="cover"
              />
            </TouchableOpacity>
          ))}
        </View>

        {/* Title + Price */}
        <View style={styles.titleRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.productName}>{product.name}</Text>
            <Text style={styles.productSubtitle}>Pick Perks makes grocery</Text>
          </View>
          <View style={styles.pricePill}>
            <Text style={styles.priceText}>{formatLKR(discountedPrice)}</Text>
          </View>
        </View>

        {/* Variant selector */}
        {variants.length > 0 && (
          <View style={styles.variantSection}>
            <Text style={styles.variantLabel}>Select Quantity</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.variantRow}
            >
              {variants.map((v) => {
                const isSelected = selectedVariant?.id === v.id;
                return (
                  <TouchableOpacity
                    key={v.id}
                    style={[styles.variantChip, isSelected && styles.variantChipSelected]}
                    onPress={() => setSelectedVariant(v)}
                  >
                    <Text
                      style={[styles.variantChipLabel, isSelected && styles.variantChipLabelSelected]}
                    >
                      {v.weight_label}
                    </Text>
                    <Text
                      style={[styles.variantChipPrice, isSelected && styles.variantChipPriceSelected]}
                    >
                      {formatLKR(v.price_lkr)}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        )}

        {/* Stats */}
        <View style={styles.statsRow}>
          <StatCell label="Active time" value={(product.active_time?.toString() ?? '0')} />
          <View style={styles.statDivider} />
          <StatCell label="Total time" value={(product.total_time?.toString() ?? '0')} />
          <View style={styles.statDivider} />
          <StatCell label="Servings" value={String(product.servings)} />
          <View style={styles.statDivider} />
          <StatCell label="Calories" value={String(product.calories)} showInfo />
        </View>

        {/* Description */}
        <View style={styles.descSection}>
          <Text style={styles.descLabel}>Description</Text>
          <Text style={styles.descText}>{product.description}</Text>
        </View>

        <View style={{ height: 110 }} />
      </ScrollView>

      {/* Sticky bottom bar */}
      <View style={[styles.bottomBar, { paddingBottom: insets.bottom + spacing.md }]}>
        <View>
          <Text style={styles.buyNow}>Buy Now</Text>
          {selectedVariant && (
            <Text style={styles.selectedVariantLabel}>{selectedVariant.weight_label}</Text>
          )}
        </View>
        <View style={styles.bottomRight}>
          <Text style={styles.bottomPrice}>{formatLKR(discountedPrice)}</Text>
          <TouchableOpacity style={styles.cartCircle} onPress={handleAddToCart}>
            <ShoppingCart size={22} color={colors.text.white} />
            {qty > 0 && (
              <View style={styles.qtyBadge}>
                <Text style={styles.qtyText}>{qty}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

function StatCell({
  label,
  value,
  showInfo = false,
}: {
  label: string;
  value: string;
  showInfo?: boolean;
}) {
  return (
    <View style={styles.statCell}>
      <Text style={styles.statLabel}>{label}</Text>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 2 }}>
        <Text style={styles.statValue}>{value}</Text>
        {showInfo && <Info size={10} color={colors.primary} />}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
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
  mainImageWrapper: {
    marginHorizontal: spacing.lg,
    borderRadius: radius.xxl,
    overflow: 'hidden',
    backgroundColor: colors.surface,
    height: 240,
  },
  mainImage: {
    width: '100%',
    height: '100%',
  },
  discountBadge: {
    position: 'absolute',
    top: spacing.md,
    right: spacing.md,
    backgroundColor: colors.primary,
    borderRadius: radius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  discountText: {
    color: colors.text.white,
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
  },
  thumbnails: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    marginTop: spacing.md,
  },
  thumb: {
    width: 64,
    height: 64,
    borderRadius: radius.md,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  thumbActive: {
    borderColor: colors.primary,
  },
  thumbImage: {
    width: '100%',
    height: '100%',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    marginTop: spacing.lg,
    gap: spacing.md,
  },
  productName: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
  },
  productSubtitle: {
    fontSize: typography.sizes.sm,
    color: colors.text.secondary,
    marginTop: 2,
  },
  pricePill: {
    backgroundColor: colors.primaryMuted,
    borderRadius: radius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  priceText: {
    color: colors.primary,
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
  },
  variantSection: {
    paddingHorizontal: spacing.lg,
    marginTop: spacing.xl,
  },
  variantLabel: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  variantRow: {
    gap: spacing.sm,
    paddingRight: spacing.lg,
  },
  variantChip: {
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    alignItems: 'center',
    minWidth: 72,
    backgroundColor: colors.surface,
  },
  variantChipSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryMuted,
  },
  variantChipLabel: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
    color: colors.text.secondary,
  },
  variantChipLabelSelected: {
    color: colors.primary,
  },
  variantChipPrice: {
    fontSize: typography.sizes.xs,
    color: colors.text.muted,
    marginTop: 2,
  },
  variantChipPriceSelected: {
    color: colors.primaryDark,
    fontWeight: typography.weights.medium,
  },
  statsRow: {
    flexDirection: 'row',
    marginHorizontal: spacing.lg,
    marginTop: spacing.xl,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    paddingVertical: spacing.md,
  },
  statCell: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  statLabel: {
    fontSize: typography.sizes.xs,
    color: colors.text.muted,
    textAlign: 'center',
  },
  statValue: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
    color: colors.text.primary,
  },
  statDivider: {
    width: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.xs,
  },
  descSection: {
    paddingHorizontal: spacing.lg,
    marginTop: spacing.xl,
  },
  descLabel: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  descText: {
    fontSize: typography.sizes.md,
    color: colors.text.secondary,
    lineHeight: 22,
  },
  bottomBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.background,
  },
  buyNow: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.semibold,
    color: colors.text.primary,
  },
  selectedVariantLabel: {
    fontSize: typography.sizes.sm,
    color: colors.primary,
    fontWeight: typography.weights.medium,
    marginTop: 2,
  },
  bottomRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  bottomPrice: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colors.primary,
  },
  cartCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qtyBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: colors.error,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qtyText: {
    color: colors.text.white,
    fontSize: 10,
    fontWeight: typography.weights.bold,
  },
  errorText: {
    color: colors.error,
    fontSize: typography.sizes.md,
  },
  goBackBtn: {
    backgroundColor: colors.primary,
    borderRadius: radius.full,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  goBackText: {
    color: colors.text.white,
    fontWeight: typography.weights.semibold,
  },
});
