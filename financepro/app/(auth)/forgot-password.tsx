import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useThemeColors } from '../../src/theme/useThemeColors';

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const theme = useThemeColors();

  const handleReset = async () => {
    if (!email) return;
    setLoading(true);
    // Simulação do envio pelo Firebase
    setTimeout(() => {
      setLoading(false);
      setSent(true);
    }, 1000);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={[styles.container, { backgroundColor: theme.background }]}
    >
      <View style={styles.content}>
        <Text style={[styles.title, { color: theme.text }]}>Recuperar Senha</Text>
        <Text style={[styles.subtitle, { color: theme.textMuted }]}>
          Informe seu e-mail para receber as instruções de recuperação
        </Text>

        {sent ? (
          <View style={styles.successContainer}>
            <Text style={styles.successText}>
              E-mail de recuperação enviado com sucesso! Verifique sua caixa de entrada.
            </Text>
            <TouchableOpacity
              style={[styles.primaryBtn, { backgroundColor: theme.primary, marginTop: 16 }]}
              onPress={() => router.back()}
            >
              <Text style={styles.primaryBtnText}>Voltar ao Login</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.form}>
            <TextInput
              style={[styles.input, { borderColor: theme.border, color: theme.text }]}
              placeholder="seu@email.com"
              placeholderTextColor={theme.textMuted}
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
            />

            <TouchableOpacity
              style={[styles.primaryBtn, { backgroundColor: theme.primary }]}
              onPress={handleReset}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.primaryBtnText}>Enviar Instruções</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
              <Text style={[styles.backText, { color: theme.textMuted }]}>Voltar</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flex: 1, justifyContent: 'center', padding: 24 },
  title: { fontSize: 24, fontWeight: '700', textAlign: 'center' },
  subtitle: { fontSize: 14, textAlign: 'center', marginTop: 8, marginBottom: 24 },
  form: { width: '100%' },
  input: {
    height: 48,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 16,
    fontSize: 15,
    backgroundColor: '#FFFFFF',
    marginBottom: 16,
  },
  primaryBtn: {
    height: 50,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  primaryBtnText: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },
  backBtn: { marginTop: 16, alignItems: 'center' },
  backText: { fontSize: 14 },
  successContainer: {
    backgroundColor: '#DCFCE7',
    padding: 16,
    borderRadius: 10,
  },
  successText: { color: '#166534', fontSize: 14, textAlign: 'center' },
});
