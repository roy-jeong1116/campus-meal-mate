// 음식 아이콘 매핑
export const getFoodIcon = (food: string): string => {
  const iconMap: { [key: string]: string } = {
    '한식': '🍚',
    '중식': '🥢',
    '일식': '🍱',
    '양식': '🍝',
    '분식': '🍜',
    '치킨': '🍗',
    '피자': '🍕',
    '카페': '☕',
  };
  return iconMap[food] || '🍽️';
};

// 관심사 아이콘 매핑
export const getInterestIcon = (interest: string): string => {
  const iconMap: { [key: string]: string } = {
    '헬스/운동': '💪',
    '러닝': '🏃',
    '축구/농구': '⚽',
    '등산': '🏔️',
    '요가/필라테스': '🧘',
    '영화/드라마': '🎬',
    '음악/공연': '🎵',
    '전시/미술관': '🎨',
    '사진/영상': '📷',
    '독서': '📚',
    '외국어': '🌍',
    '코딩/개발': '💻',
    '게임': '🎮',
    '요리/베이킹': '👨‍🍳',
    '카페투어': '☕',
    '여행': '✈️',
    '쇼핑': '🛍️',
    '패션/뷰티': '💄',
  };
  return iconMap[interest] || '✨';
};
