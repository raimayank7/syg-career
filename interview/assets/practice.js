/* Interview practice: a random question, a two minute speaking timer, then the tips. Nothing is recorded or sent; the count stays in this tab. */
(function () {
  'use strict';
  var d = document, box = d.getElementById('ip');
  if (!box || !window.IPQ) return;
  var $ = function (id) { return d.getElementById(id); }, Q = window.IPQ, cat = 'all', pool = [], cur = null, left = 120, tick = null, endAt = 0, done = 0;
  function fmt(s) { s = Math.max(0, Math.ceil(s)); return Math.floor(s / 60) + ':' + ('0' + s % 60).slice(-2); }
  function refill() { pool = Q.filter(function (q) { return cat === 'all' || q.c === cat; }).slice(); for (var j = pool.length - 1; j > 0; j--) { var k = Math.floor(Math.random() * (j + 1)), t = pool[j]; pool[j] = pool[k]; pool[k] = t; } }
  function stop() { clearInterval(tick); tick = null; $('ip-go').textContent = left < 120 && left > 0 ? 'Resume timer' : 'Start 2 minute timer'; }
  function next() {
    stop(); if (!pool.length) refill();
    cur = pool.pop(); left = 120;
    $('ip-q').textContent = cur.q; $('ip-cat').textContent = cur.n;
    $('ip-time').textContent = fmt(left); $('ip-bar').style.width = '0%';
    $('ip-tips').hidden = true; $('ip-show').hidden = false; $('ip-go').textContent = 'Start 2 minute timer';
  }
  $('ip-go').addEventListener('click', function () {
    if (tick) { left = (endAt - Date.now()) / 1000; stop(); return; }
    if (left <= 0) left = 120;
    endAt = Date.now() + left * 1000; $('ip-go').textContent = 'Pause';
    tick = setInterval(function () {
      left = (endAt - Date.now()) / 1000;
      $('ip-time').textContent = fmt(left); $('ip-bar').style.width = Math.min(100, (120 - left) / 1.2) + '%';
      if (left <= 0) { left = 0; stop(); $('ip-go').textContent = 'Start 2 minute timer'; if (window.SYG) SYG.toast('Two minutes. A real answer should be finishing now.'); reveal(); }
    }, 250);
  });
  function reveal() {
    if (!$('ip-tips').hidden) return;
    $('ip-tips').hidden = false; $('ip-show').hidden = true; done++;
    $('ip-tips').innerHTML = '<h2>How to answer</h2><p>' + SYG.esc(cur.t) + '</p>' + (cur.u ? '<p><a class="btn sm" href="' + cur.u + '">See model answers</a></p>' : '');
    $('ip-count').textContent = done + (done === 1 ? ' question' : ' questions') + ' practised in this sitting';
  }
  $('ip-show').addEventListener('click', reveal);
  $('ip-next').addEventListener('click', next);
  box.addEventListener('click', function (e) {
    var b = e.target.closest('[data-cat]'); if (!b) return;
    cat = b.getAttribute('data-cat');
    Array.prototype.forEach.call(box.querySelectorAll('[data-cat]'), function (x) { x.setAttribute('aria-pressed', x === b ? 'true' : 'false'); });
    refill(); next();
  });
  refill(); next();
})();
