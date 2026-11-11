export default function CvOnlineTemplate({ title, sections }) {
  return (
    <main className="min-h-screen bg-gray-100 px-4 py-10 sm:px-6 lg:px-8">
      <article className="mx-auto max-w-[850px] rounded-sm bg-white p-8 font-sans leading-relaxed text-gray-900 shadow-2xl sm:p-12">
        <header className="mb-8 border-b border-gray-200 pb-6 text-center">
          <h1 className="text-2xl font-bold uppercase tracking-wide text-gray-800 sm:text-3xl">
            {title}
          </h1>
        </header>

        {sections.map((section, index) => (
          <section key={section.title} className={index === sections.length - 1 ? 'mb-2' : 'mb-6'}>
            <h2 className="mb-3 border-b-2 border-gray-800 pb-1 text-lg font-bold text-gray-800">
              {section.title}
            </h2>

            {section.details && (
              <div className="grid grid-cols-1 gap-y-2 text-sm sm:grid-cols-2">
                {section.details.map(([label, value]) => (
                  <div key={label} className="flex">
                    <span className="w-24 shrink-0 font-medium text-gray-600">{label}</span>
                    <span className="text-gray-900">: {value}</span>
                  </div>
                ))}
              </div>
            )}

            {section.paragraphs?.map((paragraph) => (
              <p key={paragraph} className="text-sm text-gray-800">{paragraph}</p>
            ))}

            {section.bullets && (
              <ul className="list-inside list-disc space-y-2 text-sm text-gray-800">
                {section.bullets.map(([label, description]) => (
                  <li key={label}>
                    <span className="font-semibold">{label}</span> {description}
                  </li>
                ))}
              </ul>
            )}

            {section.jobs?.map((job) => (
              <div key={job.company} className="mb-4 last:mb-0">
                <div className="mb-1 flex flex-col text-sm font-bold text-gray-800 sm:flex-row sm:items-center sm:justify-between">
                  <span>{job.company}</span>
                  <span className="font-normal text-gray-600">{job.role} | {job.period}</span>
                </div>
                <ul className="list-inside list-disc space-y-1.5 pl-1 text-sm text-gray-800">
                  {job.bullets.map((bullet) => <li key={bullet}>{bullet}</li>)}
                </ul>
              </div>
            ))}
          </section>
        ))}
      </article>
    </main>
  );
}
