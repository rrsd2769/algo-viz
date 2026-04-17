import { EV } from "../../utils/constants";

export function bubbleSortEvents(arr) {
  const events = [], a = [...arr], n = a.length;
  for (let i = 0; i < n - 1; i++) {
    for (let j = 0; j < n - i - 1; j++) {
      events.push({ type:EV.COMPARE, indices:[j,j+1], array:[...a], cmp:1, sw:0, message:`Compare a[${j}]=${a[j]} ↔ a[${j+1}]=${a[j+1]}` });
      if (a[j] > a[j+1]) {
        [a[j],a[j+1]] = [a[j+1],a[j]];
        events.push({ type:EV.SWAP, indices:[j,j+1], array:[...a], cmp:0, sw:1, message:`Swap a[${j}] ↔ a[${j+1}]` });
      } else {
        events.push({ type:EV.MATCH, indices:[j,j+1], array:[...a], cmp:0, sw:0, message:`No swap needed` });
      }
    }
    events.push({ type:EV.SORTED, indices:[n-1-i], array:[...a], cmp:0, sw:0, message:`Position ${n-1-i} sorted` });
  }
  events.push({ type:EV.SORTED, indices:[0], array:[...a], cmp:0, sw:0, message:`Bubble Sort complete!` });
  return events;
}
