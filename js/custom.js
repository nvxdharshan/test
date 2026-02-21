document.addEventListener("DOMContentLoaded", function () {

  const el = document.querySelector(".page-single-slider .swiper");

  if (el.swiper) {
    el.swiper.destroy(true, true);
  }

  const realSlides = el.querySelectorAll('.swiper-slide').length;

  const swiper = new Swiper(el, {
    slidesPerView: 3,
    slidesPerGroup: 1,
    spaceBetween: 30,
    speed: 600,

    loop: false,
    rewind: true,
    autoplay: {
      delay: 5000,
      disableOnInteraction: false
    },

    // 🔥 Critical additions
    loopedSlides: realSlides,
    loopAdditionalSlides: realSlides,
    loopPreventsSliding: false,

    centeredSlides: false,
    freeMode: false,
    watchOverflow: false,

    navigation: {
      nextEl: ".swiper-button-next",
      prevEl: ".swiper-button-prev",
    },

    pagination: {
      el: ".swiper-pagination",
      clickable: true,
    }
  });

});