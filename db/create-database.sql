-- Разворачивает базу RoboWash с нуля: сначала таблицы, в конце справочные данные.
--
--     psql -U postgres -f db/create-database.sql
--
-- Скрипт рассчитан на чистый сервер и намеренно падает, если база уже есть: доводить существующую базу
-- до нужного состояния — работа миграций, а не этого файла. Нужна чистая база — удалите старую.
-- При добавлении таблиц скрипт обновляется вместе с миграцией, иначе развернуть проект локально станет нечем.

-- Без этой строки psql проглатывает ошибку «база уже есть», доходит до insert и молча задваивает справочник.
\set ON_ERROR_STOP on

create database robowash;

\connect robowash
\encoding UTF8
\set ON_ERROR_STOP on

-- Схема и данные ставятся одной транзакцией: если что-то отвалится на полпути, база останется пустой,
-- а не наполовину собранной, из которой уже не развернуться повторным запуском.
begin;

create table wash_modes (
    id                        int generated always as identity primary key,
    name                      text not null,
    description               text not null,
    price_rub                 int not null,
    duration_minutes          int not null,
    steps                     text[] not null,
    -- Цена одна на всю сеть, а вот программу Люкс старые роботы физически не тянут: это свойство режима,
    -- а не настройка точки, поэтому флаг здесь, а не в связке «локация — режим».
    requires_modern_equipment boolean not null
);

create table wash_locations (
    id                         int generated always as identity primary key,
    address                    text not null,
    longitude                  double precision not null,
    latitude                   double precision not null,
    robot_equipment_generation text not null
        check (robot_equipment_generation in ('Legacy', 'Modern')),
    -- Длина очереди — не справочные данные, а состояние точки: в боевой системе её обновляет оборудование.
    cars_in_queue              int not null default 0
);

create table wash_sessions (
    id               int generated always as identity primary key,
    device_id        text not null,
    wash_location_id int not null references wash_locations (id),
    wash_mode_id     int not null references wash_modes (id),
    -- Адрес, название режима и цена продублированы снимком намеренно. История показывает, что человек купил:
    -- переименуют точку или поднимут цену — прошлые записи обязаны остаться прежними. Ссылки рядом живут
    -- для аналитики, снимок — для показа.
    location_address text not null,
    wash_mode_name   text not null,
    price_rub        int not null,
    -- Всегда timestamptz: сервер живёт в UTC, клиент в +03, и timestamp без зоны врёт молча.
    washed_at        timestamptz not null
);

create index on wash_sessions (device_id, washed_at desc);

-- Справочные данные повторяют захардкоженные на клиенте, чтобы при переходе на API поведение не изменилось.
-- Идентификаторы не задаём: identity расставит их по порядку вставки, и он совпадёт с текущим клиентским.

insert into wash_modes (name, description, price_rub, duration_minutes, steps, requires_modern_equipment)
values
    ('Экспресс', 'Быстрая бесконтактная мойка кузова без сушки.', 500, 5,
     array['Ополаскивание', 'Эмульсия', 'Смыв водой'], false),
    ('Стандарт', 'Базовый режим на каждый день: цветная пена и обдув.', 700, 8,
     array['Ополаскивание', 'Эмульсия', 'Смыв водой', 'Цветная пена', 'Обдув'], false),
    ('Люкс', 'Полная программа: диски, гидрофобное покрытие и ополаскивание осмосом.', 950, 11,
     array['Ополаскивание', 'Эмульсия', 'Смыв водой', 'Цветная пена', 'Мойка дисков', 'Гидрофоб', 'Осмос',
           'Обдув 2x'], true);

insert into wash_locations (address, longitude, latitude, robot_equipment_generation, cars_in_queue)
values
    ('Невский пр., 100', 30.3608, 59.9319, 'Modern', 2),
    ('Московский пр., 165', 30.3199, 59.8663, 'Legacy', 0),
    ('Ленинский пр., 114', 30.2317, 59.8532, 'Modern', 5),
    ('пр. Энгельса, 154', 30.3236, 60.0505, 'Legacy', 1),
    ('ул. Савушкина, 112', 30.2246, 59.9862, 'Modern', 3),
    ('Пулковское ш., 30', 30.3253, 59.8083, 'Modern', 11),
    ('Индустриальный пр., 44', 30.4726, 59.9483, 'Legacy', 4);

commit;
