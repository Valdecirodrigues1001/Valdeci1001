-- Correção pontual dos compromissos criados ANTES do fix de
-- fuso horário. Eles foram gravados 3h adiantados (horário
-- digitado interpretado como UTC em vez de horário de Brasília).
--
-- Rodar UMA vez, logo após o deploy do fix. Ajuste o corte
-- '<TIMESTAMP DO DEPLOY>' para o momento em que o deploy subiu
-- (formato: 2026-08-30 18:30:00+00). Compromissos criados
-- depois disso já estão corretos e NÃO devem ser tocados.

-- 1) Confira antes o que será alterado:
select id, title, start_at, end_at, created_at
from campaign_events
where created_at < '<TIMESTAMP DO DEPLOY>'
order by created_at desc;

-- 2) Aplique:
update campaign_events
set
  start_at = start_at + interval '3 hours',
  end_at   = end_at   + interval '3 hours'
where created_at < '<TIMESTAMP DO DEPLOY>';
