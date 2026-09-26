// Redirige www.resetentupc.com -> https://resetentupc.com conservando ruta y parámetros (301).
export default {
  fetch(request) {
    const url = new URL(request.url);
    url.protocol = "https:";
    url.hostname = "resetentupc.com";
    url.port = "";
    return Response.redirect(url.toString(), 301);
  },
};
