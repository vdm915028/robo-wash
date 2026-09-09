import { FullScreenHeader } from '../components/FullScreenHeader';

const githubProjectUrl = 'https://github.com/vdm915028/robo-wash';
const conversationLogUrl = 'https://storage.googleapis.com/robo-wash-bucket/conversation-log.html';
const linkCardClasses = 'block rounded-2xl bg-white p-4 shadow-sm';

const projectShowcasePoints = [
    'как составляется план разработки',
    'какой подход к использованию агентов применяется — оркестратор, субагенты и так далее',
    'что агентам запрещено и почему',
    'какой контекст агент получает, а какой намеренно нет',
    'как пишется CLAUDE.md: что туда попадает, а что нет',
    'как агенты участвуют в код-ревью и валидации кода',
    'где агенты не окупаются и как отсекается их шум',
];

export function AboutPage() {
    return (
        <section className="absolute inset-0 flex flex-col bg-slate-100">
            <FullScreenHeader title="О приложении" />

            <div className="flex-1 overflow-y-auto p-4">
                <div className="rounded-2xl bg-white p-4 shadow-sm">
                    <p className="text-sm leading-relaxed text-slate-600">
                        RoboWash — демонстрационное приложение сети автоматических моек, сделанное для интервью.
                        Настоящая его задача не в мойках: показать, как автор выстраивает мультиагентную разработку
                        с помощью Claude Code.
                    </p>

                    <h2 className="mt-4 text-sm font-semibold text-slate-900">Что показывает проект</h2>
                    <ul className="mt-2 space-y-1.5">
                        {projectShowcasePoints.map(point => (
                            <li key={point} className="flex gap-2 text-sm leading-relaxed text-slate-600">
                                <span aria-hidden="true" className="text-slate-300">
                                    •
                                </span>
                                {point}
                            </li>
                        ))}
                    </ul>
                </div>

                <div className="mt-4 space-y-2">
                    <a href={githubProjectUrl} target="_blank" rel="noreferrer" className={linkCardClasses}>
                        <div className="flex items-center justify-between gap-3">
                            <div>
                                <p className="text-brand font-medium">Исходный код</p>
                                <p className="mt-0.5 text-sm text-slate-500">github.com/vdm915028/robo-wash</p>
                            </div>
                            <span aria-hidden="true" className="text-brand shrink-0 text-lg">↗</span>
                        </div>
                    </a>

                    <a href={conversationLogUrl} target="_blank" rel="noreferrer" className={linkCardClasses}>
                        <div className="flex items-center justify-between gap-3">
                            <div>
                                <p className="text-brand font-medium">Переписка с агентом</p>
                                <p className="mt-0.5 text-sm text-slate-500">От постановки задачи до публикации</p>
                            </div>
                            <span aria-hidden="true" className="text-brand shrink-0 text-lg">↗</span>
                        </div>
                    </a>
                </div>
            </div>
        </section>
    );
}
