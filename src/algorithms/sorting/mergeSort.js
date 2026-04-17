import { EV } from "../../utils/constants";

export function mergeSortEvents(arr) {
  const events = [], a = [...arr];
  function ms(arr, l, r) {
    if (l >= r) return;
    const m = Math.floor((l+r)/2);
    ms(arr, l, m);
    ms(arr, m+1, r);
    const L = arr.slice(l, m+1), R = arr.slice(m+1, r+1);
    let i = 0, j = 0, k = l;
    while (i < L.length && j < R.length) {
      events.push({ type:EV.COMPARE, indices:[l+i,m+1+j], array:[...arr], cmp:1, sw:0, message:`Compare L[${i}]=${L[i]} with R[${j}]=${R[j]}` });
      arr[k++] = L[i] <= R[j] ? L[i++] : R[j++];
      events.push({ type:EV.MERGE_WRITE, indices:[k-1], array:[...arr], cmp:0, sw:1, message:`Write ${arr[k-1]} at [${k-1}]` });
    }
    while (i < L.length) { arr[k++] = L[i++]; events.push({ type:EV.MERGE_WRITE, indices:[k-1], array:[...arr], cmp:0, sw:1, message:`Write ${arr[k-1]}` }); }
    while (j < R.length) { arr[k++] = R[j++]; events.push({ type:EV.MERGE_WRITE, indices:[k-1], array:[...arr], cmp:0, sw:1, message:`Write ${arr[k-1]}` }); }
  }
  ms(a, 0, a.length-1);
  events.push({ type:EV.SORTED, indices:a.map((_,i)=>i), array:[...a], cmp:0, sw:0, message:`Merge Sort complete!` });
  return events;
}
