import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text, Platform } from 'react-native';

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
          borderTopColor: c.border,
          elevation: 0,
        },
        tabBarActiveTintColor: c.primary,
        tabBarInactiveTintColor: c.textMuted,
        tabBarLabelStyle: {
          fontFamily: 'Satoshi-Medium',
          fontSize: 12,
        },
        headerStyle: { backgroundColor: c.surface },
        headerTintColor: c.text,
        headerShadowVisible: false,
        headerTitleStyle: {
          fontFamily: 'SpaceGrotesk-Bold',
          fontSize: 18,
        },
      }}
    >
      <Tab.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 20 }}>📊</Text>,
          title: 'Dashboard',
        }}
      />
      <Tab.Screen
        name="IssueList"
        component={IssueListScreen}
        options={{
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 20 }}>🐛</Text>,
          title: 'Issues',
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
