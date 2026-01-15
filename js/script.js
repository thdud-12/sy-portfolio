console.clear();
AOS.init();

// 탑바 스크롤
$(window).scroll(function () {
  let $scrollTop = $(this).scrollTop();

  let $topBar = $(".top-bar");

  if ($scrollTop > 0) {
    $topBar.addClass("active");
  } else {
    $topBar.removeClass("active");
  }
});

// 버튼 클릭 시 section-2로 스크롤 이동
document.querySelector(".page-btn").addEventListener("click", () => {
  const section2 = document.querySelector(".section-2");
  const startPosition = window.scrollY;
  const section2Position = section2.getBoundingClientRect().top + startPosition;
  const distance = section2Position - startPosition;
  const duration = 1200;

  let startTime = null;

  const animation = (currentTime) => {
    if (!startTime) startTime = currentTime;
    const progress = Math.min((currentTime - startTime) / duration, 1);
    const ease =
      progress < 0.5
        ? 2 * progress * progress
        : -1 + (4 - 2 * progress) * progress;
    window.scrollTo(0, startPosition + distance * ease);
    if (progress < 1) requestAnimationFrame(animation);
  };

  requestAnimationFrame(animation);
});

// section-2
function sectionSwiperInit() {
  const swiper = new Swiper(".swiper", {
    direction: "horizontal",
    loop: true,
    speed: 1500,
    autoplay: {
      delay: 8000,
      disableOnInteraction: false,
      pauseOnMouseEnter: true,
    },
    effect: "slide",
    navigation: {
      nextEl: ".swiper-button-next",
      prevEl: ".swiper-button-prev",
    },
    breakpoints: {
      768: {
        slidesPerView: "3",
        spaceBetween: 20,
      },
      1024: {
        slidesPerView: "5",
        spaceBetween: 20,
      },
      1280: {
        slidesPerView: 5,
        spaceBetween: 130,
      },
    },
  });

  // Swiper 영역
  const swiperContainer = document.querySelector(".section-inner-2");

  // 버튼 요소
  const nextButton = document.querySelector(".swiper-button-next");
  const prevButton = document.querySelector(".swiper-button-prev");

  // 마우스 진입 시 버튼 표시
  swiperContainer.addEventListener("mouseenter", () => {
    nextButton.style.opacity = "1";
    nextButton.style.visibility = "visible";
    prevButton.style.opacity = "1";
    prevButton.style.visibility = "visible";
  });

  // 마우스 이탈 시 버튼 숨김
  swiperContainer.addEventListener("mouseleave", () => {
    nextButton.style.opacity = "0";
    nextButton.style.visibility = "hidden";
    prevButton.style.opacity = "0";
    prevButton.style.visibility = "hidden";
  });
}

// 슬라이더 초기화 함수 호출
sectionSwiperInit();

// 4번째 section 이미지 롤링 구현
// ===================================================
// Rolling Image Animation (데스크톱 & 모바일 분리)
// ===================================================

class RollingAnimation {
  constructor(wrapperSelector, containerSelector) {
    this.wrapper = document.querySelector(
      `${containerSelector} .rolling-wrapper`
    );
    this.images = document.querySelectorAll(`${containerSelector} .span-img`);
    this.currentIndex = 0;
    this.imageWidths = [];
    this.isAnimating = false;
    this.interval = null;
    this.animationDelay = 4000;
  }

  // 이미지 너비 측정
  async measureWidths() {
    const promises = Array.from(this.images).map((span, index) => {
      return new Promise((resolve) => {
        const img = span.querySelector("img");
        if (img && img.complete && img.naturalWidth > 0) {
          this.imageWidths[index] = img.offsetWidth;
          resolve();
        } else if (img) {
          img.onload = () => {
            this.imageWidths[index] = img.offsetWidth;
            resolve();
          };
          img.onerror = () => {
            this.imageWidths[index] = 0;
            resolve();
          };
        } else {
          resolve();
        }
      });
    });
    return Promise.all(promises);
  }

  // 초기화
  init() {
    this.images.forEach((span) => {
      span.classList.remove("active");
      span.style.opacity = "";
      span.style.transform = "";
      span.style.transition = "none";
    });

    void this.wrapper?.offsetHeight;

    requestAnimationFrame(() => {
      this.images.forEach((span) => {
        span.style.transition = "";
      });

      if (this.images[0]) {
        this.images[0].classList.add("active");
        this.images[0].style.opacity = "1";
        this.images[0].style.transform = "translate(-50%, -50%) translateY(0)";
      }

      if (this.wrapper && this.imageWidths[0]) {
        this.wrapper.style.width = this.imageWidths[0] + "px";
        const firstImg = this.images[0]?.querySelector("img");
        if (firstImg) {
          this.wrapper.style.height = firstImg.offsetHeight + "px";
        }
      }
    });

    this.currentIndex = 0;
    this.isAnimating = false;
  }

  // 롤링 애니메이션
  roll() {
    if (this.isAnimating) return;
    this.isAnimating = true;

    const currentImg = this.images[this.currentIndex];
    const nextIndex = (this.currentIndex + 1) % this.images.length;
    const nextImg = this.images[nextIndex];
    const nextWidth = this.imageWidths[nextIndex];

    if (!currentImg || !nextImg) {
      this.isAnimating = false;
      return;
    }

    // 1단계: 현재 이미지 페이드 아웃 + 위로 이동
    currentImg.style.opacity = "0";
    currentImg.style.transform = "translate(-50%, -50%) translateY(-20px)";

    // 2단계: 래퍼 너비 애니메이션
    setTimeout(() => {
      if (this.wrapper && nextWidth) {
        this.wrapper.style.width = nextWidth + "px";
      }
    }, 100);

    // 3단계: 이미지 전환 및 페이드 인
    setTimeout(() => {
      currentImg.classList.remove("active");
      currentImg.style.opacity = "";
      currentImg.style.transform = "";

      this.currentIndex = nextIndex;
      nextImg.style.opacity = "0";
      nextImg.style.transform = "translate(-50%, -50%) translateY(20px)";
      nextImg.classList.add("active");

      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          nextImg.style.opacity = "1";
          nextImg.style.transform = "translate(-50%, -50%) translateY(0)";

          setTimeout(() => {
            this.isAnimating = false;
          }, 350);
        });
      });
    }, 350);
  }

  // 시작
  start() {
    this.stop();
    this.interval = setInterval(() => this.roll(), this.animationDelay);
  }

  // 정지
  stop() {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }
  }

  // 너비 업데이트 (리사이즈용)
  updateWidth() {
    if (this.wrapper && this.imageWidths[this.currentIndex]) {
      this.wrapper.style.width = this.imageWidths[this.currentIndex] + "px";
    }
  }
}

// ===================================================
// 인스턴스 생성 (데스크톱 & 모바일)
// ===================================================
let desktopRolling = null;
let mobileRolling = null;

// 현재 뷰포트 확인
function isMobileView() {
  return window.innerWidth <= 767;
}

// 활성 롤링 가져오기
function getActiveRolling() {
  return isMobileView() ? mobileRolling : desktopRolling;
}

// 모든 롤링 정지
function stopAllRolling() {
  desktopRolling?.stop();
  mobileRolling?.stop();
}

// 적절한 롤링 시작
function startActiveRolling() {
  stopAllRolling();
  const activeRolling = getActiveRolling();
  activeRolling?.start();
}

// ===================================================
// 초기화
// ===================================================
document.addEventListener("DOMContentLoaded", async () => {
  // 데스크톱 롤링 초기화
  const desktopWrapper = document.querySelector(".main .rolling-wrapper");
  if (desktopWrapper) {
    desktopRolling = new RollingAnimation(".rolling-wrapper", ".main");
    await desktopRolling.measureWidths();
    desktopRolling.init();
  }

  // 모바일 롤링 초기화
  const mobileWrapper = document.querySelector(".mo-main .rolling-wrapper");
  if (mobileWrapper) {
    mobileRolling = new RollingAnimation(".rolling-wrapper", ".mo-main");
    await mobileRolling.measureWidths();
    mobileRolling.init();
  }

  // 현재 뷰포트에 맞는 롤링 시작
  setTimeout(() => {
    startActiveRolling();
  }, 100);
});

// ===================================================
// 페이지 가시성 변경 처리
// ===================================================
document.addEventListener("visibilitychange", () => {
  if (document.hidden) {
    stopAllRolling();
  } else {
    const activeRolling = getActiveRolling();
    if (activeRolling) {
      activeRolling.isAnimating = false;
      activeRolling.start();
    }
  }
});

// ===================================================
// 리사이즈 처리 (디바운싱)
// ===================================================
let resizeTimeout;
let previousIsMobile = isMobileView();

window.addEventListener("resize", () => {
  clearTimeout(resizeTimeout);
  resizeTimeout = setTimeout(async () => {
    const currentIsMobile = isMobileView();

    // 뷰포트 전환 시 롤링 전환
    if (previousIsMobile !== currentIsMobile) {
      stopAllRolling();

      // 새 뷰포트의 롤링 재초기화
      const activeRolling = getActiveRolling();
      if (activeRolling) {
        await activeRolling.measureWidths();
        activeRolling.init();
        setTimeout(() => activeRolling.start(), 100);
      }

      previousIsMobile = currentIsMobile;
    } else {
      // 같은 뷰포트 내 리사이즈 - 너비만 업데이트
      const activeRolling = getActiveRolling();
      if (activeRolling) {
        await activeRolling.measureWidths();
        activeRolling.updateWidth();
      }
    }
  }, 150);
});

// ===================================================
// Preloader & Initial Animation
// ===================================================
document.addEventListener("DOMContentLoaded", () => {
  document.body.classList.add("loaded");

  console.log(
    "%c NEEZ ",
    "background: #000; color: #fff; font-size: 24px; font-weight: bold; padding: 10px 20px;"
  );
  console.log("%c Premium Sofa Brand ", "color: #666; font-size: 12px;");
});

// ===================================================
// Intersection Observer for Scroll Animations
// ===================================================
const observerOptions = {
  threshold: 0.1,
  rootMargin: "0px 0px -50px 0px",
};

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add("visible");
    }
  });
}, observerOptions);
