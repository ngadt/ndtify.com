/* NDTify – "Start a project" form (progressive enhancement; works without JS too) */
(function () {
  'use strict';

  const form = document.getElementById('contactForm');
  if (!form) return;

  const success = document.getElementById('formSuccess');
  const errorBox = document.getElementById('formError');
  const submit = document.getElementById('cfSubmit');
  const params = new URLSearchParams(location.search);

  form.elements.t.value = String(Date.now());

  // Pre-select a project type from links like /contact/?type=shopify-app
  const pre = params.get('type');
  if (pre) {
    const box = form.querySelector('input[name="types[]"][value="' + CSS.escape(pre) + '"]');
    if (box) box.checked = true;
  }

  const showSuccess = () => {
    form.hidden = true;
    success.hidden = false;
    success.focus();
    success.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };
  const showError = (msg) => {
    errorBox.textContent = msg;
    errorBox.hidden = !msg;
  };
  const setFieldErrors = (fields) => {
    form.querySelectorAll('.field-error').forEach((p) => {
      const msg = (fields && fields[p.dataset.for]) || '';
      p.textContent = msg;
      const input = form.elements[p.dataset.for];
      if (input) input.toggleAttribute('aria-invalid', !!msg);
    });
  };

  // Result of a no-JS submit that redirected back here
  if (params.get('sent') === '1') showSuccess();
  else if (params.get('error')) showError(params.get('error'));

  const validate = () => {
    const f = form.elements;
    const errs = {};
    if (!f.name.value.trim()) errs.name = 'Please tell us your name.';
    if (!f.email.value.trim() || !f.email.checkValidity()) errs.email = 'Please enter a valid email address.';
    if (f.message.value.trim().length < 20) errs.message = 'Please describe your project in a few sentences (20+ characters).';
    return errs;
  };

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    showError('');
    const errs = validate();
    setFieldErrors(errs);
    if (Object.keys(errs).length) {
      const first = form.elements[Object.keys(errs)[0]];
      if (first) first.focus();
      return;
    }

    const fd = new FormData(form);
    const payload = Object.fromEntries(fd.entries());
    payload.types = fd.getAll('types[]');
    delete payload['types[]'];
    payload.page = location.href;

    submit.disabled = true;
    const label = submit.textContent;
    submit.textContent = 'Sending…';
    try {
      const res = await fetch(form.action, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.ok) {
        showSuccess();
        return;
      }
      setFieldErrors(data.fields || {});
      showError(data.error || 'Something went wrong. Please try again or email support@ndtify.com.');
    } catch (err) {
      showError('Could not reach the server. Please check your connection, or email support@ndtify.com.');
    } finally {
      submit.disabled = false;
      submit.textContent = label;
    }
  });
})();
