export function get_marketing_id() {
  let marketing_id = localStorage.getItem("marketing-id");
  if (marketing_id && marketing_id !== 'null') return marketing_id;

  const urlParams = new URLSearchParams(window.location.search);
  marketing_id = urlParams.get("marketing_id");
  if (marketing_id) localStorage.setItem("marketing-id", marketing_id);
  return marketing_id;
}

export function log_open_app() {
  const marketing_id = get_marketing_id();
  if (!marketing_id) return;

  try {
    fetch(`${process.env.VUE_APP_API_MARKETING}/action`, {
      method: "POST",
      cache: "no-cache",
      redirect: "follow",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        user_id: marketing_id,
        action: "printer webapp open",
        path_from: document.referrer,
        path_to: window.location.href,
      }),
    });
  } catch {
    //Failed, skip silent
  }
}

export function log_print(status, pin) {
  const marketing_id = get_marketing_id();
  if (!marketing_id) return;

  let path_to = null;
  if (pin != undefined)
    path_to = `${process.env.VUE_APP_API_PRINTER}/file/${pin}`;

  try {
    fetch(`${process.env.VUE_APP_API_MARKETING}/action`, {
      method: "POST",
      cache: "no-cache",
      redirect: "follow",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        user_id: marketing_id,
        action: "printer webapp print",
        path_from: document.location.href,
        path_to: path_to,
        additional_data: JSON.stringify({ status: status }),
      }),
    });
  } catch {
    //Failed, skip silent
  }
}

export function log_open_history() {
  const marketing_id = get_marketing_id();
  if (!marketing_id) return;

  try {
    fetch(`${process.env.VUE_APP_API_MARKETING}/action`, {
      method: "POST",
      cache: "no-cache",
      redirect: "follow",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        user_id: marketing_id,
        action: "printer webapp history",
        path_from: document.referrer,
        path_to: document.location.href,
      }),
    });
  } catch {
    //Failed, skip silent
  }
}
