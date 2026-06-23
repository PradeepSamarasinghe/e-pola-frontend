import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { SlidersHorizontal, Search } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, spacing, radius, typography, categoryColors } from '@/constants/theme';
import { fetchCategories } from '@/lib/api';
import { Category } from '@/lib/api';
import { useCart } from '@/context/CartContext';
import CategoryCard from '@/components/CategoryCard';
import CartBadge from '@/components/CartBadge';

const CATEGORY_PRICES = ['Rs. 380', 'Rs. 450', 'Rs. 1,280', 'Rs. 680', 'Rs. 1,480', 'Rs. 620'];

export default function ShopScreen() {
  const insets = useSafeAreaInsets();
  const { totalCount } = useCart();

  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadCategories();
  }, []);

  async function loadCategories() {
    try {
      const data = await fetchCategories();
      setCategories(data);
    } catch (e) {
      setError('Failed to load categories');
    } finally {
      setLoading(false);
    }
  }

  const totalItems = categories.reduce((sum, c) => sum + (c.item_count ?? 0), 0);

  const left = categories.filter((_, i) => i % 2 === 0);
  const right = categories.filter((_, i) => i % 2 !== 0);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Groceries</Text>
          <Text style={styles.headerTitle}>Collections</Text>
        </View>
        <CartBadge
          dark
          onPress={() => router.push('/cart')}
        />
      </View>

      {/* Filter row */}
      <View style={styles.filterRow}>
        <Text style={styles.itemCount}>
          {loading ? '...' : `${totalItems} Items`}
        </Text>
        <View style={styles.filterActions}>
          <TouchableOpacity
            style={styles.filterBtn}
            onPress={() => router.push('/search')}
          >
            <Search size={16} color={colors.text.secondary} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.filterBtn}>
            <SlidersHorizontal size={16} color={colors.text.secondary} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Content */}
      {loading ? (
        <ActivityIndicator color={colors.primary} style={{ marginTop: spacing.xxxl }} />
      ) : error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity onPress={loadCategories} style={styles.retryBtn}>
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.grid}
        >
          <View style={styles.columns}>
            {/* Left column */}
            <View style={styles.column}>
              {left.map((cat, i) => (
                <CategoryCard
                  key={cat.id}
                  category={{ ...cat, color_theme: categoryColors[i * 2] }}
                  price={CATEGORY_PRICES[i * 2]}
                  showNew={i === 0}
                  onPress={() => router.push(`/category/${cat.id}`)}
                  onAddPress={() => router.push(`/category/${cat.id}`)}
                />
              ))}
            </View>

            {/* Right column — offset down */}
            <View style={[styles.column, styles.columnOffset]}>
              {right.map((cat, i) => (
                <CategoryCard
                  key={cat.id}
                  category={{ ...cat, color_theme: categoryColors[i * 2 + 1] }}
                  price={CATEGORY_PRICES[i * 2 + 1]}
                  showNew={false}
                  onPress={() => router.push(`/category/${cat.id}`)}
                  onAddPress={() => router.push(`/category/${cat.id}`)}
                />
              ))}
            </View>
          </View>
          <View style={{ height: spacing.xxl }} />
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
  },
  headerTitle: {
    fontSize: typography.sizes.xxxl,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
    lineHeight: 36,
  },
  filterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  itemCount: {
    fontSize: typography.sizes.md,
    color: colors.text.secondary,
    fontWeight: typography.weights.medium,
  },
  filterActions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  filterBtn: {
    width: 36,
    height: 36,
    borderRadius: radius.sm,
    backgroundColor: colors.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },
  grid: {
    paddingHorizontal: spacing.lg,
  },
  columns: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  column: {
    flex: 1,
  },
  columnOffset: {
    marginTop: spacing.xxxl,
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
  },
  errorText: {
    color: colors.error,
    fontSize: typography.sizes.md,
  },
  retryBtn: {
    backgroundColor: colors.primary,
    borderRadius: radius.full,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  retryText: {
    color: colors.text.white,
    fontWeight: typography.weights.semibold,
  },
});
