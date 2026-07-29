'use client';

import { useMemo, useState } from 'react';
import type {
  ExportRecord,
  ItineraryDay,
  MemoryAlbum,
  MemoryAsset,
  Place,
  RouteSnapshot,
  TravelInsight,
  TravelSource,
  Trip,
} from '@nice-travel/shared';

type Pace = 'relaxed' | 'balanced' | 'intense';

interface TripDetail {
  trip: Trip;
  sources: TravelSource[];
  insights: TravelInsight[];
  places: Place[];
  itineraryDays: ItineraryDay[];
  routes: RouteSnapshot[];
  assets: MemoryAsset[];
  albums: MemoryAlbum[];
  shares: Array<{ id: string; token: string; scope: string; expiresAt?: string }>;
  exports: ExportRecord[];
}

async function postJson<T>(url: string, body?: unknown): Promise<T> {
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = (await response.json()) as T & { error?: string };
  if (!response.ok) throw new Error(data.error ?? '请求失败');
  return data;
}

export default function TravelWorkbench({ initialData }: { initialData: TripDetail | null }) {
  const [detail, setDetail] = useState<TripDetail | null>(initialData);
  const [message, setMessage] = useState('已载入示例旅行项目，可从左侧修改并执行生成流程。');
  const [form, setForm] = useState<{
    title: string;
    destination: string;
    startDate: string;
    endDate: string;
    budgetCny: string;
    interests: string;
    pace: Pace;
    notes: string;
  }>({
    title: initialData?.trip.title ?? '成都慢游计划',
    destination: initialData?.trip.destination ?? '成都',
    startDate: initialData?.trip.startDate ?? '2026-05-01',
    endDate: initialData?.trip.endDate ?? '2026-05-03',
    budgetCny: String(initialData?.trip.budgetCny ?? 3600),
    interests: initialData?.trip.preferences.interests.join('、') ?? '美食、城市漫步、人文',
    pace: initialData?.trip.preferences.pace ?? 'balanced',
    notes: '想要轻松一点，少赶路，多吃本地小店，避开过度排队。',
  });

  const latestRoute = detail?.routes.at(-1);
  const latestAlbum = detail?.albums.at(-1);
  const shareUrl = useMemo(() => {
    const share = detail?.shares.at(-1);
    if (!share || typeof window === 'undefined') return null;
    return `${window.location.origin}/share/${share.token}`;
  }, [detail?.shares]);

  async function refresh(tripId: string) {
    const response = await fetch(`/api/trips/${tripId}`);
    const data = (await response.json()) as TripDetail & { error?: string };
    if (!response.ok) throw new Error(data.error ?? '刷新失败');
    setDetail(data);
  }

  async function createOrUpdateTrip() {
    const payload = {
      title: form.title,
      destination: form.destination,
      startDate: form.startDate,
      endDate: form.endDate,
      budgetCny: Number(form.budgetCny),
      preferences: {
        interests: form.interests.split(/[、,，]/).map((item) => item.trim()).filter(Boolean),
        pace: form.pace,
        budgetLevel: 'medium',
        companions: 'friends',
        transportModes: ['walking', 'transit'],
        avoidances: ['过度排队'],
        accessibilityNeeds: [],
      },
    };
    const trip = await postJson<Trip>('/api/trips', payload);
    await refresh(trip.id);
    setMessage('旅行项目已创建。');
  }

  async function runSourceSearch() {
    if (!detail) return;
    await postJson(`/api/trips/${detail.trip.id}/sources/search`, {
      query: `${form.destination} ${form.interests}`,
      links: ['https://example.com/social-note'],
      notes: form.notes,
    });
    await refresh(detail.trip.id);
    setMessage('已导入合规旅行信息源，并保留来源引用。');
  }

  async function runInsightExtract() {
    if (!detail) return;
    await postJson(`/api/trips/${detail.trip.id}/insights/extract`);
    await refresh(detail.trip.id);
    setMessage('已提取地点洞察、推荐理由、避坑提示和置信度。');
  }

  async function runItinerary() {
    if (!detail) return;
    await postJson(`/api/trips/${detail.trip.id}/itinerary/generate`);
    await refresh(detail.trip.id);
    setMessage('已生成多日个性化行程。');
  }

  async function runRoute() {
    if (!detail) return;
    await postJson(`/api/trips/${detail.trip.id}/routes/render`);
    await refresh(detail.trip.id);
    setMessage('已生成路径图快照；Mock 地图以文本路径展示。');
  }

  async function addAsset() {
    if (!detail) return;
    await postJson(`/api/trips/${detail.trip.id}/memories/assets`, {
      fileName: `memory-${detail.assets.length + 1}.jpg`,
      url: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee',
      caption: '旅途中值得留下的一刻',
      placeId: detail.places[0]?.id,
    });
    await refresh(detail.trip.id);
    setMessage('已添加一条旅行记忆素材。');
  }

  async function runAlbum() {
    if (!detail) return;
    await postJson(`/api/trips/${detail.trip.id}/memories/generate`);
    await refresh(detail.trip.id);
    setMessage('已生成电子相册。');
  }

  async function runShare() {
    if (!detail) return;
    await postJson(`/api/trips/${detail.trip.id}/share`, { scope: 'album' });
    await refresh(detail.trip.id);
    setMessage('已创建只读分享链接。');
  }

  async function runExport() {
    if (!detail) return;
    await postJson(`/api/trips/${detail.trip.id}/exports`, { format: 'json' });
    await refresh(detail.trip.id);
    setMessage('已创建导出记录，可通过 API 查询导出详情。');
  }

  return (
    <div className="appShell">
      <aside className="sidebar">
        <h1 className="brand">nice_travel</h1>
        <p className="muted">旅行攻略智能工作台 + 旅行记忆生成器</p>

        <div className="field">
          <label>标题</label>
          <input value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} />
        </div>
        <div className="field">
          <label>目的地</label>
          <input value={form.destination} onChange={(event) => setForm({ ...form, destination: event.target.value })} />
        </div>
        <div className="field">
          <label>日期</label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            <input type="date" value={form.startDate} onChange={(event) => setForm({ ...form, startDate: event.target.value })} />
            <input type="date" value={form.endDate} onChange={(event) => setForm({ ...form, endDate: event.target.value })} />
          </div>
        </div>
        <div className="field">
          <label>预算（元）</label>
          <input value={form.budgetCny} onChange={(event) => setForm({ ...form, budgetCny: event.target.value })} />
        </div>
        <div className="field">
          <label>兴趣偏好</label>
          <input value={form.interests} onChange={(event) => setForm({ ...form, interests: event.target.value })} />
        </div>
        <div className="field">
          <label>节奏</label>
          <select value={form.pace} onChange={(event) => setForm({ ...form, pace: event.target.value as Pace })}>
            <option value="relaxed">轻松</option>
            <option value="balanced">均衡</option>
            <option value="intense">紧凑</option>
          </select>
        </div>
        <div className="field">
          <label>旅行线索</label>
          <textarea value={form.notes} onChange={(event) => setForm({ ...form, notes: event.target.value })} />
        </div>
        <div className="buttonRow">
          <button className="button" onClick={() => void createOrUpdateTrip()}>
            新建旅行
          </button>
          <button className="button secondary" onClick={() => void runSourceSearch()}>
            导入线索
          </button>
          <button className="button secondary" onClick={() => void runInsightExtract()}>
            提取洞察
          </button>
          <button className="button secondary" onClick={() => void runItinerary()}>
            生成行程
          </button>
          <button className="button secondary" onClick={() => void runRoute()}>
            生成路径
          </button>
          <button className="button secondary" onClick={() => void addAsset()}>
            添加素材
          </button>
          <button className="button secondary" onClick={() => void runAlbum()}>
            生成相册
          </button>
          <button className="button secondary" onClick={() => void runShare()}>
            创建分享
          </button>
          <button className="button secondary" onClick={() => void runExport()}>
            导出
          </button>
        </div>
      </aside>

      <main className="main">
        <section className="card">
          <p className="pill">{detail?.trip.status ?? 'draft'}</p>
          <h2>{detail?.trip.title ?? '尚未创建旅行'}</h2>
          {detail && (
            <p className="muted">
              {detail.trip.destination} · {detail.trip.startDate} 至 {detail.trip.endDate} · 预算 {detail.trip.budgetCny ?? '-'} 元
            </p>
          )}
          <p>{message}</p>
          {shareUrl && (
            <p>
              分享链接：<a href={shareUrl}>{shareUrl}</a>
            </p>
          )}
        </section>

        <div className="grid" style={{ marginTop: 16 }}>
          <section className="card">
            <h3>信息源</h3>
            <p className="muted">{detail?.sources.length ?? 0} 条合规来源</p>
            {detail?.sources.map((source) => (
              <article key={source.id}>
                <strong>{source.title}</strong>
                <p className="muted">{source.excerpt}</p>
              </article>
            ))}
          </section>

          <section className="card">
            <h3>候选地点</h3>
            <p className="muted">{detail?.places.length ?? 0} 个地点</p>
            {detail?.places.map((place) => (
              <article key={place.id}>
                <strong>{place.name}</strong>
                <p>
                  {place.tags.map((tag) => (
                    <span className="pill" key={tag}>
                      {tag}
                    </span>
                  ))}
                </p>
                <p className="muted">评分 {place.score}</p>
              </article>
            ))}
          </section>

          <section className="card">
            <h3>行程</h3>
            <div className="timeline">
              {detail?.itineraryDays.map((day) => (
                <article className="timelineItem" key={day.id}>
                  <strong>
                    Day {day.dayNumber} · {day.date}
                  </strong>
                  {day.items.map((item) => (
                    <p key={item.id}>
                      {item.startTime} {item.placeName} · {item.reason}
                    </p>
                  ))}
                </article>
              ))}
            </div>
          </section>

          <section className="card">
            <h3>路径图</h3>
            <div className="routeBox">
              <strong>{latestRoute?.status === 'degraded' ? '降级路径' : '路线快照'}</strong>
              <p>{latestRoute?.renderedText ?? '生成行程后可创建路径快照'}</p>
              {latestRoute && <p className="muted">{latestRoute.distanceKm} km · 约 {latestRoute.durationMinutes} 分钟</p>}
            </div>
          </section>

          <section className="card">
            <h3>电子相册</h3>
            <p className="muted">{detail?.assets.length ?? 0} 个素材 · {detail?.albums.length ?? 0} 个版本</p>
            {latestAlbum && (
              <>
                <strong>{latestAlbum.title}</strong>
                <p>{latestAlbum.narrative}</p>
                {latestAlbum.sections.map((section) => (
                  <article key={section.heading}>
                    <p className="pill">{section.heading}</p>
                    <p>{section.body}</p>
                  </article>
                ))}
              </>
            )}
          </section>

          <section className="card">
            <h3>任务与导出</h3>
            <p className="muted">关键生成流程均记录任务状态。</p>
            {detail?.exports.map((record) => (
              <p key={record.id}>
                {record.format} · {record.status} · {record.url}
              </p>
            ))}
          </section>
        </div>
      </main>
    </div>
  );
}
