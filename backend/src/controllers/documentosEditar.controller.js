const pool = require('../config/database');

const {
  registrarEvento
} = require('../services/auditoria.service');

const {
  calcularEstadoVigencia
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


function normalizarFecha(valor) {
  if (!valor) {
    return null;
  }

  if (
    valor instanceof Date
  ) {
    return valor
      .toISOString()
      .slice(0, 10);
  }

  return String(valor)
    .slice(0, 10);
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
      Number(cantidad)
  );

  return fechaAString(
    fecha
  );
}


// ============================================================
// SUMAR MESES
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
        mesOriginal +
          Number(cantidad),
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


  primerDiaMesDestino
    .setUTCDate(
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
// FORMATEAR DATOS DE AUDITORÍA
// ============================================================

function datosAuditoria(
  documento
) {
  return {
    numeroDocumento:
      documento.numero_documento,

    numeroExpediente:
      documento.numero_expediente,

    entidadEmisoraId:
      documento.entidad_emisora_id,

    fechaEmision:
      normalizarFecha(
        documento.fecha_emision
      ),

    fechaVencimiento:
      normalizarFecha(
        documento.fecha_vencimiento
      ),

    responsableUsuarioId:
      documento.responsable_usuario_id,

    estado:
      documento.estado,

    observaciones:
      documento.observaciones
  };
}


// ============================================================
// EDITAR DOCUMENTO
// ============================================================

async function editarDocumento(
  req,
  res
) {
  let cliente;

  try {

    const documentoId =
      Number(
        req.params.id
      );


    const usuarioId =
      req.usuario.usuarioId;


    // ========================================================
    // VALIDAR ID
    // ========================================================

    if (
      !idValido(
        documentoId
      )
    ) {
      return res.status(400).json({
        ok: false,
        mensaje:
          'El identificador del documento no es válido'
      });
    }


    // ========================================================
    // CAMPOS AUTORIZADOS
    // ========================================================

    const camposPermitidos =
      new Set([
        'numeroDocumento',
        'numeroExpediente',
        'entidadEmisoraId',
        'fechaEmision',
        'fechaVencimiento',
        'responsableUsuarioId',
        'observaciones'
      ]);


    const camposRecibidos =
      Object.keys(
        req.body || {}
      );


    if (
      camposRecibidos.length ===
      0
    ) {
      return res.status(400).json({
        ok: false,
        mensaje:
          'No se enviaron datos para actualizar'
      });
    }


    const camposNoPermitidos =
      camposRecibidos.filter(
        (campo) =>
          !camposPermitidos.has(
            campo
          )
      );


    if (
      camposNoPermitidos.length >
      0
    ) {
      return res.status(400).json({
        ok: false,
        mensaje:
          `No está permitido modificar: ${camposNoPermitidos.join(', ')}`
      });
    }


    cliente =
      await pool.connect();


    await cliente.query(
      'BEGIN'
    );


    // ========================================================
    // OBTENER DOCUMENTO Y REGLA HISTÓRICA
    // ========================================================

    const resultadoActual =
      await cliente.query(
        `
          SELECT
            d.id,
            d.codigo_interno,
            d.tienda_id,
            d.tipo_documento_id,
            d.entidad_emisora_id,
            d.regla_vigencia_id,
            d.numero_documento,
            d.numero_expediente,
            d.fecha_emision,
            d.fecha_vencimiento,
            d.responsable_usuario_id,
            d.registrado_por,
            d.estado,
            d.observaciones,
            d.fecha_creacion,
            d.fecha_actualizacion,

            r.version
              AS regla_version,

            r.tipo_vigencia,

            r.duracion_valor,

            r.duracion_unidad,

            r.requiere_renovacion,

            r.umbral_por_vencer_dias,

            r.umbral_critico_dias

          FROM documentos d

          INNER JOIN
            tipo_documento_reglas_vigencia r
            ON r.id =
               d.regla_vigencia_id

          WHERE d.id = $1

          FOR UPDATE OF d;
        `,
        [
          documentoId
        ]
      );


    if (
      resultadoActual.rowCount ===
      0
    ) {
      await cliente.query(
        'ROLLBACK'
      );

      return res.status(404).json({
        ok: false,
        mensaje:
          'Documento no encontrado'
      });
    }


    const actual =
      resultadoActual.rows[0];


    const anteriores =
      datosAuditoria(
        actual
      );


    // ========================================================
    // PREPARAR VALORES
    // ========================================================

    const tieneCampo =
      (campo) =>
        Object.prototype
          .hasOwnProperty
          .call(
            req.body,
            campo
          );


    const numeroDocumento =
      tieneCampo(
        'numeroDocumento'
      )
        ? req.body
            .numeroDocumento
        : actual
            .numero_documento;


    const numeroExpediente =
      tieneCampo(
        'numeroExpediente'
      )
        ? req.body
            .numeroExpediente
        : actual
            .numero_expediente;


    const entidadEmisoraId =
      tieneCampo(
        'entidadEmisoraId'
      )
        ? Number(
            req.body
              .entidadEmisoraId
          )
        : Number(
            actual
              .entidad_emisora_id
          );


    const fechaEmision =
      tieneCampo(
        'fechaEmision'
      )
        ? req.body
            .fechaEmision
        : normalizarFecha(
            actual
              .fecha_emision
          );


    let fechaVencimiento =
      tieneCampo(
        'fechaVencimiento'
      )
        ? req.body
            .fechaVencimiento
        : normalizarFecha(
            actual
              .fecha_vencimiento
          );


    const responsableUsuarioId =
      tieneCampo(
        'responsableUsuarioId'
      )
        ? Number(
            req.body
              .responsableUsuarioId
          )
        : Number(
            actual
              .responsable_usuario_id
          );


    const observaciones =
      tieneCampo(
        'observaciones'
      )
        ? req.body
            .observaciones
        : actual
            .observaciones;


    // ========================================================
    // VALIDAR NÚMERO
    // ========================================================

    if (
      !textoValido(
        numeroDocumento
      )
    ) {
      await cliente.query(
        'ROLLBACK'
      );

      return res.status(400).json({
        ok: false,
        mensaje:
          'El número de documento es obligatorio'
      });
    }


    // ========================================================
    // VALIDAR EXPEDIENTE
    // ========================================================

    if (
      numeroExpediente !== null &&
      numeroExpediente !== undefined &&
      numeroExpediente !== '' &&
      !textoValido(
        numeroExpediente
      )
    ) {
      await cliente.query(
        'ROLLBACK'
      );

      return res.status(400).json({
        ok: false,
        mensaje:
          'El número de expediente no es válido'
      });
    }


    // ========================================================
    // VALIDAR FECHA EMISIÓN
    // ========================================================

    if (
      !fechaValida(
        fechaEmision
      )
    ) {
      await cliente.query(
        'ROLLBACK'
      );

      return res.status(400).json({
        ok: false,
        mensaje:
          'La fecha de emisión no es válida'
      });
    }


    // ========================================================
    // VALIDAR OBSERVACIONES
    // ========================================================

    if (
      observaciones !== null &&
      observaciones !== undefined &&
      typeof observaciones !==
        'string'
    ) {
      await cliente.query(
        'ROLLBACK'
      );

      return res.status(400).json({
        ok: false,
        mensaje:
          'Las observaciones no son válidas'
      });
    }


    // ========================================================
    // VALIDAR ENTIDAD SI CAMBIÓ
    // ========================================================

    if (
      entidadEmisoraId !==
      Number(
        actual
          .entidad_emisora_id
      )
    ) {

      if (
        !idValido(
          entidadEmisoraId
        )
      ) {
        await cliente.query(
          'ROLLBACK'
        );

        return res.status(400).json({
          ok: false,
          mensaje:
            'La entidad emisora no es válida'
        });
      }


      const entidadResultado =
        await cliente.query(
          `
            SELECT
              id,
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
        entidadResultado.rowCount ===
        0
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
        !entidadResultado
          .rows[0]
          .activo
      ) {
        await cliente.query(
          'ROLLBACK'
        );

        return res.status(400).json({
          ok: false,
          mensaje:
            'No se puede asignar una entidad emisora inactiva'
        });
      }
    }


    // ========================================================
    // VALIDAR RESPONSABLE SI CAMBIÓ
    // ========================================================

    if (
      responsableUsuarioId !==
      Number(
        actual
          .responsable_usuario_id
      )
    ) {

      if (
        !idValido(
          responsableUsuarioId
        )
      ) {
        await cliente.query(
          'ROLLBACK'
        );

        return res.status(400).json({
          ok: false,
          mensaje:
            'El responsable seleccionado no es válido'
        });
      }


      const responsableResultado =
        await cliente.query(
          `
            SELECT
              id,
              activo

            FROM usuarios

            WHERE id = $1

            LIMIT 1;
          `,
          [
            responsableUsuarioId
          ]
        );


      if (
        responsableResultado.rowCount ===
        0
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


      if (
        !responsableResultado
          .rows[0]
          .activo
      ) {
        await cliente.query(
          'ROLLBACK'
        );

        return res.status(400).json({
          ok: false,
          mensaje:
            'No se puede asignar un usuario inactivo como responsable'
        });
      }
    }


    // ========================================================
    // RECALCULAR VENCIMIENTO SEGÚN REGLA HISTÓRICA
    // ========================================================

    if (
      actual.tipo_vigencia ===
      'DETERMINADA'
    ) {

      if (
        actual.duracion_unidad ===
        'DIAS'
      ) {
        fechaVencimiento =
          sumarDias(
            fechaEmision,
            actual
              .duracion_valor
          );
      }


      if (
        actual.duracion_unidad ===
        'MESES'
      ) {
        fechaVencimiento =
          sumarMeses(
            fechaEmision,
            actual
              .duracion_valor
          );
      }
    }


    if (
      actual.tipo_vigencia ===
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
            'La fecha de vencimiento es obligatoria para un documento con vigencia temporal'
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
    }


    if (
      actual.tipo_vigencia ===
      'INDETERMINADA'
    ) {
      fechaVencimiento =
        null;
    }


    // ========================================================
    // CALCULAR NUEVO ESTADO
    // ========================================================

    const resultadoVigencia =
      calcularEstadoVigencia({
        tipoVigencia:
          actual
            .tipo_vigencia,

        fechaVencimiento,

        umbralPorVencerDias:
          actual
            .umbral_por_vencer_dias,

        umbralCriticoDias:
          actual
            .umbral_critico_dias,

        enRenovacion:
          actual.estado ===
          'EN_RENOVACION'
      });


    const nuevoEstado =
      resultadoVigencia.estado;


    // ========================================================
    // ACTUALIZAR
    // ========================================================

    const resultadoActualizado =
      await cliente.query(
        `
          UPDATE documentos

          SET
            numero_documento = $1,
            numero_expediente = $2,
            entidad_emisora_id = $3,
            fecha_emision = $4,
            fecha_vencimiento = $5,
            responsable_usuario_id = $6,
            observaciones = $7,
            estado = $8,
            fecha_actualizacion = NOW()

          WHERE id = $9

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
          numeroDocumento.trim(),

          textoValido(
            numeroExpediente
          )
            ? numeroExpediente.trim()
            : null,

          entidadEmisoraId,

          fechaEmision,

          fechaVencimiento,

          responsableUsuarioId,

          textoValido(
            observaciones
          )
            ? observaciones.trim()
            : null,

          nuevoEstado,

          documentoId
        ]
      );


    const actualizado =
      resultadoActualizado
        .rows[0];


    await cliente.query(
      'COMMIT'
    );


    // ========================================================
    // AUDITORÍA ANTES / DESPUÉS
    // ========================================================

    await registrarEvento({
      usuarioId,

      evento:
        'DOCUMENTO_EDITADO',

      modulo:
        'DOCUMENTOS',

      descripcion:
        `Se editaron datos autorizados del documento ${actual.codigo_interno}`,

      entidad:
        'documentos',

      registroId:
        documentoId,

      datosAnteriores:
        anteriores,

      datosNuevos:
        datosAuditoria(
          actualizado
        ),

      ip:
        req.ip,

      userAgent:
        req.headers[
          'user-agent'
        ]
    });


    // ========================================================
    // RESPUESTA
    // ========================================================

    return res.status(200).json({
      ok: true,

      mensaje:
        'Documento actualizado correctamente',

      documento: {
        id:
          actualizado.id,

        codigoInterno:
          actualizado
            .codigo_interno,

        tiendaId:
          actualizado
            .tienda_id,

        tipoDocumentoId:
          actualizado
            .tipo_documento_id,

        entidadEmisoraId:
          actualizado
            .entidad_emisora_id,

        reglaVigenciaId:
          actualizado
            .regla_vigencia_id,

        numeroDocumento:
          actualizado
            .numero_documento,

        numeroExpediente:
          actualizado
            .numero_expediente,

        fechaEmision:
          actualizado
            .fecha_emision,

        fechaVencimiento:
          actualizado
            .fecha_vencimiento,

        responsableUsuarioId:
          actualizado
            .responsable_usuario_id,

        estado:
          actualizado.estado,

        observaciones:
          actualizado
            .observaciones,

        fechaActualizacion:
          actualizado
            .fecha_actualizacion
      }
    });

  } catch (error) {

    if (cliente) {
      try {
        await cliente.query(
          'ROLLBACK'
        );
      } catch {
        // Puede que la transacción
        // ya haya sido confirmada.
      }
    }


    console.error(
      'Error al editar documento:',
      error
    );


    if (
      error.code === '23503'
    ) {
      return res.status(400).json({
        ok: false,
        mensaje:
          'Una de las referencias seleccionadas no es válida'
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
  editarDocumento
};