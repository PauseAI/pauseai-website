create table
  public.translation (
    path text not null,
    hash text not null,
    language_code text not null,
    translation text not null,
    constraint translations_pkey primary key (path,language_code)
  ) tablespace pg_default;