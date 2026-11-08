const pool = require('../config/database');

const {
  registrarEvento
} = require('../services/auditoria.service');

const {
  calcularEstadoVigencia
} = require('../services/vigenciaDocumentos.service');


// ============================================================
// UTILIDADES
// ============================================================

function idValido(valor) {
  const numero = Number(valor);

  return (
    Number.isInteger(numero) &&
    numero > 0
  );
}


function textoValido(valor) {
  return (
    typeof valor === 'string' &&
    valor.trim().length > 0
  );
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

  return !Number.isNaN(
    fecha.getTime()
  );
}


function fechaAString(fecha) {
  return fecha
    .toISOString()
    .slice(0, 10);
}


// ============================================================
// SUMAR DÍAS
// ============================================================

function sumarDias(
  fechaTexto,
  cantidad
) {
  const fecha =
    new Date(
      `${fechaTexto}T00:00:00.000Z`
    );

  fecha.setUTCDate(
    fecha.getUTCDate() +
    cantidad
  );

  return fechaAString(
    fecha
  );
}


// ============================================================
// SUMAR MESES
//
// Se controla el último día del mes.
//
// Ejemplo:
// 31/01 + 1 mes
// → 28/02 o 29/02
// ============================================================

function sumarMeses(
  fechaTexto,
  cantidad
) {
  const fecha =
    new Date(
      `${fechaTexto}T00:00:00.000Z`
    );

  const diaOriginal =
    fecha.getUTCDate();

  const anioOriginal =
    fecha.getUTCFullYear();

  const mesOriginal =
    fecha.getUTCMonth();

  const primerDiaMesDestino =
    new Date(
      Date.UTC(
        anioOriginal,
        mesOriginal + cantidad,
        1
      )
    );

  const anioDestino =
    primerDiaMesDestino
      .getUTCFullYear();

  const mesDestino =
    primerDiaMesDestino
      .getUTCMonth();

  const ultimoDiaMesDestino =
    new Date(
      Date.UTC(
        anioDestino,
        mesDestino + 1,
        0
      )
    ).getUTCDate();

  primerDiaMesDestino.setUTCDate(
    Math.min(
      diaOriginal,
      ultimoDiaMesDestino
    )
  );

  return fechaAString(
    primerDiaMesDestino
  );
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

    tiendaId:
      documento.tienda_id,

    tipoDocumentoId:
      documento.tipo_documento_id,

    entidadEmisoraId:
      documento.entidad_emisora_id,

    reglaVigenciaId:
      documento.regla_vigencia_id,

    numeroDocumento:
      documento.numero_documento,

    numeroExpediente:
      documento.numero_expediente,

    fechaEmision:
      documento.fecha_emision,

    fechaVencimiento:
      documento.fecha_vencimiento,

    responsableUsuarioId:
      documento.responsable_usuario_id,

    registradoPor:
      documento.registrado_por,

    estado:
      documento.estado,

    observaciones:
      documento.observaciones,

    fechaCreacion:
      documento.fecha_creacion,

    fechaActualizacion:
      documento.fecha_actualizacion
  };
}


// ============================================================
// REGISTRAR DOCUMENTO
// ============================================================

async function registrarDocumento(
  req,
  res
) {
  let cliente;

  try {
    cliente =
      await pool.connect();

    const usuarioId =
      req.usuario.usuarioId;

    const {
      tiendaId,
      tipoDocumentoId,
      entidadEmisoraId,
      numeroDocumento,
      numeroExpediente,
      fechaEmision,
      fechaVencimiento,
      responsableUsuarioId,
      observaciones
    } = req.body;


    // ========================================================
    // VALIDACIONES BÁSICAS
    // ========================================================

    if (
      !idValido(tiendaId) ||
      !idValido(tipoDocumentoId) ||
      !idValido(entidadEmisoraId) ||
      !idValido(responsableUsuarioId)
    ) {
      return res.status(400).json({
        ok: false,
        mensaje:
          'Tienda, tipo documental, entidad emisora y responsable son obligatorios'
      });
    }


    if (
      !textoValido(
        numeroDocumento
      )
    ) {
      return res.status(400).json({
        ok: false,
        mensaje:
          'El número de documento es obligatorio'
      });
    }


    if (
      !fechaValida(
        fechaEmision
      )
    ) {
      return res.status(400).json({
        ok: false,
        mensaje:
          'La fecha de emisión no es válida'
      });
    }


    if (
      numeroExpediente !== undefined &&
      numeroExpediente !== null &&
      numeroExpediente !== '' &&
      !textoValido(
        numeroExpediente
      )
    ) {
      return res.status(400).json({
        ok: false,
        mensaje:
          'El número de expediente no es válido'
      });
    }


    if (
      observaciones !== undefined &&
      observaciones !== null &&
      typeof observaciones !== 'string'
    ) {
      return res.status(400).json({
        ok: false,
        mensaje:
          'Las observaciones no son válidas'
      });
    }


    await cliente.query(
      'BEGIN'
    );


    // ========================================================
    // VALIDAR TIENDA
    // ========================================================

    const tiendaResultado =
      await cliente.query(
        `
          SELECT
            id,
            activo

          FROM tiendas

          WHERE id = $1

          LIMIT 1;
        `,
        [
          tiendaId
        ]
      );


    if (
      tiendaResultado.rowCount === 0
    ) {
      await cliente.query(
        'ROLLBACK'
      );

      return res.status(404).json({
        ok: false,
        mensaje:
          'La tienda seleccionada no existe'
      });
    }


    if (
      !tiendaResultado.rows[0].activo
    ) {
      await cliente.query(
        'ROLLBACK'
      );

      return res.status(400).json({
        ok: false,
        mensaje:
          'No se pueden registrar documentos para una tienda inactiva'
      });
    }


    // ========================================================
    // VALIDAR TIPO DE DOCUMENTO
    // ========================================================

    const tipoResultado =
      await cliente.query(
        `
          SELECT
            id,
            nombre,
            activo

          FROM tipos_documento

          WHERE id = $1

          LIMIT 1;
        `,
        [
          tipoDocumentoId
        ]
      );


    if (
      tipoResultado.rowCount === 0
    ) {
      await cliente.query(
        'ROLLBACK'
      );

      return res.status(404).json({
        ok: false,
        mensaje:
          'El tipo de documento seleccionado no existe'
      });
    }


    if (
      !tipoResultado.rows[0].activo
    ) {
      await cliente.query(
        'ROLLBACK'
      );

      return res.status(400).json({
        ok: false,
        mensaje:
          'No se puede utilizar un tipo documental inactivo'
      });
    }


    // ========================================================
    // VALIDAR ENTIDAD EMISORA
    // ========================================================

    const entidadResultado =
      await cliente.query(
        `
          SELECT
            id,
            nombre,
            activo

          FROM entidades_emisoras

          WHERE id = $1

          LIMIT 1;
        `,
        [
          entidadEmisoraId
        ]
      );


    if (
      entidadResultado.rowCount === 0
    ) {
      await cliente.query(
        'ROLLBACK'
      );

      return res.status(404).json({
        ok: false,
        mensaje:
          'La entidad emisora seleccionada no existe'
      });
    }


    if (
      !entidadResultado.rows[0].activo
    ) {
      await cliente.query(
        'ROLLBACK'
      );

      return res.status(400).json({
        ok: false,
        mensaje:
          'No se puede utilizar una entidad emisora inactiva'
      });
    }


    // ========================================================
    // VALIDAR RESPONSABLE
    // ========================================================

    const responsableResultado =
      await cliente.query(
        `
          SELECT id

          FROM usuarios

          WHERE id = $1

          LIMIT 1;
        `,
        [
          responsableUsuarioId
        ]
      );


    if (
      responsableResultado.rowCount === 0
    ) {
      await cliente.query(
        'ROLLBACK'
      );

      return res.status(404).json({
        ok: false,
        mensaje:
          'El usuario responsable seleccionado no existe'
      });
    }


    // ========================================================
    // OBTENER REGLA ACTUAL
    //
    // La regla NO se recibe desde el frontend.
    // CERTIIA selecciona automáticamente la versión vigente.
    // ========================================================

    const reglaResultado =
      await cliente.query(
        `
          SELECT
            id,
            version,
            tipo_vigencia,
            duracion_valor,
            duracion_unidad,
            requiere_renovacion,
            umbral_por_vencer_dias,
            umbral_critico_dias

          FROM tipo_documento_reglas_vigencia

          WHERE
            tipo_documento_id = $1
            AND es_actual = TRUE

          LIMIT 1;
        `,
        [
          tipoDocumentoId
        ]
      );


    if (
      reglaResultado.rowCount === 0
    ) {
      await cliente.query(
        'ROLLBACK'
      );

      return res.status(400).json({
        ok: false,
        mensaje:
          'El tipo documental seleccionado todavía no tiene una regla de vigencia configurada'
      });
    }


    const regla =
      reglaResultado.rows[0];


    // ========================================================
    // DETERMINAR FECHA DE VENCIMIENTO
    // ========================================================

    let fechaVencimientoFinal =
      null;


    // --------------------------------------------------------
    // DETERMINADA
    // --------------------------------------------------------

    if (
      regla.tipo_vigencia ===
      'DETERMINADA'
    ) {
      if (
        regla.duracion_unidad ===
        'DIAS'
      ) {
        fechaVencimientoFinal =
          sumarDias(
            fechaEmision,
            regla.duracion_valor
          );
      }


      if (
        regla.duracion_unidad ===
        'MESES'
      ) {
        fechaVencimientoFinal =
          sumarMeses(
            fechaEmision,
            regla.duracion_valor
          );
      }
    }


    // --------------------------------------------------------
    // TEMPORAL
    // --------------------------------------------------------

    if (
      regla.tipo_vigencia ===
      'TEMPORAL'
    ) {
      if (
        !fechaValida(
          fechaVencimiento
        )
      ) {
        await cliente.query(
          'ROLLBACK'
        );

        return res.status(400).json({
          ok: false,
          mensaje:
            'La fecha de vencimiento es obligatoria para documentos con vigencia temporal'
        });
      }


      if (
        fechaVencimiento <
        fechaEmision
      ) {
        await cliente.query(
          'ROLLBACK'
        );

        return res.status(400).json({
          ok: false,
          mensaje:
            'La fecha de vencimiento no puede ser anterior a la fecha de emisión'
        });
      }


      fechaVencimientoFinal =
        fechaVencimiento;
    }


    // --------------------------------------------------------
    // INDETERMINADA
    // --------------------------------------------------------

    if (
      regla.tipo_vigencia ===
      'INDETERMINADA'
    ) {
      fechaVencimientoFinal =
        null;
    }


    // ========================================================
    // CALCULAR ESTADO INICIAL
    //
    // El estado se calcula en backend utilizando la regla
    // asociada al tipo documental.
    //
    // El frontend NO puede establecer este estado.
    // ========================================================

    const resultadoVigencia =
      calcularEstadoVigencia({
        tipoVigencia:
          regla.tipo_vigencia,

        fechaVencimiento:
          fechaVencimientoFinal,

        umbralPorVencerDias:
          regla.umbral_por_vencer_dias,

        umbralCriticoDias:
          regla.umbral_critico_dias,

        enRenovacion:
          false
      });


    const estadoInicial =
      resultadoVigencia.estado;


    // ========================================================
    // GENERAR ID Y CÓDIGO INTERNO
    // ========================================================

    const secuenciaResultado =
      await cliente.query(
        `
          SELECT nextval(
            pg_get_serial_sequence(
              'documentos',
              'id'
            )
          ) AS id;
        `
      );


    const documentoId =
      Number(
        secuenciaResultado.rows[0].id
      );


    const codigoInterno =
      `DOC-${String(
        documentoId
      ).padStart(
        6,
        '0'
      )}`;


    // ========================================================
    // REGISTRAR DOCUMENTO
    // ========================================================

    const resultado =
      await cliente.query(
        `
          INSERT INTO documentos (
            id,
            codigo_interno,
            tienda_id,
            tipo_documento_id,
            entidad_emisora_id,
            regla_vigencia_id,
            numero_documento,
            numero_expediente,
            fecha_emision,
            fecha_vencimiento,
            responsable_usuario_id,
            registrado_por,
            estado,
            observaciones
          )

          VALUES (
            $1,
            $2,
            $3,
            $4,
            $5,
            $6,
            $7,
            $8,
            $9,
            $10,
            $11,
            $12,
            $13,
            $14
          )

          RETURNING
            id,
            codigo_interno,
            tienda_id,
            tipo_documento_id,
            entidad_emisora_id,
            regla_vigencia_id,
            numero_documento,
            numero_expediente,
            fecha_emision,
            fecha_vencimiento,
            responsable_usuario_id,
            registrado_por,
            estado,
            observaciones,
            fecha_creacion,
            fecha_actualizacion;
        `,
        [
          documentoId,
          codigoInterno,
          tiendaId,
          tipoDocumentoId,
          entidadEmisoraId,
          regla.id,
          numeroDocumento.trim(),

          textoValido(
            numeroExpediente
          )
            ? numeroExpediente.trim()
            : null,

          fechaEmision,
          fechaVencimientoFinal,
          responsableUsuarioId,
          usuarioId,
          estadoInicial,

          textoValido(
            observaciones
          )
            ? observaciones.trim()
            : null
        ]
      );


    await cliente.query(
      'COMMIT'
    );


    const documento =
      resultado.rows[0];


    // ========================================================
    // AUDITORÍA
    // ========================================================

    await registrarEvento({
      usuarioId,

      evento:
        'DOCUMENTO_REGISTRADO',

      modulo:
        'DOCUMENTOS',

      descripcion:
        `Se registró el documento ${codigoInterno}, número ${documento.numero_documento}, tipo documental ID ${tipoDocumentoId}, tienda ID ${tiendaId}, utilizando la regla de vigencia versión ${regla.version}`,

      ip:
        req.ip,

      userAgent:
        req.headers['user-agent']
    });


    return res.status(201).json({
      ok: true,

      mensaje:
        'Documento registrado correctamente',

      documento:
        formatearDocumento(
          documento
        ),

      vigenciaAplicada: {
        reglaId:
          regla.id,

        version:
          regla.version,

        tipoVigencia:
          regla.tipo_vigencia
      }
    });

  } catch (error) {
    if (cliente) {
      try {
        await cliente.query(
          'ROLLBACK'
        );
      } catch {
        // La transacción podría haberse confirmado.
      }
    }


    console.error(
      'Error al registrar documento:',
      error.message
    );


    if (
      error.code === '23505'
    ) {
      return res.status(409).json({
        ok: false,
        mensaje:
          'Ya existe un documento con el código interno indicado'
      });
    }


    if (
      error.code === '23503'
    ) {
      return res.status(400).json({
        ok: false,
        mensaje:
          'Una de las referencias seleccionadas ya no es válida'
      });
    }


    if (
      error.code === '23514'
    ) {
      return res.status(400).json({
        ok: false,
        mensaje:
          'Los datos del documento no cumplen las reglas de validación'
      });
    }


    return res.status(500).json({
      ok: false,
      mensaje:
        'Error interno del servidor'
    });

  } finally {
    if (cliente) {
      cliente.release();
    }
  }
}


// ============================================================
// EXPORTAR
// ============================================================

module.exports = {
  registrarDocumento
};