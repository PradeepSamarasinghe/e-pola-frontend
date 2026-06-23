import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Dimensions,
} from 'react-native';
import { colors, radius, spacing, typography } from '@/constants/theme';
import { Category } from '@/lib/api';

type Props = {
  category: Category;
  price?: string;
  onPress?: () => void;
  onAddPress?: () => void;
  showNew?: boolean;
};

const CARD_WIDTH = (Dimensions.get('window').width - spacing.lg * 2 - spacing.md) / 2;

export default function CategoryCard({
  category,
  price = '$07.00',
  onPress,
  onAddPress,
  showNew = false,
}: Props) {
  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: category.color_theme }]}
      onPress={onPress}
      activeOpacity={0.85}
    >
      {showNew && (
        <View style={styles.newBadge}>
          <Text style={styles.newBadgeText}>New</Text>
        </View>
      )}
      <Text style={styles.name} numberOfLines={2}>
        {category.name}
      </Text>
      {category.image_url ? (
        <Image
          source={{ uri: category.image_url }}
          style={styles.image}
          resizeMode="cover"
        />
      ) : (
        <View style={styles.imagePlaceholder} />
      )}
      <View style={styles.footer}>
        <View style={styles.priceBadge}>
          <Text style={styles.priceText}>{price}</Text>
        </View>
        <TouchableOpacity style={styles.addButton} onPress={onAddPress}>
          <Text style={styles.addIcon}>+</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    width: CARD_WIDTH,
    borderRadius: radius.xl,
    padding: spacing.md,
    marginBottom: spacing.md,
    minHeight: 180,
    overflow: 'hidden',
  },
  newBadge: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    backgroundColor: colors.badge.new,
    borderRadius: radius.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    zIndex: 1,
  },
  newBadgeText: {
    color: colors.badge.newText,
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold,
  },
  name: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
    color: colors.text.primary,
    marginBottom: spacing.sm,
    lineHeight: 20,
  },
  image: {
    width: '100%',
    height: 90,
    borderRadius: radius.md,
    marginBottom: spacing.sm,
  },
  imagePlaceholder: {
    width: '100%',
    height: 90,
    borderRadius: radius.md,
    backgroundColor: 'rgba(0,0,0,0.05)',
    marginBottom: spacing.sm,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  priceBadge: {
    backgroundColor: 'rgba(255,255,255,0.7)',
    borderRadius: radius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
  },
  priceText: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
    color: colors.text.primary,
  },
  addButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.text.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addIcon: {
    color: colors.text.white,
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    lineHeight: 22,
  },
});
