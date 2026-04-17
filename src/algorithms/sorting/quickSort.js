import { EV } from "../../utils/constants";

export function quickSortEvents(arr) {
  const events = [], a = [...arr];
  function qs(arr, lo, hi) {
    if (lo < hi) { const p = part(arr, lo, hi); qs(arr, lo, p-1); qs(arr, p+1, hi); }
    else if (lo === hi) events.push({ type:EV.SORTED, indices:[lo], array:[...arr], cmp:0, sw:0, message:`[${lo}] in place` });
  }
  function part(arr, lo, hi) {
    const pv = arr[hi];
    events.push({ type:EV.PIVOT, indices:[hi], array:[...arr], cmp:0, sw:0, message:`Pivot=${pv} at [${hi}]` });
    let i = lo - 1;
    for (let j = lo; j < hi; j++) {
      events.push({ type:EV.COMPARE, indices:[j,hi], array:[...arr], cmp:1, sw:0, message:`Compare a[${j}]=${arr[j]} vs pivot ${pv}` });
      if (arr[j] <= pv) {
        i++;
        [arr[i],arr[j]] = [arr[j],arr[i]];
        if (i !== j) events.push({ type:EV.SWAP, indices:[i,j], array:[...arr], cmp:0, sw:1, message:`Swap [${i}]↔[${j}]` });
      }
    }
    [arr[i+1],arr[hi]] = [arr[hi],arr[i+1]];
    events.push({ type:EV.SWAP, indices:[i+1,hi], array:[...arr], cmp:0, sw:1, message:`Place pivot ${pv} at [${i+1}]` });
    events.push({ type:EV.SORTED, indices:[i+1], array:[...arr], cmp:0, sw:0, message:`Pivot ${pv} sorted at [${i+1}]` });
    return i+1;
  }
  qs(a, 0, a.length-1);
  events.push({ type:EV.SORTED, indices:a.map((_,i)=>i), array:[...a], cmp:0, sw:0, message:`Quick Sort complete!` });
  return events;
}
