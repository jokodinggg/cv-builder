/** Moves an element inside a mutable (e.g. immer draft) array. Out-of-range targets are ignored. */
export function moveInPlace<T>(list: T[], from: number, to: number): void {
  if (from < 0 || from >= list.length || to < 0 || to >= list.length || from === to) return;
  const [moved] = list.splice(from, 1);
  list.splice(to, 0, moved);
}
