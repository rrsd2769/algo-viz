import { EV } from "../../utils/constants";

export function insertionSortEvents(arr) {
  const events = [], a = [...arr], n = a.length;
  events.push({ type:EV.SORTED, indices:[0], array:[...a], cmp:0, sw:0, message:`a[0]=${a[0]} trivially sorted` });
  for (let i = 1; i < n; i++) {
    let j = i;
    while (j > 0) {
      events.push({ type:EV.COMPARE, indices:[j-1,j], array:[...a], cmp:1, sw:0, message:`Compare a[${j-1}]=${a[j-1]} with a[${j}]=${a[j]}` });
      if (a[j-1] > a[j]) {
        [a[j-1],a[j]] = [a[j],a[j-1]];
        events.push({ type:EV.SWAP, indices:[j-1,j], array:[...a], cmp:0, sw:1, message:`Shift ${a[j]} left` });
        j--;
      } else break;
    }
    events.push({ type:EV.SORTED, indices:[...Array(i+1).keys()], array:[...a], cmp:0, sw:0, message:`Prefix [0..${i}] sorted` });
  }
  return events;
}
