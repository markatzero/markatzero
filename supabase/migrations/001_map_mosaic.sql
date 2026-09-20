-- MARK AT ZERO
-- Phase C: map mosaic aggregation foundation
--
-- This migration creates a server-side function that groups paid Marks
-- into geographic cells. The browser receives a small number of cells
-- instead of receiving every individual Mark.
--
-- Individual Marks remain unchanged in the marks table.

create or replace function public.get_map_mosaic(
  cell_size double precision
)
returns table (
  cell_x integer,
  cell_y integer,
  longitude double precision,
  latitude double precision,
  mark_count bigint,
  representative_mark_id bigint,
  representative_image_url text
)
language sql
stable
as $$
  with valid_input as (
    select cell_size
    where cell_size > 0
      and cell_size <= 360
  ),
  paid_marks as (
    select
      m.id,
      m.image_url,
      m.mark_number,
      m.longitude,
      m.latitude,
      floor(
        (m.longitude + 180.0) /
        v.cell_size
      )::integer as cell_x,
      floor(
        (m.latitude + 90.0) /
        v.cell_size
      )::integer as cell_y
    from public.marks as m
    cross join valid_input as v
    where m.status = 'paid'
      and m.mark_number is not null
      and m.longitude is not null
      and m.latitude is not null
  ),
  ranked_marks as (
    select
      *,
      row_number() over (
        partition by cell_x, cell_y
        order by mark_number desc
      ) as cell_rank
    from paid_marks
  )
  select
    cell_x,
    cell_y,
    avg(longitude)::double precision
      as longitude,
    avg(latitude)::double precision
      as latitude,
    count(*)::bigint
      as mark_count,
    max(id) filter (
      where cell_rank = 1
    )::bigint
      as representative_mark_id,
    max(image_url) filter (
      where cell_rank = 1
    )::text
      as representative_image_url
  from ranked_marks
  group by cell_x, cell_y
  order by cell_y, cell_x;
$$;