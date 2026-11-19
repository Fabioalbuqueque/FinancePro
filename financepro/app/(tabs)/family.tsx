import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { api } from '../../src/services/api';
import { useThemeColors } from '../../src/theme/useThemeColors';

export default function FamilyScreen() {
  const [familyData, setFamilyData] = useState<any>(null);
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modais
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [familyName, setFamilyName] = useState('');
  const [inviteModalVisible, setInviteModalVisible] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [saving, setSaving] = useState(false);

  const theme = useThemeColors();

  const loadFamily = useCallback(async () => {
    try {
      const current = await api.getCurrentFamily();
      setFamilyData(current);
      if (current) {
        const mems = await api.getFamilyMembers();
        setMembers(mems || []);
      }
    } catch (err) {
      console.log('Erro ao carregar família', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadFamily();
  }, [loadFamily]);

  const handleCreateFamily = async () => {
    if (!familyName) {
      Alert.alert('Atenção', 'Informe o nome do grupo familiar.');
      return;
    }
    try {
      setSaving(true);
      await api.createFamily(familyName);
      setCreateModalVisible(false);
      setFamilyName('');
      loadFamily();
      Alert.alert('Sucesso', 'Grupo familiar criado com sucesso!');
    } catch (err: any) {
      Alert.alert('Erro', err.message || 'Falha ao criar família.');
    } finally {
      setSaving(false);
    }
  };

  const handleInvite = async () => {
    if (!inviteEmail) {
      Alert.alert('Atenção', 'Informe o e-mail do participante.');
      return;
    }
    try {
      setSaving(true);
      await api.inviteFamilyMember(inviteEmail);
      setInviteModalVisible(false);
      setInviteEmail('');
      loadFamily();
      Alert.alert('Sucesso', 'Participante convidado com sucesso!');
    } catch (err: any) {
      Alert.alert('Erro', err.message || 'Falha ao convidar.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.background }]}>
      {!familyData ? (
        <View style={[styles.emptyCard, { backgroundColor: theme.card }]}>
          <Ionicons name="people-circle-outline" size={64} color={theme.primary} />
          <Text style={[styles.emptyTitle, { color: theme.text }]}>
            Nenhum grupo familiar conectado
          </Text>
          <Text style={[styles.emptySub, { color: theme.textMuted }]}>
            Crie um grupo familiar para compartilhar despesas, contas conjuntas e planejar finanças em conjunto.
          </Text>
          <TouchableOpacity
            style={[styles.primaryBtn, { backgroundColor: theme.primary }]}
            onPress={() => setCreateModalVisible(true)}
          >
            <Text style={styles.primaryBtnText}>Criar Grupo Familiar</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          {/* Header da Família */}
          <View style={[styles.familyHeader, { backgroundColor: '#1E293B' }]}>
            <View>
              <Text style={styles.familyName}>{familyData.family?.name}</Text>
              <Text style={styles.familyRole}>
                Seu papel: {familyData.role === 'admin' ? 'Administrador 👑' : 'Membro 👤'}
              </Text>
            </View>
            {familyData.role === 'admin' && (
              <TouchableOpacity
                style={[styles.inviteBtn, { backgroundColor: theme.primary }]}
                onPress={() => setInviteModalVisible(true)}
              >
                <Ionicons name="person-add" size={16} color="#FFFFFF" />
                <Text style={styles.inviteBtnText}>Convidar</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Lista de Membros */}
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            Participantes ({members.length})
          </Text>

          {members.map((m) => (
            <View key={m._id} style={[styles.memberCard, { backgroundColor: theme.card }]}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>
                  {m.userId?.name?.charAt(0) || 'U'}
                </Text>
              </View>
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={[styles.memberName, { color: theme.text }]}>
                  {m.userId?.name || 'Membro'}
                </Text>
                <Text style={[styles.memberEmail, { color: theme.textMuted }]}>
                  {m.userId?.email}
                </Text>
              </View>
              <View
                style={[
                  styles.roleBadge,
                  { backgroundColor: m.role === 'admin' ? '#FEF3C7' : '#E0E7FF' },
                ]}
              >
                <Text
                  style={[
                    styles.roleBadgeText,
                    { color: m.role === 'admin' ? '#B45309' : '#3730A3' },
                  ]}
                >
                  {m.role === 'admin' ? 'Admin' : 'Membro'}
                </Text>
              </View>
            </View>
          ))}
        </>
      )}

      {/* Modal Criar Família */}
      <Modal visible={createModalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.card }]}>
            <Text style={[styles.modalTitle, { color: theme.text }]}>
              Criar Grupo Familiar
            </Text>
            <TextInput
              style={[styles.input, { borderColor: theme.border, color: theme.text }]}
              placeholder="Ex: Família Silva"
              value={familyName}
              onChangeText={setFamilyName}
            />
            <TouchableOpacity
              style={[styles.primaryBtn, { backgroundColor: theme.primary, marginTop: 16 }]}
              onPress={handleCreateFamily}
              disabled={saving}
            >
              <Text style={styles.primaryBtnText}>Confirmar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.cancelBtn}
              onPress={() => setCreateModalVisible(false)}
            >
              <Text style={{ color: theme.textMuted }}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Modal Convidar Membro */}
      <Modal visible={inviteModalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.card }]}>
            <Text style={[styles.modalTitle, { color: theme.text }]}>
              Convidar Participante
            </Text>
            <TextInput
              style={[styles.input, { borderColor: theme.border, color: theme.text }]}
              placeholder="email@familiar.com"
              keyboardType="email-address"
              autoCapitalize="none"
              value={inviteEmail}
              onChangeText={setInviteEmail}
            />
            <TouchableOpacity
              style={[styles.primaryBtn, { backgroundColor: theme.primary, marginTop: 16 }]}
              onPress={handleInvite}
              disabled={saving}
            >
              <Text style={styles.primaryBtnText}>Enviar Convite</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.cancelBtn}
              onPress={() => setInviteModalVisible(false)}
            >
              <Text style={{ color: theme.textMuted }}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyCard: {
    padding: 32,
    borderRadius: 16,
    alignItems: 'center',
    marginTop: 40,
  },
  emptyTitle: { fontSize: 18, fontWeight: '700', marginTop: 16, textAlign: 'center' },
  emptySub: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 24,
    lineHeight: 20,
  },
  familyHeader: {
    padding: 20,
    borderRadius: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  familyName: { color: '#FFFFFF', fontSize: 20, fontWeight: '700' },
  familyRole: { color: '#94A3B8', fontSize: 13, marginTop: 4 },
  inviteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  inviteBtnText: { color: '#FFFFFF', fontSize: 13, fontWeight: '600' },
  sectionTitle: { fontSize: 16, fontWeight: '700', marginBottom: 12 },
  memberCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 12,
    marginBottom: 10,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#DCFCE7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { fontSize: 16, fontWeight: '700', color: '#166534' },
  memberName: { fontSize: 15, fontWeight: '600' },
  memberEmail: { fontSize: 12, marginTop: 2 },
  roleBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6 },
  roleBadgeText: { fontSize: 12, fontWeight: '600' },
  primaryBtn: {
    height: 48,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  primaryBtnText: { color: '#FFFFFF', fontSize: 15, fontWeight: '600' },
  cancelBtn: { marginTop: 12, alignItems: 'center' },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    padding: 24,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  modalTitle: { fontSize: 18, fontWeight: '700', marginBottom: 16 },
  input: {
    height: 46,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 15,
  },
});
