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

  const familyNameStr = familyData?.family?.name || 'FinancePro';
  const appDownloadUrl = 'https://financepro-six-chi.vercel.app/login';
  const previewMessage = `Olá! Você foi convidado para participar do grupo "${familyNameStr}" no FinancePro.

Se ainda não tem o app, acesse aqui:
📱 ${appDownloadUrl}

Aceite o convite e comece a planejar as finanças em conjunto! 💚`;

  // Abre o WhatsApp pedindo para o usuário escolher o contato
  const handleSendWhatsApp = async () => {
    const encodedMessage = encodeURIComponent(previewMessage);
    const url =
      Platform.OS === 'ios'
        ? `whatsapp://wa.me/?text=${encodedMessage}`
        : `https://wa.me/?text=${encodedMessage}`;

    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
        setWhatsappModalVisible(false);
        Alert.alert(
          'WhatsApp aberto',
          'Selecione o contato que deseja convidar e envie a mensagem.'
        );
      } else {
        Alert.alert(
          'WhatsApp não encontrado',
          'Instale o WhatsApp para enviar o convite.'
        );
      }
    } catch (err: any) {
      Alert.alert('Erro', err.message || 'Não foi possível abrir o WhatsApp.');
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
    <ScrollView
      style={[styles.container, { backgroundColor: theme.background }]}
      showsVerticalScrollIndicator={false}
    >
      {!familyData ? (
        /* ============ ESTADO VAZIO — CRIAR FAMÍLIA ============ */
        <View style={[styles.emptyCard, { backgroundColor: theme.card }]}>
          <View style={styles.emptyIconWrap}>
            <View style={[styles.emptyIcon, { backgroundColor: '#DCFCE7' }]}>
              <Ionicons name="people-outline" size={32} color={theme.primary} />
            </View>
            <View style={styles.emptyIconRing} />
          </View>
          <Text style={[styles.emptyTitle, { color: theme.text }]}>
            Crie seu grupo familiar
          </Text>
          <Text style={[styles.emptySub, { color: theme.textMuted }]}>
            Compartilhe despesas, contas conjuntas e metas financeiras com quem você
            ama. Comece agora!
          </Text>          <TouchableOpacity
            style={[styles.primaryBtn, { backgroundColor: theme.primary }]}
            onPress={() => setCreateModalVisible(true)}
            activeOpacity={0.85}
          >
            <Ionicons name="add-circle-outline" size={18} color="#FFFFFF" />
            <Text style={styles.primaryBtnText}>Criar Grupo</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          {/* ============ CARD DE RESUMO DA FAMÍLIA ============ */}
          <View style={[styles.familyCard, { backgroundColor: theme.card }]}>
            <View style={styles.familyCardHeader}>
              <View style={[styles.familyAvatar, { backgroundColor: '#1E293B' }]}>
                <Ionicons name="home-outline" size={28} color="#10B981" />
              </View>
              <View style={{ flex: 1, marginLeft: 14 }}>
                <Text style={[styles.familyCardName, { color: theme.text }]} numberOfLines={1}>
                  {familyNameStr}
                </Text>
                <Text style={[styles.familyCardRole, { color: theme.textMuted }]}>
                  {familyData.role === 'admin'
                    ? 'Você é o Administrador 👑'
                    : 'Você é Membro do grupo'}
                </Text>
              </View>
            </View>

            <View style={styles.familyStatsRow}>
              <View style={styles.familyStat}>
                <Text style={[styles.familyStatValue, { color: theme.text }]}>
                  {members.length}
                </Text>
                <Text style={[styles.familyStatLabel, { color: theme.textMuted }]}>
                  Membros
                </Text>
              </View>
              <View style={[styles.familyStatDivider, { backgroundColor: theme.border }]} />
              <View style={styles.familyStat}>
                <Text style={[styles.familyStatValue, { color: theme.text }]}>
                  {familyData.role === 'admin' ? 'Admin' : 'Membro'}
                </Text>
                <Text style={[styles.familyStatLabel, { color: theme.textMuted }]}>
                  Seu papel
                </Text>
              </View>
              <View style={[styles.familyStatDivider, { backgroundColor: theme.border }]} />
              <View style={styles.familyStat}>
                <Text style={[styles.familyStatValue, { color: theme.text }]}>
                  Ativa
                </Text>
                <Text style={[styles.familyStatLabel, { color: theme.textMuted }]}>
                  Status
                </Text>
              </View>
            </View>

            {familyData.role === 'admin' && (
              <View style={styles.inviteButtonsRow}>
                <TouchableOpacity
                  style={[styles.inviteBtn, { backgroundColor: theme.primary }]}
                  onPress={() => setInviteModalVisible(true)}
                  activeOpacity={0.85}
                >
                  <Ionicons name="mail-outline" size={16} color="#FFFFFF" />
                  <Text style={styles.inviteBtnText}>E-mail</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.inviteBtn, { backgroundColor: '#25D366' }]}
                  onPress={() => setWhatsappModalVisible(true)}
                  activeOpacity={0.85}
                >
                  <Ionicons name="chatbubble-ellipses-outline" size={16} color="#FFFFFF" />
                  <Text style={styles.inviteBtnText}>WhatsApp</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          {/* ============ LISTA DE MEMBROS ============ */}
          <View style={styles.sectionRow}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>
              Participantes
            </Text>
            <View style={styles.countChip}>
              <Ionicons name="people-outline" size={12} color={theme.primary} />
              <Text style={[styles.countChipText, { color: theme.primary }]}>
                {members.length}
              </Text>
            </View>
          </View>

          {members.map((m, idx) => {
            const isAdmin = m.role === 'admin';
            const avatarColors = [
              { bg: '#DCFCE7', fg: '#166534' },
              { bg: '#DBEAFE', fg: '#1E40AF' },
              { bg: '#FEF3C7', fg: '#92400E' },
              { bg: '#FCE7F3', fg: '#9D174D' },
            ];
            const av = avatarColors[idx % avatarColors.length];
            return (
              <View
                key={m._id}
                style={[styles.memberCard, { backgroundColor: theme.card }]}
              >
                <View style={[styles.avatar, { backgroundColor: av.bg }]}>
                  <Text style={[styles.avatarText, { color: av.fg }]}>
                    {m.userId?.name?.charAt(0)?.toUpperCase() || 'U'}
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
                    { backgroundColor: isAdmin ? '#FEF3C7' : '#E0E7FF' },
                  ]}
                >
                  <Ionicons
                    name={isAdmin ? 'star-outline' : 'person-outline'}
                    size={11}
                    color={isAdmin ? '#B45309' : '#3730A3'}
                  />
                  <Text
                    style={[
                      styles.roleBadgeText,
                      { color: isAdmin ? '#B45309' : '#3730A3' },
                    ]}
                  >
                    {isAdmin ? 'Admin' : 'Membro'}
                  </Text>
                </View>
              </View>
            );
          })}

          {/* ============ COMO CONVIDAR ============ */}
          <View style={[styles.helpCard, { backgroundColor: theme.card }]}>
            <Text style={[styles.helpTitle, { color: theme.text }]}>
              Como convidar
            </Text>
            <View style={styles.helpItem}>
              <View style={[styles.helpIcon, { backgroundColor: '#DCFCE7' }]}>
                <Ionicons name="mail-outline" size={18} color={theme.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.helpItemTitle, { color: theme.text }]}>
                  E-mail direto
                </Text>
                <Text style={[styles.helpItemSub, { color: theme.textMuted }]}>
                  Adiciona quem já tem cadastro no FinancePro.
                </Text>
              </View>
            </View>
            <View style={styles.helpItem}>
              <View style={[styles.helpIcon, { backgroundColor: '#D1FAE5' }]}>
                <Ionicons name="chatbubble-ellipses-outline" size={18} color="#25D366" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.helpItemTitle, { color: theme.text }]}>
                  WhatsApp
                </Text>
                <Text style={[styles.helpItemSub, { color: theme.textMuted }]}>
                  Envie o convite por mensagem para quem ainda não usa o app.
                </Text>
              </View>
            </View>
          </View>
        </>
      )}

      {/* ============ MODAL CRIAR FAMÍLIA ============ */}
      <Modal visible={createModalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.card }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: theme.text }]}>
                Criar Grupo Familiar
              </Text>
              <TouchableOpacity
                onPress={() => setCreateModalVisible(false)}
                style={[styles.modalClose, { backgroundColor: theme.background }]}
              >
                <Ionicons name="close" size={20} color={theme.textMuted} />
              </TouchableOpacity>
            </View>
            <TextInput
              style={[styles.input, { borderColor: theme.border, color: theme.text, backgroundColor: theme.background }]}
              placeholder="Ex: Família Silva"
              value={familyName}
              onChangeText={setFamilyName}
              maxLength={40}
            />
            <TouchableOpacity
              style={[styles.primaryBtn, { backgroundColor: theme.primary, marginTop: 20 }]}
              onPress={handleCreateFamily}
              disabled={saving}
              activeOpacity={0.85}
            >
              {saving ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <>
                  <Ionicons name="add-circle-outline" size={16} color="#FFFFFF" />
                  <Text style={styles.primaryBtnText}>Criar Grupo</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* ============ MODAL CONVIDAR POR E-MAIL ============ */}
      <Modal visible={inviteModalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.card }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: theme.text }]}>
                Convidar por E-mail
              </Text>
              <TouchableOpacity
                onPress={() => setInviteModalVisible(false)}
                style={[styles.modalClose, { backgroundColor: theme.background }]}
              >
                <Ionicons name="close" size={20} color={theme.textMuted} />
              </TouchableOpacity>
            </View>
            <TextInput
              style={[styles.input, { borderColor: theme.border, color: theme.text, backgroundColor: theme.background }]}
              placeholder="email@familiar.com"
              keyboardType="email-address"
              autoCapitalize="none"
              value={inviteEmail}
              onChangeText={setInviteEmail}
            />
            <Text style={[styles.fieldHint, { color: theme.textMuted }]}>
              O participante precisa já ter uma conta no FinancePro.
            </Text>
            <TouchableOpacity
              style={[styles.primaryBtn, { backgroundColor: theme.primary, marginTop: 16 }]}
              onPress={handleInvite}
              disabled={saving}
              activeOpacity={0.85}
            >
              {saving ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <>
                  <Ionicons name="paper-plane-outline" size={16} color="#FFFFFF" />
                  <Text style={styles.primaryBtnText}>Adicionar</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* ============ MODAL CONVIDAR POR WHATSAPP ============ */}
      <Modal visible={whatsappModalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.card }]}>
            <View style={styles.waTopBar}>
              <View style={[styles.waLogo, { backgroundColor: '#25D366' }]}>
                <Ionicons name="chatbubble-ellipses-outline" size={28} color="#FFFFFF" />
              </View>
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={[styles.waTitle, { color: theme.text }]}>
                  Convidar pelo WhatsApp
                </Text>
                <Text style={[styles.waSub, { color: theme.textMuted }]}>
                  Grupo: {familyNameStr}
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => setWhatsappModalVisible(false)}
                style={[styles.modalClose, { backgroundColor: theme.background }]}
              >
                <Ionicons name="close" size={20} color={theme.textMuted} />
              </TouchableOpacity>
            </View>

            {/* Preview da mensagem que será enviada */}
            <View style={[styles.waPreview, { backgroundColor: theme.background }]}>
              <Text style={[styles.waPreviewLabel, { color: theme.textMuted }]}>
                Mensagem que será enviada
              </Text>
              <Text style={[styles.waPreviewText, { color: theme.text }]}>{previewMessage}</Text>
            </View>

            <View style={styles.waSteps}>
              <View style={styles.waStep}>
                <View style={[styles.waStepNum, { backgroundColor: '#D1FAE5' }]}>
                  <Text style={styles.waStepNumText}>1</Text>
                </View>
                <Text style={[styles.waStepText, { color: theme.textMuted }]}>
                  Abre o WhatsApp
                </Text>
              </View>
              <View style={styles.waStep}>
                <View style={[styles.waStepNum, { backgroundColor: '#D1FAE5' }]}>
                  <Text style={styles.waStepNumText}>2</Text>
                </View>
                <Text style={[styles.waStepText, { color: theme.textMuted }]}>
                  Escolha o contato
                </Text>
              </View>
              <View style={styles.waStep}>
                <View style={[styles.waStepNum, { backgroundColor: '#D1FAE5' }]}>
                  <Text style={styles.waStepNumText}>3</Text>
                </View>
                <Text style={[styles.waStepText, { color: theme.textMuted }]}>
                  Envie a mensagem
                </Text>
              </View>
            </View>

            <TouchableOpacity
              style={[styles.waSendBtn]}
              onPress={handleSendWhatsApp}
              activeOpacity={0.85}
            >
              <Ionicons name="chatbubble-ellipses-outline" size={18} color="#FFFFFF" />
              <Text style={styles.waSendText}>Abrir WhatsApp</Text>
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

  /* Estado vazio */
  emptyCard: {
    padding: 36,
    borderRadius: 20,
    alignItems: 'center',
    marginTop: 32,
    shadowColor: '#0F172A',
    shadowOpacity: 0.06,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
  emptyIconWrap: { alignItems: 'center', marginBottom: 12 },
  emptyIcon: {
    width: 68,
    height: 68,
    borderRadius: 34,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyIconRing: {
    position: 'absolute',
    width: 84,
    height: 84,
    borderRadius: 42,
    borderWidth: 3,
    borderColor: 'rgba(16,185,129,0.15)',
  },
  emptyTitle: { fontSize: 20, fontWeight: '800', textAlign: 'center', letterSpacing: -0.4 },
  emptySub: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 24,
    lineHeight: 20,
    maxWidth: 280,
  },

  /* Card da família */
  familyCard: {
    borderRadius: 20,
    padding: 18,
    marginBottom: 20,
    shadowColor: '#0F172A',
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  familyCardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  familyAvatar: {
    width: 54,
    height: 54,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  familyCardName: { fontSize: 18, fontWeight: '800', letterSpacing: -0.3 },
  familyCardRole: { fontSize: 12, marginTop: 2 },
  familyStatsRow: {
    flexDirection: 'row',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    paddingVertical: 12,
    marginBottom: 14,
  },
  familyStat: { flex: 1, alignItems: 'center', gap: 2 },
  familyStatValue: { fontSize: 16, fontWeight: '800' },
  familyStatLabel: { fontSize: 10, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5 },
  familyStatDivider: { width: 1, marginHorizontal: 8, alignSelf: 'stretch' },

  /* Botões de convite */
  inviteButtonsRow: { flexDirection: 'row', gap: 8 },
  inviteBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    borderRadius: 10,
  },
  inviteBtnText: { color: '#FFFFFF', fontSize: 13, fontWeight: '700' },

  /* Seção de membros */
  sectionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: { fontSize: 17, fontWeight: '800', letterSpacing: -0.3 },
  countChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: '#DCFCE7',
  },
  countChipText: { fontSize: 12, fontWeight: '800' },

  /* Card de membro */
  memberCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 14,
    marginBottom: 10,
    shadowColor: '#0F172A',
    shadowOpacity: 0.03,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { fontSize: 16, fontWeight: '800' },
  memberName: { fontSize: 15, fontWeight: '700' },
  memberEmail: { fontSize: 12, marginTop: 2 },
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
  },
  roleBadgeText: { fontSize: 11, fontWeight: '700' },

  /* Card de ajuda */
  helpCard: {
    marginTop: 24,
    padding: 18,
    borderRadius: 14,
    gap: 12,
  },
  helpTitle: { fontSize: 15, fontWeight: '800', marginBottom: 4 },
  helpItem: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  helpIcon: {
    width: 38,
    height: 38,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  helpItemTitle: { fontSize: 13, fontWeight: '700' },
  helpItemSub: { fontSize: 11, marginTop: 1, lineHeight: 14 },

  /* Modais */
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    padding: 24,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '85%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: { fontSize: 18, fontWeight: '800', letterSpacing: -0.3 },
  modalClose: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  input: {
    height: 50,
    borderWidth: 1.5,
    borderRadius: 12,
    paddingHorizontal: 14,
    fontSize: 15,
    fontWeight: '500',
  },
  fieldHint: { fontSize: 11, marginTop: 8 },

  /* Botão primário */
  primaryBtn: {
    height: 50,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  primaryBtnText: { color: '#FFFFFF', fontSize: 15, fontWeight: '700' },

  /* Modal WhatsApp */
  waTopBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  waLogo: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  waTitle: { fontSize: 16, fontWeight: '800' },
  waSub: { fontSize: 12, marginTop: 2 },
  waPreview: {
    borderRadius: 12,
    padding: 14,
    marginBottom: 14,
  },
  waPreviewLabel: { fontSize: 10, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },
  waPreviewText: { fontSize: 13, marginTop: 6, lineHeight: 18 },
  waSteps: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 18,
  },
  waStep: {
    flex: 1,
    alignItems: 'center',
    gap: 6,
  },
  waStepNum: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  waStepNumText: { fontSize: 11, fontWeight: '800', color: '#166534' },
  waStepText: { fontSize: 10, textAlign: 'center' },
  waSendBtn: {
    height: 52,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#25D366',
    shadowColor: '#25D366',
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  waSendText: { color: '#FFFFFF', fontSize: 15, fontWeight: '800' },
});
