import { StyleSheet, Text, View } from 'react-native';

export function SectionCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.sectionCard}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );
}

export function MetricCard({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent: 'amber' | 'blue' | 'mint';
}) {
  return (
    <View
      style={[
        styles.metricCard,
        accent === 'amber' && styles.metricAmber,
        accent === 'blue' && styles.metricBlue,
        accent === 'mint' && styles.metricMint,
      ]}
    >
      <Text style={styles.metricLabel}>{label}</Text>
      <Text style={styles.metricValue}>{value}</Text>
    </View>
  );
}

export function BigMetric({ title, value }: { title: string; value: string }) {
  return (
    <View style={styles.bigMetric}>
      <Text style={styles.bigMetricTitle}>{title}</Text>
      <Text style={styles.bigMetricValue}>{value}</Text>
    </View>
  );
}

export function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <View style={styles.legendItem}>
      <View style={[styles.legendDot, { backgroundColor: color }]} />
      <Text style={styles.legendLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  sectionCard: {
    backgroundColor: '#0d1720',
    borderColor: '#1c2a36',
    borderRadius: 22,
    borderWidth: 1,
    gap: 14,
    padding: 18,
  },
  sectionTitle: {
    color: '#f8fafc',
    fontSize: 22,
    fontWeight: '800',
  },
  metricCard: {
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  metricAmber: {
    backgroundColor: '#3a2510',
  },
  metricBlue: {
    backgroundColor: '#122d47',
  },
  metricMint: {
    backgroundColor: '#10342e',
  },
  metricLabel: {
    color: '#cbd5e1',
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  metricValue: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '800',
    marginTop: 4,
  },
  bigMetric: {
    backgroundColor: '#0d1720',
    borderColor: '#1c2a36',
    borderRadius: 18,
    borderWidth: 1,
    minWidth: '47%',
    padding: 18,
  },
  bigMetricTitle: {
    color: '#94a3b8',
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  bigMetricValue: {
    color: '#f8fafc',
    fontSize: 28,
    fontWeight: '900',
    marginTop: 8,
  },
  legendItem: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  legendDot: {
    borderRadius: 999,
    height: 10,
    width: 10,
  },
  legendLabel: {
    color: '#cbd5e1',
    fontSize: 13,
    fontWeight: '600',
  },
});
