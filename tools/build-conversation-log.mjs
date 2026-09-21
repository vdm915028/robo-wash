// Собирает статичную страницу с перепиской из транскриптов сессии Claude Code.
// Запуск: node tools/build-conversation-log.mjs <транскрипт.jsonl>... <выходной.html> [начало последней реплики]
//
// Транскрипты лежат в ~/.claude/projects/<проект>/<сессия>.jsonl. Сессия, продолженная после сжатия контекста,
// пишется в новый файл: он начинается со сводки и заново содержит всё, что было после сжатия, а история до него
// остаётся только в предыдущем файле. Поэтому транскрипты передаются от старого к новому. Файл ответвления —
// сессии, в которой реплику потом отредактировали и пошли другим путём, — передавать не нужно.

import { readFileSync, writeFileSync } from 'node:fs';
import { userInfo } from 'node:os';

const args = process.argv.slice(2);
const transcriptCount = args.findIndex(a => !a.endsWith('.jsonl'));
const transcriptPaths = args.slice(0, transcriptCount === -1 ? args.length : transcriptCount);
const [outputPath, cutMarker] = args.slice(transcriptPaths.length);

if (transcriptPaths.length === 0 || !outputPath) {
    console.error('Использование: node tools/build-conversation-log.mjs <транскрипт.jsonl>... <выходной.html> [маркер]');
    process.exit(1);
}

const isNoise = text =>
    !text.trim() ||
    text.includes('<system-reminder>') ||
    text.includes('<task-notification>') ||
    text.includes('<command-name>') ||
    text.includes('<local-command-stdout>') ||
    text.startsWith('Caveat:') ||
    text.startsWith('Continue from where you left off') ||
    text.startsWith('[Request interrupted') ||
    text.startsWith('I hit my usage limit');

// Берём только текст: картинки и результаты инструментов в переписку не попадают.
const textOf = content => {
    if (typeof content === 'string') return content;
    if (!Array.isArray(content)) return '';
    return content.filter(b => b.type === 'text').map(b => b.text).join('\n\n');
};

// Имя пользователя берём из системы, а не из исходника: оно встречается в путях вида C:\Users\<имя>.
// Логин GitHub не вычищаем — он публичен, ссылка на репозиторий висит в самом приложении.
const osUserName = userInfo().username;
const scrub = text =>
    text.replace(/[\w.+-]+@[\w.-]+\.\w+/g, '[адрес скрыт]').split(osUserName).join('user');

const readRows = path =>
    readFileSync(path, 'utf8').split('\n').flatMap(line => {
        try { return line.trim() ? [JSON.parse(line)] : []; } catch { return []; }
    });

const isCompactBoundary = row => row.type === 'system' && row.subtype === 'compact_boundary';

// Из каждого файла берём отрезок от его первой границы сжатия (у первого файла — от начала) до последней
// (у последнего — до конца): всё, что лежит за этими границами, есть в соседнем файле.
const historyRows = () =>
    transcriptPaths.flatMap((path, i) => {
        const rows = readRows(path);
        const boundaries = rows.flatMap((row, index) => (isCompactBoundary(row) ? [index] : []));
        const isFirst = i === 0;
        const isLast = i === transcriptPaths.length - 1;

        const from = isFirst || boundaries.length === 0 ? 0 : boundaries[0] + 1;
        const to = isLast || boundaries.length === 0 ? rows.length : boundaries.at(-1);

        return rows.slice(from, to);
    });

const readDialogue = () => {
    const turns = [];

    for (const row of historyRows()) {
        // Сводку сжатия пишет не пользователь, а Claude Code, чтобы продолжить сессию, — в переписку она не идёт.
        if (row.isSidechain || row.isMeta || row.isCompactSummary) continue;
        if (row.type !== 'user' && row.type !== 'assistant') continue;

        const text = textOf(row.message?.content).trim();
        // Результаты инструментов и уведомления фоновых задач приезжают как сообщения пользователя, хотя
        // пользователь их не писал. Выбрасываем молча: ход агента ими не прерывается, он продолжается.
        if (isNoise(text)) continue;

        const previous = turns.at(-1);
        if (previous?.role === row.type) previous.parts.push(text);
        else turns.push({ role: row.type, parts: [text] });
    }

    const dialogue = turns.map(t => ({ role: t.role, text: scrub(t.parts.join('\n\n')) }));
    if (!cutMarker) return dialogue;

    // Ищем с конца: одна и та же фраза вроде «закоммитил, смержил» за долгий проект встречается не раз, а маркер
    // отмечает последнюю реплику.
    const cut = dialogue.findLastIndex(m => m.role === 'user' && m.text.startsWith(cutMarker));
    if (cut === -1) throw new Error(`Реплика, начинающаяся с «${cutMarker}», в транскрипте не найдена`);

    return dialogue.slice(0, cut + 1);
};

const escapeHtml = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

// Ссылки в переписке ведут на файлы репозитория и на отдельной странице никуда не приведут,
// поэтому кликабельными оставляем только внешние адреса, остальные показываем текстом.
const renderInline = text =>
    text
        .split(/(`[^`]+`)/)
        .map(part => {
            if (part.startsWith('`') && part.endsWith('`')) return `<code>${part.slice(1, -1)}</code>`;
            return part
                .replace(/\[([^\]]+)\]\((https?:[^)]+)\)/g, '<a href="$2" target="_blank" rel="noreferrer">$1</a>')
                .replace(/\[([^\]]+)\]\([^)]+\)/g, '<code>$1</code>')
                .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
        })
        .join('');

const renderMarkdown = source => {
    const lines = escapeHtml(source).split('\n');
    const html = [];
    let index = 0;

    const collect = predicate => {
        const collected = [];
        while (index < lines.length && predicate(lines[index])) collected.push(lines[index++]);
        return collected;
    };

    while (index < lines.length) {
        const line = lines[index];

        if (!line.trim()) { index++; continue; }

        if (line.startsWith('```')) {
            index++;
            const code = collect(l => !l.startsWith('```'));
            index++;
            html.push(`<pre><code>${code.join('\n')}</code></pre>`);
            continue;
        }

        const heading = line.match(/^(#{2,4})\s+(.*)$/);
        if (heading) {
            const level = heading[1].length + 1;
            html.push(`<h${level}>${renderInline(heading[2])}</h${level}>`);
            index++;
            continue;
        }

        if (line.startsWith('|')) {
            const rows = collect(l => l.startsWith('|')).map(l => l.replace(/^\||\|$/g, '').split('|'));
            const body = rows.filter(cells => !cells.every(cell => /^\s*:?-+:?\s*$/.test(cell)));
            const [header, ...rest] = body;
            const row = (tag, cells) => `<tr>${cells.map(c => `<${tag}>${renderInline(c.trim())}</${tag}>`).join('')}</tr>`;
            html.push(`<table><thead>${row('th', header)}</thead><tbody>${rest.map(r => row('td', r)).join('')}</tbody></table>`);
            continue;
        }

        if (/^[-*]\s+/.test(line)) {
            const items = collect(l => /^[-*]\s+/.test(l)).map(l => l.replace(/^[-*]\s+/, ''));
            html.push(`<ul>${items.map(i => `<li>${renderInline(i)}</li>`).join('')}</ul>`);
            continue;
        }

        if (/^\d+\.\s+/.test(line)) {
            const items = collect(l => /^\d+\.\s+/.test(l)).map(l => l.replace(/^\d+\.\s+/, ''));
            html.push(`<ol>${items.map(i => `<li>${renderInline(i)}</li>`).join('')}</ol>`);
            continue;
        }

        if (line.startsWith('&gt;')) {
            const quote = collect(l => l.startsWith('&gt;')).map(l => l.replace(/^&gt;\s?/, ''));
            html.push(`<blockquote>${renderInline(quote.join(' '))}</blockquote>`);
            continue;
        }

        // Переносы строк внутри абзаца сохраняем: в чате их ставят осмысленно, а не как перенос по ширине.
        const paragraph = collect(l => l.trim() && !/^([-*]\s|\d+\.\s|#{2,4}\s|\||```|&gt;)/.test(l));
        html.push(`<p>${paragraph.map(renderInline).join('<br />')}</p>`);
    }

    return html.join('\n');
};

const dialogue = readDialogue();

const messages = dialogue
    .map(message => {
        const body = renderMarkdown(message.text);
        if (message.role === 'user') {
            return `<article class="message message--user"><div class="author">Вадим</div><div class="body">${body}</div></article>`;
        }
        return `<article class="message message--agent"><div class="author">Агент Оркестратор</div>
<div class="body body--collapsed">${body}</div>
<button class="expand" type="button">Показать ответ целиком</button></article>`;
    })
    .join('\n\n');

const page = `<!doctype html>
<html lang="ru">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>RoboWash — переписка с агентом</title>
<style>
    :root { color-scheme: light; }
    * { box-sizing: border-box; }
    body {
        margin: 0;
        background: #f6f6f4;
        color: #1f1f1d;
        font: 16px/1.65 -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
    }
    .page { max-width: 46rem; margin: 0 auto; padding: 2.5rem 1.25rem 4rem; }

    header.intro { padding-bottom: 1.5rem; border-bottom: 1px solid #e2e1dc; margin-bottom: 2rem; }
    header.intro h1 { margin: 0 0 0.75rem; font-size: 1.6rem; line-height: 1.25; }
    header.intro p { margin: 0.6rem 0 0; color: #5d5c56; font-size: 0.95rem; }

    .message { margin: 0 0 1.75rem; }
    .author { font-size: 0.78rem; font-weight: 600; letter-spacing: 0.06em; text-transform: uppercase; color: #8a887f; margin-bottom: 0.5rem; }
    .message--user .body {
        background: #fff;
        border: 1px solid #e2e1dc;
        border-left: 3px solid #c96442;
        border-radius: 0.5rem;
        padding: 0.85rem 1.1rem;
    }
    .message--agent .body { padding-left: 0.15rem; }

    .body--collapsed { max-height: 7.5rem; overflow: hidden; mask-image: linear-gradient(to bottom, #000 55%, transparent 100%); }
    .expand {
        margin-top: 0.6rem;
        padding: 0.35rem 0.8rem;
        font: inherit;
        font-size: 0.85rem;
        color: #5d5c56;
        background: #fff;
        border: 1px solid #dcdbd5;
        border-radius: 999px;
        cursor: pointer;
    }
    .expand:hover { background: #f0efeb; }

    .body > :first-child { margin-top: 0; }
    .body > :last-child { margin-bottom: 0; }
    p { margin: 0.7rem 0; }
    h3, h4, h5 { margin: 1.4rem 0 0.5rem; line-height: 1.3; }
    h3 { font-size: 1.15rem; }
    h4 { font-size: 1rem; }
    ul, ol { margin: 0.7rem 0; padding-left: 1.3rem; }
    li { margin: 0.3rem 0; }
    blockquote { margin: 0.8rem 0; padding: 0.1rem 0 0.1rem 0.9rem; border-left: 3px solid #dcdbd5; color: #5d5c56; }
    a { color: #c96442; }
    code {
        background: #eceae4;
        border-radius: 0.25rem;
        padding: 0.1em 0.35em;
        font-family: ui-monospace, "SF Mono", "Cascadia Mono", Menlo, Consolas, monospace;
        font-size: 0.87em;
    }
    pre {
        background: #26251f;
        color: #f2f1ec;
        border-radius: 0.5rem;
        padding: 0.9rem 1rem;
        overflow-x: auto;
        margin: 0.9rem 0;
    }
    pre code { background: none; padding: 0; color: inherit; font-size: 0.85em; }
    table { border-collapse: collapse; width: 100%; margin: 0.9rem 0; font-size: 0.92em; display: block; overflow-x: auto; }
    th, td { border: 1px solid #e2e1dc; padding: 0.4rem 0.6rem; text-align: left; vertical-align: top; }
    th { background: #eceae4; }

    footer.outro { margin-top: 2.5rem; padding-top: 1.5rem; border-top: 1px solid #e2e1dc; color: #5d5c56; font-size: 0.95rem; }
</style>
</head>
<body>
<div class="page">
<header class="intro">
    <h1>RoboWash — переписка с агентом</h1>
    <p>Работа над демо-приложением сети автоматических моек — с первой постановки задачи. Разработку ведёт
    Claude Code в роли оркестратора, проверку кода — отдельные агенты: локально перед пул реквестом и в самом
    пул реквесте.</p>
    <p>Здесь только диалог: реплики агента приведены целиком, но свёрнуты — разворачиваются по кнопке.
    Вызовы инструментов, вывод команд и отчёты проверяющих агентов опущены.</p>
</header>

${messages}

<footer class="outro">
    <p>Лог обрывается там, где работа идёт прямо сейчас. Эту страницу собрал тот же агент, разобрав транскрипт
    переписки, — поэтому она и заканчивается просьбой её обновить.</p>
</footer>
</div>
<script>
    for (const button of document.querySelectorAll('.expand')) {
        const body = button.previousElementSibling;
        // Короткий ответ и так виден целиком — кнопка на нём выглядела бы издевательством.
        if (body.scrollHeight <= body.clientHeight + 8) {
            body.classList.remove('body--collapsed');
            button.remove();
            continue;
        }
        button.addEventListener('click', () => {
            const collapsed = body.classList.toggle('body--collapsed');
            button.textContent = collapsed ? 'Показать ответ целиком' : 'Свернуть';
        });
    }
</script>
</body>
</html>
`;

writeFileSync(outputPath, page, 'utf8');
console.log(`готово: ${outputPath} | ${(Buffer.byteLength(page, 'utf8') / 1024).toFixed(0)} КБ | реплик: ${dialogue.length}`);
