insert into public.auth_users (email, password_hash, name, role, created_at, updated_at)
values
  (
    'superadmin@scg.gt',
    'dfca19030b4d5d92e623a443174170fc:14a2af489f5f23e454bf59f67372778e821642e39f6986b873f307e3dcca1789d0e44b84f34789af86360de5f20b2bcb74a43eae19e6c92161634f481970dc5e',
    'Admin SCG',
    'Superadmin',
    now(),
    now()
  ),
  (
    'admin@scg.gt',
    '7ed951220629eef56e6fc21284f14771:db1eb9b94cc7986b0401096cae1ea6ad892d1ff63b5c4c3aa88cce0b85b5ee43bc69e92827e22d193d983488caef4ef56dbd3791c4a2942a6069806b7c00829b',
    'Operaciones SCG',
    'Admin',
    now(),
    now()
  ),
  (
    'gerente@scg.gt',
    'e81c0517d62e6992ab0ff376e30bf647:45ee2e769438e7dd0c174ee34ecdeecf72d1211cd4f3019e35ee069e8040286ba287a5aebe3b10a45e9c9ea6ed4a7c6e45c8f4e0c3ba3fcb913670d8753d32dd',
    'Gerencia SCG',
    'Gerente',
    now(),
    now()
  ),
  (
    'contador@scg.gt',
    'c60fce24b3337046038235ddcc34e197:0b81161fe886c713986ec9a75f9263390f952a2671d15750e6a2eabc4b947884b3369f547c0f73122c3dcfb37dd29d8428e3180e686ccb0f5e8e1409d1942294',
    'Contabilidad SCG',
    'Contador',
    now(),
    now()
  )
on conflict (email) do update
set
  password_hash = excluded.password_hash,
  name = excluded.name,
  role = excluded.role,
  updated_at = now();
