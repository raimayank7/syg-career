/* Resume builder. Everything stays in this browser (localStorage 'resume-draft'); nothing is uploaded.
   The preview is a real A4 sheet (210 x 297 mm) scaled to the screen; Print sends only that sheet. */
(function () {
  'use strict';
  var d = document, form = d.getElementById('rb-form');
  if (!form) return;
  var $ = function (id) { return d.getElementById(id); }, esc = SYG.esc;
  var EMPTY = { mode: 'fresher', tpl: 'classic', color: '#1d4ed8', size: 10.5, name: '', title: '', phone: '', email: '', city: '', links: '', summary: '',
    edu: [{ d: '', i: '', y: '', s: '' }], exp: [], proj: [], skills: '', extra: '', langs: '', interests: '' };
  var SIMPLE = [['name', 'Full name', 'text', 'As on your certificates'], ['title', 'Headline', 'text', 'For example: B.Com graduate | Accounts and GST'], ['phone', 'Mobile number', 'tel', '10 digit number you answer'],
    ['email', 'Email', 'email', 'A plain address with your name'], ['city', 'City and state', 'text', 'For example: Indore, Madhya Pradesh'], ['links', 'LinkedIn or portfolio link (optional)', 'text', 'linkedin.com/in/yourname']];
  var GROUPS = {
    edu: ['Education', 'Add a qualification', [['d', 'Degree or class', 'B.Com, Class 12 (CBSE)'], ['i', 'College, school or board', 'Name and city'], ['y', 'Year', '2023 to 2026'], ['s', 'Marks', '7.8 CGPA or 82%']], false],
    exp: ['Work experience', 'Add a job', [['r', 'Job title', 'Accounts Executive'], ['c', 'Company and city', 'Company name, Pune'], ['p', 'Period', 'Jun 2024 to present']], true],
    proj: ['Projects and internships', 'Add a project or internship', [['t', 'Title', 'Internship or project name'], ['o', 'Where or with what', 'Organisation, or tools used'], ['p', 'Period', 'May to Jul 2025']], true]
  };
  var data;
  function load() {
    var v = null;
    try { v = JSON.parse(localStorage.getItem('resume-draft')); } catch (e) {}
    data = Object.assign({}, EMPTY, v || {});
    ['edu', 'exp', 'proj'].forEach(function (k) { if (!Array.isArray(data[k])) data[k] = []; });
  }
  function save() { try { localStorage.setItem('resume-draft', JSON.stringify(data)); } catch (e) {} }
  function lines(s) { return String(s || '').split(/\n+/).map(function (x) { return x.replace(/^\s*[-•*]\s*/, '').trim(); }).filter(Boolean); }

  /* ---------- the form ---------- */
  function field(id, label, type, ph, val, big) {
    return '<div class="rb-f"><label for="' + id + '">' + label + '</label>' + (big
      ? '<textarea id="' + id + '" rows="' + big + '" placeholder="' + esc(ph) + '">' + esc(val) + '</textarea>'
      : '<input type="' + type + '" id="' + id + '" placeholder="' + esc(ph) + '" value="' + esc(val) + '" autocomplete="off">') + '</div>';
  }
  function drawForm() {
    var h = '<fieldset><legend>Your details</legend><div class="rb-grid">';
    SIMPLE.forEach(function (f) { h += field('rb-' + f[0], f[1], f[2], f[3], data[f[0]]); });
    h += '</div>' + field('rb-summary', data.mode === 'fresher' ? 'Career objective (2 or 3 lines)' : 'Professional summary (2 to 4 lines)', '', 'Who you are, what you are good at, what work you want. No "hardworking and sincere" lines.', data.summary, 4) + '</fieldset>';
    Object.keys(GROUPS).forEach(function (k) {
      var g = GROUPS[k];
      h += '<fieldset><legend>' + g[0] + '</legend>';
      data[k].forEach(function (row, n) {
        h += '<div class="rb-item"><div class="rb-grid">';
        g[2].forEach(function (f) { h += field('rb-' + k + '-' + n + '-' + f[0], f[1], 'text', f[2], row[f[0]] || ''); });
        h += '</div>';
        if (g[3]) h += field('rb-' + k + '-' + n + '-b', 'Points (one per line, start each with an action word)', '', 'Prepared GST returns for 12 clients every month\nReduced pending invoices from 60 to 15 in three months', (row.b || []).join('\n'), 4);
        h += '<div class="rb-row"><button type="button" class="btn sm ghost" data-up="' + k + ',' + n + '"' + (n ? '' : ' disabled') + '>Move up</button><button type="button" class="btn sm ghost" data-rm="' + k + ',' + n + '">Remove</button></div></div>';
      });
      h += '<button type="button" class="btn sm" data-add="' + k + '">' + g[1] + '</button></fieldset>';
    });
    h += '<fieldset><legend>Skills and more</legend>' +
      field('rb-skills', 'Skills (one group per line)', '', 'Accounting: Tally, GST returns, bank reconciliation\nComputer: MS Excel (VLOOKUP, pivot tables), MS Word\nOther: Typing 35 wpm', data.skills, 4) +
      field('rb-extra', 'Achievements and certificates (one per line, optional)', '', 'Class topper in B.Com second year\nNISM Series V-A certificate, 2025', data.extra, 3) +
      '<div class="rb-grid">' + field('rb-langs', 'Languages', 'text', 'English, Hindi, Marathi', data.langs) + field('rb-interests', 'Interests (optional)', 'text', 'Cricket, volunteering', data.interests) + '</div></fieldset>';
    form.innerHTML = h;
  }
  function read() {
    SIMPLE.forEach(function (f) { data[f[0]] = $('rb-' + f[0]).value.trim(); });
    ['summary', 'skills', 'extra', 'langs', 'interests'].forEach(function (k) { data[k] = $('rb-' + k).value.trim(); });
    Object.keys(GROUPS).forEach(function (k) {
      data[k].forEach(function (row, n) {
        GROUPS[k][2].forEach(function (f) { row[f[0]] = $('rb-' + k + '-' + n + '-' + f[0]).value.trim(); });
        if (GROUPS[k][3]) row.b = lines($('rb-' + k + '-' + n + '-b').value);
      });
    });
  }

  /* ---------- the sheet ---------- */
  function sec(title, inner) { return inner ? '<section><h2>' + title + '</h2>' + inner + '</section>' : ''; }
  function sheetHtml() {
    var c = [data.phone, data.email, data.city, data.links].filter(Boolean).map(esc).join(' <i>|</i> ');
    var h = '<header><p class="rs-n">' + esc(data.name || 'Your Name') + '</p>' + (data.title ? '<p class="rs-t">' + esc(data.title) + '</p>' : '') + (c ? '<p class="rs-c">' + c + '</p>' : '') + '</header>';
    var edu = data.edu.filter(function (e) { return e.d || e.i; }).map(function (e) {
      return '<div class="rs-row"><div><b>' + esc(e.d) + '</b>' + (e.i ? ', ' + esc(e.i) : '') + (e.s ? ' <span class="rs-s">' + esc(e.s) + '</span>' : '') + '</div><div class="rs-p">' + esc(e.y) + '</div></div>';
    }).join('');
    var block = function (list, a, b) {
      return list.filter(function (e) { return e[a] || e[b]; }).map(function (e) {
        return '<div class="rs-job"><div class="rs-row"><div><b>' + esc(e[a]) + '</b>' + (e[b] ? ', ' + esc(e[b]) : '') + '</div><div class="rs-p">' + esc(e.p) + '</div></div>' +
          ((e.b || []).length ? '<ul>' + e.b.map(function (x) { return '<li>' + esc(x) + '</li>'; }).join('') + '</ul>' : '') + '</div>';
      }).join('');
    };
    var skills = lines(data.skills).map(function (l) { var i = l.indexOf(':'); return '<p>' + (i > 0 && i < 30 ? '<b>' + esc(l.slice(0, i)) + ':</b>' + esc(l.slice(i + 1)) : esc(l)) + '</p>'; }).join('');
    var extra = lines(data.extra).map(function (l) { return '<li>' + esc(l) + '</li>'; }).join('');
    var more = (data.langs ? '<p><b>Languages:</b> ' + esc(data.langs) + '</p>' : '') + (data.interests ? '<p><b>Interests:</b> ' + esc(data.interests) + '</p>' : '');
    var S = { sum: sec(data.mode === 'fresher' ? 'Career objective' : 'Summary', data.summary ? '<p>' + esc(data.summary) + '</p>' : ''), edu: sec('Education', edu), exp: sec('Work experience', block(data.exp, 'r', 'c')),
      proj: sec(data.mode === 'fresher' ? 'Projects and internships' : 'Projects', block(data.proj, 't', 'o')), skills: sec('Skills', skills), extra: sec('Achievements and certificates', extra ? '<ul>' + extra + '</ul>' : ''), more: sec('Additional information', more) };
    var order = data.mode === 'fresher' ? ['sum', 'edu', 'proj', 'exp', 'skills', 'extra', 'more'] : ['sum', 'exp', 'proj', 'skills', 'edu', 'extra', 'more'];
    return h + order.map(function (k) { return S[k]; }).join('');
  }
  var sheet = $('rb-sheet'), wrap = $('rb-wrap');
  function fit() {            // scale the A4 sheet to the width of its column; report whether the content fits one page
    var w = wrap.clientWidth, k = Math.min(1, w / sheet.offsetWidth);
    sheet.style.transform = 'scale(' + k + ')';
    wrap.style.height = Math.ceil(sheet.offsetHeight * k) + 'px';
    var over = sheet.scrollHeight - sheet.clientHeight;
    var st = $('rb-fit');
    if (over > 2) { st.textContent = 'Too long for one page by about ' + Math.ceil(over / 3.78) + ' mm. Shorten the text or press "Fit to one page".'; st.className = 'rb-fit bad'; }
    else { st.textContent = 'Fits on one A4 page.'; st.className = 'rb-fit ok'; }
    return over;
  }
  function draw() {
    sheet.className = 'rs rs-' + data.tpl;
    sheet.style.setProperty('--rs-c', data.color);
    sheet.style.setProperty('--rs-f', data.size + 'pt');
    sheet.innerHTML = sheetHtml();
    $('rb-size').value = data.size; $('rb-size-v').textContent = data.size + ' pt';
    fit();
  }
  function controls() {
    Array.prototype.forEach.call(d.querySelectorAll('[data-mode]'), function (b) { b.setAttribute('aria-pressed', b.getAttribute('data-mode') === data.mode ? 'true' : 'false'); });
    Array.prototype.forEach.call(d.querySelectorAll('[data-tpl]'), function (b) { b.setAttribute('aria-pressed', b.getAttribute('data-tpl') === data.tpl ? 'true' : 'false'); });
    Array.prototype.forEach.call(d.querySelectorAll('[data-color]'), function (b) { b.setAttribute('aria-pressed', b.getAttribute('data-color') === data.color ? 'true' : 'false'); });
  }
  function all() { drawForm(); controls(); draw(); save(); }

  form.addEventListener('input', function () { read(); draw(); save(); });
  form.addEventListener('click', function (e) {
    var b = e.target.closest('button'); if (!b) return;
    var k, n, p;
    if (b.hasAttribute('data-add')) { read(); k = b.getAttribute('data-add'); if (data[k].length >= 8) return SYG.toast('Eight entries are the limit for one page'); data[k].push(k === 'edu' ? { d: '', i: '', y: '', s: '' } : { b: [] }); all(); }
    else if (b.hasAttribute('data-rm')) { read(); p = b.getAttribute('data-rm').split(','); data[p[0]].splice(+p[1], 1); all(); }
    else if (b.hasAttribute('data-up')) { read(); p = b.getAttribute('data-up').split(','); k = p[0]; n = +p[1]; if (n > 0) { var t = data[k][n]; data[k][n] = data[k][n - 1]; data[k][n - 1] = t; all(); } }
  });
  d.addEventListener('click', function (e) {
    var b = e.target.closest('[data-mode],[data-tpl],[data-color]'); if (!b) return;
    read();
    if (b.hasAttribute('data-mode')) { data.mode = b.getAttribute('data-mode'); all(); return; }
    if (b.hasAttribute('data-tpl')) data.tpl = b.getAttribute('data-tpl');
    if (b.hasAttribute('data-color')) data.color = b.getAttribute('data-color');
    controls(); draw(); save();
  });
  $('rb-size').addEventListener('input', function () { data.size = +this.value; draw(); save(); });
  $('rb-auto').addEventListener('click', function () {
    read();
    while (fit() > 2 && data.size > 8.5) { data.size = Math.round((data.size - 0.25) * 100) / 100; draw(); }
    save();
    SYG.toast(fit() > 2 ? 'Still too long at the smallest readable size. Cut some text.' : 'Fits on one page at ' + data.size + ' pt');
  });
  $('rb-print').addEventListener('click', function () {
    read(); draw();
    if (fit() > 2 && !confirm('The resume is longer than one page and the extra lines will be cut off. Print anyway?')) return;
    var old = d.title; d.title = (data.name || 'Resume').replace(/[^\w ]+/g, '').trim().replace(/\s+/g, '_') + '_Resume';
    window.print(); d.title = old;
  });
  $('rb-text').addEventListener('click', function () {
    read();
    var t = [data.name, data.title, [data.phone, data.email, data.city, data.links].filter(Boolean).join(' | '), ''];
    var add = function (h, arr) { if (arr.length) { t.push(h.toUpperCase()); arr.forEach(function (x) { t.push(x); }); t.push(''); } };
    add(data.mode === 'fresher' ? 'Career objective' : 'Summary', data.summary ? [data.summary] : []);
    var jobs = function (list, a, b) { var o = []; list.forEach(function (e) { if (e[a] || e[b]) { o.push([e[a], e[b]].filter(Boolean).join(', ') + (e.p ? ' (' + e.p + ')' : '')); (e.b || []).forEach(function (x) { o.push('- ' + x); }); } }); return o; };
    var edu = data.edu.filter(function (e) { return e.d || e.i; }).map(function (e) { return [e.d, e.i, e.y, e.s].filter(Boolean).join(', '); });
    if (data.mode === 'fresher') { add('Education', edu); add('Projects and internships', jobs(data.proj, 't', 'o')); add('Work experience', jobs(data.exp, 'r', 'c')); }
    else { add('Work experience', jobs(data.exp, 'r', 'c')); add('Projects', jobs(data.proj, 't', 'o')); }
    add('Skills', lines(data.skills)); if (data.mode !== 'fresher') add('Education', edu);
    add('Achievements and certificates', lines(data.extra).map(function (x) { return '- ' + x; }));
    add('Additional information', [data.langs ? 'Languages: ' + data.langs : '', data.interests ? 'Interests: ' + data.interests : ''].filter(Boolean));
    SYG.copy(t.join('\n').trim(), 'Plain text copied');
  });
  $('rb-save').addEventListener('click', function () {
    read();
    var a = d.createElement('a');
    a.href = URL.createObjectURL(new Blob([JSON.stringify(data, null, 1)], { type: 'application/json' }));
    a.download = (data.name || 'my').replace(/[^\w]+/g, '_') + '_resume_backup.json'; d.body.appendChild(a); a.click(); a.remove();
  });
  $('rb-open').addEventListener('change', function () {
    var f = this.files[0]; if (!f) return;
    var r = new FileReader();
    r.onload = function () { try { var v = JSON.parse(r.result); if (typeof v !== 'object' || !('name' in v)) throw 0; data = Object.assign({}, EMPTY, v); all(); SYG.toast('Backup opened'); } catch (e) { SYG.toast('That file is not a resume backup from this page'); } };
    r.readAsText(f); this.value = '';
  });
  $('rb-clear').addEventListener('click', function () { if (confirm('Clear everything you have typed? This cannot be undone.')) { data = JSON.parse(JSON.stringify(EMPTY)); all(); } });
  function sample(id) {
    SYG.json('/resume/data/samples.json').then(function (S) {
      var s = S[id] || S[Object.keys(S)[0]];
      data = Object.assign({}, EMPTY, JSON.parse(JSON.stringify(s)), { tpl: data.tpl, color: data.color }); all(); SYG.toast('Sample loaded. Replace it with your own details.');
    }).catch(function () { SYG.toast('Could not load the sample'); });
  }
  $('rb-sample').addEventListener('click', function () {
    read();
    if ((data.name || data.summary) && !confirm('Replace what you have typed with a sample?')) return;
    sample(data.mode === 'fresher' ? 'bcom-fresher' : 'sales-executive');
  });
  window.addEventListener('resize', fit);
  load();
  var m = /[?&]sample=([\w-]+)/.exec(location.search);
  if (m && (!(data.name || data.summary) || confirm('Open the sample? It will replace what you have typed in the builder.'))) { all(); sample(m[1]); history.replaceState(null, '', location.pathname); }
  else all();
  if (d.fonts && d.fonts.ready) d.fonts.ready.then(fit);
})();
