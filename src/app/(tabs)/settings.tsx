import DateTimePicker, {
  type DateTimePickerEvent,
} from '@react-native-community/datetimepicker';
import Constants from 'expo-constants';
import { useSQLiteContext } from 'expo-sqlite';
import { useEffect, useState } from 'react';
import { Alert, Linking, Share, StyleSheet, Switch, View } from 'react-native';

import { BrandMark } from '@/components/BrandMark';
import { Card } from '@/components/Card';
import { Icon, type IconName } from '@/components/Icon';
import { PressableScale } from '@/components/PressableScale';
import { Screen } from '@/components/Screen';
import { Txt } from '@/components/Txt';
import * as repo from '@/data/entriesRepository';
import { getPermissionState, type PermissionState } from '@/notifications/reminders';
import { syncReminder } from '@/notifications/sync';
import {
  DEFAULT_REMINDER,
  formatTime,
  getReminderPrefs,
  type ReminderPrefs,
  setReminderPrefs,
} from '@/prefs/reminder';
import { APP_NAME, APP_TAGLINE } from '@/theme/brand';
import { palette } from '@/theme/colors';
import { fonts, radius, spacing, type } from '@/theme/tokens';

export default function SettingsScreen() {
  const db = useSQLiteContext();
  const [prefs, setPrefs] = useState<ReminderPrefs>(DEFAULT_REMINDER);
  const [permState, setPermState] = useState<PermissionState>('undetermined');
  const [showPicker, setShowPicker] = useState(false);

  useEffect(() => {
    (async () => {
      setPrefs(await getReminderPrefs());
      setPermState(await getPermissionState());
    })();
  }, []);

  const applyPrefs = async (next: ReminderPrefs) => {
    setPrefs(next);
    await setReminderPrefs(next);
    const result = await syncReminder({ requestIfNeeded: true, prefs: next });
    setPermState(await getPermissionState());
    if (result === 'denied' && next.enabled) {
      Alert.alert(
        'Notifications are off',
        'Turn on notifications for Rebound in system settings to get your daily reminder.',
        [
          { text: 'Not now', style: 'cancel' },
          { text: 'Open settings', onPress: () => Linking.openSettings() },
        ],
      );
    }
  };

  const onToggle = (value: boolean) => applyPrefs({ ...prefs, enabled: value });

  const onTimeChange = (event: DateTimePickerEvent, date?: Date) => {
    setShowPicker(false);
    if (event.type === 'set' && date) {
      applyPrefs({ ...prefs, hour: date.getHours(), minute: date.getMinutes() });
    }
  };

  const onExport = async () => {
    const all = await repo.all(db);
    if (all.length === 0) {
      Alert.alert('Nothing to export yet', 'Log a few check-ins first.');
      return;
    }
    const payload = JSON.stringify(
      { app: APP_NAME, exportedAt: new Date().toISOString(), entries: all },
      null,
      2,
    );
    await Share.share({ message: payload, title: `${APP_NAME} export` });
  };

  const onReset = () => {
    Alert.alert(
      'Erase all check-ins?',
      'This permanently deletes every entry on this device. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Erase everything',
          style: 'destructive',
          onPress: async () => {
            await repo.deleteAll(db);
          },
        },
      ],
    );
  };

  const pickerDate = new Date();
  pickerDate.setHours(prefs.hour, prefs.minute, 0, 0);
  const version = Constants.expoConfig?.version ?? '1.0.0';

  return (
    <Screen>
      <Txt variant="display">Settings</Txt>

      {/* Reminder */}
      <Card style={styles.card}>
        <View style={styles.rowBetween}>
          <View style={styles.rowLeft}>
            <View style={[styles.iconChip, { backgroundColor: '#FFF1EF' }]}>
              <Icon name="bell" size={20} color={palette.coral} />
            </View>
            <View style={styles.rowTextWrap}>
              <Txt style={styles.rowTitle}>Daily reminder</Txt>
              <Txt variant="caption">A gentle nudge to check in</Txt>
            </View>
          </View>
          <Switch
            value={prefs.enabled}
            onValueChange={onToggle}
            trackColor={{ false: palette.hairline, true: palette.coral }}
            thumbColor={palette.cloud}
            ios_backgroundColor={palette.hairline}
          />
        </View>

        {prefs.enabled ? (
          <>
            <View style={styles.divider} />
            <PressableScale haptic={false} onPress={() => setShowPicker(true)} style={styles.rowBetween}>
              <Txt style={styles.rowTitle}>Time</Txt>
              <View style={styles.rowLeft}>
                <Txt style={styles.timeValue}>{formatTime(prefs.hour, prefs.minute)}</Txt>
                <Icon name="chevronRight" size={18} color={palette.mist} />
              </View>
            </PressableScale>
            {permState === 'undetermined' ? (
              <PressableScale haptic={false} onPress={() => applyPrefs(prefs)}>
                <Txt variant="caption" style={styles.hint}>
                  Tap to allow notifications so your reminder can reach you.
                </Txt>
              </PressableScale>
            ) : permState === 'denied' ? (
              <PressableScale haptic={false} onPress={() => Linking.openSettings()}>
                <Txt variant="caption" style={styles.warning}>
                  Notifications are blocked — tap to open system settings.
                </Txt>
              </PressableScale>
            ) : null}
          </>
        ) : null}
      </Card>

      {showPicker ? (
        <DateTimePicker value={pickerDate} mode="time" is24Hour={false} onChange={onTimeChange} />
      ) : null}

      {/* Data */}
      <Card style={styles.card} padding={spacing.sm}>
        <SettingRow icon="download" label="Export my data" onPress={onExport} />
        <View style={styles.divider} />
        <SettingRow icon="trash" label="Erase all check-ins" danger onPress={onReset} />
      </Card>

      {/* About */}
      <Card style={[styles.card, styles.about]}>
        <BrandMark size={48} />
        <Txt variant="title" style={styles.aboutName}>
          {APP_NAME}
        </Txt>
        <Txt variant="bodyMuted" align="center">
          {APP_TAGLINE}
        </Txt>
        <Txt variant="caption" align="center" style={styles.privacy}>
          Everything stays on your device. Version {version}.
        </Txt>
      </Card>
    </Screen>
  );
}

function SettingRow({
  icon,
  label,
  onPress,
  danger,
}: {
  icon: IconName;
  label: string;
  onPress: () => void;
  danger?: boolean;
}) {
  const color = danger ? palette.coral : palette.ink;
  return (
    <PressableScale haptic={false} onPress={onPress} style={styles.settingRow}>
      <Icon name={icon} size={20} color={color} />
      <Txt style={[styles.rowTitle, { color }]}>{label}</Txt>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  card: { marginTop: spacing.lg },
  rowBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  rowLeft: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  rowTextWrap: { gap: 1 },
  iconChip: {
    width: 38,
    height: 38,
    borderRadius: radius.input,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowTitle: { fontFamily: fonts.bodySemiBold, fontSize: type.body, color: palette.ink },
  timeValue: { fontFamily: fonts.bodyMedium, fontSize: type.body, color: palette.coral },
  divider: { height: 1, backgroundColor: palette.hairline, marginVertical: spacing.md },
  warning: { color: palette.coral, marginTop: spacing.sm },
  hint: { color: palette.mist, marginTop: spacing.sm },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
  },
  about: { alignItems: 'center', gap: spacing.sm, paddingVertical: spacing.xxl },
  aboutName: { marginTop: spacing.xs },
  privacy: { marginTop: spacing.sm },
});
