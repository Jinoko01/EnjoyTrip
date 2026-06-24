<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import api from '@/api'
import { saveAiPlan } from '@/composables/useAiPlanSave'
import { DEFAULT_TOUR_REGION, TOUR_REGIONS } from '@/constants/tourRegions'

const props = defineProps<{
  candidates: any[]
  initialRegion?: string
  initialSigunguCode?: string
  initialSigunguName?: string
  sigunguOptions?: any[]
  isCandidatesLoading?: boolean
}>()
const emit = defineEmits<{
  planCreated: [plan: Plan]
  regionSelected: [selection: { regionName: string; sigunguCode?: string; sigunguName?: string; theme: string; pace: string }]
}>()
const router = useRouter()

interface PlanItem {
  time: string
  title: string
  description: string
}
interface PlanDay {
  day: number
  theme: string
  items: PlanItem[]
}
interface Plan {
  summary: string
  days: PlanDay[]
  places: any[]
}

const isLoading = ref(false)
const isOpen = ref(false)
const errorMessage = ref('')
const plan = ref<Plan | null>(null)
const region = ref(props.initialRegion ?? DEFAULT_TOUR_REGION.name)
const selectedSigunguCode = ref('')
const selectedSigunguName = ref('')
const duration = ref('1박 2일')
const theme = ref('맛집')
const pace = ref('균형 있게')
const style = computed(() => `${theme.value} / ${pace.value}`)
const isSaving = ref(false)
const activeDay = ref(1)
const sigunguOptions = computed(() => props.sigunguOptions ?? [])

const canSubmit = computed(
  () => Boolean(region.value && duration.value && theme.value && pace.value) && !isLoading.value && !props.isCandidatesLoading,
)

watch(
  () => props.initialRegion,
  (nextRegion) => {
    if (!nextRegion || plan.value) return
    if (TOUR_REGIONS.some((option) => option.name === nextRegion)) region.value = nextRegion
  },
  { immediate: true },
)

watch(
  [() => props.initialSigunguCode, () => props.initialSigunguName, sigunguOptions],
  () => {
    const code = String(props.initialSigunguCode ?? '')
    const option = sigunguOptions.value.find((item) => String(item.code) === code)
    selectedSigunguCode.value = option ? code : ''
    selectedSigunguName.value = option?.name ?? props.initialSigunguName ?? ''
  },
  { immediate: true },
)

function openAssistant() {
  isOpen.value = true
}

function emitRegionSelection() {
  emit('regionSelected', {
    regionName: region.value,
    sigunguCode: selectedSigunguCode.value || undefined,
    sigunguName: selectedSigunguName.value || undefined,
    theme: theme.value,
    pace: pace.value,
  })
}

function handleRegionChange() {
  selectedSigunguCode.value = ''
  selectedSigunguName.value = ''
  console.warn('[AI_PLAN_REGION_CHANGE]', { region: region.value })
  emitRegionSelection()
}

function handleSigunguChange() {
  selectedSigunguName.value = sigunguOptions.value.find(
    (item) => String(item.code) === selectedSigunguCode.value,
  )?.name ?? ''
  console.warn('[AI_PLAN_SIGUNGU_CHANGE]', {
    region: region.value,
    sigunguCode: selectedSigunguCode.value,
    sigunguName: selectedSigunguName.value,
  })
  emitRegionSelection()
}

function handleThemeChange(nextTheme: string) {
  theme.value = nextTheme
  console.warn('[AI_PLAN_STYLE_CHANGE]', { theme: theme.value, pace: pace.value, style: style.value })
  emitRegionSelection()
}

function handlePaceChange(nextPace: string) {
  pace.value = nextPace
  console.warn('[AI_PLAN_STYLE_CHANGE]', { theme: theme.value, pace: pace.value, style: style.value })
  emitRegionSelection()
}

async function generatePlan() {
  if (!canSubmit.value) return
  emitRegionSelection()
  await nextTick()
  if (props.isCandidatesLoading) {
    errorMessage.value = '선택한 지역의 관광지 후보를 불러오는 중입니다. 잠시 후 다시 시도해주세요.'
    return
  }
  if (props.candidates.length === 0) {
    errorMessage.value = '선택한 지역의 관광지 후보가 없습니다. 지역을 다시 선택해주세요.'
    return
  }
  isLoading.value = true
  errorMessage.value = ''
  try {
    const areaCode = TOUR_REGIONS.find((option) => option.name === region.value)?.areaCode ?? ''
    console.warn('[AI_PLAN_REQUEST]', {
      areaCode,
      region: region.value,
      sigunguCode: selectedSigunguCode.value || undefined,
      sigunguName: selectedSigunguName.value || undefined,
      theme: theme.value,
      pace: pace.value,
      duration: duration.value,
      style: style.value,
    })
    const response = await api.post<Plan>('/ai/plan', {
      region: region.value,
      areaCode,
      sigunguCode: selectedSigunguCode.value || undefined,
      sigunguName: selectedSigunguName.value || undefined,
      theme: theme.value,
      pace: pace.value,
      duration: duration.value,
      style: style.value,
      candidates: props.candidates.map((item) => ({
        contentId: item.contentId ?? item.contentid,
        title: item.title,
        addr1: item.addr1,
        mapx: item.mapx,
        mapy: item.mapy,
        firstimage: item.firstimage,
        sigunguCode: item.sigunguCode ?? item.sigungucode,
      })),
    })
    plan.value = response.data
    activeDay.value = response.data.days[0]?.day ?? 1
    emit('planCreated', response.data)
  } catch (error: any) {
    const responseError = error.response?.data
    errorMessage.value =
      responseError?.detail ??
      responseError?.error ??
      '일정을 만들지 못했어요. 잠시 후 다시 시도해주세요.'
  } finally {
    isLoading.value = false
  }
}

async function savePlan() {
  if (!plan.value || isSaving.value) return
  isSaving.value = true
  try {
    await router.push(`/schedule-detail/${await saveAiPlan(plan.value, region.value, style.value)}`)
  } catch (error: any) {
    errorMessage.value =
      error.response?.data?.error ?? '일정을 저장하지 못했습니다. 로그인 상태를 확인해주세요.'
  } finally {
    isSaving.value = false
  }
}
</script>

<template>
  <button class="assistant-trigger" type="button" @click="openAssistant">
    <i class="bi bi-stars"></i> AI 일정 비서
  </button>

  <div v-if="isOpen" class="assistant-backdrop" @click.self="isOpen = false">
    <section class="assistant-modal" role="dialog" aria-modal="true" aria-label="AI 일정 비서">
      <button class="close-button" type="button" aria-label="닫기" @click="isOpen = false">
        ×
      </button>
      <header class="assistant-header">
        <span class="assistant-icon"><i class="bi bi-stars"></i></span>
        <div>
          <h2>AI 일정 비서</h2>
          <p>조건만 선택하면 여행의 첫 장을 만들어드려요.</p>
        </div>
      </header>

      <template v-if="!plan">
        <label
          >여행 지역<select v-model="region" @change="handleRegionChange">
            <option v-for="option in TOUR_REGIONS" :key="option.areaCode" :value="option.name">
              {{ option.name }}
            </option>
          </select></label
        >
        <label
          >시/군/구<select v-model="selectedSigunguCode" :disabled="sigunguOptions.length === 0 || props.isCandidatesLoading" @change="handleSigunguChange">
            <option value="">{{ props.isCandidatesLoading ? '불러오는 중...' : '시/군/구 전체' }}</option>
            <option v-for="option in sigunguOptions" :key="option.code" :value="String(option.code)">
              {{ option.name }}
            </option>
          </select></label
        >
        <fieldset>
          <legend>여행 기간</legend>
          <button
            v-for="option in ['당일', '1박 2일', '2박 3일']"
            :key="option"
            type="button"
            :class="{ selected: duration === option }"
            @click="duration = option"
          >
            {{ option }}
          </button>
        </fieldset>
        <fieldset>
          <legend>여행 테마</legend>
          <button
            v-for="option in ['맛집', '관광·명소', '문화·역사', '자연·힐링', '레포츠·액티비티', '쇼핑', '축제·공연', '카페·핫플']"
            :key="option"
            type="button"
            :class="{ selected: theme === option }"
            @click="handleThemeChange(option)"
          >
            {{ option }}
          </button>
        </fieldset>
        <fieldset>
          <legend>여행 템포</legend>
          <button
            v-for="option in ['균형 있게', '여유롭게', '알차게']"
            :key="option"
            type="button"
            :class="{ selected: pace === option }"
            @click="handlePaceChange(option)"
          >
            {{ option }}
          </button>
        </fieldset>
        <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>
        <button class="generate-button" type="button" :disabled="!canSubmit" @click="generatePlan">
          <span v-if="isLoading" class="spinner-border spinner-border-sm"></span
          ><i v-else class="bi bi-magic"></i>
          {{ isLoading ? '일정 만드는 중...' : '일정 생성하기' }}
        </button>
      </template>

      <section v-else class="plan-result">
        <p class="result-label">AI가 제안하는 여행</p>
        <h3>{{ plan.summary }}</h3>
        <article v-for="day in plan.days" :key="day.day" class="day-card">
          <strong>DAY {{ day.day }} · {{ day.theme }}</strong>
          <ol>
            <li v-for="item in day.items" :key="`${day.day}-${item.time}-${item.title}`">
              <time>{{ item.time }}</time>
              <div>
                <b>{{ item.title }}</b>
                <p>{{ item.description }}</p>
              </div>
            </li>
          </ol>
        </article>
        <button class="generate-button" type="button" :disabled="isSaving" @click="savePlan">
          {{ isSaving ? '일정 저장 중...' : '내 일정에 추가하기' }}
        </button>
        <button class="generate-button secondary-button" type="button" @click="plan = null">
          조건 다시 고르기
        </button>
      </section>
    </section>
  </div>
</template>

<style scoped>
.assistant-trigger {
  position: fixed;
  right: 28px;
  bottom: 28px;
  z-index: 20;
  border: 0;
  border-radius: 999px;
  padding: 13px 20px;
  background: #0788f5;
  color: #fff;
  font-weight: 800;
  box-shadow: 0 8px 22px #006fc455;
}
.assistant-backdrop {
  position: fixed;
  inset: 0;
  z-index: 1000;
  display: grid;
  place-items: center;
  background: #10213173;
  backdrop-filter: blur(3px);
}
.assistant-modal {
  position: relative;
  width: min(460px, calc(100vw - 32px));
  max-height: 88vh;
  overflow: auto;
  border-radius: 18px;
  background: #fff;
  padding: 28px;
  box-shadow: 0 24px 80px #0004;
}
.close-button {
  position: absolute;
  right: 16px;
  top: 12px;
  border: 0;
  background: transparent;
  color: #9aa7b5;
  font-size: 26px;
}
.assistant-header {
  display: flex;
  gap: 12px;
  align-items: center;
  margin-bottom: 20px;
}
.assistant-header h2,
.plan-result h3 {
  margin: 0;
  font-size: 20px;
  font-weight: 800;
}
.assistant-header p {
  margin: 3px 0 0;
  color: #7a8795;
  font-size: 12px;
}
.assistant-icon {
  display: grid;
  place-items: center;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: #0788f5;
  color: #fff;
}
label,
fieldset {
  display: block;
  margin: 16px 0;
  border: 0;
  padding: 0;
  font-size: 13px;
  font-weight: 700;
}
select {
  display: block;
  width: 100%;
  margin-top: 7px;
  border: 1px solid #dce5ee;
  border-radius: 8px;
  padding: 10px;
  background: white;
}
fieldset button {
  margin: 6px 6px 0 0;
  border: 1px solid #dce5ee;
  border-radius: 999px;
  padding: 7px 11px;
  background: white;
  color: #627083;
  font-size: 12px;
}
.selected {
  border-color: #0788f5 !important;
  background: #eaf5ff !important;
  color: #0788f5 !important;
}
.generate-button {
  width: 100%;
  margin-top: 18px;
  border: 0;
  border-radius: 9px;
  padding: 12px;
  background: #0788f5;
  color: #fff;
  font-weight: 800;
}
.generate-button:disabled {
  opacity: 0.6;
}
.error-message {
  margin: 0;
  color: #dc3545;
  font-size: 13px;
}
.result-label {
  margin: 0;
  color: #0788f5;
  font-size: 12px;
  font-weight: 800;
}
.day-card {
  margin-top: 14px;
  border: 1px solid #e1ebf3;
  border-radius: 12px;
  padding: 13px;
}
.day-card strong {
  font-size: 13px;
  color: #1579cc;
}
.day-card ol {
  margin: 10px 0 0;
  padding: 0;
  list-style: none;
}
.day-card li {
  display: flex;
  gap: 10px;
  padding: 8px 0;
  border-top: 1px solid #edf1f5;
}
.day-card time {
  color: #0788f5;
  font-weight: 800;
  font-size: 12px;
}
.day-card b {
  font-size: 13px;
}
.day-card p {
  margin: 2px 0 0;
  color: #778493;
  font-size: 12px;
}
</style>
