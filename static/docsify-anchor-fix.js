let hash;
let params = new URLSearchParams(window.location.search);

if ((hash = params.get("id"))) {
  params.delete("id");
  window.location.hash = hash;
  window.location.search = params.toString();
}
