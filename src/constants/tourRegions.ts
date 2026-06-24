export const TOUR_REGIONS = [
  { name: '서울특별시', areaCode: '1' },
  { name: '인천광역시', areaCode: '2' },
  { name: '대전광역시', areaCode: '3' },
  { name: '대구광역시', areaCode: '4' },
  { name: '광주광역시', areaCode: '5' },
  { name: '부산광역시', areaCode: '6' },
  { name: '울산광역시', areaCode: '7' },
  { name: '세종특별자치시', areaCode: '8' },
  { name: '경기도', areaCode: '31' },
  { name: '강원특별자치도', areaCode: '32' },
  { name: '충청북도', areaCode: '33' },
  { name: '충청남도', areaCode: '34' },
  { name: '경상북도', areaCode: '35' },
  { name: '경상남도', areaCode: '36' },
  { name: '전라북도', areaCode: '37' },
  { name: '전라남도', areaCode: '38' },
  { name: '제주특별자치도', areaCode: '39' },
] as const

export const DEFAULT_TOUR_REGION = TOUR_REGIONS.find((region) => region.name === '부산광역시')!
