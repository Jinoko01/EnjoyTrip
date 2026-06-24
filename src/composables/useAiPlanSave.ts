import api from '@/api'

export async function saveAiPlan(plan: any, region: string, style: string) {
  const places = Array.isArray(plan.places) ? plan.places : []
  const findPlace = (item: any) =>
    places.find((place: any) => String(place.contentId) === String(item.contentId)) ||
    places.find((place: any) => place.title === item.title)
  const items = plan.days
    .flatMap((day: any) =>
      day.items.map((item: any, orderNum: number) => {
        const place = findPlace(item)
        return {
          title: place?.title || item.title,
          addr1: place?.addr1 || '',
          mapx: String(place?.mapx || ''),
          mapy: String(place?.mapy || ''),
          firstimage: place?.firstimage || '',
          contentId: String(place?.contentId || item.contentId || ''),
          day: day.day || 1,
          orderNum,
          visitTime: item.time || null,
          description: item.description || null,
        }
      }),
    )
    .filter((item: any) => item.contentid || item.title)
  console.warn('[AI_PLAN_SAVE_PAYLOAD]', items)
  if (!items.length) throw new Error('저장할 관광지 정보가 없습니다.')
  const start = new Date()
  const end = new Date(start)
  end.setDate(start.getDate() + plan.days.length - 1)
  const format = (date: Date) => date.toISOString().slice(0, 10)
  const created = await api.post('/schedule', {
    title: plan.summary,
    startDate: format(start),
    endDate: format(end),
    memo: `AI 일정 비서 · ${region} · ${style}`,
  })
  await api.post(`/schedule/${created.data.scheduleId}/items`, { items: JSON.stringify(items) })
  return created.data.scheduleId as number
}
