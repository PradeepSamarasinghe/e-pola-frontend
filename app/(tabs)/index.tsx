import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { router } from 'expo-router';
import { SlidersHorizontal, ShoppingCart, Search } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, spacing, radius, typography } from '@/constants/theme';
import { fetchProducts, fetchStores } from '@/lib/api';
import { Product, Store } from '@/lib/api';
import { useCart } from '@/context/CartContext';
import QuickPickCard from '@/components/QuickPickCard';
import StoreRow from '@/components/StoreRow';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const { totalCount, addToCart } = useCart();
  const [quickPicks, setQuickPicks] = useState<Product[]>([]);
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const [picks, storeList] = await Promise.all([
        fetchProducts({ quick_pick: true }),
        fetchStores(),
      ]);
      setQuickPicks(picks);
      setStores(storeList);
    } catch (e) {
      console.error('Home load error:', e);
    } finally {
      setLoading(false);
    }
  }

  const row1 = quickPicks.slice(0, 4);
  const row2 = quickPicks.slice(4, 8);

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} bounces={false}>
        {/* Dark green header */}
        <LinearGradient
          colors={[colors.primaryDark, colors.primary]}
          style={[styles.header, { paddingTop: insets.top + spacing.md }]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          {/* Search row */}
          <View style={styles.searchRow}>
            <TouchableOpacity
              style={styles.searchBar}
              onPress={() => router.push('/search')}
              activeOpacity={0.8}
            >
              <Search size={16} color={colors.text.muted} />
              <Text style={styles.searchPlaceholder}>Search...</Text>
              <SlidersHorizontal size={16} color={colors.text.muted} />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.cartBtn}
              onPress={() => router.push('/cart')}
            >
              <ShoppingCart size={18} color={colors.text.white} />
              <Text style={styles.cartCount}>{totalCount}</Text>
            </TouchableOpacity>
          </View>

          {/* Heading */}
          <Text style={styles.heading}>Find Your Daily{'\n'}Grocery</Text>

          {/* Veggie strip */}
          <Image
            source={{
              uri: 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=800',
            }}
            style={styles.veggieStrip}
            resizeMode="cover"
          />
        </LinearGradient>

        {/* Quick picks grid */}
        <View style={styles.section}>
          {loading ? (
            <ActivityIndicator color={colors.primary} style={{ marginVertical: spacing.xl }} />
          ) : (
            <>
              <QuickPickRow
                products={row1}
                onProductPress={(p) => router.push(`/product/${p.id}`)}
                onAdd={addToCart}
              />
              <QuickPickRow
                products={row2}
                onProductPress={(p) => router.push(`/product/${p.id}`)}
                onAdd={addToCart}
              />
            </>
          )}
        </View>

        {/* Promo banner */}
        <View style={styles.bannerContainer}>
          <LinearGradient
            colors={[colors.primaryDark, '#064E3B']}
            style={styles.banner}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={styles.bannerContent}>
              <Text style={styles.bannerSub}>Healthy &amp; Fresh</Text>
              <Text style={styles.bannerTitle}>VEGETABLE</Text>
              <TouchableOpacity
                style={styles.bannerBtn}
                onPress={() => router.push('/search')}
              >
                <Text style={styles.bannerBtnText}>Order Now</Text>
              </TouchableOpacity>
            </View>
            <Image
              source={{
                uri: 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=400',
              }}
              style={styles.bannerImage}
              resizeMode="cover"
            />
          </LinearGradient>
        </View>

        {/* Stores section */}
        <View style={[styles.section, styles.storesSection]}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Stores to help you save</Text>
            <TouchableOpacity onPress={() => router.push('/(tabs)/map')}>
              <Text style={styles.showAll}>Show all</Text>
            </TouchableOpacity>
          </View>
          {stores.map((store) => (
            <StoreRow key={store.id} store={store} />
          ))}
        </View>

        <View style={{ height: spacing.xxl }} />
      </ScrollView>
    </View>
  );
}

function QuickPickRow({
  products,
  onProductPress,
  onAdd,
}: {
  products: Product[];
  onProductPress: (p: Product) => void;
  onAdd: (p: Product) => void;
}) {
  return (
    <View style={styles.quickRow}>
      {products.map((product) => (
        <View key={product.id} style={styles.quickCell}>
          <QuickPickCard
            product={product}
            onPress={() => onProductPress(product)}
          />
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingHorizontal: spacing.lg,
    paddingBottom: 0,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    overflow: 'hidden',
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: radius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    gap: spacing.sm,
  },
  searchPlaceholder: {
    flex: 1,
    fontSize: typography.sizes.md,
    color: colors.text.muted,
  },
  cartBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: radius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    gap: spacing.xs,
  },
  cartCount: {
    color: colors.text.white,
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
  },
  heading: {
    fontSize: typography.sizes.xxl,
    fontWeight: typography.weights.bold,
    color: colors.text.white,
    marginBottom: spacing.lg,
    lineHeight: 30,
  },
  veggieStrip: {
    width: SCREEN_WIDTH,
    height: 160,
    marginLeft: -spacing.lg,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  section: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
  },
  quickRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  quickCell: {
    flex: 1,
    alignItems: 'center',
  },
  bannerContainer: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
  },
  banner: {
    borderRadius: radius.xl,
    flexDirection: 'row',
    overflow: 'hidden',
    minHeight: 120,
  },
  bannerContent: {
    flex: 1,
    padding: spacing.lg,
    justifyContent: 'center',
  },
  bannerSub: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: typography.sizes.sm,
    fontStyle: 'italic',
    marginBottom: 4,
  },
  bannerTitle: {
    color: colors.text.white,
    fontSize: typography.sizes.xxl,
    fontWeight: typography.weights.bold,
    fontStyle: 'italic',
    marginBottom: spacing.md,
  },
  bannerBtn: {
    backgroundColor: colors.text.white,
    borderRadius: radius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    alignSelf: 'flex-start',
  },
  bannerBtnText: {
    color: colors.primaryDark,
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
  },
  bannerImage: {
    width: 120,
    height: '100%',
  },
  storesSection: {
    paddingBottom: spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
  },
  showAll: {
    fontSize: typography.sizes.md,
    color: colors.primary,
    fontWeight: typography.weights.medium,
  },
});
