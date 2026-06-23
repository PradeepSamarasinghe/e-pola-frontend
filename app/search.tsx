import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { ChevronLeft, Search, X } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { fetchProducts } from '@/lib/api';
import { Product } from '@/lib/api';
import { colors, spacing, radius, typography } from '@/constants/theme';
import ProductListItem from '@/components/ProductListItem';

export default function SearchScreen() {
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ q?: string }>();
  const [query, setQuery] = useState(params.q ?? '');
  const [results, setResults] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inputRef = useRef<TextInput>(null);

  useEffect(() => {
    if (params.q) runSearch(params.q);
    else inputRef.current?.focus();
  }, []);

  const runSearch = useCallback(async (text: string) => {
    if (!text.trim()) {
      setResults([]);
      setSearched(false);
      return;
    }
    setLoading(true);
    try {
      const data = await fetchProducts({ search: text.trim() });
      setResults(data);
      setSearched(true);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  function handleChange(text: string) {
    setQuery(text);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => runSearch(text), 400);
  }

  function handleClear() {
    setQuery('');
    setResults([]);
    setSearched(false);
    inputRef.current?.focus();
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Search bar row */}
      <View style={styles.topRow}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <ChevronLeft size={22} color={colors.text.primary} />
        </TouchableOpacity>
        <View style={styles.searchBar}>
          <Search size={16} color={colors.text.muted} />
          <TextInput
            ref={inputRef}
            style={styles.searchInput}
            placeholder="Search products..."
            placeholderTextColor={colors.text.muted}
            value={query}
            onChangeText={handleChange}
            returnKeyType="search"
            onSubmitEditing={() => runSearch(query)}
            autoFocus
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={handleClear}>
              <X size={16} color={colors.text.muted} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Results */}
      {loading ? (
        <ActivityIndicator color={colors.primary} style={{ marginTop: spacing.xxxl }} />
      ) : results.length > 0 ? (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
        >
          <Text style={styles.resultCount}>
            {results.length} result{results.length !== 1 ? 's' : ''} for "{query}"
          </Text>
          {results.map((product) => (
            <ProductListItem
              key={product.id}
              product={product}
              onPress={() => router.push(`/product/${product.id}`)}
            />
          ))}
          <View style={{ height: spacing.xxl }} />
        </ScrollView>
      ) : searched && query.trim() ? (
        <View style={styles.empty}>
          <Search size={48} color={colors.border} />
          <Text style={styles.emptyTitle}>No results found</Text>
          <Text style={styles.emptySub}>
            Try a different keyword or browse categories
          </Text>
          <TouchableOpacity
            style={styles.browseBtn}
            onPress={() => router.push('/(tabs)/shop')}
          >
            <Text style={styles.browseBtnText}>Browse Categories</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.placeholder}>
          <Text style={styles.placeholderTitle}>What are you looking for?</Text>
          <Text style={styles.placeholderSub}>
            Search for vegetables, fruits, meat, dairy and more
          </Text>
          <View style={styles.suggestions}>
            {['Fresh Vegetables', 'Bananas', 'Beef Bone', 'Bell Pepper'].map((s) => (
              <TouchableOpacity
                key={s}
                style={styles.suggestionChip}
                onPress={() => {
                  setQuery(s);
                  runSearch(s);
                }}
              >
                <Text style={styles.suggestionText}>{s}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    gap: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: radius.full,
    backgroundColor: colors.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    gap: spacing.sm,
    borderWidth: 1.5,
    borderColor: colors.primary,
  },
  searchInput: {
    flex: 1,
    fontSize: typography.sizes.md,
    color: colors.text.primary,
    paddingVertical: 0,
  },
  listContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
  },
  resultCount: {
    fontSize: typography.sizes.sm,
    color: colors.text.muted,
    marginBottom: spacing.md,
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.xl,
  },
  emptyTitle: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
  },
  emptySub: {
    fontSize: typography.sizes.md,
    color: colors.text.muted,
    textAlign: 'center',
  },
  browseBtn: {
    backgroundColor: colors.primary,
    borderRadius: radius.full,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.sm,
  },
  browseBtnText: {
    color: colors.text.white,
    fontWeight: typography.weights.semibold,
  },
  placeholder: {
    flex: 1,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xxxl,
    alignItems: 'center',
  },
  placeholderTitle: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  placeholderSub: {
    fontSize: typography.sizes.md,
    color: colors.text.muted,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  suggestions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    justifyContent: 'center',
  },
  suggestionChip: {
    backgroundColor: colors.primaryMuted,
    borderRadius: radius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderWidth: 1,
    borderColor: colors.primaryLight,
  },
  suggestionText: {
    color: colors.primary,
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
  },
});
