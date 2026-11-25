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
  Linking,
  Platform,
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
  const [whatsappModalVisible, setWhatsappModalVisible] = useState(false);
  const [whatsappNumber, setWhatsappNumber] = useState('');
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
    if (!familyName.trim()) {
      Alert.alert('Atenção', 'Informe o nome do grupo familiar.');
      return;
    }
    try {
      setSaving(true);
      await api.createFamily(familyName.trim());
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
    if (!inviteEmail.trim()) {
      Alert.alert('Atenção', 'Informe o e-mail do participante.');
      return;
    }
    try {
      setSaving(true);
      await api.inviteFamilyMember(inviteEmail.trim());
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

  const handleSendWhatsApp = async () => {
    if (!whatsappNumber.trim()) {
      Alert.alert('Atenção', 'Informe o número de WhatsApp do participante.');
      return;
    }

    // Limpa o número (remove espaços, traços e parênteses)
    const cleanNumber = whatsappNumber.replace(/[^\d]/g, '');

    // Se o usuário não especificou o código do país, assume DDI 55 (Brasil)
    const numberWithDDI = cleanNumber.startsWith('55')
      ? cleanNumber
      : `55${cleanNumber}`;

    const familyNameStr = familyData?.family?.name || 'FinancePro';
    const message = `Olá! Foi convidado para participar do grupo "${familyNameStr}" no FinancePro. Acesse o app para aceitar o convite e começar a planejar as finanças em conjunto. 💚`;

    const encodedMessage = encodeURIComponent(message);
    const url = Platform.OS === 'ios'
      ? `wa.me/${numberWithDDI}?text=${encodedMessage}`
      : `https://wa.me/${numberWithDDI}?text=${encodedMessage}`;

    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
        setWhatsappModalVisible(false);
        setWhatsappNumber('');
        Alert.alert('Sucesso', 'WhatsApp aberto! O participante receberá o convite.');
      } else {
        Alert.alert(
          'Atenção',
          'WhatsApp não está instalado neste dispositivo.'
        );
      }
    } catch (err: any) {
      Alert.alert('Erro', err.message || 'Falha ao abrir WhatsApp.');
    }
  };

  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  const familyNameStr = familyData?.family?.name || 'FinancePro';

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.background }]}>
      {!familyData ? (
        <View style={[styles.emptyCard, { backgroundColor: theme.card }]}>
          <Ionicons name="people-circle-outline" size={64} color={theme.primary} />
          <Text style={[styles.emptyTitle, { color: theme.text }]}>
            Nenhum grupo familiar conectado
          </Text>
          <Text style={[styles.emptySub, { color: theme.textMuted }]}>
            Crie um grupo familiar para compartilhar despesas, contas conjuntas
            e planejar finanças em conjunto.
          </Text>
          <TouchableOpacity
            style={[styles.primaryBtn, { backgroundColor: theme.primary }]}
            onPress={() => setCreateModalVisible(true)}
          >
            <Ionicons name="add-circle-outline" size={18} color="#FFFFFF" />
            <Text style={styles.primaryBtnText}>Criar Grupo Familiar</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          {/* Header da Família */}
          <View style={[styles.familyHeader, { backgroundColor: '#1E293B' }]}>
            <View>
              <Text style={styles.familyName}>{familyNameStr}</Text>
              <Text style={styles.familyRole}>
                Seu papel: {familyData.role === 'admin' ? 'Administrador 👑' : 'Membro 👤'}
              </Text>
            </View>
            {familyData.role === 'admin' && (
              <View style={styles.inviteBtnGroup}>
                <TouchableOpacity
                  style={[styles.inviteBtn, { backgroundColor: theme.primary }]}
                  onPress={() => setInviteModalVisible(true)}
                >
                  <Ionicons name="mail-outline" size={16} color="#FFFFFF" />
                  <Text style={styles.inviteBtnText}>E-mail</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.inviteBtnWhats, { backgroundColor: '#25D366' }]}
                  onPress={() => setWhatsappModalVisible(true)}
                >
                  <Ionicons name="chatbubble-ellipses-outline" size={16} color="#FFFFFF" />
                  <Text style={styles.inviteBtnText}>WhatsApp</Text>
                </TouchableOpacity>
              </View>
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

          {/* Seção de Convites Pendentes */}
          <Text style={[styles.sectionTitle, { color: theme.text, marginTop: 24 }]}>
            Como convidar um participante
          </Text>
          <View style={[styles.helpCard, { backgroundColor: theme.card }]}>
            <View style={styles.helpItem}>
              <View style={[styles.helpIcon, { backgroundColor: '#DCFCE7' }]}>
                <Ionicons name="mail-outline" size={18} color={theme.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.helpTitle, { color: theme.text }]}>
                  Convidar por e-mail
                </Text>
                <Text style={[styles.helpSub, { color: theme.textMuted }]}>
                  Adicione o participante diretamente ao grupo (requer cadastro).
                </Text>
              </View>
            </View>
            <View style={styles.helpItem}>
              <View style={[styles.helpIcon, { backgroundColor: '#D1FAE5' }]}>
                <Ionicons name="chatbubble-ellipses-outline" size={18} color="#25D366" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.helpTitle, { color: theme.text }]}>
                  Convidar por WhatsApp
                </Text>
                <Text style={[styles.helpSub, { color: theme.textMuted }]}>
                  Envie o convite por mensagem para quem ainda não usa o app.
                </Text>
              </View>
            </View>
          </View>
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
              <Ionicons
                name={saving ? 'sync-outline' : 'checkmark-circle-outline'}
                size={16}
                color="#FFFFFF"
              />
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

      {/* Modal Convidar por E-mail */}
      <Modal visible={inviteModalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.card }]}>
            <Text style={[styles.modalTitle, { color: theme.text }]}>
              Convidar por E-mail
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
              <Ionicons
                name={saving ? 'sync-outline' : 'paper-plane-outline'}
                size={16}
                color="#FFFFFF"
              />
              <Text style={styles.primaryBtnText}>Adicionar Participante</Text>
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

      {/* Modal Convidar por WhatsApp */}
      <Modal visible={whatsappModalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.card }]}>
            <View style={styles.waHeader}>
              <View style={[styles.waIcon, { backgroundColor: '#25D366' }]}>
                <Ionicons name="chatbubble-ellipses-outline" size={22} color="#FFFFFF" />
              </View>
              <View>
                <Text style={[styles.modalTitle, { color: theme.text, marginBottom: 2 }]}>
                  Convidar por WhatsApp
                </Text>
                <Text style={[styles.waSub, { color: theme.textMuted }]}>
                  O convite será enviado para: {familyNameStr}
                </Text>
              </View>
            </View>

            <Text style={[styles.inputLabel, { color: theme.text }]}>
              Número de WhatsApp
            </Text>
            <TextInput
              style={[styles.input, { borderColor: theme.border, color: theme.text }]}
              placeholder="Ex: 11999998888 (com DDD)"
              keyboardType="phone-pad"
              value={whatsappNumber}
              onChangeText={setWhatsappNumber}
            />
            <Text style={[styles.waHint, { color: theme.textMuted }]}>
              Dica: Use o DDI 55 (Brasil) ou informe o número com DDD.
            </Text>

            <TouchableOpacity
              style={[styles.primaryBtn, { backgroundColor: '#25D366', marginTop: 16 }]}
              onPress={handleSendWhatsApp}
              disabled={saving}
            >
              <Ionicons name="chatbubble-ellipses-outline" size={16} color="#FFFFFF" />
              <Text style={styles.primaryBtnText}>Enviar pelo WhatsApp</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.cancelBtn}
              onPress={() => setWhatsappModalVisible(false)}
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
  inviteBtnGroup: { flexDirection: 'row', gap: 8 },
  inviteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  inviteBtnWhats: {
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
  helpCard: {
    padding: 16,
    borderRadius: 12,
    gap: 14,
  },
  helpItem: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  helpIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  helpTitle: { fontSize: 14, fontWeight: '700' },
  helpSub: { fontSize: 12, marginTop: 2, lineHeight: 16 },
  primaryBtn: {
    height: 48,
    borderRadius: 10,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
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
  waHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 16 },
  waIcon: {
    width: 42,
    height: 42,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  waSub: { fontSize: 12 },
  inputLabel: { fontSize: 13, fontWeight: '600', marginBottom: 6, marginTop: 12 },
  waHint: { fontSize: 11, marginTop: 6 },
});
