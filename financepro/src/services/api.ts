import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';

// Em desenvolvimento, o app pode apontar para o backend local.
// Em builds EAS, use EXPO_PUBLIC_API_BASE_URL (definido no eas.json).
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

  async getToken(): Promise<string | null> {
    if (!this.token) {
      this.token = await AsyncStorage.getItem('financepro_token');
    }
    return this.token;
  }

  // Método genérico para chamadas HTTP ao backend
  private async request<T = any>(method: string, path: string, body?: any): Promise<T> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const url = `${API_BASE_URL}${path}`;

    const response = await fetch(url, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });

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

  async createTransfer(data: {
    fromAccountId: string;
    toAccountId: string;
    amountCents: number;
    description?: string;
    date: string;
  }) {
    return await this.request('POST', '/transactions/transfer', data);
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
    return await this.request('POST', '/families/invite', { email, role });
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
