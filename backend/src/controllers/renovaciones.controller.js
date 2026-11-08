const pool =
  require('../config/database');

const {
  registrarEvento
} = require(
  '../services/auditoria.service'
);

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

  if (
    Number.isNaN(
      fecha.getTime()
    )
  ) {
    return false;
  }

  return (
    fecha
      .toISOString()
      .slice(0, 10) === valor
  );
}


function fechaAString(fecha) {

  return fecha
    .toISOString()
    .slice(0, 10);
}


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


  const primerDiaDestino =
    new Date(
      Date.UTC(
        anioOriginal,
        mesOriginal +
          Number(cantidad),
        1
      )
    );


  const anioDestino =
    primerDiaDestino
      .getUTCFullYear();

  const mesDestino =
    primerDiaDestino
      .getUTCMonth();


  const ultimoDiaDestino =
    new Date(
      Date.UTC(
        anioDestino,
        mesDestino + 1,
        0
      )
    )
      .getUTCDate();


  primerDiaDestino.setUTCDate(
    Math.min(
      diaOriginal,
      ultimoDiaDestino
    )
  );


  return fechaAString(
    primerDiaDestino
  );
}


// ============================================================
// HU-031
// INICIAR RENOVACIÓN
// ============================================================

async function iniciarRenovacion(
  req,
  res
) {

  const cliente =
    await pool.connect();

  try {

    const usuarioId =
      req.usuario?.usuarioId;


    if (
      !usuarioId ||
      !idValido(usuarioId)
    ) {

      return res.status(401).json({
        ok: false,
        mensaje:
          'Usuario no autenticado'
      });
    }


    const {
      documentoId,
      tramiteId,
      responsableUsuarioId,
      fechaInicio,
      observaciones
    } = req.body;


    // ========================================================
    // VALIDACIONES
    // ========================================================

    if (
      !idValido(documentoId)
    ) {

      return res.status(400).json({
        ok: false,
        mensaje:
          'El documento es obligatorio y debe ser válido'
      });
    }


    if (
      !idValido(
        responsableUsuarioId
      )
    ) {

      return res.status(400).json({
        ok: false,
        mensaje:
          'El responsable es obligatorio y debe ser válido'
      });
    }


    if (
      !fechaValida(fechaInicio)
    ) {

      return res.status(400).json({
        ok: false,
        mensaje:
          'La fecha de inicio no es válida'
      });
    }


    const tramiteNormalizado =
      tramiteId === null ||
      tramiteId === undefined ||
      tramiteId === ''
        ? null
        : Number(tramiteId);


    if (
      tramiteNormalizado !== null &&
      !idValido(
        tramiteNormalizado
      )
    ) {

      return res.status(400).json({
        ok: false,
        mensaje:
          'El trámite asociado no es válido'
      });
    }


    const observacionesLimpias =
      typeof observaciones === 'string'
        ? observaciones.trim()
        : '';


    if (
      observacionesLimpias.length >
      1500
    ) {

      return res.status(400).json({
        ok: false,
        mensaje:
          'Las observaciones no pueden superar 1500 caracteres'
      });
    }


    await cliente.query(
      'BEGIN'
    );


    // ========================================================
    // DOCUMENTO
    // ========================================================

    const resultadoDocumento =
      await cliente.query(
        `
          SELECT
            d.id,
            d.codigo_interno,
            d.numero_documento,
            d.estado,
            d.condicion_registro,
            d.tipo_documento_id,

            rv.requiere_renovacion

          FROM documentos d

          INNER JOIN
            tipo_documento_reglas_vigencia rv

            ON rv.id =
               d.regla_vigencia_id

          WHERE d.id = $1

          LIMIT 1

          FOR UPDATE OF d;
        `,
        [
          Number(documentoId)
        ]
      );


    if (
      resultadoDocumento.rowCount === 0
    ) {

      await cliente.query(
        'ROLLBACK'
      );

      return res.status(404).json({
        ok: false,
        mensaje:
          'El documento no existe'
      });
    }


    const documento =
      resultadoDocumento.rows[0];


    // ========================================================
    // DOCUMENTO ACTIVO
    // ========================================================

    if (
      documento.condicion_registro !==
      'ACTIVO'
    ) {

      await cliente.query(
        'ROLLBACK'
      );

      return res.status(409).json({
        ok: false,
        mensaje:
          'No se puede renovar un documento archivado o anulado'
      });
    }


    // ========================================================
    // DOCUMENTO RENOVABLE
    // ========================================================

    if (
      documento.requiere_renovacion !==
      true
    ) {

      await cliente.query(
        'ROLLBACK'
      );

      return res.status(409).json({
        ok: false,
        mensaje:
          'El tipo de documento no está configurado para renovación'
      });
    }


    // ========================================================
    // EVITAR RENOVACIÓN DUPLICADA
    // ========================================================

    const resultadoRenovacionActiva =
      await cliente.query(
        `
          SELECT
            id

          FROM renovaciones

          WHERE
            documento_anterior_id = $1
            AND estado = 'EN_PROCESO'

          LIMIT 1;
        `,
        [
          Number(documentoId)
        ]
      );


    if (
      resultadoRenovacionActiva.rowCount >
      0
    ) {

      await cliente.query(
        'ROLLBACK'
      );

      return res.status(409).json({
        ok: false,
        mensaje:
          'El documento ya tiene una renovación en proceso'
      });
    }


    // ========================================================
    // RESPONSABLE
    // ========================================================

    const resultadoResponsable =
      await cliente.query(
        `
          SELECT
            id,
            nombres,
            apellidos

          FROM usuarios

          WHERE
            id = $1
            AND activo = TRUE

          LIMIT 1;
        `,
        [
          Number(
            responsableUsuarioId
          )
        ]
      );


    if (
      resultadoResponsable.rowCount === 0
    ) {

      await cliente.query(
        'ROLLBACK'
      );

      return res.status(400).json({
        ok: false,
        mensaje:
          'El responsable no existe o se encuentra inactivo'
      });
    }


    // ========================================================
    // TRÁMITE OPCIONAL
    // ========================================================

    if (
      tramiteNormalizado !== null
    ) {

      const resultadoTramite =
        await cliente.query(
          `
            SELECT
              id,
              documento_id,
              numero_expediente

            FROM tramites

            WHERE id = $1

            LIMIT 1;
          `,
          [
            tramiteNormalizado
          ]
        );


      if (
        resultadoTramite.rowCount === 0
      ) {

        await cliente.query(
          'ROLLBACK'
        );

        return res.status(400).json({
          ok: false,
          mensaje:
            'El trámite asociado no existe'
        });
      }


      if (
        Number(
          resultadoTramite.rows[0]
            .documento_id
        ) !==
        Number(documentoId)
      ) {

        await cliente.query(
          'ROLLBACK'
        );

        return res.status(409).json({
          ok: false,
          mensaje:
            'El trámite seleccionado no pertenece al documento que se desea renovar'
        });
      }
    }


    // ========================================================
    // CREAR RENOVACIÓN
    // ========================================================

    const resultadoRenovacion =
      await cliente.query(
        `
          INSERT INTO renovaciones (
            documento_anterior_id,
            documento_renovado_id,
            tramite_id,
            responsable_usuario_id,
            fecha_inicio,
            fecha_finalizacion,
            estado,
            observaciones,
            creado_por,
            finalizado_por
          )

          VALUES (
            $1,
            NULL,
            $2,
            $3,
            $4,
            NULL,
            'EN_PROCESO',
            $5,
            $6,
            NULL
          )

          RETURNING
            id,
            documento_anterior_id,
            documento_renovado_id,
            tramite_id,
            responsable_usuario_id,
            fecha_inicio,
            fecha_finalizacion,
            estado,
            observaciones,
            creado_por,
            finalizado_por,
            fecha_creacion,
            fecha_actualizacion;
        `,
        [
          Number(documentoId),

          tramiteNormalizado,

          Number(
            responsableUsuarioId
          ),

          fechaInicio,

          observacionesLimpias ||
            null,

          Number(usuarioId)
        ]
      );


    const renovacion =
      resultadoRenovacion.rows[0];


    // ========================================================
    // DOCUMENTO → EN RENOVACIÓN
    // ========================================================

    await cliente.query(
      `
        UPDATE documentos

        SET
          estado =
            'EN_RENOVACION',

          fecha_actualizacion =
            NOW()

        WHERE id = $1;
      `,
      [
        Number(documentoId)
      ]
    );


    await cliente.query(
      'COMMIT'
    );


    // ========================================================
    // AUDITORÍA
    // ========================================================

    await registrarEvento({

      usuarioId:
        Number(usuarioId),

      evento:
        'RENOVACION_INICIADA',

      modulo:
        'RENOVACIONES',

      descripcion:
        `Se inició la renovación ${renovacion.id} del documento ${documento.codigo_interno}`,

      entidad:
        'renovaciones',

      registroId:
        renovacion.id,

      datosAnteriores: {

        documentoId:
          documento.id,

        estado:
          documento.estado
      },

      datosNuevos: {

        renovacionId:
          renovacion.id,

        documentoAnteriorId:
          renovacion
            .documento_anterior_id,

        tramiteId:
          renovacion.tramite_id,

        responsableUsuarioId:
          renovacion
            .responsable_usuario_id,

        fechaInicio:
          renovacion.fecha_inicio,

        estadoRenovacion:
          renovacion.estado,

        estadoDocumento:
          'EN_RENOVACION'
      },

      ip:
        req.ip,

      userAgent:
        req.headers[
          'user-agent'
        ]
    });


    return res.status(201).json({

      ok: true,

      mensaje:
        'Renovación iniciada correctamente',

      renovacion: {

        id:
          renovacion.id,

        documentoAnteriorId:
          renovacion
            .documento_anterior_id,

        documentoRenovadoId:
          renovacion
            .documento_renovado_id,

        tramiteId:
          renovacion.tramite_id,

        responsableUsuarioId:
          renovacion
            .responsable_usuario_id,

        fechaInicio:
          renovacion.fecha_inicio,

        fechaFinalizacion:
          renovacion.fecha_finalizacion,

        estado:
          renovacion.estado,

        observaciones:
          renovacion.observaciones,

        creadoPor:
          renovacion.creado_por,

        fechaCreacion:
          renovacion.fecha_creacion
      }
    });


  } catch (error) {

    try {

      await cliente.query(
        'ROLLBACK'
      );

    } catch {
      // Transacción ya finalizada.
    }


    console.error(
      'Error iniciando renovación:',
      error
    );


    return res.status(500).json({
      ok: false,
      mensaje:
        'Error interno del servidor'
    });


  } finally {

    cliente.release();
  }
}


// ============================================================
// HU-032
// REGISTRAR DOCUMENTO RENOVADO
// ============================================================

async function completarRenovacion(
  req,
  res
) {

  const cliente =
    await pool.connect();

  try {

    const usuarioId =
      req.usuario?.usuarioId;


    const renovacionId =
      Number(
        req.params.id
      );


    if (
      !idValido(usuarioId)
    ) {

      return res.status(401).json({
        ok: false,
        mensaje:
          'Usuario no autenticado'
      });
    }


    if (
      !idValido(renovacionId)
    ) {

      return res.status(400).json({
        ok: false,
        mensaje:
          'La renovación indicada no es válida'
      });
    }


    const {
      numeroDocumento,
      numeroExpediente,
      fechaEmision,
      fechaVencimiento,
      entidadEmisoraId,
      observaciones
    } = req.body;


    // ========================================================
    // VALIDACIONES BÁSICAS
    // ========================================================

    if (
      !textoValido(
        numeroDocumento
      )
    ) {

      return res.status(400).json({
        ok: false,
        mensaje:
          'El número del nuevo documento es obligatorio'
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
      entidadEmisoraId !== undefined &&
      entidadEmisoraId !== null &&
      entidadEmisoraId !== '' &&
      !idValido(
        entidadEmisoraId
      )
    ) {

      return res.status(400).json({
        ok: false,
        mensaje:
          'La entidad emisora no es válida'
      });
    }


    const observacionesLimpias =
      typeof observaciones === 'string'
        ? observaciones.trim()
        : '';


    if (
      observacionesLimpias.length >
      1000
    ) {

      return res.status(400).json({
        ok: false,
        mensaje:
          'Las observaciones no pueden superar 1000 caracteres'
      });
    }


    await cliente.query(
      'BEGIN'
    );


    // ========================================================
    // OBTENER RENOVACIÓN Y DOCUMENTO ANTERIOR
    // ========================================================

    const resultadoRenovacion =
      await cliente.query(
        `
          SELECT

            r.id,
            r.documento_anterior_id,
            r.documento_renovado_id,
            r.tramite_id,
            r.responsable_usuario_id,
            r.fecha_inicio,
            r.fecha_finalizacion,
            r.estado,

            d.codigo_interno
              AS documento_codigo,

            d.tienda_id,

            d.tipo_documento_id,

            d.entidad_emisora_id,

            d.regla_vigencia_id,

            d.numero_documento
              AS numero_documento_anterior,

            d.fecha_emision
              AS fecha_emision_anterior,

            d.fecha_vencimiento
              AS fecha_vencimiento_anterior,

            d.estado
              AS estado_documento_anterior,

            d.condicion_registro,

            regla_anterior.tipo_vigencia
              AS tipo_vigencia_anterior,

            regla_anterior.umbral_por_vencer_dias
              AS umbral_por_vencer_anterior,

            regla_anterior.umbral_critico_dias
              AS umbral_critico_anterior

          FROM renovaciones r

          INNER JOIN documentos d
            ON d.id =
               r.documento_anterior_id

          INNER JOIN
            tipo_documento_reglas_vigencia
              regla_anterior

            ON regla_anterior.id =
               d.regla_vigencia_id

          WHERE r.id = $1

          LIMIT 1

          FOR UPDATE OF r, d;
        `,
        [
          renovacionId
        ]
      );


    if (
      resultadoRenovacion.rowCount ===
      0
    ) {

      await cliente.query(
        'ROLLBACK'
      );

      return res.status(404).json({
        ok: false,
        mensaje:
          'La renovación no existe'
      });
    }


    const renovacion =
      resultadoRenovacion.rows[0];


    // ========================================================
    // ESTADO DEL PROCESO
    // ========================================================

    if (
      renovacion.estado !==
      'EN_PROCESO'
    ) {

      await cliente.query(
        'ROLLBACK'
      );

      return res.status(409).json({
        ok: false,
        mensaje:
          'La renovación ya no se encuentra en proceso'
      });
    }


    if (
      renovacion
        .documento_renovado_id !==
      null
    ) {

      await cliente.query(
        'ROLLBACK'
      );

      return res.status(409).json({
        ok: false,
        mensaje:
          'La renovación ya tiene un documento renovado asociado'
      });
    }


    if (
      renovacion
        .condicion_registro !==
      'ACTIVO'
    ) {

      await cliente.query(
        'ROLLBACK'
      );

      return res.status(409).json({
        ok: false,
        mensaje:
          'El documento anterior ya no se encuentra activo'
      });
    }


    // ========================================================
    // VALIDAR TIPO DOCUMENTAL
    // ========================================================

    const resultadoTipo =
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
          renovacion
            .tipo_documento_id
        ]
      );


    if (
      resultadoTipo.rowCount ===
      0
    ) {

      await cliente.query(
        'ROLLBACK'
      );

      return res.status(404).json({
        ok: false,
        mensaje:
          'El tipo documental del documento anterior ya no existe'
      });
    }


    if (
      resultadoTipo.rows[0]
        .activo !== true
    ) {

      await cliente.query(
        'ROLLBACK'
      );

      return res.status(409).json({
        ok: false,
        mensaje:
          'El tipo documental está inactivo y no permite registrar un nuevo documento'
      });
    }


    // ========================================================
    // ENTIDAD EMISORA
    // ========================================================

    const entidadFinalId =
      entidadEmisoraId
        ? Number(
            entidadEmisoraId
          )
        : Number(
            renovacion
              .entidad_emisora_id
          );


    const resultadoEntidad =
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
          entidadFinalId
        ]
      );


    if (
      resultadoEntidad.rowCount ===
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
      resultadoEntidad.rows[0]
        .activo !== true
    ) {

      await cliente.query(
        'ROLLBACK'
      );

      return res.status(409).json({
        ok: false,
        mensaje:
          'La entidad emisora seleccionada está inactiva'
      });
    }


    // ========================================================
    // RESPONSABLE DEL PROCESO
    // ========================================================

    const resultadoResponsable =
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
          renovacion
            .responsable_usuario_id
        ]
      );


    if (
      resultadoResponsable.rowCount ===
      0 ||
      resultadoResponsable.rows[0]
        .activo !== true
    ) {

      await cliente.query(
        'ROLLBACK'
      );

      return res.status(409).json({
        ok: false,
        mensaje:
          'El responsable de la renovación no está disponible'
      });
    }


    // ========================================================
    // OBTENER REGLA ACTUAL
    //
    // El documento renovado utiliza la configuración vigente
    // del tipo documental.
    // ========================================================

    const resultadoRegla =
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

          FROM
            tipo_documento_reglas_vigencia

          WHERE
            tipo_documento_id = $1
            AND es_actual = TRUE

          LIMIT 1;
        `,
        [
          renovacion
            .tipo_documento_id
        ]
      );


    if (
      resultadoRegla.rowCount ===
      0
    ) {

      await cliente.query(
        'ROLLBACK'
      );

      return res.status(409).json({
        ok: false,
        mensaje:
          'El tipo documental no tiene una regla de vigencia actual'
      });
    }


    const regla =
      resultadoRegla.rows[0];


    // ========================================================
    // CALCULAR VENCIMIENTO
    // ========================================================

    let fechaVencimientoFinal =
      null;


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
            'La fecha de vencimiento es obligatoria para este tipo de documento'
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


    if (
      regla.tipo_vigencia ===
      'INDETERMINADA'
    ) {

      fechaVencimientoFinal =
        null;
    }


    // ========================================================
    // ESTADO DEL NUEVO DOCUMENTO
    // ========================================================

    const calculoNuevo =
      calcularEstadoVigencia({

        tipoVigencia:
          regla.tipo_vigencia,

        fechaVencimiento:
          fechaVencimientoFinal,

        umbralPorVencerDias:
          regla
            .umbral_por_vencer_dias,

        umbralCriticoDias:
          regla
            .umbral_critico_dias,

        enRenovacion:
          false
      });


    // ========================================================
    // GENERAR ID Y CÓDIGO DEL NUEVO DOCUMENTO
    // ========================================================

    const resultadoSecuencia =
      await cliente.query(
        `
          SELECT
            nextval(
              pg_get_serial_sequence(
                'documentos',
                'id'
              )
            ) AS id;
        `
      );


    const nuevoDocumentoId =
      Number(
        resultadoSecuencia
          .rows[0]
          .id
      );


    const codigoInterno =
      `DOC-${String(
        nuevoDocumentoId
      ).padStart(
        6,
        '0'
      )}`;


    // ========================================================
    // CREAR NUEVO DOCUMENTO
    // ========================================================

    const resultadoNuevoDocumento =
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
            condicion_registro,
            fecha_creacion,
            fecha_actualizacion;
        `,
        [
          nuevoDocumentoId,

          codigoInterno,

          renovacion.tienda_id,

          renovacion
            .tipo_documento_id,

          entidadFinalId,

          regla.id,

          numeroDocumento.trim(),

          textoValido(
            numeroExpediente
          )
            ? numeroExpediente.trim()
            : null,

          fechaEmision,

          fechaVencimientoFinal,

          renovacion
            .responsable_usuario_id,

          Number(usuarioId),

          calculoNuevo.estado,

          observacionesLimpias ||
            null
        ]
      );


    const nuevoDocumento =
      resultadoNuevoDocumento
        .rows[0];


    // ========================================================
    // ESTADO FINAL DEL DOCUMENTO ANTERIOR
    //
    // Se quita EN_RENOVACION porque el proceso ya terminó.
    // Su condición será ARCHIVADO y seguirá disponible
    // como documento histórico.
    // ========================================================

    const calculoAnterior =
      calcularEstadoVigencia({

        tipoVigencia:
          renovacion
            .tipo_vigencia_anterior,

        fechaVencimiento:
          renovacion
            .fecha_vencimiento_anterior,

        umbralPorVencerDias:
          renovacion
            .umbral_por_vencer_anterior,

        umbralCriticoDias:
          renovacion
            .umbral_critico_anterior,

        enRenovacion:
          false
      });


    // ========================================================
    // ARCHIVAR DOCUMENTO ANTERIOR
    // ========================================================

    await cliente.query(
      `
        UPDATE documentos

        SET
          estado = $1,

          condicion_registro =
            'ARCHIVADO',

          motivo_baja = $2,

          fecha_baja =
            NOW(),

          baja_por = $3,

          fecha_actualizacion =
            NOW()

        WHERE id = $4;
      `,
      [
        calculoAnterior.estado,

        `Documento reemplazado por renovación. Nuevo documento: ${codigoInterno}`,

        Number(usuarioId),

        renovacion
          .documento_anterior_id
      ]
    );


    // ========================================================
    // COMPLETAR RENOVACIÓN
    // ========================================================

    const resultadoCierre =
      await cliente.query(
        `
          UPDATE renovaciones

          SET
            documento_renovado_id =
              $1,

            fecha_finalizacion =
              CURRENT_DATE,

            estado =
              'COMPLETADA',

            finalizado_por =
              $2,

            fecha_actualizacion =
              NOW()

          WHERE id = $3

          RETURNING
            id,
            documento_anterior_id,
            documento_renovado_id,
            tramite_id,
            responsable_usuario_id,
            fecha_inicio,
            fecha_finalizacion,
            estado,
            observaciones,
            creado_por,
            finalizado_por,
            fecha_creacion,
            fecha_actualizacion,

            (
              fecha_finalizacion -
              fecha_inicio
            )::int
              AS duracion_dias;
        `,
        [
          nuevoDocumentoId,

          Number(usuarioId),

          renovacionId
        ]
      );


    const renovacionFinal =
      resultadoCierre.rows[0];


    await cliente.query(
      'COMMIT'
    );


    // ========================================================
    // AUDITORÍA
    // ========================================================

    await registrarEvento({

      usuarioId:
        Number(usuarioId),

      evento:
        'RENOVACION_COMPLETADA',

      modulo:
        'RENOVACIONES',

      descripcion:
        `Se completó la renovación ${renovacionId}. El documento ${renovacion.documento_codigo} fue reemplazado por ${codigoInterno}.`,

      entidad:
        'renovaciones',

      registroId:
        renovacionId,

      datosAnteriores: {

        documentoId:
          renovacion
            .documento_anterior_id,

        codigoInterno:
          renovacion
            .documento_codigo,

        numeroDocumento:
          renovacion
            .numero_documento_anterior,

        estado:
          renovacion
            .estado_documento_anterior,

        condicionRegistro:
          renovacion
            .condicion_registro
      },

      datosNuevos: {

        renovacionId,

        documentoRenovadoId:
          nuevoDocumento.id,

        codigoInterno:
          nuevoDocumento
            .codigo_interno,

        numeroDocumento:
          nuevoDocumento
            .numero_documento,

        fechaEmision:
          nuevoDocumento
            .fecha_emision,

        fechaVencimiento:
          nuevoDocumento
            .fecha_vencimiento,

        estado:
          nuevoDocumento.estado,

        duracionDias:
          Number(
            renovacionFinal
              .duracion_dias
          )
      },

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

    return res.status(201).json({

      ok: true,

      mensaje:
        'Documento renovado registrado correctamente',

      renovacion: {

        id:
          renovacionFinal.id,

        documentoAnteriorId:
          renovacionFinal
            .documento_anterior_id,

        documentoRenovadoId:
          renovacionFinal
            .documento_renovado_id,

        tramiteId:
          renovacionFinal
            .tramite_id,

        fechaInicio:
          renovacionFinal
            .fecha_inicio,

        fechaFinalizacion:
          renovacionFinal
            .fecha_finalizacion,

        duracionDias:
          Number(
            renovacionFinal
              .duracion_dias
          ),

        estado:
          renovacionFinal.estado
      },


      documento: {

        id:
          nuevoDocumento.id,

        codigoInterno:
          nuevoDocumento
            .codigo_interno,

        tiendaId:
          nuevoDocumento
            .tienda_id,

        tipoDocumentoId:
          nuevoDocumento
            .tipo_documento_id,

        entidadEmisoraId:
          nuevoDocumento
            .entidad_emisora_id,

        reglaVigenciaId:
          nuevoDocumento
            .regla_vigencia_id,

        numeroDocumento:
          nuevoDocumento
            .numero_documento,

        numeroExpediente:
          nuevoDocumento
            .numero_expediente,

        fechaEmision:
          nuevoDocumento
            .fecha_emision,

        fechaVencimiento:
          nuevoDocumento
            .fecha_vencimiento,

        responsableUsuarioId:
          nuevoDocumento
            .responsable_usuario_id,

        estado:
          nuevoDocumento.estado,

        condicionRegistro:
          nuevoDocumento
            .condicion_registro,

        observaciones:
          nuevoDocumento
            .observaciones
      }
    });


  } catch (error) {

    try {

      await cliente.query(
        'ROLLBACK'
      );

    } catch {
      // Transacción ya finalizada.
    }


    console.error(
      'Error completando renovación:',
      error
    );


    return res.status(500).json({
      ok: false,
      mensaje:
        'Error interno del servidor'
    });


  } finally {

    cliente.release();
  }
}


// ============================================================
// EXPORTAR
// ============================================================

module.exports = {
  iniciarRenovacion,
  completarRenovacion
};