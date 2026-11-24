import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import { getFreshIdToken } from './firebase';

// Em desenvolvimento, o app pode apontar para o backend local.
// Em builds EAS ou produção, use EXPO_PUBLIC_API_BASE_URL.
const localFallbackApiUrl = 'http://192.168.1.64:3000';
export const API_BASE_URL: string =
  process.env.EXPO_PUBLIC_API_BASE_URL || localFallbackApiUrl;

class ApiService {
  private token: string | null = null;

  async setToken(token: string | null) {
    this.token = token;
    if (token) {
      await AsyncStorage.setItem('financepro_token', token);
    } else {
      await AsyncStorage.removeItem('financepro_token');
    }
  }

  async getToken(forceRefresh = false): Promise<string | null> {
    if (forceRefresh) {
      const freshToken = await getFreshIdToken(true);
      if (freshToken) {
        this.token = freshToken;
        await AsyncStorage.setItem('financepro_token', freshToken);
        return freshToken;
      }
    }

    if (!this.token) {
      const freshToken = await getFreshIdToken();
      if (freshToken) {
        this.token = freshToken;
        return freshToken;
      }
      this.token = await AsyncStorage.getItem('financepro_token');
    }
    return this.token;
  }

  // Método genérico para chamadas HTTP ao backend com renovação automática de token
  private async request<T = any>(
    method: string,
    path: string,
    body?: any,
    isRetry = false
  ): Promise<T> {
    const token = await this.getToken(isRetry);

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const url = `${API_BASE_URL}${path}`;

    let response: Response;
    try {
      response = await fetch(url, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
      });
    } catch (networkError: any) {
      // Detecção de erro de rede ou Mixed Content (HTTPS -> HTTP)
      if (
        typeof window !== 'undefined' &&
        window.location &&
        window.location.protocol === 'https:' &&
        url.startsWith('http://')
      ) {
        throw new Error(
          'Bloqueio de Segurança (Mixed Content): O site está em HTTPS na Vercel e não pode acessar uma API HTTP local. O backend precisa estar em HTTPS.'
        );
      }
      throw new Error(networkError?.message || 'Falha de conexão com a API.');
    }

    // Se o token estiver expirado (401), tenta renovar uma vez e reenviar
    if (response.status === 401 && !isRetry) {
      const refreshed = await this.getToken(true);
      if (refreshed) {
        return this.request<T>(method, path, body, true);
      }
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Erro na API: ${response.status}`);
    }

    return response.json();
  }

  // Usuários
  async getMe() {
    return await this.request('GET', '/users/me');
  }

  async updateMe(data: any) {
    return await this.request('PATCH', '/users/me', data);
  }

  // Dashboard
  async getDashboard(scope: 'user' | 'family' | 'all' = 'all') {
    return await this.request('GET', `/dashboard?scope=${scope}`);
  }

  // Contas
  async getAccounts() {
    return await this.request('GET', '/accounts');
  }

  async createAccount(data: any) {
    return await this.request('POST', '/accounts', data);
  }

  // Categorias
  async getCategories() {
    return await this.request('GET', '/categories');
  }

  async createCategory(data: any) {
    return await this.request('POST', '/categories', data);
  }

  // Transações
  async getTransactions(params: Record<string, any> = {}) {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        query.append(key, String(value));
      }
    });
    const queryString = query.toString();
    return await this.request('GET', `/transactions${queryString ? `?${queryString}` : ''}`);
  }

  async createTransaction(data: any) {
    return await this.request('POST', '/transactions', data);
  }

  async updateTransaction(id: string, data: any) {
    return await this.request('PATCH', `/transactions/${id}`, data);
  }

  async deleteTransaction(id: string) {
    return await this.request('DELETE', `/transactions/${id}`);
  }

  // Família
  async getCurrentFamily() {
    return await this.request('GET', '/families/current');
  }

  async getFamilyMembers() {
    return await this.request('GET', '/families/members');
  }

  async createFamily(name: string) {
    return await this.request('POST', '/families', { name });
  }

  async inviteFamilyMember(email: string, role: string = 'member') {
    return await this.request('POST', '/families/invitations', { email, role });
  }

  // Relatórios
  async getMonthlyReport(month: number, year: number) {
    return await this.request(
      'GET',
      `/reports/monthly?month=${month}&year=${year}`
    );
  }

  // Orçamento
  async createBudget(data: {
    month: number;
    year: number;
    totalBudgetCents: number;
    categoryBudgets?: { categoryId: string; budgetCents: number }[];
  }) {
    return await this.request('POST', '/budgets', data);
  }

  async getCurrentBudget() {
    return await this.request('GET', '/budgets/current');
  }

  async updateBudget(id: string, data: {
    totalBudgetCents?: number;
    categoryBudgets?: { categoryId: string; budgetCents: number }[];
  }) {
    return await this.request('PATCH', `/budgets/${id}`, data);
  }

  // Metas
  async createGoal(data: {
    name: string;
    targetAmountCents: number;
    currentAmountCents?: number;
    deadline: string;
    description?: string;
    category?: string;
  }) {
    return await this.request('POST', '/goals', data);
  }

  async listGoals(): Promise<any[]> {
    return await this.request('GET', '/goals');
  }

  async getGoal(id: string) {
    return await this.request('GET', `/goals/${id}`);
  }

  async addGoalContribution(id: string, amountCents: number) {
    return await this.request('POST', `/goals/${id}/contribute`, {
      amountCents,
    });
  }

  async updateGoal(id: string, data: {
    name?: string;
    targetAmountCents?: number;
    currentAmountCents?: number;
    deadline?: string;
    status?: 'active' | 'completed' | 'abandoned';
    description?: string;
  }) {
    return await this.request('PATCH', `/goals/${id}`, data);
  }

  async deleteGoal(id: string) {
    return await this.request('DELETE', `/goals/${id}`);
  }
}

export const api = new ApiService();
