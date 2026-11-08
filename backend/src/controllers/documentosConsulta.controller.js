const pool =
  require('../config/database');

const {
  recalcularEstadosDocumentos
} = require(
  '../services/vigenciaDocumentos.service'
);


// ============================================================
// UTILIDADES
// ============================================================

function idValido(valor) {

  const numero =
    Number(valor);

  return (
    Number.isInteger(numero) &&
    numero > 0
  );
}


function enteroPositivo(
  valor,
  predeterminado
) {

  if (
    valor === undefined ||
    valor === null ||
    valor === ''
  ) {
    return predeterminado;
  }


  const numero =
    Number(valor);


  if (
    !Number.isInteger(numero) ||
    numero <= 0
  ) {
    return null;
  }


  return numero;
}


function fechaValida(valor) {

  if (
    typeof valor !== 'string' ||
    !/^\d{4}-\d{2}-\d{2}$/.test(valor)
  ) {
    return false;
  }


  const fecha =
    new Date(
      `${valor}T00:00:00.000Z`
    );


  if (
    Number.isNaN(
      fecha.getTime()
    )
  ) {
    return false;
  }


  return (
    fecha.toISOString()
      .slice(0, 10) === valor
  );
}


function textoFiltro(valor) {

  if (
    typeof valor !== 'string'
  ) {
    return '';
  }


  return valor.trim();
}


// ============================================================
// FORMATEAR DOCUMENTO
// ============================================================

function formatearDocumento(
  documento
) {

  return {

    id:
      documento.id,


    codigoInterno:
      documento.codigo_interno,


    numeroDocumento:
      documento.numero_documento,


    numeroExpediente:
      documento.numero_expediente,


    fechaEmision:
      documento.fecha_emision,


    fechaVencimiento:
      documento.fecha_vencimiento,


    estado:
      documento.estado,


    condicionRegistro:
      documento.condicion_registro,


    observaciones:
      documento.observaciones,


    tienda: {

      id:
        documento.tienda_id,

      nombre:
        documento.tienda_nombre
    },


    tipoDocumento: {

      id:
        documento.tipo_documento_id,

      nombre:
        documento.tipo_documento_nombre,

      categoria:
        documento.tipo_documento_categoria
    },


    entidadEmisora: {

      id:
        documento.entidad_emisora_id,

      nombre:
        documento.entidad_emisora_nombre
    },


    responsable: {

      id:
        documento.responsable_usuario_id,

      nombres:
        documento.responsable_nombres,

      apellidos:
        documento.responsable_apellidos
    },


    reglaVigencia: {

      id:
        documento.regla_vigencia_id,

      version:
        documento.regla_version,

      tipoVigencia:
        documento.tipo_vigencia,

      requiereRenovacion:
        documento.requiere_renovacion,

      umbralPorVencerDias:
        documento.umbral_por_vencer_dias,

      umbralCriticoDias:
        documento.umbral_critico_dias
    },


    fechaCreacion:
      documento.fecha_creacion,


    fechaActualizacion:
      documento.fecha_actualizacion
  };
}


// ============================================================
// LISTAR / BUSCAR / FILTRAR / PAGINAR DOCUMENTOS
// HU-023 + HU-025
// ============================================================

async function listarDocumentos(
  req,
  res
) {

  try {

    // ========================================================
    // RECALCULAR ESTADOS
    // ========================================================

    await recalcularEstadosDocumentos();


    // ========================================================
    // OBTENER FILTROS
    // ========================================================

    const busqueda =
      textoFiltro(
        req.query.q
      );


    const tipoDocumentoId =
      textoFiltro(
        req.query.tipoDocumentoId
      );


    const categoria =
      textoFiltro(
        req.query.categoria
      );


    const estado =
      textoFiltro(
        req.query.estado
      )
        .toUpperCase();


    const tiendaId =
      textoFiltro(
        req.query.tiendaId
      );


    const fechaDesde =
      textoFiltro(
        req.query.fechaDesde
      );


    const fechaHasta =
      textoFiltro(
        req.query.fechaHasta
      );


    const pagina =
      enteroPositivo(
        req.query.pagina,
        1
      );


    const limiteSolicitado =
      enteroPositivo(
        req.query.limite,
        10
      );


    // ========================================================
    // VALIDAR PAGINACIÓN
    // ========================================================

    if (
      pagina === null ||
      limiteSolicitado === null
    ) {

      return res.status(400).json({

        ok: false,

        mensaje:
          'Los parámetros de paginación no son válidos.'
      });
    }


    const limite =
      Math.min(
        limiteSolicitado,
        100
      );


    const offset =
      (pagina - 1) *
      limite;


    // ========================================================
    // VALIDAR TIPO DOCUMENTAL
    // ========================================================

    if (
      tipoDocumentoId &&
      !idValido(
        tipoDocumentoId
      )
    ) {

      return res.status(400).json({

        ok: false,

        mensaje:
          'El filtro de tipo de documento no es válido'
      });
    }


    // ========================================================
    // VALIDAR TIENDA
    // ========================================================

    if (
      tiendaId &&
      !idValido(
        tiendaId
      )
    ) {

      return res.status(400).json({

        ok: false,

        mensaje:
          'El filtro de tienda no es válido'
      });
    }


    // ========================================================
    // VALIDAR ESTADO
    // ========================================================

    const estadosPermitidos = [

      'VIGENTE',

      'POR_VENCER',

      'CRITICO',

      'VENCIDO',

      'EN_RENOVACION'
    ];


    if (
      estado &&
      !estadosPermitidos.includes(
        estado
      )
    ) {

      return res.status(400).json({

        ok: false,

        mensaje:
          'El estado seleccionado no es válido'
      });
    }


    // ========================================================
    // VALIDAR FECHAS
    // ========================================================

    if (
      fechaDesde &&
      !fechaValida(
        fechaDesde
      )
    ) {

      return res.status(400).json({

        ok: false,

        mensaje:
          'La fecha inicial no es válida'
      });
    }


    if (
      fechaHasta &&
      !fechaValida(
        fechaHasta
      )
    ) {

      return res.status(400).json({

        ok: false,

        mensaje:
          'La fecha final no es válida'
      });
    }


    if (
      fechaDesde &&
      fechaHasta &&
      fechaDesde > fechaHasta
    ) {

      return res.status(400).json({

        ok: false,

        mensaje:
          'La fecha inicial no puede ser posterior a la fecha final'
      });
    }


    // ========================================================
    // CONSTRUIR CONSULTA
    // ========================================================

    /*
     * HU-025
     *
     * Los documentos archivados o anulados
     * no forman parte del listado operativo.
     *
     * Permanecen almacenados en la base de datos.
     */

    const condiciones = [
      `d.condicion_registro = 'ACTIVO'`
    ];


    const parametros = [];


    // ========================================================
    // BÚSQUEDA GENERAL
    // ========================================================

    if (busqueda) {

      parametros.push(
        `%${busqueda}%`
      );


      const posicion =
        parametros.length;


      condiciones.push(
        `
          (
            d.codigo_interno ILIKE $${posicion}
            OR d.numero_documento ILIKE $${posicion}
            OR t.nombre ILIKE $${posicion}
            OR ee.nombre ILIKE $${posicion}
          )
        `
      );
    }


    // ========================================================
    // TIPO DOCUMENTO
    // ========================================================

    if (tipoDocumentoId) {

      parametros.push(
        Number(
          tipoDocumentoId
        )
      );


      condiciones.push(
        `d.tipo_documento_id = $${parametros.length}`
      );
    }


    // ========================================================
    // CATEGORÍA
    // ========================================================

    if (categoria) {

      parametros.push(
        categoria
      );


      condiciones.push(
        `LOWER(td.categoria) = LOWER($${parametros.length})`
      );
    }


    // ========================================================
    // ESTADO
    // ========================================================

    if (estado) {

      parametros.push(
        estado
      );


      condiciones.push(
        `d.estado = $${parametros.length}`
      );
    }


    // ========================================================
    // TIENDA
    // ========================================================

    if (tiendaId) {

      parametros.push(
        Number(
          tiendaId
        )
      );


      condiciones.push(
        `d.tienda_id = $${parametros.length}`
      );
    }


    // ========================================================
    // FECHA DESDE
    // ========================================================

    if (fechaDesde) {

      parametros.push(
        fechaDesde
      );


      condiciones.push(
        `d.fecha_vencimiento >= $${parametros.length}::date`
      );
    }


    // ========================================================
    // FECHA HASTA
    // ========================================================

    if (fechaHasta) {

      parametros.push(
        fechaHasta
      );


      condiciones.push(
        `d.fecha_vencimiento <= $${parametros.length}::date`
      );
    }


    const where =
      `WHERE ${condiciones.join(
        '\n AND '
      )}`;


    // ========================================================
    // CONTAR RESULTADOS
    // ========================================================

    const resultadoTotal =
      await pool.query(
        `
          SELECT

            COUNT(*)::int AS total

          FROM documentos d

          INNER JOIN tiendas t
            ON t.id =
               d.tienda_id

          INNER JOIN tipos_documento td
            ON td.id =
               d.tipo_documento_id

          INNER JOIN entidades_emisoras ee
            ON ee.id =
               d.entidad_emisora_id

          ${where};
        `,
        parametros
      );


    const total =
      Number(
        resultadoTotal.rows[0]?.total ||
        0
      );


    const totalPaginas =
      total === 0
        ? 0
        : Math.ceil(
            total /
            limite
          );


    // ========================================================
    // PREPARAR LIMIT Y OFFSET
    // ========================================================

    const parametrosConsulta = [

      ...parametros,

      limite,

      offset
    ];


    const posicionLimite =
      parametros.length + 1;


    const posicionOffset =
      parametros.length + 2;


    // ========================================================
    // CONSULTAR DOCUMENTOS
    // ========================================================

    const resultado =
      await pool.query(
        `
          SELECT

            d.id,

            d.codigo_interno,

            d.numero_documento,

            d.numero_expediente,

            d.fecha_emision,

            d.fecha_vencimiento,

            d.estado,

            d.condicion_registro,

            d.observaciones,

            d.fecha_creacion,

            d.fecha_actualizacion,


            t.id
              AS tienda_id,

            t.nombre
              AS tienda_nombre,


            td.id
              AS tipo_documento_id,

            td.nombre
              AS tipo_documento_nombre,

            td.categoria
              AS tipo_documento_categoria,


            ee.id
              AS entidad_emisora_id,

            ee.nombre
              AS entidad_emisora_nombre,


            u.id
              AS responsable_usuario_id,

            u.nombres
              AS responsable_nombres,

            u.apellidos
              AS responsable_apellidos,


            r.id
              AS regla_vigencia_id,

            r.version
              AS regla_version,

            r.tipo_vigencia,

            r.requiere_renovacion,

            r.umbral_por_vencer_dias,

            r.umbral_critico_dias


          FROM documentos d


          INNER JOIN tiendas t
            ON t.id =
               d.tienda_id


          INNER JOIN tipos_documento td
            ON td.id =
               d.tipo_documento_id


          INNER JOIN entidades_emisoras ee
            ON ee.id =
               d.entidad_emisora_id


          INNER JOIN usuarios u
            ON u.id =
               d.responsable_usuario_id


          INNER JOIN
            tipo_documento_reglas_vigencia r

            ON r.id =
               d.regla_vigencia_id


          ${where}


          ORDER BY

            d.fecha_vencimiento
              ASC NULLS LAST,

            d.id DESC


          LIMIT $${posicionLimite}

          OFFSET $${posicionOffset};
        `,
        parametrosConsulta
      );


    const documentos =
      resultado.rows.map(
        formatearDocumento
      );


    // ========================================================
    // RESPUESTA
    // ========================================================

    return res.status(200).json({

      ok: true,

      total,

      pagina,

      limite,

      totalPaginas,

      documentos,

      filtros: {

        q:
          busqueda ||
          null,

        tipoDocumentoId:
          tipoDocumentoId
            ? Number(
                tipoDocumentoId
              )
            : null,

        categoria:
          categoria ||
          null,

        estado:
          estado ||
          null,

        tiendaId:
          tiendaId
            ? Number(
                tiendaId
              )
            : null,

        fechaDesde:
          fechaDesde ||
          null,

        fechaHasta:
          fechaHasta ||
          null
      }
    });


  } catch (error) {

    console.error(
      'Error al consultar documentos:',
      error
    );


    return res.status(500).json({

      ok: false,

      mensaje:
        'Error interno del servidor'
    });
  }
}


// ============================================================
// EXPORTAR
// ============================================================

module.exports = {
  listarDocumentos
};