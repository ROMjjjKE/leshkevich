/* ИП Лешкевич: меню, шкала высоты, заявка */

var WA_BASE = 'https://wa.me/375333821934';

var GAUGE = [
  { max: 5, way: 'Спиливаем целиком',
    note: 'Молодое дерево или поросль: валим в свободную сторону с завесом. Пни и мелкую поросль убираем тем же выездом.' },
  { max: 12, way: 'По частям с завесом',
    note: 'Ствол снимается сверху вниз, куски опускаются на трос, чтобы ничего не попало на кровлю, забор и провода.' },
  { max: 18, way: 'По частям, со страховкой',
    note: 'Высокое дерево рядом с постройками: работаем с завесом и страховкой, зона под деревом ограждается. Часто это целый день.' },
  { max: 99, way: 'По частям, возможен подъёмник',
    note: 'Такие стволы снимают по частям, а доступ к верхним веткам иногда возможен только с подъёмника. Способ зависит от проводов и построек рядом.' }
];

document.addEventListener('DOMContentLoaded', function () {
  initDrawer();
  initGauge();
  initForm();
  var y = document.getElementById('year');
  if (y) y.textContent = new Date().getFullYear();
});

/* Меню: fixed-слой, блокировка прокрутки, ловушка фокуса, Escape */
function initDrawer() {
  var burger = document.getElementById('burger');
  var drawer = document.getElementById('drawer');
  if (!burger || !drawer) return;
  var lastFocus = null;

  function open() {
    lastFocus = document.activeElement;
    drawer.hidden = false;
    burger.setAttribute('aria-expanded', 'true');
    document.body.classList.add('is-locked');
    var btn = document.getElementById('drawer-close');
    if (btn) btn.focus({ preventScroll: true });
  }

  function close() {
    drawer.hidden = true;
    burger.setAttribute('aria-expanded', 'false');
    document.body.classList.remove('is-locked');
    if (lastFocus) lastFocus.focus({ preventScroll: true });
  }

  burger.addEventListener('click', function () {
    if (drawer.hidden) open(); else close();
  });

  var closeBtn = document.getElementById('drawer-close');
  if (closeBtn) closeBtn.addEventListener('click', close);

  drawer.addEventListener('click', function (e) {
    if (e.target.closest('a')) { close(); return; }
    if (!e.target.closest('.drawer__inner')) close();
  });

  document.addEventListener('keydown', function (e) {
    if (drawer.hidden) return;
    if (e.key === 'Escape') { close(); return; }
    if (e.key !== 'Tab') return;
    var items = drawer.querySelectorAll('a, button');
    if (!items.length) return;
    var first = items[0], last = items[items.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  });

  window.addEventListener('resize', function () {
    if (window.innerWidth > 1180 && !drawer.hidden) close();
  });
}

/* Шкала высоты: способ спила по введённой высоте */
function initGauge() {
  var input = document.getElementById('gauge');
  if (!input) return;
  var out = document.getElementById('gauge-out');
  var way = document.getElementById('gauge-way');
  var note = document.getElementById('gauge-note');

  function update() {
    var h = parseInt(input.value, 10) || 1;
    out.textContent = h + ' м';
    var row = GAUGE.filter(function (g) { return h <= g.max; })[0] || GAUGE[GAUGE.length - 1];
    way.textContent = row.way;
    note.textContent = row.note;
    var pct = (h - input.min) / (input.max - input.min);
    input.setAttribute('aria-valuetext', h + ' метров: ' + row.way);
    input.style.background = 'transparent';
    return pct;
  }

  input.addEventListener('input', update);
  update();
}

/* Заявка */
function initForm() {
  var form = document.getElementById('lead-form');
  if (!form) return;
  var ok = document.getElementById('form-ok');
  var out = document.getElementById('order-text');
  var send = document.getElementById('order-send');
  var copy = document.getElementById('order-copy');

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var name = document.getElementById('f-name');
    var contact = document.getElementById('f-contact');
    var bad = false;
    [name, contact].forEach(function (el) {
      if (!el.value.trim()) { el.style.borderColor = '#8E2F1C'; bad = true; }
      else el.style.borderColor = '';
    });
    if (bad) return;

    var trees = document.getElementById('f-trees').value;
    var height = document.getElementById('f-height').value;
    var area = document.getElementById('f-area').value;
    var place = document.getElementById('f-place').value.trim();
    var what = document.getElementById('f-what').value;
    var note = document.getElementById('f-note').value.trim();

    var rows = [
      'Заявка с сайта: ИП Лешкевич (спил деревьев и участки)',
      'Имя: ' + name.value.trim(),
      'Контакт: ' + contact.value.trim(),
      'Работа: ' + what
    ];
    if (trees) rows.push('Деревьев: ' + trees);
    if (height) rows.push('Высота примерно: ' + height + ' м');
    if (area) rows.push('Участок: ' + area + ' соток');
    if (place) rows.push('Адрес: ' + place);
    if (note) rows.push('Что рядом: ' + note);

    var text = rows.join('\n');
    out.textContent = text;
    send.href = WA_BASE + '?text=' + encodeURIComponent(text);
    if (ok.hidden) {
      ok.hidden = false;
      form.querySelectorAll('input, select, textarea, .form__btn').forEach(function (el) { el.disabled = true; });
    }
    ok.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  });

  if (copy) {
    copy.addEventListener('click', function () {
      var text = out.textContent || '';
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text);
      } else {
        var ta = document.createElement('textarea');
        ta.value = text; document.body.appendChild(ta); ta.select();
        document.execCommand('copy'); document.body.removeChild(ta);
      }
      copy.textContent = 'Скопировано';
      setTimeout(function () { copy.textContent = 'Скопировать'; }, 1800);
    });
  }
}
