begin;

-- 1) Elimina duplicados conservando la fila más reciente por (codigo, pedido, entrega)
with ranked as (
  select
    ctid,
    row_number() over (
      partition by codigo, pedido, entrega
      order by created_at desc nulls last, id desc
    ) as rn
  from public.programacion
)
delete from public.programacion p
using ranked r
where p.ctid = r.ctid
  and r.rn > 1;

-- 2) Crea índice único para idempotencia real
create unique index if not exists ux_programacion_codigo_pedido_entrega
on public.programacion (codigo, pedido, entrega);

commit;
