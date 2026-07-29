import type { SourceImportInput, TravelSource, Trip } from '@nice-travel/shared';

export interface SourceProvider {
  id: string;
  search(trip: Trip, input: SourceImportInput): Promise<TravelSource[]>;
}

export class ManualSourceProvider implements SourceProvider {
  id = 'manual';

  async search(trip: Trip, input: SourceImportInput): Promise<TravelSource[]> {
    const now = new Date().toISOString();
    const linkSources = input.links.map((url, index): TravelSource => ({
      id: `src_${Date.now()}_${index}`,
      tripId: trip.id,
      provider: this.id,
      sourceType: 'manual_link',
      title: `${trip.destination} 旅行链接 ${index + 1}`,
      url,
      excerpt: `用户提供的旅行参考链接：${url}`,
      status: 'imported',
      copyrightNote: '仅保存链接、摘要与引用，不复制未授权原文或图片。',
      createdAt: now,
    }));

    const textSource =
      input.notes && input.notes.trim()
        ? [
            {
              id: `src_${Date.now()}_text`,
              tripId: trip.id,
              provider: this.id,
              sourceType: 'manual_text' as const,
              title: `${trip.destination} 手动旅行笔记`,
              excerpt: input.notes.slice(0, 1000),
              status: 'imported' as const,
              copyrightNote: '用户主动输入内容，仅用于当前旅行项目分析。',
              createdAt: now,
            },
          ]
        : [];

    const querySource =
      input.query && input.query.trim()
        ? [
            {
              id: `src_${Date.now()}_query`,
              tripId: trip.id,
              provider: this.id,
              sourceType: 'public_search' as const,
              title: `${input.query} 的公开旅行线索`,
              excerpt: `模拟公开搜索结果：${trip.destination} 常见推荐包括城市漫步、特色餐饮、地标景点和避开高峰时段。`,
              status: 'imported' as const,
              copyrightNote: 'Mock Provider 仅生成示例摘要；真实 Provider 必须遵守平台条款。',
              createdAt: now,
            },
          ]
        : [];

    return [...linkSources, ...textSource, ...querySource];
  }
}

