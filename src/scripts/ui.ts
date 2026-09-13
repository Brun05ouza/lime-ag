import { track, type AnalyticsEvent } from '../lib/analytics';
export function initUI() {
  const header = document.querySelector<HTMLElement>('[data-header]');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const updateReducedHeader = () => {
    if (reducedMotion.matches && header)
      header.dataset.headerState = window.scrollY < 56 ? 'hero' : 'expanded';
  };
  const syncReducedListener = () => {
    window.removeEventListener('scroll', updateReducedHeader);
    if (reducedMotion.matches)
      window.addEventListener('scroll', updateReducedHeader, { passive: true });
    updateReducedHeader();
  };
  reducedMotion.addEventListener('change', syncReducedListener);
  syncReducedListener();
  const toggle = document.querySelector<HTMLButtonElement>('[data-menu-toggle]');
  const menu = document.querySelector<HTMLDialogElement>('#mobile-menu');
  if (toggle && menu) {
    const largeDesktop = window.matchMedia('(min-width: 1600px)');
    document.documentElement.classList.add('js-menu');
    toggle.hidden = false;
    const finishClose = () => menu.close();
    const close = () => {
      const event = new CustomEvent('lime:menu-close', {
        cancelable: true,
        detail: { complete: finishClose },
      });
      if (menu.dispatchEvent(event)) finishClose();
    };
    toggle.addEventListener('click', () => {
      if (largeDesktop.matches && header?.dataset.headerState === 'collapsed') {
        header.dispatchEvent(new CustomEvent('lime:header-expand'));
        return;
      }
      menu.scrollTop = 0;
      menu.showModal();
      toggle.setAttribute('aria-expanded', 'true');
      toggle.setAttribute('aria-label', 'Fechar menu');
      document.body.style.overflow = 'hidden';
      menu.dispatchEvent(new CustomEvent('lime:menu-open'));
    });
    menu.querySelector('[data-menu-close]')?.addEventListener('click', close);
    menu.querySelectorAll('a').forEach((link) => link.addEventListener('click', close));
    menu.addEventListener('cancel', (event) => {
      event.preventDefault();
      close();
    });
    menu.addEventListener('close', () => {
      toggle.setAttribute('aria-expanded', 'false');
      toggle.setAttribute('aria-label', 'Abrir menu');
      document.body.style.overflow = '';
      toggle.focus();
    });
    window.matchMedia('(min-width: 900px)').addEventListener('change', (event) => {
      if (event.matches && menu.open) close();
    });
  }
  document.querySelectorAll<HTMLElement>('[data-services]').forEach((explorer) => {
    const buttons = Array.from(
      explorer.querySelectorAll<HTMLButtonElement>('[data-service-button]'),
    );
    const wide = window.matchMedia('(min-width: 900px)');
    let active = 0;
    const activate = (index: number, collapse = false) => {
      active = collapse ? -1 : index;
      const selected = active;
      const apply = () => {
        explorer.style.setProperty('--scope-progress', String((selected + 1) / buttons.length));
        buttons.forEach((button, i) => {
          const expanded = i === selected;
          button.setAttribute('aria-expanded', String(expanded));
          button.closest('.service')?.classList.toggle('is-active', expanded);
          const panel = document.getElementById(button.getAttribute('aria-controls') || '');
          if (panel) panel.hidden = !expanded;
        });
      };
      const next =
        active < 0
          ? null
          : document.getElementById(buttons[active].getAttribute('aria-controls') || '');
      const event = new CustomEvent('lime:service-change', {
        cancelable: true,
        detail: { apply, next },
      });
      if (explorer.dispatchEvent(event)) apply();
    };
    explorer.classList.add('is-enhanced');
    activate(0);
    buttons.forEach((button, i) => {
      button.addEventListener('click', () => {
        activate(i, !wide.matches && active === i);
        track('service_view', { service: button.id });
      });
      button.addEventListener('keydown', (event) => {
        if (!['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)) return;
        event.preventDefault();
        const next =
          event.key === 'Home'
            ? 0
            : event.key === 'End'
              ? buttons.length - 1
              : (i + (event.key === 'ArrowDown' ? 1 : -1) + buttons.length) % buttons.length;
        buttons[next].focus();
        activate(next);
      });
    });
    wide.addEventListener('change', () => {
      if (wide.matches && active < 0) activate(0);
    });
  });
  document.addEventListener('click', (event) => {
    if (!(event.target instanceof Element)) return;
    const link = event.target.closest<HTMLElement>('[data-analytics]');
    if (link)
      track(link.dataset.analytics as AnalyticsEvent, { href: link.getAttribute('href') || '' });
  });
  const casePage = document.querySelector<HTMLElement>('[data-case-view]');
  if (casePage) track('case_view', { slug: casePage.dataset.caseView || '' });
  const form = document.querySelector<HTMLFormElement>('[data-contact-form]');
  if (form) {
    const submit = form.querySelector<HTMLButtonElement>('[data-contact-submit]');
    if (submit) submit.disabled = false;
    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      const status = form.querySelector<HTMLElement>('[data-form-status]');
      try {
        const { contactSchema, buildContactEmail } = await import('../lib/contact');
        const parsed = contactSchema.safeParse(Object.fromEntries(new FormData(form)));
        if (!parsed.success) {
          if (status)
            status.textContent =
              'Confira os campos. A mensagem precisa ter pelo menos 10 caracteres.';
          return;
        }
        window.location.href = buildContactEmail(parsed.data);
        if (status)
          status.textContent =
            'Mensagem preparada. Conclua o envio no seu aplicativo de e-mail. Se ele não abrir, use um dos endereços ao lado.';
        track('contact_click', { method: 'email_draft' });
      } catch {
        if (status)
          status.textContent =
            'Não foi possível preparar a mensagem. Entre em contato pelos e-mails ao lado.';
      }
    });
  }
}
