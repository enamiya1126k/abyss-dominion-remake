// Visual quantities derive from authoritative cuts / final points, never client input.
export const CUT_STAGES487 = Object.freeze([0, 2, 5, 9, 15, 23, 35, 50, 70, 110, 175]);

export function chopMaterial487(cuts) {
  cuts = Number.isFinite(cuts) ? Math.max(0, cuts) : 0;
  let food = 0;
  while (food + 1 < CUT_STAGES487.length && cuts >= CUT_STAGES487[food + 1]) food++;
  const next = Math.min(food + 1, CUT_STAGES487.length - 1);
  const mix = next === food ? 0 : (cuts - CUT_STAGES487[food]) / (CUT_STAGES487[next] - CUT_STAGES487[food]);
  const label = food >= 10 ? '限界の極細' : food >= 9 ? 'キャベツの雪' : food >= 8 ? '極みじん切り' : food >= 6 ? 'みじん切り' : food >= 4 ? '千切り' : 'ざく切り';
  return { food, next, mix, label };
}

export function foodLayer487(frame, from, to) {
  const fine = frame >= 8, index = fine ? frame - 7 : frame;
  const trim = !fine && frame >= 4;
  return {
    backgroundImage: `url('./assets/cabbage${fine ? '487/fine-stages' : '486/cabbage-stages'}.png')`,
    backgroundSize: fine ? '200% 200%' : '400% 200%',
    backgroundPosition: `${index % (fine ? 2 : 4) * 100 / (fine ? 1 : 3)}% ${Math.floor(index / (fine ? 2 : 4)) * 100}%`,
    // Opaque adjacent regions refine the pile on EACH cut, without double-exposure ghosts.
    clipPath: `inset(${trim ? 14 : 0}% ${100 - to}% ${trim ? 6 : 0}% ${from}%)`,
    transform: `translateY(${fine ? (index >= 2 ? 9 : 1) : trim ? 9 : 0}%)`,
    opacity: 1,
  };
}

export function cabbagePile487(score, topScore = score) {
  const points = Number.isFinite(score) ? Math.max(0, score) : 0;
  const top = Number.isFinite(topScore) ? Math.max(points, topScore) : points;
  // Winner mound is bounded on phones yet grows with absolute final points.
  // Comparison bars use one common scale: 800 pt always has half the fill of 1,600 pt.
  return {
    points,
    scale: points === 0 ? 0 : Math.cbrt(points / (points + 1200)),
    share: top > 0 ? points / top : 0,
  };
}
