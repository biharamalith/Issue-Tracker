import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text, Platform, Image } from 'react-native';

import { LoginScreen } from '../screens/LoginScreen';
import { DashboardScreen } from '../screens/DashboardScreen';
import { IssueListScreen } from '../screens/IssueListScreen';
import { IssueDetailScreen } from '../screens/IssueDetailScreen';
import { CreateEditIssueScreen } from '../screens/CreateEditIssueScreen';
import { useAuthStore } from '../store/authStore';
import { useTheme } from '../hooks/useTheme';
import { RootStackParamList, MainTabParamList } from '../types';

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();

const MainTabs = () => {
  const { theme } = useTheme();
  const c = theme.colors;

  return (
    <Tab.Navigator
      screenOptions={{
        tabBarStyle: {
          backgroundColor: c.surface,
          borderTopWidth: 0,
          elevation: 0,
          height: Platform.OS === 'ios' ? 88 : 70,
          paddingBottom: Platform.OS === 'ios' ? 28 : 10,
          paddingTop: 10,
          position: 'absolute',
          borderTopLeftRadius: 24,
          borderTopRightRadius: 24,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 0.1,
          shadowRadius: 12,
        },
        tabBarActiveTintColor: c.primary,
        tabBarInactiveTintColor: c.textMuted,
        tabBarLabelStyle: {
          fontFamily: 'Satoshi-Medium',
          fontSize: 11,
          marginTop: 4,
        },
        tabBarIconStyle: {
          marginTop: 4,
        },
        headerStyle: { backgroundColor: c.surface },
        headerTintColor: c.text,
        headerShadowVisible: false,
        headerTitleStyle: {
          fontFamily: 'SpaceGrotesk-Bold',
          fontSize: 20,
        },
      }}
    >
      <Tab.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{
          tabBarIcon: ({ color, focused }) => (
            <Image
              source={require('../../assets/dashboard.png')}
              style={{
                width: focused ? 24 : 22,
                height: focused ? 24 : 22,
                tintColor: focused ? c.primary : c.textMuted,
              }}
              resizeMode="contain"
            />
          ),
          title: 'Dashboard',
          headerShown: false,
        }}
      />
      <Tab.Screen
        name="IssueList"
        component={IssueListScreen}
        options={{
          tabBarIcon: ({ color, focused }) => (
            <Image
              source={require('../../assets/issues.png')}
              style={{
                width: focused ? 24 : 22,
                height: focused ? 24 : 22,
                tintColor: focused ? c.primary : c.textMuted,
              }}
              resizeMode="contain"
            />
          ),
          title: 'Issues',
          headerShown: false,
        }}
      />
    </Tab.Navigator>
  );
};

export const AppNavigator = () => {
  const { theme } = useTheme();
  const c = theme.colors;
  const user = useAuthStore(s => s.user);

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerStyle: { backgroundColor: c.surface },
          headerTintColor: c.text,
          headerShadowVisible: false,
          contentStyle: { backgroundColor: c.background },
          headerTitleStyle: {
            fontFamily: 'SpaceGrotesk-Bold',
            fontSize: 18,
          },
          headerBackTitleStyle: {
            fontFamily: 'Satoshi-Medium',
          },
        }}
      >
        {!user ? (
          <Stack.Screen
            name="Login"
            component={LoginScreen}
            options={{ headerShown: false }}
          />
        ) : (
          <>
            <Stack.Screen
              name="Main"
              component={MainTabs}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="IssueDetail"
              component={IssueDetailScreen}
              options={{ title: 'Issue Detail' }}
            />
            <Stack.Screen
              name="CreateEditIssue"
              component={CreateEditIssueScreen}
              options={{ title: 'New Issue' }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};
