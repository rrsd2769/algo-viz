import { EV } from "../../utils/constants";

function computeLPS(pattern) {
  const lps = new Array(pattern.length).fill(0);
  let len = 0, i = 1;
  const events = [];
  events.push({type:EV.KMP_LPS_COMPUTE, i, len, lps:[...lps], message:`Build LPS: pattern="${pattern}"`});
  while (i < pattern.length) {
    events.push({type:EV.KMP_LPS_COMPUTE, i, len, lps:[...lps], message:`LPS[${i}]: compare P[${i}]='${pattern[i]}' with P[${len}]='${pattern[len]}'`});
    if (pattern[i] === pattern[len]) {
      len++; lps[i] = len;
      events.push({type:EV.KMP_LPS_MATCH, i, len:len-1, lps:[...lps], message:`Match → lps[${i}]=${lps[i]}`});
      i++;
    } else if (len > 0) {
      len = lps[len-1];
      events.push({type:EV.KMP_LPS_COMPUTE, i, len, lps:[...lps], message:`Mismatch, fallback → len=${len}`});
    } else {
      lps[i] = 0; i++;
      events.push({type:EV.KMP_LPS_COMPUTE, i:i-1, len, lps:[...lps], message:`lps[${i-1}]=0`});
    }
  }
  return {lps, lpsEvents: events};
}

export function kmpEvents(text, pattern) {
  const events = [];
  if (!pattern || !text) return events;
  const {lps, lpsEvents} = computeLPS(pattern);
  events.push(...lpsEvents);
  const n = text.length, m = pattern.length;
  let i = 0, j = 0;
  const matches = [];
  while (i < n) {
    events.push({
      type: text[i] === pattern[j] ? EV.KMP_MATCH : EV.KMP_MISMATCH,
      ti: i, pi: j, lps: [...lps], matches: [...matches],
      message: text[i] === pattern[j]
        ? `Match T[${i}]='${text[i]}' = P[${j}]='${pattern[j]}'`
        : `Mismatch T[${i}]='${text[i]}' ≠ P[${j}]='${pattern[j]}'`,
    });
    if (text[i] === pattern[j]) { i++; j++; }
    else {
      if (j > 0) {
        const skip = j - lps[j-1];
        events.push({type:EV.KMP_SKIP, ti:i, pi:j, skipBy:skip, lps:[...lps], matches:[...matches], message:`Mismatch: j=${j}, use lps[${j-1}]=${lps[j-1]}, skip ${skip}`});
        j = lps[j-1];
      } else i++;
    }
    if (j === m) {
      matches.push(i - m);
      events.push({type:EV.KMP_FOUND, ti:i-m, pi:j, matchStart:i-m, lps:[...lps], matches:[...matches], message:`Pattern found at index ${i-m}!`});
      j = lps[j-1];
    }
  }
  if (matches.length === 0)
    events.push({type:EV.KMP_MISMATCH, ti:n, pi:0, lps:[...lps], matches:[], message:`No match found.`});
  return events;
}
