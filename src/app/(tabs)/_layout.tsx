import { Tabs } from 'expo-router';
import { Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Icon, type IconName } from '@/components/Icon';
import { palette, withAlpha } from '@/theme/colors';
import { fonts, radius, shadow } from '@/theme/tokens';

const TABS: { name: string; title: string; icon: IconName }[] = [
  { name: 'index', title: 'Today', icon: 'sun' },
  { name: 'calendar', title: 'Calendar', icon: 'calendar' },
  { name: 'trends', title: 'Trends', icon: 'trend' },
  { name: 'settings', title: 'Settings', icon: 'sliders' },
];

export default function TabsLayout() {
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: palette.coral,
        tabBarInactiveTintColor: palette.mist,
        tabBarHideOnKeyboard: true,
        tabBarLabelStyle: { fontFamily: fonts.bodyMedium, fontSize: 11 },
        // Clean, centered button with a soft borderless ripple instead of the
        // default rectangular Android ripple that looked odd in the rounded bar.
        tabBarButton: ({ style, ref, ...props }) => (
          <Pressable
            {...props}
            android_ripple={{ borderless: true, color: withAlpha(palette.coral, 0.12) }}
            style={[style, { flex: 1, alignItems: 'center', justifyContent: 'center' }]}
          />
        ),
        tabBarStyle: {
          position: 'absolute',
          marginHorizontal: 36,
          bottom: insets.bottom + 12,
          height: 64,
          paddingTop: 0,
          paddingBottom: 0,
          borderRadius: radius.card,
          backgroundColor: palette.cloud,
          borderTopWidth: 0,
          ...shadow.card,
        },
      }}
    >
      {TABS.map((t) => (
        <Tabs.Screen
          key={t.name}
          name={t.name}
          options={{
            title: t.title,
            tabBarIcon: ({ color, focused }) => (
              <Icon name={t.icon} size={23} color={color as string} strokeWidth={focused ? 2.6 : 2} />
            ),
          }}
        />
      ))}
    </Tabs>
  );
}
