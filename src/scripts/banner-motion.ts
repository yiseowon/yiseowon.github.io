const edge = [
  [0, 0], [10, 0.4], [22, 0.73], [36, 0.93], [50, 1],
  [64, 0.93], [78, 0.73], [90, 0.4], [100, 0],
] as const;

const motionStyles = [
  '--cloth-outline',
  '--fold-x',
  '--fold-y',
  '--fold-angle',
  '--fold-strength',
  '--message-shift',
  '--message-tilt',
];

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

export function enableBannerMotion(cloth: HTMLElement) {
  const listeners = new AbortController();
  const { signal } = listeners;
  const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
  const clothSlack = Number.parseFloat(getComputedStyle(cloth).getPropertyValue('--cloth-slack'));
  let grab: { id: number; x: number; y: number } | undefined;
  let foldX = 50;
  let foldY = 50;
  let offset = 0;
  let velocity = 0;
  let pull = 0;
  let scrollY = window.scrollY;
  let frame = 0;
  let previousTime = 0;

  function render() {
    const height = cloth.clientHeight;
    const sag = height * 0.075;
    const top: string[] = [];
    const bottom: string[] = [];

    for (const [x, weight] of edge) {
      const nearFold = Math.exp(-((x - foldX) ** 2) / 180) * weight;
      const sagged = weight * (sag + offset * 0.42);
      const localPull = nearFold * offset * 0.62;
      const upper = clamp(sagged + localPull * (1 - foldY / 100), 0, height);
      const lower = clamp(height - sag - clothSlack + sagged + localPull * (foldY / 100), 0, height);
      top.push(`${x}% ${upper.toFixed(2)}px`);
      bottom.unshift(`${x}% ${lower.toFixed(2)}px`);
    }

    const { style } = cloth;
    style.setProperty('--cloth-outline', `polygon(${[...top, ...bottom].join(', ')})`);
    style.setProperty('--fold-x', `${foldX}%`);
    style.setProperty('--fold-y', `${foldY}%`);
    style.setProperty('--fold-angle', `${(foldX - 50) * 0.36}deg`);
    style.setProperty('--fold-strength', String(grab ? 0.82 : clamp(Math.abs(offset) / 23, 0, 0.58)));
    style.setProperty('--message-shift', `${offset * 0.38}px`);
    style.setProperty('--message-tilt', `${((foldX - 50) * offset) / 465}deg`);
  }

  function clearRendering() {
    for (const property of motionStyles) cloth.style.removeProperty(property);
  }

  function animate(now: number) {
    const step = previousTime ? clamp((now - previousTime) / 1000, 0, 1 / 25) : 1 / 60;
    previousTime = now;
    velocity += (pull - offset) * 105 * step;
    velocity *= Math.exp(-5.2 * step);
    offset = clamp(offset + velocity * step, -31, 36);

    const moving = Math.abs(pull - offset) > 0.08 || Math.abs(velocity) > 0.8;
    if (grab || moving) render();
    if (moving) {
      frame = requestAnimationFrame(animate);
    } else {
      frame = previousTime = velocity = 0;
      offset = pull;
      if (!grab) clearRendering();
    }
  }

  function wake() {
    if (!frame) frame = requestAnimationFrame(animate);
  }

  function track(event: PointerEvent) {
    const bounds = cloth.getBoundingClientRect();
    foldX = clamp(((event.clientX - bounds.left) / bounds.width) * 100, 4, 96);
    foldY = clamp(((event.clientY - bounds.top) / bounds.height) * 100, 12, 88);
  }

  function release(event: PointerEvent) {
    if (grab?.id !== event.pointerId) return;
    grab = undefined;
    pull = 0;
    cloth.removeAttribute('data-dragging');
    wake();
  }

  cloth.addEventListener('pointerdown', (event) => {
    if (motionPreference.matches || !event.isPrimary || event.button !== 0 || grab) return;
    grab = { id: event.pointerId, x: event.clientX, y: event.clientY };
    track(event);
    pull = 8;
    cloth.setAttribute('data-dragging', '');
    cloth.setPointerCapture(event.pointerId);
    wake();
  }, { signal });

  cloth.addEventListener('pointermove', (event) => {
    if (grab?.id !== event.pointerId) return;
    track(event);
    const horizontal = Math.abs(event.clientX - grab.x);
    pull = clamp(8 + (event.clientY - grab.y) * 0.7 + horizontal * 0.085, -24, 32);
    wake();
  }, { signal });

  for (const type of ['pointerup', 'pointercancel', 'lostpointercapture'] as const) {
    cloth.addEventListener(type, release, { signal });
  }

  window.addEventListener('scroll', () => {
    const next = window.scrollY;
    const delta = next - scrollY;
    scrollY = next;
    if (motionPreference.matches || !delta || grab) return;

    const bounds = cloth.getBoundingClientRect();
    if (bounds.bottom <= 0 || bounds.top >= window.innerHeight) return;
    foldX = 50;
    foldY = 50;
    velocity = clamp(velocity + clamp(delta * 1.35, -100, 100), -160, 160);
    wake();
  }, { passive: true, signal });

  function stop() {
    if (grab && cloth.hasPointerCapture(grab.id)) cloth.releasePointerCapture(grab.id);
    grab = undefined;
    cancelAnimationFrame(frame);
    frame = previousTime = offset = velocity = pull = 0;
    cloth.removeAttribute('data-dragging');
    clearRendering();
  }

  function updatePreference() {
    cloth.toggleAttribute('data-motion', !motionPreference.matches);
    if (motionPreference.matches) stop();
  }

  updatePreference();
  motionPreference.addEventListener('change', updatePreference, { signal });

  return () => {
    listeners.abort();
    stop();
    cloth.removeAttribute('data-motion');
  };
}
