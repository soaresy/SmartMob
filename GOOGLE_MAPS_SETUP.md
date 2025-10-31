# Configuração da Google Maps API

Este guia explica como configurar a Google Maps Directions API para obter rotas reais no SmartMob.

## Passo 1: Obter uma API Key do Google Maps

1. Acesse o [Google Cloud Console](https://console.cloud.google.com/)
2. Crie um novo projeto ou selecione um existente
3. Navegue até **APIs & Services** > **Credentials**
4. Clique em **Create Credentials** > **API Key**
5. Copie a chave gerada

## Passo 2: Ativar a Directions API

1. No Google Cloud Console, vá para **APIs & Services** > **Library**
2. Procure por "Directions API"
3. Clique em **Enable**

## Passo 3: Configurar a chave no projeto

1. Abra o arquivo `.env` na raiz do projeto
2. Adicione sua chave na variável:
   ```
   VITE_GOOGLE_MAPS_API_KEY=sua_chave_aqui
   ```
3. Reinicie o servidor de desenvolvimento

## Passo 4: Configurar restrições (Recomendado)

Para proteger sua API Key:

1. No Google Cloud Console, clique na sua API Key
2. Em **Application restrictions**, selecione:
   - **HTTP referrers (web sites)** para produção
   - Adicione os domínios autorizados
3. Em **API restrictions**, selecione:
   - **Restrict key**
   - Marque apenas **Directions API**
4. Clique em **Save**

## Como funciona

Quando a API Key está configurada, o SmartMob:

1. Envia requisições para a Google Maps Directions API
2. Recebe dados reais de:
   - Distância em quilômetros
   - Tempo de viagem em minutos
   - Rota otimizada baseada no meio de transporte selecionado

3. Calcula o custo estimado baseado em:
   - Distância da rota
   - Meios de transporte selecionados
   - Tabela de custos por km de cada modal

## Fallback

Se a API Key não estiver configurada, o sistema automaticamente:
- Usa dados estimados para demonstração
- Exibe uma notificação informando que as rotas são aproximadas
- Mantém todas as funcionalidades de interface funcionando

## Custos

A Google Maps oferece:
- $200 de crédito gratuito por mês
- Suficiente para ~40.000 requisições
- Após o limite, há cobrança por uso

Para mais informações, consulte: [Google Maps Platform Pricing](https://mapsplatform.google.com/pricing/)

## Solução de Problemas

### Erro: "REQUEST_DENIED"
- Verifique se a Directions API está ativada
- Confirme que a API Key está correta
- Verifique as restrições da chave

### Erro: "ZERO_RESULTS"
- Certifique-se de usar endereços completos
- Inclua cidade e estado nos endereços
- Exemplo: "Avenida Paulista, São Paulo, SP"

### Rotas não aparecem
- Abra o console do navegador (F12)
- Verifique se há erros relacionados à API
- Confirme que a variável de ambiente está carregada corretamente
