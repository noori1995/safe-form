/* PLEASE DO NOT COPY AND PASTE THIS CODE. */ (function () {
  var w = window,
    C = "___grecaptcha_cfg",
    cfg = (w[C] = w[C] || {}),
    N = "grecaptcha";
  var gr = (w[N] = w[N] || {});
  gr.ready =
    gr.ready ||
    function (f) {
      (cfg["fns"] = cfg["fns"] || []).push(f);
    };
  w["__recaptcha_api"] = "https://www.google.com/recaptcha/api2/";
  (cfg["render"] = cfg["render"] || []).push("onload");
  w["__google_recaptcha_client"] = true;
  var d = document,
    po = d.createElement("script");
  po.type = "text/javascript";
  po.async = true;
  var v = w.navigator,
    m = d.createElement("meta");
  m.httpEquiv = "origin-trial";
  m.content =
    "Az520Inasey3TAyqLyojQa8MnmCALSEU29yQFW8dePZ7xQTvSt73pHazLFTK5f7SyLUJSo2uKLesEtEa9aUYcgMAAACPeyJvcmlnaW4iOiJodHRwczovL2dvb2dsZS5jb206NDQzIiwiZmVhdHVyZSI6IkRpc2FibGVUaGlyZFBhcnR5U3RvcmFnZVBhcnRpdGlvbmluZyIsImV4cGlyeSI6MTcyNTQwNzk5OSwiaXNTdWJkb21haW4iOnRydWUsImlzVGhpcmRQYXJ0eSI6dHJ1ZX0=";
  if (v && v.cookieDeprecationLabel) {
    v.cookieDeprecationLabel.getValue().then(function (l) {
      if (
        l !== "treatment_1.1" &&
        l !== "treatment_1.2" &&
        l !== "control_1.1"
      ) {
        d.head.prepend(m);
      }
    });
  } else {
    d.head.prepend(m);
  }
  po.src =
    "https://www.gstatic.com/recaptcha/releases/TqxSU0dsOd2Q9IbI7CpFnJLD/recaptcha__en.js";
  po.crossOrigin = "anonymous";
  po.integrity =
    "sha384-hPyFRPtmIlZ/h96KCtxJTBIBP3zd59DIienuUS73AMSvQ3kZQSEjuK4A+Lw/BPMn";
  var e = d.querySelector("script[nonce]"),
    n = e && (e["nonce"] || e.getAttribute("nonce"));
  if (n) {
    po.setAttribute("nonce", n);
  }
  var s = d.getElementsByTagName("script")[0];
  s.parentNode.insertBefore(po, s);
})();

//////////////////
// END OF RECAPTCHA
//////////////////
async function getCsrfToken() {
  const response = await fetch("/api/get-csrf-token", {
    credentials: "same-origin",
  });
  const data = await response.json();
  return data.csrfToken;
}

async function handleSubmit(event) {
  event.preventDefault();

  const csrfToken = await getCsrfToken();

  const formData = {
    name: document.getElementById("name").value,
    email: document.getElementById("email").value,
    _csrf: csrfToken,
  };

  const recaptchaToken = await grecaptcha.execute(
    "6LcbjPUpAAAAAG-_vDI5QSE9O0M0aBpnrG4KYqAC",
    {
      action: "submit",
    }
  );

  const response = await fetch("/api/submit-form", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "CSRF-Token": csrfToken,
    },
    body: JSON.stringify({ ...formData, recaptchaToken }),
  });

  const result = await response.json();

  if (response.ok) {
    alert(result.message);
  } else {
    alert(`Error: ${result.message}`);
  }
}

document.getElementById("myForm").addEventListener("submit", handleSubmit);
