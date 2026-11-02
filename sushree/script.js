(function () {
  var toggle = document.querySelector('.nav-toggle');
  var menu = document.getElementById('nav-menu');
  if (!toggle || !menu) return;
  toggle.hidden = false;

  function setOpen(open) {
    toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    menu.classList.toggle('open', open);
  }

  toggle.addEventListener('click', function () {
    setOpen(toggle.getAttribute('aria-expanded') !== 'true');
  });
  menu.addEventListener('click', function (e) {
    if (e.target.closest('a')) setOpen(false);
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') {
      setOpen(false);
      toggle.focus();
    }
  });
})();
