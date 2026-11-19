#!/bin/bash

# Script de build para FinancePro

echo "=== FinancePro Build Script ==="

# Verificar se o Node.js está instalado
if ! command -v node &> /dev/null; then
    echo "Erro: Node.js não encontrado. Instale o Node.js 18+."
    exit 1
fi

# Verificar se o EAS CLI está instalado
if ! command -v eas &> /dev/null; then
    echo "Instalando EAS CLI..."
    npm install -g eas-cli
fi

# Navegar para o diretório do app
cd financepro

# Instalar dependências
echo "Instalando dependências..."
npm install

# Selecionar plataforma
echo ""
echo "Selecione a plataforma:"
echo "1) Android"
echo "2) iOS"
echo "3) Ambos"
read -r -p "Escolha: " platform

# Selecionar ambiente
echo ""
echo "Selecione o ambiente:"
echo "1) development (recomendado para teste)"
echo "2) preview (internal build)"
echo "3) production (store build)"
read -r -p "Escolha: " env

# Executar o build
echo ""
echo "Iniciando build..."

if [ "$platform" = "1" ]; then
    eas build --platform android --profile $env
elif [ "$platform" = "2" ]; then
    eas build --platform ios --profile $env
elif [ "$platform" = "3" ]; then
    eas build --platform all --profile $env
else
    echo "Plataforma inválida"
    exit 1
fi

echo ""
echo "Build concluído!"
echo "Para subir o app na loja:"
echo "  eas submit --platform android"
echo "  eas submit --platform ios"
