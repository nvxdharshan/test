/* Minimal init for advisory pages (mobile menu + WOW). */
(function ($) {
  "use strict";

  function initSlickNav() {
    if (!$.fn || !$.fn.slicknav) return;
    const $menu = $("#menu");
    if (!$menu.length) return;
    if ($menu.data("slicknav-initialized")) return;
    $menu.data("slicknav-initialized", true);

    $menu.slicknav({
      label: "",
      prependTo: ".responsive-menu",
    });
  }

  function initWow() {
    if (typeof WOW === "undefined") return;
    try {
      new WOW().init();
    } catch (_) {}
  }

  $(function () {
    initSlickNav();
    initWow();
  });
})(jQuery);

