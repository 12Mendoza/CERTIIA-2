const ExcelJS = require('exceljs');

const pool = require('../config/database');

const {
  calcularEstadoVigencia
} = require('../services/vigenciaDocumentos.service');

const {
  registrarEvento
} = require('../services/auditoria.service');


const ESTADOS_DOCUMENTO = new Set([
  'VIGENTE',
  'POR_VENCER',
  'CRITICO',
  'VENCIDO',
  'EN_RENOVACION'
]);

const CONDICIONES_DOCUMENTO = new Set([
  'TODOS',
  'ACTIVO',
  'ARCHIVADO',
  'ANULADO'
]);

const ESTADOS_RENOVACION = new Set([
  'INICIADA',
  'COMPLETADA'
]);


function idPositivo(valor) {
  const numero = Number(valor);

  return Number.isInteger(numero) && numero > 0
    ? numero
    : null;
}


function fechaIsoValida(valor) {
  if (!valor) {
    return null;
  }

  const texto = String(valor).trim();

  if (!/^\d{4}-\d{2}-\d{2}$/.test(texto)) {
    return null;
  }

  const fecha = new Date(`${texto}T00:00:00Z`);

  if (Number.isNaN(fecha.getTime())) {
    return null;
  }

  return fecha.toISOString().slice(0, 10) === texto
    ? texto
    : null;
}


function textoMayuscula(valor) {
  return String(valor || '')
    .trim()
    .toUpperCase();
}


function formatearFecha(valor) {
  if (!valor) {
    return '';
  }

  if (typeof valor === 'string') {
    return valor.slice(0, 10);
  }

  const fecha = new Date(valor);

  if (Number.isNaN(fecha.getTime())) {
    return '';
  }

  return fecha.toISOString().slice(0, 10);
}


function obtenerFiltrosDocumentos(query = {}) {
  const estado = textoMayuscula(query.estado);
  const condicion = textoMayuscula(query.condicion || 'ACTIVO');
  const fechaCampo = textoMayuscula(query.fechaCampo || 'EMISION');

  return {
    tiendaId: idPositivo(query.tiendaId),
    entidadId: idPositivo(query.entidadId),
    tipoId: idPositivo(query.tipoId),
    estado: ESTADOS_DOCUMENTO.has(estado)
      ? estado
      : null,
    condicion: CONDICIONES_DOCUMENTO.has(condicion)
      ? condicion
      : 'ACTIVO',
    fechaCampo: fechaCampo === 'VENCIMIENTO'
      ? 'VENCIMIENTO'
      : 'EMISION',
    fechaDesde: fechaIsoValida(query.fechaDesde),
    fechaHasta: fechaIsoValida(query.fechaHasta)
  };
}


function obtenerFiltrosProcesos(query = {}) {
  const renovacionEstado = textoMayuscula(
    query.renovacionEstado
  );

  return {
    tiendaId: idPositivo(query.tiendaId),
    entidadId: idPositivo(query.entidadId),
    tipoId: idPositivo(query.tipoId),
    tramiteEstado: textoMayuscula(query.tramiteEstado) || null,
    renovacionEstado: ESTADOS_RENOVACION.has(renovacionEstado)
      ? renovacionEstado
      : null,
    fechaDesde: fechaIsoValida(query.fechaDesde),
    fechaHasta: fechaIsoValida(query.fechaHasta)
  };
}


function validarRangoFechas(filtros) {
  if (
    filtros.fechaDesde &&
    filtros.fechaHasta &&
    filtros.fechaDesde > filtros.fechaHasta
  ) {
    const error = new Error(
      'La fecha desde no puede ser posterior a la fecha hasta.'
    );

    error.status = 400;
    throw error;
  }
}


async function consultarReporteDocumentos(query = {}) {
  const filtros = obtenerFiltrosDocumentos(query);
  validarRangoFechas(filtros);

  const condiciones = [];
  const valores = [];

  function agregarCondicion(sql, valor) {
    valores.push(valor);
    condiciones.push(
      sql.replace('?', `$${valores.length}`)
    );
  }

  if (filtros.tiendaId) {
    agregarCondicion(
      'd.tienda_id = ?',
      filtros.tiendaId
    );
  }

  if (filtros.entidadId) {
    agregarCondicion(
      'd.entidad_emisora_id = ?',
      filtros.entidadId
    );
  }

  if (filtros.tipoId) {
    agregarCondicion(
      'd.tipo_documento_id = ?',
      filtros.tipoId
    );
  }

  if (filtros.condicion !== 'TODOS') {
    agregarCondicion(
      'd.condicion_registro = ?',
      filtros.condicion
    );
  }

  const campoFecha = filtros.fechaCampo === 'VENCIMIENTO'
    ? 'd.fecha_vencimiento'
    : 'd.fecha_emision';

  if (filtros.fechaDesde) {
    agregarCondicion(
      `${campoFecha} >= ?`,
      filtros.fechaDesde
    );
  }

  if (filtros.fechaHasta) {
    agregarCondicion(
      `${campoFecha} <= ?`,
      filtros.fechaHasta
    );
  }

  const where = condiciones.length
    ? `WHERE ${condiciones.join(' AND ')}`
    : '';

  const resultado = await pool.query(
    `
      SELECT
        d.id,
        d.codigo_interno,
        d.numero_documento,
        d.numero_expediente,
        d.fecha_emision,
        d.fecha_vencimiento,
        d.estado AS estado_guardado,
        d.condicion_registro,
        d.observaciones,

        ti.id AS tienda_id,
        ti.codigo AS tienda_codigo,
        ti.nombre AS tienda_nombre,

        td.id AS tipo_id,
        td.nombre AS tipo_nombre,
        td.categoria AS tipo_categoria,

        ee.id AS entidad_id,
        ee.nombre AS entidad_nombre,
        ee.tipo AS entidad_tipo,

        rv.tipo_vigencia,
        rv.umbral_por_vencer_dias,
        rv.umbral_critico_dias,

        CONCAT(
          ur.nombres,
          ' ',
          ur.apellidos
        ) AS responsable_nombre

      FROM documentos d

      INNER JOIN tiendas ti
        ON ti.id = d.tienda_id

      INNER JOIN tipos_documento td
        ON td.id = d.tipo_documento_id

      INNER JOIN entidades_emisoras ee
        ON ee.id = d.entidad_emisora_id

      INNER JOIN tipo_documento_reglas_vigencia rv
        ON rv.id = d.regla_vigencia_id

      INNER JOIN usuarios ur
        ON ur.id = d.responsable_usuario_id

      ${where}

      ORDER BY
        d.fecha_emision DESC,
        d.id DESC;
    `,
    valores
  );

  let registros = resultado.rows.map((fila) => {
    let estadoActual = fila.estado_guardado;
    let diasRestantes = null;

    if (fila.condicion_registro === 'ACTIVO') {
      const calculado = calcularEstadoVigencia({
        tipoVigencia: fila.tipo_vigencia,
        fechaVencimiento: formatearFecha(
          fila.fecha_vencimiento
        ) || null,
        umbralPorVencerDias:
          fila.umbral_por_vencer_dias,
        umbralCriticoDias:
          fila.umbral_critico_dias,
        enRenovacion:
          fila.estado_guardado === 'EN_RENOVACION'
      });

      estadoActual = calculado.estado;
      diasRestantes = calculado.diasRestantes;
    }

    return {
      id: fila.id,
      codigoInterno: fila.codigo_interno,
      numeroDocumento: fila.numero_documento,
      numeroExpediente: fila.numero_expediente,
      fechaEmision: formatearFecha(fila.fecha_emision),
      fechaVencimiento:
        formatearFecha(fila.fecha_vencimiento) || null,
      estado: estadoActual,
      diasRestantes,
      condicionRegistro: fila.condicion_registro,
      tienda: {
        id: fila.tienda_id,
        codigo: fila.tienda_codigo,
        nombre: fila.tienda_nombre
      },
      tipoDocumento: {
        id: fila.tipo_id,
        nombre: fila.tipo_nombre,
        categoria: fila.tipo_categoria
      },
      entidad: {
        id: fila.entidad_id,
        nombre: fila.entidad_nombre,
        tipo: fila.entidad_tipo
      },
      responsable: fila.responsable_nombre,
      observaciones: fila.observaciones
    };
  });

  if (filtros.estado) {
    registros = registros.filter(
      (registro) => registro.estado === filtros.estado
    );
  }

  const estados = {
    VIGENTE: 0,
    POR_VENCER: 0,
    CRITICO: 0,
    VENCIDO: 0,
    EN_RENOVACION: 0
  };

  for (const registro of registros) {
    if (Object.hasOwn(estados, registro.estado)) {
      estados[registro.estado] += 1;
    }
  }

  return {
    filtros,
    resumen: {
      total: registros.length,
      ...estados
    },
    registros
  };
}


async function consultarReporteProcesos(query = {}) {
  const filtros = obtenerFiltrosProcesos(query);
  validarRangoFechas(filtros);

  const valoresTramites = [];
  const condicionesTramites = [];

  function condicionTramite(sql, valor) {
    valoresTramites.push(valor);
    condicionesTramites.push(
      sql.replace('?', `$${valoresTramites.length}`)
    );
  }

  if (filtros.tiendaId) {
    condicionTramite('d.tienda_id = ?', filtros.tiendaId);
  }

  if (filtros.entidadId) {
    condicionTramite(
      'tr.entidad_emisora_id = ?',
      filtros.entidadId
    );
  }

  if (filtros.tipoId) {
    condicionTramite(
      'd.tipo_documento_id = ?',
      filtros.tipoId
    );
  }

  if (filtros.tramiteEstado) {
    condicionTramite(
      'tr.estado_codigo = ?',
      filtros.tramiteEstado
    );
  }

  if (filtros.fechaDesde) {
    condicionTramite(
      'tr.fecha_inicio >= ?',
      filtros.fechaDesde
    );
  }

  if (filtros.fechaHasta) {
    condicionTramite(
      'tr.fecha_inicio <= ?',
      filtros.fechaHasta
    );
  }

  const whereTramites = condicionesTramites.length
    ? `WHERE ${condicionesTramites.join(' AND ')}`
    : '';

  const tramitesResultado = await pool.query(
    `
      SELECT
        tr.id,
        tr.numero_expediente,
        tr.fecha_inicio,
        tr.fecha_finalizacion,
        tr.estado_codigo,
        te.nombre AS estado_nombre,
        tr.observaciones,

        d.id AS documento_id,
        d.codigo_interno,
        d.numero_documento,

        ti.id AS tienda_id,
        ti.codigo AS tienda_codigo,
        ti.nombre AS tienda_nombre,

        td.id AS tipo_id,
        td.nombre AS tipo_nombre,
        td.categoria AS tipo_categoria,

        ee.id AS entidad_id,
        ee.nombre AS entidad_nombre,

        CONCAT(
          ur.nombres,
          ' ',
          ur.apellidos
        ) AS responsable_nombre,

        (
          SELECT COUNT(*)::INTEGER
          FROM tramite_observaciones tob
          WHERE tob.tramite_id = tr.id
        ) AS numero_observaciones

      FROM tramites tr

      INNER JOIN documentos d
        ON d.id = tr.documento_id

      INNER JOIN tiendas ti
        ON ti.id = d.tienda_id

      INNER JOIN tipos_documento td
        ON td.id = d.tipo_documento_id

      INNER JOIN entidades_emisoras ee
        ON ee.id = tr.entidad_emisora_id

      INNER JOIN usuarios ur
        ON ur.id = tr.responsable_usuario_id

      INNER JOIN tramite_estados te
        ON te.codigo = tr.estado_codigo

      ${whereTramites}

      ORDER BY
        tr.fecha_inicio DESC,
        tr.id DESC;
    `,
    valoresTramites
  );

  const valoresRenovaciones = [];
  const condicionesRenovaciones = [];

  function condicionRenovacion(sql, valor) {
    valoresRenovaciones.push(valor);
    condicionesRenovaciones.push(
      sql.replace('?', `$${valoresRenovaciones.length}`)
    );
  }

  if (filtros.tiendaId) {
    condicionRenovacion(
      'd.tienda_id = ?',
      filtros.tiendaId
    );
  }

  if (filtros.entidadId) {
    condicionRenovacion(
      'd.entidad_emisora_id = ?',
      filtros.entidadId
    );
  }

  if (filtros.tipoId) {
    condicionRenovacion(
      'd.tipo_documento_id = ?',
      filtros.tipoId
    );
  }

  if (filtros.renovacionEstado) {
    condicionRenovacion(
      'rn.estado = ?',
      filtros.renovacionEstado
    );
  }

  if (filtros.fechaDesde) {
    condicionRenovacion(
      'rn.fecha_inicio >= ?',
      filtros.fechaDesde
    );
  }

  if (filtros.fechaHasta) {
    condicionRenovacion(
      'rn.fecha_inicio <= ?',
      filtros.fechaHasta
    );
  }

  const whereRenovaciones = condicionesRenovaciones.length
    ? `WHERE ${condicionesRenovaciones.join(' AND ')}`
    : '';

  const renovacionesResultado = await pool.query(
    `
      SELECT
        rn.id,
        rn.fecha_inicio,
        rn.fecha_finalizacion,
        rn.duracion_dias,
        rn.estado,
        rn.observaciones,
        rn.tramite_id,

        d.id AS documento_anterior_id,
        d.codigo_interno AS documento_codigo,
        d.numero_documento AS documento_numero,

        dn.id AS documento_renovado_id,
        dn.codigo_interno AS documento_renovado_codigo,
        dn.numero_documento AS documento_renovado_numero,

        ti.id AS tienda_id,
        ti.codigo AS tienda_codigo,
        ti.nombre AS tienda_nombre,

        td.id AS tipo_id,
        td.nombre AS tipo_nombre,
        td.categoria AS tipo_categoria,

        ee.id AS entidad_id,
        ee.nombre AS entidad_nombre,

        CONCAT(
          ur.nombres,
          ' ',
          ur.apellidos
        ) AS responsable_nombre,

        tr.numero_expediente AS tramite_expediente,
        tr.estado_codigo AS tramite_estado

      FROM renovaciones rn

      INNER JOIN documentos d
        ON d.id = rn.documento_anterior_id

      LEFT JOIN documentos dn
        ON dn.id = rn.documento_renovado_id

      INNER JOIN tiendas ti
        ON ti.id = d.tienda_id

      INNER JOIN tipos_documento td
        ON td.id = d.tipo_documento_id

      INNER JOIN entidades_emisoras ee
        ON ee.id = d.entidad_emisora_id

      INNER JOIN usuarios ur
        ON ur.id = rn.responsable_usuario_id

      LEFT JOIN tramites tr
        ON tr.id = rn.tramite_id

      ${whereRenovaciones}

      ORDER BY
        rn.fecha_inicio DESC,
        rn.id DESC;
    `,
    valoresRenovaciones
  );

  const tramites = tramitesResultado.rows.map((fila) => {
    let resultado = 'PENDIENTE';

    if (['APROBADO', 'EMITIDO'].includes(fila.estado_codigo)) {
      resultado = 'FAVORABLE';
    } else if (fila.estado_codigo === 'RECHAZADO') {
      resultado = 'DESFAVORABLE';
    }

    let duracionDias = null;

    if (fila.fecha_finalizacion) {
      const inicio = new Date(`${formatearFecha(fila.fecha_inicio)}T00:00:00Z`);
      const fin = new Date(`${formatearFecha(fila.fecha_finalizacion)}T00:00:00Z`);

      duracionDias = Math.max(
        0,
        Math.round((fin - inicio) / 86400000)
      );
    }

    return {
      id: fila.id,
      expediente: fila.numero_expediente,
      fechaInicio: formatearFecha(fila.fecha_inicio),
      fechaFinalizacion:
        formatearFecha(fila.fecha_finalizacion) || null,
      duracionDias,
      estado: fila.estado_codigo,
      estadoNombre: fila.estado_nombre,
      resultado,
      numeroObservaciones: fila.numero_observaciones,
      observaciones: fila.observaciones,
      documento: {
        id: fila.documento_id,
        codigo: fila.codigo_interno,
        numero: fila.numero_documento
      },
      tienda: {
        id: fila.tienda_id,
        codigo: fila.tienda_codigo,
        nombre: fila.tienda_nombre
      },
      tipoDocumento: {
        id: fila.tipo_id,
        nombre: fila.tipo_nombre,
        categoria: fila.tipo_categoria
      },
      entidad: {
        id: fila.entidad_id,
        nombre: fila.entidad_nombre
      },
      responsable: fila.responsable_nombre
    };
  });

  const renovaciones = renovacionesResultado.rows.map((fila) => ({
    id: fila.id,
    fechaInicio: formatearFecha(fila.fecha_inicio),
    fechaFinalizacion:
      formatearFecha(fila.fecha_finalizacion) || null,
    duracionDias: fila.duracion_dias,
    estado: fila.estado,
    situacion: fila.estado === 'COMPLETADA'
      ? 'CONCLUIDA'
      : 'PENDIENTE',
    observaciones: fila.observaciones,
    tramite: fila.tramite_id
      ? {
          id: fila.tramite_id,
          expediente: fila.tramite_expediente,
          estado: fila.tramite_estado
        }
      : null,
    documentoAnterior: {
      id: fila.documento_anterior_id,
      codigo: fila.documento_codigo,
      numero: fila.documento_numero
    },
    documentoRenovado: fila.documento_renovado_id
      ? {
          id: fila.documento_renovado_id,
          codigo: fila.documento_renovado_codigo,
          numero: fila.documento_renovado_numero
        }
      : null,
    tienda: {
      id: fila.tienda_id,
      codigo: fila.tienda_codigo,
      nombre: fila.tienda_nombre
    },
    tipoDocumento: {
      id: fila.tipo_id,
      nombre: fila.tipo_nombre,
      categoria: fila.tipo_categoria
    },
    entidad: {
      id: fila.entidad_id,
      nombre: fila.entidad_nombre
    },
    responsable: fila.responsable_nombre
  }));

  return {
    filtros,
    resumen: {
      tramites: tramites.length,
      tramitesConcluidos: tramites.filter(
        (item) => ['FAVORABLE', 'DESFAVORABLE'].includes(item.resultado)
      ).length,
      tramitesPendientes: tramites.filter(
        (item) => item.resultado === 'PENDIENTE'
      ).length,
      renovaciones: renovaciones.length,
      renovacionesConcluidas: renovaciones.filter(
        (item) => item.estado === 'COMPLETADA'
      ).length,
      renovacionesPendientes: renovaciones.filter(
        (item) => item.estado === 'INICIADA'
      ).length
    },
    tramites,
    renovaciones
  };
}


async function obtenerCatalogosReportes(req, res) {
  try {
    const [tiendas, entidades, tipos, estadosTramite] = await Promise.all([
      pool.query(`
        SELECT id, codigo, nombre
        FROM tiendas
        WHERE activo = TRUE
        ORDER BY nombre ASC;
      `),
      pool.query(`
        SELECT id, nombre, tipo
        FROM entidades_emisoras
        WHERE activo = TRUE
        ORDER BY nombre ASC;
      `),
      pool.query(`
        SELECT id, nombre, categoria
        FROM tipos_documento
        WHERE activo = TRUE
        ORDER BY nombre ASC;
      `),
      pool.query(`
        SELECT codigo, nombre, orden
        FROM tramite_estados
        WHERE activo = TRUE
        ORDER BY orden ASC;
      `)
    ]);

    return res.json({
      ok: true,
      tiendas: tiendas.rows,
      entidades: entidades.rows,
      tiposDocumento: tipos.rows,
      estadosTramite: estadosTramite.rows,
      estadosDocumento: Array.from(ESTADOS_DOCUMENTO),
      estadosRenovacion: Array.from(ESTADOS_RENOVACION)
    });
  } catch (error) {
    console.error('Error obteniendo catálogos de reportes:', error);

    return res.status(500).json({
      ok: false,
      mensaje: 'No se pudieron cargar los catálogos de reportes.'
    });
  }
}


async function generarReporteDocumentos(req, res) {
  try {
    const reporte = await consultarReporteDocumentos(req.query);

    return res.json({
      ok: true,
      ...reporte
    });
  } catch (error) {
    console.error('Error generando reporte de documentos:', error);

    return res.status(error.status || 500).json({
      ok: false,
      mensaje:
        error.status === 400
          ? error.message
          : 'No se pudo generar el reporte de documentos.'
    });
  }
}


async function generarReporteTramitesRenovaciones(req, res) {
  try {
    const reporte = await consultarReporteProcesos(req.query);

    return res.json({
      ok: true,
      ...reporte
    });
  } catch (error) {
    console.error(
      'Error generando reporte de trámites y renovaciones:',
      error
    );

    return res.status(error.status || 500).json({
      ok: false,
      mensaje:
        error.status === 400
          ? error.message
          : 'No se pudo generar el reporte de trámites y renovaciones.'
    });
  }
}


function agregarTituloHoja(hoja, titulo, filtros) {
  hoja.addRow([titulo]);
  hoja.mergeCells('A1:H1');
  hoja.getCell('A1').font = {
    bold: true,
    size: 16
  };

  hoja.addRow([
    'Generado',
    new Date().toLocaleString('es-PE')
  ]);

  hoja.addRow([
    'Filtros utilizados',
    JSON.stringify(filtros)
  ]);

  hoja.addRow([]);
}


function aplicarEncabezado(fila) {
  fila.font = {
    bold: true
  };

  fila.alignment = {
    vertical: 'middle',
    horizontal: 'center'
  };
}


function ajustarColumnas(hoja) {
  hoja.columns.forEach((columna) => {
    let ancho = 12;

    columna.eachCell({ includeEmpty: true }, (celda) => {
      const longitud = celda.value
        ? String(celda.value).length
        : 0;

      ancho = Math.min(
        45,
        Math.max(ancho, longitud + 2)
      );
    });

    columna.width = ancho;
  });
}


async function exportarReporte(req, res) {
  try {
    const tipo = textoMayuscula(req.query.tipo);
    const formato = textoMayuscula(req.query.formato || 'XLSX');

    if (formato !== 'XLSX') {
      return res.status(400).json({
        ok: false,
        mensaje: 'El formato solicitado no está habilitado. Use XLSX.'
      });
    }

    if (!['DOCUMENTOS', 'PROCESOS'].includes(tipo)) {
      return res.status(400).json({
        ok: false,
        mensaje: 'El tipo de reporte no es válido.'
      });
    }

    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'CERTIIA';
    workbook.created = new Date();

    let filtrosAuditoria = null;
    let totalExportado = 0;

    if (tipo === 'DOCUMENTOS') {
      const reporte = await consultarReporteDocumentos(req.query);
      filtrosAuditoria = reporte.filtros;
      totalExportado = reporte.registros.length;

      const hoja = workbook.addWorksheet('Documentos');
      agregarTituloHoja(
        hoja,
        'CERTIIA - Reporte de documentos',
        reporte.filtros
      );

      const encabezado = hoja.addRow([
        'Código',
        'Tienda',
        'Tipo documental',
        'Categoría',
        'Entidad emisora',
        'N.º documento',
        'N.º expediente',
        'Fecha emisión',
        'Fecha vencimiento',
        'Estado',
        'Días restantes',
        'Condición',
        'Responsable'
      ]);

      aplicarEncabezado(encabezado);

      for (const item of reporte.registros) {
        hoja.addRow([
          item.codigoInterno,
          item.tienda.nombre,
          item.tipoDocumento.nombre,
          item.tipoDocumento.categoria,
          item.entidad.nombre,
          item.numeroDocumento,
          item.numeroExpediente || '',
          item.fechaEmision,
          item.fechaVencimiento || '',
          item.estado,
          item.diasRestantes ?? '',
          item.condicionRegistro,
          item.responsable
        ]);
      }

      hoja.addRow([]);
      hoja.addRow(['TOTAL', reporte.resumen.total]);
      ajustarColumnas(hoja);
    } else {
      const reporte = await consultarReporteProcesos(req.query);
      filtrosAuditoria = reporte.filtros;
      totalExportado =
        reporte.tramites.length +
        reporte.renovaciones.length;

      const hojaTramites = workbook.addWorksheet('Tramites');
      agregarTituloHoja(
        hojaTramites,
        'CERTIIA - Reporte de trámites',
        reporte.filtros
      );

      const encabezadoTramites = hojaTramites.addRow([
        'ID',
        'Expediente',
        'Tienda',
        'Documento',
        'Tipo documental',
        'Entidad',
        'Estado',
        'Resultado',
        'Fecha inicio',
        'Fecha finalización',
        'Duración real (días)',
        'N.º observaciones',
        'Responsable'
      ]);

      aplicarEncabezado(encabezadoTramites);

      for (const item of reporte.tramites) {
        hojaTramites.addRow([
          item.id,
          item.expediente,
          item.tienda.nombre,
          item.documento.numero,
          item.tipoDocumento.nombre,
          item.entidad.nombre,
          item.estado,
          item.resultado,
          item.fechaInicio,
          item.fechaFinalizacion || '',
          item.duracionDias ?? '',
          item.numeroObservaciones,
          item.responsable
        ]);
      }

      ajustarColumnas(hojaTramites);

      const hojaRenovaciones = workbook.addWorksheet('Renovaciones');
      agregarTituloHoja(
        hojaRenovaciones,
        'CERTIIA - Reporte de renovaciones',
        reporte.filtros
      );

      const encabezadoRenovaciones = hojaRenovaciones.addRow([
        'ID',
        'Tienda',
        'Documento anterior',
        'Documento renovado',
        'Tipo documental',
        'Entidad',
        'Estado',
        'Situación',
        'Fecha inicio',
        'Fecha finalización',
        'Duración real (días)',
        'Trámite relacionado',
        'Responsable'
      ]);

      aplicarEncabezado(encabezadoRenovaciones);

      for (const item of reporte.renovaciones) {
        hojaRenovaciones.addRow([
          item.id,
          item.tienda.nombre,
          item.documentoAnterior.numero,
          item.documentoRenovado?.numero || '',
          item.tipoDocumento.nombre,
          item.entidad.nombre,
          item.estado,
          item.situacion,
          item.fechaInicio,
          item.fechaFinalizacion || '',
          item.duracionDias ?? '',
          item.tramite?.expediente || '',
          item.responsable
        ]);
      }

      ajustarColumnas(hojaRenovaciones);
    }

    const buffer = await workbook.xlsx.writeBuffer();

    await registrarEvento({
      usuarioId: req.usuario?.usuarioId || null,
      evento: 'REPORTE_EXPORTADO',
      modulo: 'REPORTES',
      descripcion:
        `Exportación XLSX de reporte ${tipo.toLowerCase()} con ${totalExportado} registros.`,
      entidad: 'reporte',
      registroId: null,
      datosNuevos: {
        tipo,
        formato,
        totalExportado,
        filtros: filtrosAuditoria
      },
      ip: req.ip,
      userAgent: req.get('user-agent') || null
    });

    const nombre = tipo === 'DOCUMENTOS'
      ? 'certiia_reporte_documentos.xlsx'
      : 'certiia_reporte_tramites_renovaciones.xlsx';

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );

    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${nombre}"`
    );

    return res.send(Buffer.from(buffer));
  } catch (error) {
    console.error('Error exportando reporte:', error);

    return res.status(error.status || 500).json({
      ok: false,
      mensaje:
        error.status === 400
          ? error.message
          : 'No se pudo exportar el reporte.'
    });
  }
}


module.exports = {
  obtenerCatalogosReportes,
  generarReporteDocumentos,
  generarReporteTramitesRenovaciones,
  exportarReporte
};
