// ===== Sidebar Active State =====
(function () {
  const currentPage = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.sidebar-link').forEach(function (link) {
    if (link.getAttribute('href') === currentPage ||
        link.getAttribute('href') === '../' + currentPage) {
      link.classList.add('active');
    }
  });
})();

// ===== Mobile Menu Toggle =====
document.addEventListener('click', function (e) {
  if (e.target.closest('.menu-toggle')) {
    document.querySelector('.sidebar').classList.toggle('open');
  }
  // Close sidebar when clicking outside on mobile
  if (!e.target.closest('.sidebar') && !e.target.closest('.menu-toggle')) {
    var sidebar = document.querySelector('.sidebar');
    if (sidebar) sidebar.classList.remove('open');
  }
});

// ===== Accordion =====
document.addEventListener('click', function (e) {
  var header = e.target.closest('.accordion-header');
  if (!header) return;
  var item = header.parentElement;
  item.classList.toggle('open');
});

// ===== Smooth scroll for anchor links =====
document.addEventListener('click', function (e) {
  var link = e.target.closest('a[href^="#"]');
  if (!link) return;
  e.preventDefault();
  var target = document.querySelector(link.getAttribute('href'));
  if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
});

// ===== Search (simple filter for index page cards) =====
var searchInput = document.getElementById('module-search');
if (searchInput) {
  searchInput.addEventListener('input', function () {
    var query = this.value.toLowerCase();
    document.querySelectorAll('.card[data-keywords]').forEach(function (card) {
      var keywords = card.getAttribute('data-keywords').toLowerCase();
      card.style.display = keywords.includes(query) ? '' : 'none';
    });
  });
}
