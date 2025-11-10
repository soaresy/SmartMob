# Integração URBES (Sorocaba) - Tempo Real

## 🚍 Visão Geral

O SmartMob agora se integra com a API pública da URBES (Sorocaba) para exibir dados reais de transporte público em tempo real. A funcionalidade detecta o ponto de ônibus mais próximo ao endereço do usuário e mostra:

- **Linhas de ônibus** próximas
- **Horários de chegada** em minutos
- **Localização GPS** dos ônibus
- **Mapa interativo** com pontos e veículos

## 🔧 Como Funciona

### Fluxo de Dados

1. **Localização do Usuário**
   - Sistema lê endereço cadastrado no Perfil
   - Google Maps Geocoding converte para coordenadas (lat/lng)

2. **Busca de Ponto Próximo**
   - Consulta API URBES `/paradas` (todos os pontos de ônibus)
   - Calcula distância até cada ponto
   - Seleciona o mais próximo (até ~500m)

3. **Previsão de Ônibus**
   - Consulta `/previsao?codigoParada={id}` para o ponto selecionado
   - Retorna linhas e horários em tempo real

4. **Localização de Veículos**
   - Consulta `/veiculos` para posição GPS de todos os ônibus
   - Exibe no mapa (opcional)

5. **Atualização Automática**
   - A cada 30 segundos, os dados são atualizados
   - Sem necessidade de recarregar a página

## 📍 Configuração Necessária

### 1. Google Maps API Key
Você já deve ter `VITE_GOOGLE_MAPS_API_KEY` no `.env`

```
VITE_GOOGLE_MAPS_API_KEY=sua_chave_aqui
```

### 2. APIs URBES (Públicas)
Não requerem autenticação. Endpoints:

| Endpoint | Descrição |
|----------|-----------|
| `https://dados.urbes.com.br/api/v1/paradas` | Lista de pontos de ônibus |
| `https://dados.urbes.com.br/api/v1/linhas` | Lista de linhas |
| `https://dados.urbes.com.br/api/v1/previsao?codigoParada={id}` | Previsão para um ponto |
| `https://dados.urbes.com.br/api/v1/veiculos` | Posição GPS dos ônibus |

## 📱 Como Usar

### Passo 1: Cadastrar Endereço
1. Acesse a aba **Perfil**
2. Expanda "Meu Endereço"
3. Digite seu endereço completo (com autocomplete)
4. Salve

### Passo 2: Acessar Tempo Real
1. Clique na aba **Tempo Real**
2. Sistema geocodifica seu endereço automaticamente
3. Encontra o ponto de ônibus mais próximo
4. Exibe ônibus e horários

### Recursos da Tela

**Mapa Interativo:**
- 🔵 Marcador azul = Sua localização
- 🔴 Marcador vermelho = Ponto de ônibus mais próximo
- 🟡 Marcadores amarelos = Ônibus em trânsito

**Tabela de Ônibus:**
- Número da linha
- Destino/Nome da linha
- Status (Chegando / No horário)
- Próxima chegada em minutos
- Favoritar linhas
- Receber notificações

**Botão de Modo:**
- "Dados Reais" - Conectado à URBES
- "Simulated" - Dados simulados (fallback)

## 🐛 Solução de Problemas

### "Cadastre seu endereço"
- Vá para **Perfil** > **Meu Endereço**
- Digite seu endereço completo
- Salve as alterações

### "Erro ao conectar com o serviço"
- Verifique conexão com internet
- Verifique se `VITE_GOOGLE_MAPS_API_KEY` está configurada
- Tente novamente após alguns segundos

### "Nenhum ônibus previsto"
- Pode ser horário fora de funcionamento
- Verifique se o ponto selecionado tem linhas
- Sistema atualiza a cada 30 segundos

### Mapa não carrega
- Verifique se Google Maps está carregando corretamente
- Confirme que `VITE_GOOGLE_MAPS_API_KEY` está válida
- Recarregue a página

## 📊 Arquitetura

```
src/
├─ services/
│  ├─ urbApi.ts              # Integração com API URBES
│  ├─ googlePlaces.ts        # Google Places Autocomplete
│  └─ userLocation.ts        # Gerenciamento de localização
├─ hooks/
│  └─ useRealTimeData.ts     # Hook para dados em tempo real
├─ utils/
│  └─ geoUtils.ts            # Cálculos de geolocalização
├─ components/
│  └─ RealTimeMap.tsx        # Mapa interativo com Google Maps
└─ pages/
   └─ RealTimePage.tsx       # Página principal de Tempo Real
```

## 🔄 Fluxo de Atualização

```
useRealTimeData Hook
    ↓
1. Geocodificar endereço (Google Maps)
    ↓
2. Buscar paradas da URBES
    ↓
3. Calcular parada mais próxima
    ↓
4. Buscar previsão + veículos
    ↓
5. Atualizar estado (linhas, parada, veículos)
    ↓
6. Renderizar componentes
    ↓
7. Esperar 30 segundos
    ↓
Repetir desde passo 1
```

## 🎨 Interface

### Estados da Tela

**Carregando:**
- Spinner animado
- Texto "Carregando dados em tempo real..."

**Com Dados:**
- Localização do usuário exibida
- Mapa com marcadores
- Tabela com linhas próximas
- Timestamp da última atualização

**Sem Dados:**
- Mensagem "Cadastre seu endereço"
- Link para Perfil

**Com Erro:**
- Alerta em vermelho
- Descrição do erro
- Sistema continua tentando atualizar

## 📈 Performance

- **Cache de Dados:** Hook reutiliza dados até próxima atualização
- **Intervalo de Atualização:** 30 segundos (configurável em `useRealTimeData.ts`)
- **Cleanup:** Intervals são limpos ao desmontar componente
- **Limite de Veículos:** Apenas 5 ônibus mostrados no mapa (para performance)

## 🚀 Próximas Melhorias

- [ ] Filtrar linhas por número/nome
- [ ] Histórico de linhas favoritas
- [ ] Notificações push quando ônibus chega
- [ ] Rota em tempo real no mapa
- [ ] Estimativa de lotação
- [ ] Integração com múltiplas cidades

## 📞 Suporte

Para problemas com a API URBES:
- https://dados.urbes.com.br (documentação)
- Status da API pode variar dependendo da disponibilidade

Para problemas com Google Maps:
- https://developers.google.com/maps
- Verifique se a API Key tem as devidas restrições

