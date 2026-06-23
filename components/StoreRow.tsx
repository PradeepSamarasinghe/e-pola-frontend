import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
} from 'react-native';
import { Zap } from 'lucide-react-native';
import { colors, radius, spacing, typography } from '@/constants/theme';
import { Store } from '@/lib/api';

type Props = {
  store: Store;
  onPress?: () => void;
};

export default function StoreRow({ store, onPress }: Props) {
  return (
    <TouchableOpacity style={styles.row} onPress={onPress} activeOpacity={0.8}>
      <View style={styles.iconWrapper}>
        {store.icon_url ? (
          <Image source={{ uri: store.icon_url }} style={styles.icon} resizeMode="cover" />
        ) : (
          <View style={[styles.icon, styles.iconPlaceholder]} />
        )}
      </View>
      <View style={styles.info}>
        <Text style={styles.name}>{store.name}</Text>
        <View style={styles.metaRow}>
          <Zap size={11} color={colors.warning} fill={colors.warning} />
          <Text style={styles.metaText}>
            {store.delivery_time} . {store.distance} . $
          </Text>
        </View>
        <View style={styles.tagsRow}>
          {(store.tags ?? []).map((tag) => (
            <View key={tag} style={styles.tag}>
              <Text style={styles.tagText}>{tag}</Text>
            </View>
          ))}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  iconWrapper: {
    marginRight: spacing.md,
  },
  icon: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  iconPlaceholder: {
    backgroundColor: colors.primaryLight,
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.semibold,
    color: colors.text.primary,
    marginBottom: 3,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    marginBottom: spacing.xs,
  },
  metaText: {
    fontSize: typography.sizes.sm,
    color: colors.text.secondary,
  },
  tagsRow: {
    flexDirection: 'row',
    gap: spacing.xs,
    flexWrap: 'wrap',
  },
  tag: {
    backgroundColor: '#FEF9C3',
    borderRadius: radius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
  },
  tagText: {
    fontSize: typography.sizes.xs,
    color: colors.text.secondary,
    fontWeight: typography.weights.medium,
  },
});
