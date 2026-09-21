// Cancel native touch completion even when a captured enemy is removed on pointerup.
// Game input still runs through its own pointer/touch handlers; never synthesize clicks.
const owners = new WeakMap();
export function lockPlayZoom498(surface, doc = globalThis.document) {
  if (!surface) return () => {};
  const viewport = doc?.querySelector('meta[name="viewport"]');
  const content = viewport?.getAttribute('content');
  const owner = viewport && owners.get(viewport);
  const previous = owner && content === owner.locked ? owner.previous : content;
  const locked = (previous ?? 'width=device-width').split(',')
    .filter(part => !/^\s*(initial-scale|maximum-scale|minimum-scale|user-scalable)\s*=/i.test(part))
    .concat(['initial-scale=1', 'maximum-scale=1', 'minimum-scale=1', 'user-scalable=no']).join(',');
  const token = { previous, locked };
  if (viewport) owners.set(viewport, token);
  viewport?.setAttribute('content', locked);
  const style = surface.style;
  const oldAction = style?.getPropertyValue?.('touch-action') ?? style?.touchAction ?? '';
  const oldPriority = style?.getPropertyPriority?.('touch-action') ?? '';
  if (style?.setProperty) style.setProperty('touch-action', 'none', 'important');
  else if (style) style.touchAction = 'none';
  const host = doc?.addEventListener ? doc : surface;
  const active = new Map(), listeners = [];
  const inside = target => target === surface || !!surface.contains?.(target);
  const prevent = e => { if (e.cancelable !== false) e.preventDefault(); };
  const on = (name, fn) => {
    host.addEventListener(name, fn, { passive: false, capture: true });
    listeners.push(() => host.removeEventListener(name, fn, true));
  };
  const belongs = e => host === surface || inside(e.target) || active.size > 0;
  const isPlayTouch = target => {
    if (target?.closest?.('[data-gg-hair503],[data-gg-hair],[data-cb-side],[data-cn-target496],[data-cn-target494],[data-cn-lane]')) return true;
    return !target?.closest?.('button,a,input,select,textarea');
  };
  on('touchstart', e => {
    if (!belongs(e)) return;
    let playTouch = false;
    for (const t of e.changedTouches ?? []) {
      if (host === surface || inside(t.target ?? e.target)) {
        const play = isPlayTouch(t.target ?? e.target);
        active.set(t.identifier, play);
        playTouch ||= play;
      }
    }
    // Start is also cancelled: a detached target may never bubble its touchend to document.
    // preventDefault does not stop propagation to the game's input handlers.
    if (playTouch || e.touches?.length > 1) prevent(e);
  });
  on('touchmove', e => { if (belongs(e) && e.touches?.length > 1) prevent(e); });
  const finish = e => {
    let block = false;
    for (const t of e.changedTouches ?? []) {
      block ||= active.get(t.identifier) === true;
      active.delete(t.identifier);
    }
    // The touch target may already be detached; the tracked identifier survives that.
    if (block) prevent(e);
  };
  on('touchend', finish);
  on('touchcancel', finish);
  for (const name of ['gesturestart', 'gesturechange', 'gestureend', 'dblclick']) {
    on(name, e => { if (belongs(e)) prevent(e); });
  }
  let disposed = false;
  return () => {
    if (disposed) return;
    disposed = true;
    listeners.forEach(off => off());
    active.clear();
    if (style?.setProperty) {
      if (oldAction) style.setProperty('touch-action', oldAction, oldPriority);
      else style.setProperty('touch-action', '');
    } else if (style) style.touchAction = oldAction;
    if (!viewport || owners.get(viewport) !== token || viewport.getAttribute('content') !== locked) return;
    const restore = () => {
      if (owners.get(viewport) !== token || viewport.getAttribute('content') !== locked) return;
      if (previous == null) viewport.removeAttribute('content');
      else viewport.setAttribute('content', previous);
      owners.delete(viewport);
    };
    const win = doc?.defaultView;
    if (win?.visualViewport?.scale > 1.01 && win.requestAnimationFrame) {
      // Ask the browser for the normal scale before restoring the next screen's zoom policy.
      viewport.setAttribute('content', locked.replace('initial-scale=1,', ''));
      viewport.setAttribute('content', locked);
      win.requestAnimationFrame(() => win.requestAnimationFrame(restore));
    } else restore();
  };
}
