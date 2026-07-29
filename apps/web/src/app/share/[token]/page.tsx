import { getPublicShare } from '../../../server/store';

export default async function SharePage({ params }: { params: Promise<{ token: string }> }) {
  const data = getPublicShare((await params).token);
  const latestAlbum = data.albums.at(-1);
  return (
    <main className="main">
      <section className="card">
        <p className="pill">只读分享</p>
        <h1 className="brand">{data.trip.title}</h1>
        <p className="muted">
          {data.trip.destination} · {data.trip.startDate} 至 {data.trip.endDate}
        </p>
      </section>
      {latestAlbum ? (
        <section className="card" style={{ marginTop: 16 }}>
          <h2>{latestAlbum.title}</h2>
          <p>{latestAlbum.narrative}</p>
          {latestAlbum.sections.map((section) => (
            <article key={section.heading} className="timelineItem">
              <h3>{section.heading}</h3>
              <p>{section.body}</p>
            </article>
          ))}
        </section>
      ) : (
        <section className="card" style={{ marginTop: 16 }}>
          <p>相册尚未生成。</p>
        </section>
      )}
    </main>
  );
}

