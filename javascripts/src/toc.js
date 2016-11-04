import $ from "jquery"
import "jquery.tocify"

var toc;

var closeToc = function() {
  $(".tocify-wrapper").removeClass('open');
  $("#nav-button").removeClass('open');
};

var makeToc = function() {
  toc = $("#toc").tocify({
    selectors: 'h1, h2',
    extendPage: false,
    theme: 'none',
    smoothScroll: true,
    ignoreSelector: '.toc-ignore',
    hashGenerator: function (text, element) {
      return element.prop('id');
    }
  }).data('toc-tocify');

  $("#nav-button").click(function() {
    $(".tocify-wrapper").toggleClass('open');
    $("#nav-button").toggleClass('open');
    return false;
  });

  $(".page-wrapper").click(closeToc);
  $(".tocify-item").click(closeToc);
};

// Hack to make already open sections to start opened,
// instead of displaying an ugly animation
function animate() {
  setTimeout(function() {
    toc.setOption('showEffectSpeed', 180);
  }, 50);
}

$(function() {
  makeToc();
  animate();
});

