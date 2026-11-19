#!/bin/bash

# Teste rápido de criação de transações
# Execute com: bash test-transactions.sh

BASE_URL="http://localhost:3000"
TOKEN="mock-token-test-user"

echo "=== Testando Criação de Transações ==="
echo ""

# 1. Criar conta de teste
echo "1. Criando conta de teste..."
ACCOUNT=$(curl -s -X POST "$BASE_URL/accounts" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Carteira Teste","type":"cash","initialBalanceCents":100000,"ownerType":"user"}')

ACCOUNT_ID=$(echo $ACCOUNT | grep -o '"_id":"[^"]*"' | cut -d'"' -f4)
echo "   Conta criada: $ACCOUNT_ID"

# 2. Criar receita
echo "2. Criando receita (salário)..."
INCOME=$(curl -s -X POST "$BASE_URL/transactions" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"description\":\"Salário mensal\",\"amountCents\":5000000,\"type\":\"income\",\"accountId\":\"$ACCOUNT_ID\",\"status\":\"paid\",\"date\":\"2026-11-19\"}")

echo "   Receita: $(echo $INCOME | head -c 200)..."

# 3. Criar despesa
echo "3. Criando despesa (aluguel)..."
EXPENSE=$(curl -s -X POST "$BASE_URL/transactions" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"description\":\"Aluguel\",\"amountCents\":1500000,\"type\":\"expense\",\"accountId\":\"$ACCOUNT_ID\",\"status\":\"paid\",\"date\":\"2026-11-19\"}")

echo "   Despesa: $(echo $EXPENSE | head -c 200)..."

# 4. Verificar saldo
echo "4. Verificando dashboard..."
DASH=$(curl -s "$BASE_URL/dashboard?scope=user" \
  -H "Authorization: Bearer $TOKEN")

BALANCE=$(echo $DASH | grep -o '"totalBalanceCents":[0-9]*' | cut -d':' -f2)
echo "   Saldo total: R$ $(($BALANCE / 100)),$(($BALANCE % 100))"

# 5. Testar validação
echo "5. Testando validação (valor negativo)..."
INVALID=$(curl -s -X POST "$BASE_URL/transactions" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"description\":\"Teste\",\"amountCents\":-100,\"type\":\"income\",\"accountId\":\"$ACCOUNT_ID\",\"status\":\"paid\",\"date\":\"2026-11-19\"}")

if echo $INVALID | grep -q "400"; then
  echo "   ✓ Validação funciona (valor negativo rejeitado)"
else
  echo "   ✗ Validação não funcionou"
fi

echo ""
echo "=== Teste concluído ==="