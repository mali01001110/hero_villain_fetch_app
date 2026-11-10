import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Appearance, Biography, Connections, Work } from '@/api/types';
import { SPACING, useTheme } from '@/theme/ThemeContext';

interface DetailRowProps {
  label: string;
  value: string | string[];
}

export function DetailRow({ label, value }: DetailRowProps) {
  const { tokens } = useTheme();

  const formattedValue = Array.isArray(value)
    ? value.length > 0
      ? value.join(', ')
      : 'Unknown'
    : value || 'Unknown';

  return (
    <View style={styles.row}>
      <Text style={[styles.label, { color: tokens.textSecondary }]}>{label}</Text>
      <Text style={[styles.value, { color: tokens.text }]}>{formattedValue}</Text>
    </View>
  );
}

interface SectionContainerProps {
  title: string;
  children: React.ReactNode;
}

export function SectionContainer({ title, children }: SectionContainerProps) {
  const { tokens } = useTheme();

  return (
    <View style={[styles.sectionContainer, { borderColor: tokens.border, backgroundColor: tokens.card }]}>
      <Text style={[styles.sectionTitle, { color: tokens.text, borderBottomColor: tokens.divider }]}>
        {title}
      </Text>
      <View style={styles.sectionBody}>{children}</View>
    </View>
  );
}

export function BiographySection({ biography }: { biography: Biography }) {
  return (
    <SectionContainer title="Biography">
      <DetailRow label="Full Name" value={biography.fullName} />
      <DetailRow label="Alter Egos" value={biography.alterEgos} />
      <DetailRow label="Aliases" value={biography.aliases} />
      <DetailRow label="Place of Birth" value={biography.placeOfBirth} />
      <DetailRow label="First Appearance" value={biography.firstAppearance} />
      <DetailRow label="Publisher" value={biography.publisher} />
      <DetailRow label="Alignment" value={biography.alignment} />
    </SectionContainer>
  );
}

function formatDimension(dimension: { imperial: string; metric: string }): string {
  if (dimension.imperial === 'Unknown' && dimension.metric === 'Unknown') {
    return 'Unknown';
  }
  if (dimension.metric === 'Unknown') {
    return dimension.imperial;
  }
  if (dimension.imperial === 'Unknown') {
    return dimension.metric;
  }
  return `${dimension.imperial} (${dimension.metric})`;
}

export function AppearanceSection({ appearance }: { appearance: Appearance }) {
  const heightStr = formatDimension(appearance.height);
  const weightStr = formatDimension(appearance.weight);

  return (
    <SectionContainer title="Appearance">
      <DetailRow label="Gender" value={appearance.gender} />
      <DetailRow label="Race" value={appearance.race} />
      <DetailRow label="Height" value={heightStr} />
      <DetailRow label="Weight" value={weightStr} />
      <DetailRow label="Eye Color" value={appearance.eyeColor} />
      <DetailRow label="Hair Color" value={appearance.hairColor} />
    </SectionContainer>
  );
}

export function WorkSection({ work }: { work: Work }) {
  return (
    <SectionContainer title="Work">
      <DetailRow label="Occupation" value={work.occupation} />
      <DetailRow label="Base" value={work.base} />
    </SectionContainer>
  );
}

export function ConnectionsSection({ connections }: { connections: Connections }) {
  return (
    <SectionContainer title="Connections">
      <DetailRow label="Group Affiliation" value={connections.groupAffiliation} />
      <DetailRow label="Relatives" value={connections.relatives} />
    </SectionContainer>
  );
}

const styles = StyleSheet.create({
  sectionContainer: {
    borderWidth: 1,
    borderRadius: 8,
    marginVertical: SPACING.sm,
    overflow: 'hidden',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    letterSpacing: -0.2,
    textTransform: 'uppercase',
  },
  sectionBody: {
    padding: SPACING.md,
    gap: SPACING.sm,
  },
  row: {
    flexDirection: 'column',
    gap: 2,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  value: {
    fontSize: 15,
    lineHeight: 22,
    flexWrap: 'wrap',
  },
});
