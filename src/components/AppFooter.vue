<template>
  <footer class="site-footer">
    <div class="site-footer-inner">
      <div class="footer-main">
        <div class="footer-brand-column">
          <div class="footer-brand">
            <img class="footer-brand-logo" src="/logo.svg" alt="EnjoyTrip" />
          </div>
          <p class="footer-copy">진짜 나만의 여행<br /></p>
          <div class="footer-socials" aria-label="소셜 미디어">
            <a href="#!" aria-label="인스타그램"><i class="bi bi-instagram"></i></a>
            <a href="#!" aria-label="페이스북"><i class="bi bi-facebook"></i></a>
            <a href="#!" aria-label="유튜브"><i class="bi bi-youtube"></i></a>
          </div>
        </div>

        <div class="footer-menu-columns">
          <div class="footer-menu">
            <strong>고객지원</strong>
            <RouterLink to="/notice">공지사항</RouterLink>
            <RouterLink to="/news">여행뉴스</RouterLink>
            <a href="#!">자주 묻는 질문</a>
            <a href="#!">1:1 문의</a>
          </div>
          <div class="footer-menu">
            <strong>서비스</strong>
            <RouterLink to="/attraction">여행지 탐색</RouterLink>
            <RouterLink to="/schedule">AI 일정 비서</RouterLink>
            <RouterLink to="/hotplace">핫플레이스</RouterLink>
            <RouterLink to="/schedule">여행 일정</RouterLink>
            <RouterLink to="/board">커뮤니티</RouterLink>
          </div>
          <div class="footer-menu">
            <strong>회사</strong>
            <a href="#!">회사소개</a>
            <a href="#!">채용</a>
            <a href="#!">제휴 문의</a>
          </div>
        </div>
      </div>

      <div class="footer-meta">
        &copy; EnjoyTrip 2026. 본 서비스는 학습용 데모이며 실제 예약/결제를 제공하지 않습니다.
      </div>
    </div>
  </footer>
</template>
