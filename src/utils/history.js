export function get_history() {
  let hist = localStorage.getItem("print-history") || "[]";
  hist = JSON.parse(hist);
  return hist;
}

export function add_history(pin, name) {
  let hist = get_history();
  hist = hist.slice(-9);
  hist.push({ pin: pin, name: name });
  localStorage.setItem("print-history", JSON.stringify(hist));
  return hist;
}
