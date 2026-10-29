// Submits every <form data-ajax-form> with fetch and shows the result in its [data-form-status] element.
// Messages come from the form's data-sending / data-success / data-error attributes.
// Demo mode: without PUBLIC_FORM_ENDPOINT the send is only simulated.
const endpoint: string = import.meta.env.PUBLIC_FORM_ENDPOINT ?? '';

export function initAjaxForms() {
  document.querySelectorAll<HTMLFormElement>('form[data-ajax-form]').forEach((form) => {
    const status = form.querySelector<HTMLElement>('[data-form-status]');
    const button = form.querySelector<HTMLButtonElement>('button[type="submit"]');
    if (!status || !button) return;

    const show = (msg: string, ok: boolean) => {
      status.textContent = msg;
      status.classList.remove('hidden', 'bg-emerald-100', 'bg-red-100');
      status.classList.add(ok ? 'bg-emerald-100' : 'bg-red-100');
    };

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const { sending, success, error } = form.dataset;
      const label = button.innerHTML;
      button.disabled = true;
      button.textContent = sending ?? '';
      try {
        if (endpoint) {
          const res = await fetch(endpoint, { method: 'POST', body: new FormData(form), headers: { Accept: 'application/json' } });
          if (!res.ok) throw new Error(String(res.status));
        } else {
          await new Promise((r) => setTimeout(r, 700));
        }
        form.reset();
        show(success ?? '', true);
      } catch {
        show(error ?? '', false);
      } finally {
        button.disabled = false;
        button.innerHTML = label;
      }
    });
  });
}
