# Auditoria Geral — Instituto Politécnico do Sumbe (IPS)

## 1. Estado da Base de Dados (Lovable Cloud)

- **Estado:** Base de dados e PgBouncer operacionais, sem reinícios
- **Instância:** Tiny (suficiente para a carga atual)
- **Memória:** 50% usada — saudável
- **Disco:** 4% usado — muito espaço livre
- **Ligações:** 8/60 — baixa utilização
- **Tamanho da base de dados:** 12.7 MB
- **Alertas de exaustão (48h):** nenhum
- **Transações revertidas:** 228 desde o arranque (normal, sem sinal de crescimento anómalo)

## 2. Dados por Tabela

| Tabela | Registos | Observação |
|---|---|---|
| admissions | 1 | 1 candidatura submetida |
| announcements | 1 | Poucos anúncios |
| calendar_events | 12 | Eventos de teste criados |
| campus_photos | 1 | Galeria quase vazia |
| campus_visits | 0 | Sem visitas marcadas |
| courses | 3 | Cursos ativos |
| enrollments | 0 | Sem matrículas |
| grades | 0 | Sem notas lançadas |
| profiles | 7 | 7 utilizadores registados |
| schedules | 0 | Sem horários definidos |
| site_content | 2 | Conteúdo editável presente |
| subjects | 2 | Poucas disciplinas |
| user_roles | 5 | 5 papéis atribuídos |

**Conclusão:** o sistema académico (matrículas, notas, horários) ainda não tem dados reais — falta popular disciplinas, matricular estudantes e definir horários para os painéis de professor/estudante funcionarem com conteúdo.

## 3. Segurança

Avisos do scanner (nível informativo, não crítico):
- Políticas RLS com `USING (true)` em **courses**, **campus_photos**, **schedules**, **site_content**, **calendar_events** — intencional: são dados públicos do site.
- INSERT aberto em **admissions** e **campus_visits** — intencional: formulários públicos.

**Ponto de atenção real:** as políticas "Anyone can check their application status" e "Anyone can check their visit" permitem a qualquer pessoa **ler todas as candidaturas e visitas** (nomes, emails, telefones). Isto expõe dados pessoais publicamente.

## 4. Ferramentas e Stack Utilizadas

**Frontend:** React 18, Vite 5, TypeScript 5, Tailwind CSS 3, shadcn/ui (Radix), framer-motion (animações/parallax), react-router-dom 6, TanStack Query, react-hook-form + zod (validação), react-helmet-async (SEO), embla-carousel, lucide-react, sonner, next-themes (dark mode), recharts, date-fns.

**Backend (Lovable Cloud):** Base de dados Postgres com RLS, autenticação por email, storage (bucket `campus-photos` público), edge function `create-staff-user` (criação de contas de staff pelo admin).

**Qualidade/SEO:** Vitest + Testing Library, ESLint, sitemap.xml, robots.txt, llms.txt, JSON-LD, meta tags por rota.

## 5. Correções Propostas (se aprovado)

1. **Proteger dados pessoais:** restringir a leitura de `admissions` e `campus_visits` — a consulta de estado passa a exigir email + código/referência, ou via função segura, em vez de leitura pública de todas as linhas.
2. **Dados de demonstração:** popular disciplinas, horários e matrículas de teste para validar os painéis de professor e estudante.
3. **Limpeza:** remover eventos de teste do calendário quando entrarem dados reais (opcional).
