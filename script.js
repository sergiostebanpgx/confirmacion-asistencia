(() => {
  "use strict";

  /* ========================================================================
     CONFIGURACIÓN DEL EVENTO
     Edita únicamente este bloque para actualizar los datos de la invitación.
     El número de WhatsApp debe ir sin "+", espacios ni guiones.
     ======================================================================== */
  const EVENTO = Object.freeze({
    nombre: Object.freeze({
      pila: "Tahiry Dayanna",
      apellidos: "Vergel Maldonado",
      completo: "Tahiry Dayanna Vergel Maldonado",
      iniciales: "TD"
    }),
    fecha: Object.freeze({
      dia: "31",
      mes: "Octubre",
      mesNumero: "10",
      anio: "2026",
      anioDosDigitos: "26",
      diaSemana: "Sábado",
      hora: "7:00 p. m.",
      larga: "Sábado, 31 de octubre de 2026",
      corta: "31 de octubre",
      iso: "2026-10-31T19:00:00-05:00"
    }),
    lugar: Object.freeze({
      linea1: "Calle 58A Sur # 75-34",
      linea2: "Barrio La Estancia"
    }),
    whatsapp: Object.freeze({
      numero: "573204216241"
    }),
    maxPersonas: 20
  });

  /* ========================================================================
     Referencias y constantes
     ======================================================================== */
  const MAX_PERSONAS = EVENTO.maxPersonas;
  const NUMERO_WHATSAPP = EVENTO.whatsapp.numero.replace(/\D/g, "");
  const prefiereMenosMovimiento = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const formulario = document.getElementById("form-confirmacion");
  const campoNombre = document.getElementById("nombre-completo");
  const errorNombre = document.getElementById("error-nombre");
  const radiosAsistencia = formulario
    ? Array.from(formulario.querySelectorAll('input[name="asistencia"]'))
    : [];
  const grupoAsistencia = radiosAsistencia.length
    ? radiosAsistencia[0].closest("fieldset")
    : null;
  const errorAsistencia = document.getElementById("error-asistencia");
  const bloqueAsistentes = document.getElementById("bloque-asistentes");
  const campoCantidad = document.getElementById("cantidad-personas");
  const errorCantidad = document.getElementById("error-personas");
  const botonesPaso = formulario
    ? Array.from(formulario.querySelectorAll(".stepper__btn"))
    : [];
  const totalPersonas = document.getElementById("total-personas");
  const totalPersonasLabel = document.getElementById("total-personas-label");
  const acompanantes = document.getElementById("acompanantes");
  const agradecimiento = document.getElementById("agradecimiento");
  const graciasTitulo = document.getElementById("gracias-titulo");
  const graciasTexto = document.getElementById("gracias-texto");
  const enlaceWhatsApp = document.getElementById("whatsapp-alternativo");
  const botonCopiarMensaje = document.getElementById("copiar-mensaje");
  const toast = document.getElementById("toast");

  let temporizadorToast;
  let temporizadorWhatsApp;
  let ultimoMensajeWhatsApp = "";

  /* ========================================================================
     Datos del evento en la página
     ======================================================================== */
  function completarDatosDelEvento() {
    const resolverRuta = (ruta) =>
      ruta.split(".").reduce((objeto, clave) => {
        return objeto && Object.prototype.hasOwnProperty.call(objeto, clave)
          ? objeto[clave]
          : undefined;
      }, EVENTO);

    document.querySelectorAll("[data-event]").forEach((elemento) => {
      const ruta = elemento.dataset.event;
      const valor = resolverRuta(ruta);

      if (typeof valor === "string" || typeof valor === "number") {
        elemento.textContent = String(valor);
      }
    });

    const fechaEvento = document.getElementById("fecha-evento");
    if (fechaEvento) {
      fechaEvento.dateTime = EVENTO.fecha.iso;
    }

    document.title = `Grado de abogada · ${EVENTO.nombre.completo}`;

    const descripcion = document.querySelector('meta[name="description"]');
    if (descripcion) {
      descripcion.setAttribute(
        "content",
        `Acompáñame a celebrar mi grado de abogada. ${EVENTO.fecha.larga}, ${EVENTO.fecha.hora}, ${EVENTO.lugar.linea1}, ${EVENTO.lugar.linea2}.`
      );
    }

    const tituloSocial = document.querySelector('meta[property="og:title"]');
    if (tituloSocial) {
      tituloSocial.setAttribute("content", `Grado de abogada · ${EVENTO.nombre.completo}`);
    }
  }

  /* ========================================================================
     Formulario de confirmación
     ======================================================================== */
  function obtenerAsistencia() {
    const seleccion = radiosAsistencia.find((radio) => radio.checked);
    return seleccion ? seleccion.value : "";
  }

  function leerCantidad() {
    if (!campoCantidad) return null;

    const texto = campoCantidad.value.trim();
    if (!/^\d+$/.test(texto)) return null;

    const numero = Number(texto);
    return Number.isSafeInteger(numero) ? numero : null;
  }

  function mostrarError(campo, contenedorError, mensaje) {
    if (!contenedorError) return;

    contenedorError.textContent = mensaje;
    contenedorError.hidden = false;

    if (campo) {
      campo.setAttribute("aria-invalid", "true");
    }
  }

  function limpiarError(campo, contenedorError) {
    if (contenedorError) {
      contenedorError.textContent = "";
      contenedorError.hidden = true;
    }

    if (campo) {
      campo.removeAttribute("aria-invalid");
    }
  }

  function enfocarCampo(campo) {
    if (!campo) return;

    try {
      campo.focus({ preventScroll: true });
    } catch {
      campo.focus();
    }

    if (typeof campo.scrollIntoView === "function") {
      campo.scrollIntoView({
        behavior: prefiereMenosMovimiento ? "auto" : "smooth",
        block: "center"
      });
    }
  }

  function actualizarContador() {
    if (!campoCantidad || !totalPersonas || !totalPersonasLabel || !acompanantes) {
      return;
    }

    const cantidad = leerCantidad();
    const cantidadVisible = cantidad !== null && cantidad > 0;

    totalPersonas.textContent = cantidadVisible ? String(cantidad) : "—";
    totalPersonasLabel.textContent =
      cantidad === 1 ? "persona en total" : "personas en total";

    if (!cantidadVisible) {
      acompanantes.textContent = "Indica cuántas personas asistirán.";
    } else if (cantidad === 1) {
      acompanantes.textContent = "Sin acompañantes adicionales.";
    } else {
      const adicionales = cantidad - 1;
      acompanantes.textContent = `${adicionales} ${
        adicionales === 1 ? "acompañante adicional" : "acompañantes adicionales"
      }.`;
    }

    botonesPaso.forEach((boton) => {
      const paso = Number(boton.dataset.step);
      if (paso < 0) {
        boton.disabled = cantidad === null || cantidad <= 1;
      } else {
        boton.disabled = cantidad !== null && cantidad >= MAX_PERSONAS;
      }
    });
  }

  function actualizarBloqueAsistentes() {
    if (!bloqueAsistentes || !campoCantidad) return;

    const asistira = obtenerAsistencia() === "si";

    bloqueAsistentes.hidden = !asistira;
    campoCantidad.disabled = !asistira;

    if (asistira) {
      const cantidad = leerCantidad();
      if (cantidad === null || cantidad < 1) {
        campoCantidad.value = "1";
      }
      actualizarContador();
    } else {
      limpiarError(campoCantidad, errorCantidad);
    }
  }

  function validarNombre() {
    if (!campoNombre || !errorNombre) return false;

    const nombre = normalizarTexto(campoNombre.value);
    campoNombre.value = nombre;

    if (!nombre) {
      mostrarError(campoNombre, errorNombre, "Escribe tu nombre completo para saber quién confirma.");
      return false;
    }

    if (nombre.length < 3) {
      mostrarError(campoNombre, errorNombre, "Tu nombre debe tener al menos 3 caracteres.");
      return false;
    }

    if (/\d/.test(nombre) || !/[A-Za-zÁÉÍÓÚÜÑáéíóúüñ]/.test(nombre)) {
      mostrarError(campoNombre, errorNombre, "Escribe tu nombre usando solo letras y espacios.");
      return false;
    }

    if (!/^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ'’ .-]+$/.test(nombre)) {
      mostrarError(
        campoNombre,
        errorNombre,
        "Usa solo letras, espacios, puntos, apóstrofos o guiones en tu nombre."
      );
      return false;
    }

    limpiarError(campoNombre, errorNombre);
    return true;
  }

  function validarAsistencia() {
    const asistencia = obtenerAsistencia();

    if (!asistencia) {
      if (grupoAsistencia) {
        grupoAsistencia.classList.add("has-error");
      }
      mostrarError(grupoAsistencia, errorAsistencia, "Elige una opción para preparar tu respuesta.");
      return false;
    }

    if (grupoAsistencia) {
      grupoAsistencia.classList.remove("has-error");
    }
    limpiarError(grupoAsistencia, errorAsistencia);
    return true;
  }

  function validarCantidad() {
    if (!campoCantidad || !errorCantidad) return false;
    if (obtenerAsistencia() !== "si") {
      limpiarError(campoCantidad, errorCantidad);
      return true;
    }

    const texto = campoCantidad.value.trim();
    const cantidad = leerCantidad();

    if (!texto) {
      mostrarError(
        campoCantidad,
        errorCantidad,
        "Indica cuántas personas asistirán, incluyéndote."
      );
      return false;
    }

    if (cantidad === null || !Number.isInteger(cantidad)) {
      mostrarError(campoCantidad, errorCantidad, "Escribe una cantidad válida en números enteros.");
      return false;
    }

    if (cantidad < 1) {
      mostrarError(campoCantidad, errorCantidad, "Debe asistir al menos una persona: tú.");
      return false;
    }

    if (cantidad > MAX_PERSONAS) {
      mostrarError(
        campoCantidad,
        errorCantidad,
        `La cantidad máxima es de ${MAX_PERSONAS} personas.`
      );
      return false;
    }

    limpiarError(campoCantidad, errorCantidad);
    return true;
  }

  function validarFormulario() {
    if (agradecimiento) {
      agradecimiento.hidden = true;
    }

    const nombreValido = validarNombre();
    const asistenciaValida = validarAsistencia();
    const asistira = obtenerAsistencia() === "si";
    let cantidadValida = true;

    if (asistira) {
      cantidadValida = validarCantidad();
    } else {
      limpiarError(campoCantidad, errorCantidad);
    }

    if (!nombreValido) {
      enfocarCampo(campoNombre);
    } else if (!asistenciaValida) {
      enfocarCampo(radiosAsistencia[0]);
    } else if (asistira && !cantidadValida) {
      enfocarCampo(campoCantidad);
    }

    return {
      valido: nombreValido && asistenciaValida && cantidadValida,
      asistira,
      nombre: campoNombre ? campoNombre.value : "",
      total: asistira ? leerCantidad() : 0
    };
  }

  function construirMensaje(datos) {
    if (datos.asistira) {
      const acompañantesAdicionales = Math.max(0, datos.total - 1);

      return [
        "¡Hola! Quiero confirmar mi asistencia a tu celebración de grado de abogada.",
        "",
        `- Nombre del invitado: ${datos.nombre}`,
        "- Confirmación: Sí, asistiré.",
        `- Total de personas: ${datos.total}`,
        `- Acompañantes adicionales: ${acompañantesAdicionales}`,
        "",
        `¡Muchas gracias por la invitación! Nos vemos el ${EVENTO.fecha.corta}.`
      ].join("\n");
    }

    return [
      "¡Hola! Gracias por la invitación a la celebración de grado de abogada.",
      "",
      `- Nombre del invitado: ${datos.nombre}`,
      "- Confirmación: No podré asistir.",
      "",
      "Te deseo muchos éxitos en esta nueva etapa profesional. ¡Felicitaciones!"
    ].join("\n");
  }

  function normalizarTexto(texto) {
    return String(texto)
      .normalize("NFC")
      .replace(/[\u200B-\u200F\u202A-\u202E\u2060-\u206F\uFEFF]/g, "")
      .trim()
      .replace(/\s+/g, " ");
  }

  function codificarMensajeWhatsApp(mensaje) {
    const texto = String(mensaje)
      .normalize("NFC")
      .replace(/[\u200B-\u200F\u202A-\u202E\u2060-\u206F\uFEFF]/g, "")
      .replace(/\r\n?/g, "\n");

    // Se codifican también ! ' ( ) * para evitar interpretaciones del cliente.
    return encodeURIComponent(texto).replace(/[!'()*]/g, (caracter) => {
      return `%${caracter.charCodeAt(0).toString(16).toUpperCase()}`;
    });
  }

  function construirUrlWhatsApp(mensaje) {
    // El endpoint directo evita la redirección de wa.me, que puede alterar
    // caracteres al pasar el texto a algunos clientes de WhatsApp.
    return `https://api.whatsapp.com/send/?phone=${NUMERO_WHATSAPP}&text=${codificarMensajeWhatsApp(mensaje)}&type=phone_number&app_absent=0`;
  }

  function mostrarToast(mensaje) {
    if (!toast) return;

    window.clearTimeout(temporizadorToast);
    toast.textContent = mensaje;
    toast.classList.add("is-visible");

    temporizadorToast = window.setTimeout(() => {
      toast.classList.remove("is-visible");
    }, 3800);
  }

  function mostrarAgradecimiento(datos, urlWhatsApp) {
    if (!agradecimiento || !graciasTitulo || !graciasTexto || !enlaceWhatsApp) return;

    const primerNombre = datos.nombre.split(/\s+/)[0] || datos.nombre;

    if (datos.asistira) {
      graciasTitulo.textContent = `¡Gracias, ${primerNombre}!`;
      graciasTexto.textContent = `Preparé tu mensaje para ${datos.total} ${
        datos.total === 1 ? "persona" : "personas"
      }. Te espero el ${EVENTO.fecha.corta} a las ${EVENTO.fecha.hora} Recuerda pulsar Enviar dentro de WhatsApp.`;
    } else {
      graciasTitulo.textContent = `Gracias por avisarme, ${primerNombre}.`;
      graciasTexto.textContent =
        "Preparé tu mensaje de respuesta. Recuerda pulsar Enviar dentro de WhatsApp para que me llegue.";
    }

    enlaceWhatsApp.href = urlWhatsApp;
    agradecimiento.hidden = false;

    try {
      agradecimiento.focus({ preventScroll: true });
    } catch {
      agradecimiento.focus();
    }

    if (typeof agradecimiento.scrollIntoView === "function") {
      agradecimiento.scrollIntoView({
        behavior: prefiereMenosMovimiento ? "auto" : "smooth",
        block: "center"
      });
    }
  }

  function programarAperturaWhatsApp(urlWhatsApp) {
    window.clearTimeout(temporizadorWhatsApp);

    temporizadorWhatsApp = window.setTimeout(() => {
      const ventana = window.open(urlWhatsApp, "_blank");

      if (ventana) {
        try {
          ventana.opener = null;
        } catch {
          // Algunos navegadores no permiten modificar esta propiedad.
        }
      } else {
        // Si el navegador bloquea la pestaña, se abre en la misma pestaña.
        window.location.href = urlWhatsApp;
      }
    }, prefiereMenosMovimiento ? 250 : 1600);
  }

  function manejarEnvio(evento) {
    evento.preventDefault();
    window.clearTimeout(temporizadorWhatsApp);

    const datos = validarFormulario();
    if (!datos.valido) {
      mostrarToast("Revisa los campos marcados para continuar.");
      return;
    }

    const mensaje = construirMensaje(datos);
    const urlWhatsApp = construirUrlWhatsApp(mensaje);

    ultimoMensajeWhatsApp = mensaje;
    mostrarAgradecimiento(datos, urlWhatsApp);
    mostrarToast("Abriendo WhatsApp con tu mensaje listo…");
    programarAperturaWhatsApp(urlWhatsApp);
  }

  function iniciarFormulario() {
    if (
      !formulario ||
      !campoNombre ||
      !bloqueAsistentes ||
      !campoCantidad ||
      radiosAsistencia.length === 0
    ) {
      return;
    }

    radiosAsistencia.forEach((radio) => {
      radio.addEventListener("change", () => {
        actualizarBloqueAsistentes();
        validarAsistencia();
      });
    });

    campoNombre.addEventListener("input", () => {
      limpiarError(campoNombre, errorNombre);
    });

    campoNombre.addEventListener("blur", () => {
      if (campoNombre.value.trim()) {
        campoNombre.value = normalizarTexto(campoNombre.value);
      }
    });

    campoCantidad.addEventListener("input", () => {
      actualizarContador();
      limpiarError(campoCantidad, errorCantidad);
    });

    botonesPaso.forEach((boton) => {
      boton.addEventListener("click", () => {
        const paso = Number(boton.dataset.step);
        const cantidadActual = leerCantidad();
        let nuevaCantidad;

        if (!Number.isFinite(paso)) return;

        if (cantidadActual === null || cantidadActual < 1) {
          nuevaCantidad = 1;
        } else {
          nuevaCantidad = Math.min(
            MAX_PERSONAS,
            Math.max(1, cantidadActual + paso)
          );
        }

        campoCantidad.value = String(nuevaCantidad);
        actualizarContador();
        limpiarError(campoCantidad, errorCantidad);
      });
    });

    enlaceWhatsApp?.addEventListener("click", () => {
      window.clearTimeout(temporizadorWhatsApp);
    });

    botonCopiarMensaje?.addEventListener("click", async () => {
      window.clearTimeout(temporizadorWhatsApp);

      if (!ultimoMensajeWhatsApp) {
        mostrarToast("Primero completa tu confirmación para generar el mensaje.");
        return;
      }

      const copiado = await copiarAlPortapapeles(ultimoMensajeWhatsApp);
      mostrarToast(
        copiado
          ? "Mensaje copiado. Pégalo en la conversación de WhatsApp."
          : "No se pudo copiar el mensaje. Inténtalo de nuevo."
      );
    });

    formulario.addEventListener("submit", manejarEnvio);

    actualizarBloqueAsistentes();
    actualizarContador();
  }

  /* ========================================================================
     Compartir y copiar el enlace
     ======================================================================== */
  function obtenerEnlaceInvitacion() {
    return window.location.href.split("#")[0];
  }

  async function copiarAlPortapapeles(texto) {
    if (navigator.clipboard && window.isSecureContext) {
      try {
        await navigator.clipboard.writeText(texto);
        return true;
      } catch {
        // Se intenta con el método alternativo.
      }
    }

    try {
      const area = document.createElement("textarea");
      area.value = texto;
      area.setAttribute("readonly", "");
      area.style.position = "fixed";
      area.style.top = "-9999px";
      area.style.left = "-9999px";
      area.style.opacity = "0";
      document.body.appendChild(area);
      area.select();
      area.setSelectionRange(0, area.value.length);
      const copiado = document.execCommand("copy");
      area.remove();
      return copiado;
    } catch {
      return false;
    }
  }

  async function compartirInvitacion() {
    const url = obtenerEnlaceInvitacion();
    const datosCompartir = {
      title: `Grado de abogada de ${EVENTO.nombre.pila}`,
      text: `Acompáñame a celebrar mi grado de abogada el ${EVENTO.fecha.larga} a las ${EVENTO.fecha.hora}`,
      url
    };

    if (typeof navigator.share === "function") {
      try {
        await navigator.share(datosCompartir);
        return;
      } catch (error) {
        if (error && error.name === "AbortError") {
          return;
        }
      }
    }

    const copiado = await copiarAlPortapapeles(url);
    mostrarToast(
      copiado
        ? "Enlace copiado. Ya puedes compartirlo por WhatsApp."
        : "No se pudo copiar el enlace. Inténtalo de nuevo."
    );
  }

  async function copiarEnlaceInvitacion() {
    const copiado = await copiarAlPortapapeles(obtenerEnlaceInvitacion());
    mostrarToast(
      copiado
        ? "Enlace copiado. Ya puedes compartirlo por WhatsApp."
        : "No se pudo copiar el enlace. Inténtalo de nuevo."
    );
  }

  function iniciarCompartir() {
    document.querySelectorAll("[data-share]").forEach((boton) => {
      boton.addEventListener("click", compartirInvitacion);
    });

    document.querySelectorAll("[data-copy]").forEach((boton) => {
      boton.addEventListener("click", copiarEnlaceInvitacion);
    });
  }

  /* ========================================================================
     Animaciones al desplazarse
     ======================================================================== */
  function iniciarRevelado() {
    const elementos = Array.from(document.querySelectorAll(".reveal"));
    if (!elementos.length) return;

    if (prefiereMenosMovimiento || !("IntersectionObserver" in window)) {
      elementos.forEach((elemento) => elemento.classList.add("is-visible"));
      return;
    }

    document.body.classList.add("motion-ready");

    const observador = new IntersectionObserver(
      (entradas) => {
        entradas.forEach((entrada) => {
          if (entrada.isIntersecting) {
            entrada.target.classList.add("is-visible");
            observador.unobserve(entrada.target);
          }
        });
      },
      {
        threshold: 0.08,
        rootMargin: "0px 0px -35px 0px"
      }
    );

    elementos.forEach((elemento) => observador.observe(elemento));
  }

  /* ========================================================================
     Inicio
     ======================================================================== */
  completarDatosDelEvento();
  iniciarFormulario();
  iniciarCompartir();
  iniciarRevelado();
})();
