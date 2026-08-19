/**
 * Arma el cuerpo del mensaje (checklist ordenado) y el asunto, a partir de los mismos
 * datos recolectados en el formulario. Se usa tanto para el envío por correo como para
 * el enlace de WhatsApp, así el técnico recibe la misma información completa sin importar
 * el canal — y al usuario nunca se le pregunta dos veces.
 */
export function construirCuerpoMensaje(datos, labels) {
  const lineas = [];
  const agregar = (label, valor) => {
    if (valor) lineas.push(`${label}: ${valor}`);
  };

  agregar(labels.tipo, datos.tipo);
  agregar(labels.servicio, datos.servicio);
  agregar(labels.garantiaDato, datos.garantiaDato);
  agregar(labels.cuponRuleta, datos.cuponRuleta);
  agregar(labels.marca, datos.marca);
  agregar(labels.modelo, datos.modelo);
  agregar(labels.error, datos.error);
  agregar(labels.sistemaOperativo, datos.sistemaOperativo);
  agregar(labels.conexion, datos.conexion);

  const opcionales = [];
  if (datos.nombre) opcionales.push(`${labels.nombre}: ${datos.nombre}`);
  if (datos.email) opcionales.push(`${labels.email}: ${datos.email}`);
  if (datos.whatsapp) opcionales.push(`${labels.whatsapp}: ${datos.whatsapp}`);
  if (datos.canalPreferido) opcionales.push(`${labels.canalPreferido}: ${datos.canalPreferido}`);
  if (opcionales.length) {
    lineas.push("");
    lineas.push(...opcionales);
  }

  agregar(labels.moduloDescargado, datos.moduloDescargado);

  if (datos.nota) {
    lineas.push("");
    lineas.push(`${labels.nota}:`);
    lineas.push(datos.nota);
  }

  if (datos.urlOrigen) {
    lineas.push("");
    lineas.push(`${labels.paginaOrigen}: ${datos.urlOrigen}`);
  }

  return lineas.join("\n");
}

/** Asunto final = tipo de solicitud — servicio — marca modelo — error. País se agrega server-side (correo). */
export function construirAsunto(asuntoBase, datos) {
  const partes = [asuntoBase];
  if (datos.servicio) partes.push(datos.servicio);
  const detalle = [datos.marca, datos.modelo].filter(Boolean).join(" ");
  if (detalle) partes.push(detalle);
  if (datos.error) partes.push(datos.error);
  return partes.join(" — ");
}
