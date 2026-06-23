import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from 'react-native';
import { MapPin, Clock, Navigation, Tag, ChevronRight, Zap } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, spacing, radius, typography } from '@/constants/theme';
import { fetchStores } from '@/lib/api';
import { Store } from '@/lib/api';

const AREA_IMAGES: Record<number, string> = {
  0: 'https://images.pexels.com/photos/2292919/pexels-photo-2292919.jpeg?auto=compress&cs=tinysrgb&w=400',
  1: 'https://images.pexels.com/photos/1508666/pexels-photo-1508666.jpeg?auto=compress&cs=tinysrgb&w=400',
  2: 'https://images.pexels.com/photos/2292919/pexels-photo-2292919.jpeg?auto=compress&cs=tinysrgb&w=400',
  3: 'https://images.pexels.com/photos/1508666/pexels-photo-1508666.jpeg?auto=compress&cs=tinysrgb&w=400',
};

type FilterOption = 'all' | 'fast' | 'near';

export default function MapScreen() {
  const insets = useSafeAreaInsets();
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<FilterOption>('all');

  useEffect(() => {
    loadStores();
  }, []);

  async function loadStores() {
    try {
      const data = await fetchStores();
      setStores(data);
    } finally {
      setLoading(false);
    }
  }

  const filters: { key: FilterOption; label: string }[] = [
    { key: 'all', label: 'All Stores' },
    { key: 'fast', label: 'Fastest' },
    { key: 'near', label: 'Nearest' },
  ];

  const filtered = stores.filter((s) => {
    if (activeFilter === 'fast') return ((s.delivery_time ?? '') ?? '').includes('9') || ((s.delivery_time ?? '') ?? '').includes('10');
    if (activeFilter === 'near') return parseFloat(s.distance) < 15;
    return true;
  });

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Map placeholder header */}
      <LinearGradient
        colors={[colors.primaryDark, colors.primary]}
        style={styles.mapBanner}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.mapBannerContent}>
          <Navigation size={20} color={colors.text.white} />
          <View style={styles.mapBannerText}>
            <Text style={styles.mapBannerTitle}>Colombo, Western Province</Text>
            <Text style={styles.mapBannerSub}>Your delivery area</Text>
          </View>
        </View>
        <View style={styles.mapGrid}>
          {[0, 1, 2, 3].map((i) => (
            <View key={i} style={styles.mapCell}>
              <MapPin
                size={14}
                color={i === 0 ? '#FCD34D' : 'rgba(255,255,255,0.5)'}
                fill={i === 0 ? '#FCD34D' : 'none'}
              />
            </View>
          ))}
        </View>
      </LinearGradient>

      {/* Filter pills */}
      <View style={styles.filterRow}>
        {filters.map(({ key, label }) => (
          <TouchableOpacity
            key={key}
            style={[styles.filterPill, activeFilter === key && styles.filterPillActive]}
            onPress={() => setActiveFilter(key)}
          >
            <Text
              style={[styles.filterPillText, activeFilter === key && styles.filterPillTextActive]}
            >
              {label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.sectionTitle}>
        {filtered.length} store{filtered.length !== 1 ? 's' : ''} near you
      </Text>

      {loading ? (
        <ActivityIndicator color={colors.primary} style={{ marginTop: spacing.xl }} />
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.storeList}
        >
          {filtered.map((store, i) => (
            <StoreDetailCard key={store.id} store={store} imageUri={AREA_IMAGES[i % 4]} />
          ))}
          <View style={{ height: spacing.xxl }} />
        </ScrollView>
      )}
    </View>
  );
}

function StoreDetailCard({ store, imageUri }: { store: Store; imageUri: string }) {
  return (
    <TouchableOpacity style={styles.storeCard} activeOpacity={0.88}>
      {/* Cover image */}
      <Image source={{ uri: imageUri }} style={styles.storeImage} resizeMode="cover" />

      <View style={styles.storeBody}>
        {/* Name + Arrow */}
        <View style={styles.storeNameRow}>
          <Text style={styles.storeName}>{store.name}</Text>
          <ChevronRight size={18} color={colors.text.muted} />
        </View>

        {/* Meta row */}
        <View style={styles.storeMeta}>
          <View style={styles.metaItem}>
            <Clock size={13} color={colors.primary} />
            <Text style={styles.metaText}>{store.delivery_time}</Text>
          </View>
          <View style={styles.metaDot} />
          <View style={styles.metaItem}>
            <MapPin size={13} color={colors.primary} />
            <Text style={styles.metaText}>{store.distance}</Text>
          </View>
          <View style={styles.metaDot} />
          <View style={styles.metaItem}>
            <Zap size={13} color={colors.warning} fill={colors.warning} />
            <Text style={styles.metaText}>Express</Text>
          </View>
        </View>

        {/* Tags */}
        {store.tags.length > 0 && (
          <View style={styles.tagsRow}>
            {(store.tags ?? []).map((tag) => (
              <View key={tag} style={styles.tag}>
                <Tag size={10} color={colors.primary} />
                <Text style={styles.tagText}>{tag}</Text>
              </View>
            ))}
          </View>
        )}

        {/* CTA */}
        <TouchableOpacity style={styles.orderBtn}>
          <Text style={styles.orderBtnText}>Order from this store</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  mapBanner: {
    height: 140,
    marginHorizontal: spacing.lg,
    borderRadius: radius.xl,
    marginBottom: spacing.lg,
    padding: spacing.lg,
    overflow: 'hidden',
    justifyContent: 'space-between',
  },
  mapBannerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  mapBannerText: { flex: 1 },
  mapBannerTitle: {
    color: colors.text.white,
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
  },
  mapBannerSub: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: typography.sizes.sm,
    marginTop: 2,
  },
  mapGrid: {
    flexDirection: 'row',
    gap: spacing.xl,
    alignSelf: 'center',
  },
  mapCell: {
    width: 32,
    height: 32,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterRow: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  filterPill: {
    borderRadius: radius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.surfaceAlt,
    borderWidth: 1,
    borderColor: colors.border,
  },
  filterPillActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  filterPillText: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
    color: colors.text.secondary,
  },
  filterPillTextActive: {
    color: colors.text.white,
  },
  sectionTitle: {
    fontSize: typography.sizes.md,
    color: colors.text.secondary,
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  storeList: {
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
  },
  storeCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    overflow: 'hidden',
    marginBottom: spacing.md,
  },
  storeImage: {
    width: '100%',
    height: 120,
  },
  storeBody: {
    padding: spacing.md,
    gap: spacing.sm,
  },
  storeNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  storeName: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
    flex: 1,
  },
  storeMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flexWrap: 'wrap',
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: typography.sizes.sm,
    color: colors.text.secondary,
  },
  metaDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.border,
  },
  tagsRow: {
    flexDirection: 'row',
    gap: spacing.xs,
    flexWrap: 'wrap',
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.primaryMuted,
    borderRadius: radius.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
  },
  tagText: {
    fontSize: typography.sizes.xs,
    color: colors.primary,
    fontWeight: typography.weights.medium,
  },
  orderBtn: {
    backgroundColor: colors.primary,
    borderRadius: radius.full,
    paddingVertical: spacing.sm,
    alignItems: 'center',
    marginTop: spacing.xs,
  },
  orderBtnText: {
    color: colors.text.white,
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
  },
});
