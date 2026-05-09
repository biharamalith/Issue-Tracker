import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  ScrollView,
  Image,
} from 'react-native';
import { useAuthStore } from '../store/authStore';
import { useTheme } from '../hooks/useTheme';
import { validateEmail } from '../utils/formatDate';
import { fontStyles } from '../utils/fonts';
import { USE_FIREBASE } from '../services/api';

export const LoginScreen: React.FC = () => {
  const { theme, isDark, toggleTheme } = useTheme();
  const c = theme.colors;
  const login = useAuthStore(s => s.login);
  const register = useAuthStore(s => s.register);
  const isLoading = useAuthStore(s => s.isLoading);
  const authError = useAuthStore(s => s.error);

  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [showPassword, setShowPassword] = useState(false);

  const validate = () => {
    const newErrors: typeof errors = {};
    if (!email.trim()) newErrors.email = 'Email is required';
    else if (!validateEmail(email)) newErrors.email = 'Enter a valid email (e.g., user@example.com)';
    if (!password) newErrors.password = 'Password is required';
    else if (password.length < 6) newErrors.password = 'Password must be at least 6 characters';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async () => {
    if (!validate()) return;
    await login(email.trim(), password);
  };

  const handleSignUp = async () => {
    if (!validate()) return;
    await register(email.trim(), password);
  };

  const handleSubmit = () => {
    if (isSignUp) {
      handleSignUp();
    } else {
      handleLogin();
    }
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: c.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        {/* Theme toggle */}
        <TouchableOpacity style={styles.themeToggle} onPress={toggleTheme}>
          <Text style={{ fontSize: 22 }}>{isDark ? '☀️' : '🌙'}</Text>
        </TouchableOpacity>

        {/* Logo */}
        <View style={styles.logoContainer}>
          <Image 
            source={require('../../assets/issue-removebg-preview.png')} 
            style={styles.logoImage}
            resizeMode="contain"
          />
          <Text style={[styles.appName, { color: c.text }]}>IssueTracker</Text>
          <Text style={[styles.tagline, { color: c.textSecondary }]}>
            Track bugs. Ship faster.
          </Text>
        </View>

        {/* Card */}
        <View style={[styles.card, { backgroundColor: c.surface, borderColor: c.border }]}>
          <Text style={[styles.cardTitle, { color: c.text }]}>
            {isSignUp ? 'Create Account' : 'Sign in'}
          </Text>

          {authError && (
            <View style={[styles.errorBanner, { backgroundColor: '#FEF2F2', borderColor: '#FECACA' }]}>
              <Text style={[styles.errorBannerText, { color: c.error }]}>⚠️ {authError}</Text>
            </View>
          )}

          {/* Email */}
          <View style={styles.field}>
            <Text style={[styles.label, { color: c.textSecondary }]}>Email</Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: c.inputBackground,
                  borderColor: errors.email ? c.error : c.border,
                  color: c.text,
                  fontFamily: 'Satoshi-Regular',
                },
              ]}
              value={email}
              onChangeText={v => { setEmail(v); setErrors(e => ({ ...e, email: undefined })); }}
              placeholder="you@example.com"
              placeholderTextColor={c.placeholder}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
            {errors.email && <Text style={[styles.fieldError, { color: c.error }]}>{errors.email}</Text>}
          </View>

          {/* Password */}
          <View style={styles.field}>
            <Text style={[styles.label, { color: c.textSecondary }]}>Password</Text>
            <View style={styles.passwordRow}>
              <TextInput
                style={[
                  styles.input,
                  styles.passwordInput,
                  {
                    backgroundColor: c.inputBackground,
                    borderColor: errors.password ? c.error : c.border,
                    color: c.text,
                    fontFamily: 'Satoshi-Regular',
                  },
                ]}
                value={password}
                onChangeText={v => { setPassword(v); setErrors(e => ({ ...e, password: undefined })); }}
                placeholder="••••••••"
                placeholderTextColor={c.placeholder}
                secureTextEntry={!showPassword}
              />
              <TouchableOpacity
                style={[styles.eyeBtn, { borderColor: c.border, backgroundColor: c.inputBackground }]}
                onPress={() => setShowPassword(p => !p)}
              >
                <Image 
                  source={showPassword 
                    ? require('../../assets/eyeclose.png') 
                    : require('../../assets/eyeopen.png')
                  }
                  style={styles.eyeIcon}
                  resizeMode="contain"
                />
              </TouchableOpacity>
            </View>
            {errors.password && <Text style={[styles.fieldError, { color: c.error }]}>{errors.password}</Text>}
          </View>

          {/* Submit */}
          <TouchableOpacity
            style={[styles.loginBtn, { backgroundColor: c.primary }, isLoading && styles.loginBtnDisabled]}
            onPress={handleSubmit}
            disabled={isLoading}
            activeOpacity={0.8}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.loginBtnText}>
                {isSignUp ? 'Create Account' : 'Sign in'}
              </Text>
            )}
          </TouchableOpacity>

          {/* Toggle Sign Up / Sign In - Only show if Firebase is enabled */}
          {USE_FIREBASE && (
            <TouchableOpacity 
              onPress={() => {
                setIsSignUp(!isSignUp);
                setErrors({});
              }}
              style={styles.toggleContainer}
            >
              <Text style={[styles.toggleText, { color: c.textSecondary }]}>
                {isSignUp ? 'Already have an account? ' : "Don't have an account? "}
                <Text style={[styles.toggleLink, { color: c.primary }]}>
                  {isSignUp ? 'Sign in' : 'Sign up'}
                </Text>
              </Text>
            </TouchableOpacity>
          )}

          {!isSignUp && (
            <Text style={[styles.hint, { color: c.textMuted }]}>
              {USE_FIREBASE 
                ? 'Use your registered email and password'
                : 'Demo: any valid email + 6+ char password'
              }
            </Text>
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
  },
  themeToggle: {
    position: 'absolute',
    top: 48,
    right: 24,
    padding: 8,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  logoImage: {
    width: 72,
    height: 72,
    marginBottom: 12,
  },
  logoIcon: { fontSize: 36 },
  appName: { fontSize: 28, letterSpacing: -0.5, ...fontStyles.heading },
  tagline: { fontSize: 14, marginTop: 4, ...fontStyles.body },
  card: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 24,
    gap: 16,
  },
  cardTitle: { fontSize: 20, ...fontStyles.headingMedium },
  errorBanner: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
  },
  errorBannerText: { fontSize: 14, ...fontStyles.bodyMedium },
  field: { gap: 6 },
  label: { fontSize: 14, ...fontStyles.bodyMedium },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    flex: 1,
    ...fontStyles.body,
  },
  passwordRow: { flexDirection: 'row', gap: 8 },
  passwordInput: { flex: 1 },
  eyeBtn: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  eyeIcon: {
    width: 20,
    height: 20,
  },
  fieldError: { fontSize: 12, ...fontStyles.bodyMedium },
  loginBtn: {
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 4,
  },
  loginBtnDisabled: { opacity: 0.6 },
  loginBtnText: { color: '#fff', fontSize: 16, ...fontStyles.headingMedium },
  toggleContainer: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  toggleText: {
    fontSize: 14,
    ...fontStyles.body,
  },
  toggleLink: {
    ...fontStyles.bodyMedium,
  },
  hint: { fontSize: 12, textAlign: 'center', ...fontStyles.body },
});
