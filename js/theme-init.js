// Runs in <head> before the page is drawn: applies the saved theme so it never flickers.
(function () {
  var root = document.documentElement;
  root.classList.add('js');
  try {
    var saved = localStorage.getItem('theme');
    if (saved === 'light' || saved === 'dark') root.dataset.theme = saved;
  } catch (error) {
    // Storage can be blocked (private mode). The system theme is used instead.
  }
})();
