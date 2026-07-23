document.getElementById('footer-year').textContent = new Date().getFullYear();

var themeToggle = document.querySelector('.theme-toggle');
if (themeToggle) {
  themeToggle.addEventListener('click', function () {
    var current = document.documentElement.getAttribute('data-theme');
    var next = current === 'light' ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('theme', next);
  });
}

var mobileToggle = document.querySelector('.nav__mobile-toggle');
var navLinks = document.querySelector('.nav__links');
if (mobileToggle && navLinks) {
  var setMenu = function (open) {
    navLinks.classList.toggle('open', open);
    mobileToggle.classList.toggle('open', open);
    mobileToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
  };
  mobileToggle.addEventListener('click', function () {
    setMenu(!navLinks.classList.contains('open'));
  });
  navLinks.querySelectorAll('a').forEach(function (link) {
    link.addEventListener('click', function () { setMenu(false); });
  });
}

window.addEventListener('load', function () {
  var hero = document.querySelector('.hero');
  if (hero) hero.classList.add('loaded');
});

var revealItems = document.querySelectorAll('.fade-in:not(.hero .fade-in)');

if ('IntersectionObserver' in window) {
  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });

  revealItems.forEach(function (el) {
    observer.observe(el);
  });
} else {
  revealItems.forEach(function (el) {
    el.classList.add('visible');
  });
}
