const pool =
  require('../config/database');

const {
  registrarEvento
} = require(
  '../services/auditoria.service'
);

const {
  generarAlertasVencimiento
} = require(
  '../services/alertas.service'
);

const {
  procesarNotificacionesPendientes,
  listarNotificaciones
} = require(
  '../services/notificacionesAlertas.service'
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


function textoFiltro(valor) {

  if (
    typeof valor !== 'string'
  ) {
    return '';
  }

  return valor.trim();
}


// ============================================================
// HU-034 + HU-035
// LISTAR ALERTAS
// ============================================================

async function listarAlertas(
  req,
  res
) {

  try {

    const estado =
      textoFiltro(
        req.query.estado
      )
        .toUpperCase();

    const nivel =
      textoFiltro(
        req.query.nivel
      )
        .toUpperCase();

    const q =
      textoFiltro(
        req.query.q
      );


    const estadosPermitidos = [
      'PENDIENTE',
      'ATENDIDA',
      'RESUELTA'
    ];


    const nivelesPermitidos = [
      'POR_VENCER',
      'CRITICO',
      'VENCIDO'
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
          'El estado de alerta no es válido'
      });
    }


    if (
      nivel &&
      !nivelesPermitidos.includes(
        nivel
      )
    ) {

      return res.status(400).json({
        ok: false,
        mensaje:
          'El nivel de alerta no es válido'
      });
    }


    const condiciones = [
      '1 = 1'
    ];

    const parametros = [];


    if (estado) {

      parametros.push(
        estado
      );

      condiciones.push(
        `a.estado = $${parametros.length}`
      );
    }


    if (nivel) {

      parametros.push(
        nivel
      );

      condiciones.push(
        `a.nivel = $${parametros.length}`
      );
    }


    if (q) {

      parametros.push(
        `%${q}%`
      );

      const posicion =
        parametros.length;


      condiciones.push(
        `
          (
            d.codigo_interno ILIKE $${posicion}
            OR d.numero_documento ILIKE $${posicion}
            OR t.nombre ILIKE $${posicion}
            OR td.nombre ILIKE $${posicion}
            OR a.mensaje ILIKE $${posicion}
          )
        `
      );
    }


    const resultado =
      await pool.query(
        `
          SELECT
            a.id,
            a.tipo,
            a.nivel,
            a.estado,
            a.dias_restantes,
            a.fecha_vencimiento,
            a.mensaje,
            a.fecha_generacion,
            a.fecha_ultima_evaluacion,
            a.atendida_por,
            a.fecha_atencion,
            a.comentario_atencion,
            a.resuelta_automaticamente,
            a.fecha_resolucion,

            d.id
              AS documento_id,
            d.codigo_interno,
            d.numero_documento,
            d.estado
              AS documento_estado,

            t.id
              AS tienda_id,
            t.nombre
              AS tienda_nombre,

            td.id
              AS tipo_documento_id,
            td.nombre
              AS tipo_documento_nombre,

            ua.nombres
              AS atendida_nombres,
            ua.apellidos
              AS atendida_apellidos

          FROM alertas a

          INNER JOIN documentos d
            ON d.id = a.documento_id

          INNER JOIN tiendas t
            ON t.id = d.tienda_id

          INNER JOIN tipos_documento td
            ON td.id = d.tipo_documento_id

          LEFT JOIN usuarios ua
            ON ua.id = a.atendida_por

          WHERE
            ${condiciones.join(
              '\n AND '
            )}

          ORDER BY
            CASE a.estado
              WHEN 'PENDIENTE' THEN 0
              WHEN 'ATENDIDA' THEN 1
              ELSE 2
            END ASC,

            CASE a.nivel
              WHEN 'VENCIDO' THEN 0
              WHEN 'CRITICO' THEN 1
              ELSE 2
            END ASC,

            a.fecha_vencimiento ASC,
            a.id DESC;
        `,
        parametros
      );


    const alertas =
      resultado.rows.map(
        (fila) => ({
          id:
            fila.id,

          tipo:
            fila.tipo,

          nivel:
            fila.nivel,

          estado:
            fila.estado,

          diasRestantes:
            fila.dias_restantes,

          fechaVencimiento:
            fila.fecha_vencimiento,

          mensaje:
            fila.mensaje,

          fechaGeneracion:
            fila.fecha_generacion,

          fechaUltimaEvaluacion:
            fila.fecha_ultima_evaluacion,

          fechaAtencion:
            fila.fecha_atencion,

          comentarioAtencion:
            fila.comentario_atencion,

          resueltaAutomaticamente:
            fila.resuelta_automaticamente,

          fechaResolucion:
            fila.fecha_resolucion,

          documento: {
            id:
              fila.documento_id,
            codigoInterno:
              fila.codigo_interno,
            numeroDocumento:
              fila.numero_documento,
            estado:
              fila.documento_estado
          },

          tienda: {
            id:
              fila.tienda_id,
            nombre:
              fila.tienda_nombre
          },

          tipoDocumento: {
            id:
              fila.tipo_documento_id,
            nombre:
              fila.tipo_documento_nombre
          },

          atendidaPor:
            fila.atendida_por
              ? {
                  id:
                    fila.atendida_por,
                  nombres:
                    fila.atendida_nombres,
                  apellidos:
                    fila.atendida_apellidos,
                  nombreCompleto:
                    `${fila.atendida_nombres || ''} ${fila.atendida_apellidos || ''}`
                      .trim()
                }
              : null
        })
      );


    const resultadoIndicadores =
      await pool.query(
        `
          SELECT
            COUNT(*)::int
              AS total,

            COUNT(*) FILTER (
              WHERE estado = 'PENDIENTE'
            )::int
              AS pendientes,

            COUNT(*) FILTER (
              WHERE estado = 'ATENDIDA'
            )::int
              AS atendidas,

            COUNT(*) FILTER (
              WHERE estado = 'PENDIENTE'
                AND nivel = 'POR_VENCER'
            )::int
              AS por_vencer,

            COUNT(*) FILTER (
              WHERE estado = 'PENDIENTE'
                AND nivel = 'CRITICO'
            )::int
              AS criticas,

            COUNT(*) FILTER (
              WHERE estado = 'PENDIENTE'
                AND nivel = 'VENCIDO'
            )::int
              AS vencidas

          FROM alertas;
        `
      );


    const indicadores =
      resultadoIndicadores.rows[0];


    return res.status(200).json({
      ok: true,

      total:
        alertas.length,

      indicadores: {
        total:
          Number(
            indicadores.total || 0
          ),
        pendientes:
          Number(
            indicadores.pendientes || 0
          ),
        atendidas:
          Number(
            indicadores.atendidas || 0
          ),
        porVencer:
          Number(
            indicadores.por_vencer || 0
          ),
        criticas:
          Number(
            indicadores.criticas || 0
          ),
        vencidas:
          Number(
            indicadores.vencidas || 0
          )
      },

      alertas
    });

  } catch (error) {

    console.error(
      'Error listando alertas:',
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
// HU-034
// EJECUTAR GENERACIÓN DE ALERTAS
// ============================================================

async function evaluarVencimientos(
  req,
  res
) {

  try {

    const resultado =
      await generarAlertasVencimiento();


    await registrarEvento({
      usuarioId:
        req.usuario?.usuarioId || null,

      evento:
        'ALERTAS_EVALUADAS',

      modulo:
        'ALERTAS',

      descripcion:
        'Se ejecutó la evaluación de vencimientos y generación de alertas.',

      entidad:
        'alertas',

      datosNuevos:
        resultado,

      ip:
        req.ip,

      userAgent:
        req.headers[
          'user-agent'
        ]
    });


    return res.status(200).json({
      ok: true,
      mensaje:
        'Evaluación de vencimientos completada',
      resultado
    });

  } catch (error) {

    console.error(
      'Error evaluando vencimientos:',
      error
    );


    return res.status(500).json({
      ok: false,
      mensaje:
        'No se pudo completar la evaluación de vencimientos'
    });
  }
}


// ============================================================
// HU-035
// ATENDER ALERTA
// ============================================================

async function atenderAlerta(
  req,
  res
) {

  const cliente =
    await pool.connect();


  try {

    const alertaId =
      Number(
        req.params.id
      );

    const usuarioId =
      Number(
        req.usuario?.usuarioId
      );


    if (
      !idValido(alertaId) ||
      !idValido(usuarioId)
    ) {

      return res.status(400).json({
        ok: false,
        mensaje:
          'La alerta o el usuario no son válidos'
      });
    }


    const comentario =
      typeof req.body?.comentario ===
      'string'
        ? req.body.comentario.trim()
        : '';


    if (
      comentario.length > 1000
    ) {

      return res.status(400).json({
        ok: false,
        mensaje:
          'El comentario no puede superar 1000 caracteres'
      });
    }


    await cliente.query(
      'BEGIN'
    );


    const resultadoAnterior =
      await cliente.query(
        `
          SELECT
            id,
            documento_id,
            nivel,
            estado,
            mensaje

          FROM alertas

          WHERE id = $1

          LIMIT 1

          FOR UPDATE;
        `,
        [
          alertaId
        ]
      );


    if (
      resultadoAnterior.rowCount === 0
    ) {

      await cliente.query(
        'ROLLBACK'
      );

      return res.status(404).json({
        ok: false,
        mensaje:
          'La alerta no existe'
      });
    }


    const anterior =
      resultadoAnterior.rows[0];


    if (
      anterior.estado !==
      'PENDIENTE'
    ) {

      await cliente.query(
        'ROLLBACK'
      );

      return res.status(409).json({
        ok: false,
        mensaje:
          'La alerta ya fue atendida o resuelta'
      });
    }


    const resultado =
      await cliente.query(
        `
          UPDATE alertas

          SET
            estado = 'ATENDIDA',
            atendida_por = $1,
            fecha_atencion = NOW(),
            comentario_atencion = $2,
            fecha_actualizacion = NOW()

          WHERE id = $3

          RETURNING
            id,
            documento_id,
            nivel,
            estado,
            fecha_atencion,
            comentario_atencion;
        `,
        [
          usuarioId,
          comentario || null,
          alertaId
        ]
      );


    await cliente.query(
      'COMMIT'
    );


    await registrarEvento({
      usuarioId,

      evento:
        'ALERTA_ATENDIDA',

      modulo:
        'ALERTAS',

      descripcion:
        `Se atendió la alerta ${alertaId}.`,

      entidad:
        'alertas',

      registroId:
        alertaId,

      datosAnteriores: {
        estado:
          anterior.estado,
        nivel:
          anterior.nivel,
        documentoId:
          anterior.documento_id
      },

      datosNuevos: {
        estado:
          'ATENDIDA',
        comentario:
          comentario || null
      },

      ip:
        req.ip,

      userAgent:
        req.headers[
          'user-agent'
        ]
    });


    return res.status(200).json({
      ok: true,
      mensaje:
        'Alerta atendida correctamente',
      alerta:
        resultado.rows[0]
    });

  } catch (error) {

    try {
      await cliente.query(
        'ROLLBACK'
      );
    } catch {
      // Sin acción adicional.
    }


    console.error(
      'Error atendiendo alerta:',
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
// HU-036
// PROCESAR NOTIFICACIONES
// ============================================================

async function procesarNotificaciones(
  req,
  res
) {

  try {

    const resultado =
      await procesarNotificacionesPendientes({
        limite:
          req.body?.limite ||
          100
      });


    await registrarEvento({
      usuarioId:
        req.usuario?.usuarioId || null,

      evento:
        'NOTIFICACIONES_ALERTA_PROCESADAS',

      modulo:
        'ALERTAS',

      descripcion:
        'Se procesó la cola de notificaciones de alertas.',

      entidad:
        'notificaciones_alerta',

      datosNuevos:
        resultado,

      ip:
        req.ip,

      userAgent:
        req.headers[
          'user-agent'
        ]
    });


    return res.status(200).json({
      ok: true,
      mensaje:
        'Notificaciones procesadas',
      resultado
    });

  } catch (error) {

    console.error(
      'Error procesando notificaciones:',
      error
    );


    return res.status(500).json({
      ok: false,
      mensaje:
        'No se pudieron procesar las notificaciones'
    });
  }
}


// ============================================================
// HU-036
// CONSULTAR MIS NOTIFICACIONES
// ============================================================

async function consultarNotificaciones(
  req,
  res
) {

  try {

    const usuarioId =
      Number(
        req.usuario?.usuarioId
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


    const estado =
      textoFiltro(
        req.query.estado
      )
        .toUpperCase();


    const estadosPermitidos = [
      '',
      'PENDIENTE',
      'ENVIADA',
      'FALLIDA'
    ];


    if (
      !estadosPermitidos.includes(
        estado
      )
    ) {

      return res.status(400).json({
        ok: false,
        mensaje:
          'El estado de notificación no es válido'
      });
    }


    const notificaciones =
      await listarNotificaciones({
        usuarioId,
        estado,
        limite: 100
      });


    return res.status(200).json({
      ok: true,
      total:
        notificaciones.length,
      notificaciones
    });

  } catch (error) {

    console.error(
      'Error consultando notificaciones:',
      error
    );


    return res.status(500).json({
      ok: false,
      mensaje:
        'Error interno del servidor'
    });
  }
}


module.exports = {
  listarAlertas,
  evaluarVencimientos,
  atenderAlerta,
  procesarNotificaciones,
  consultarNotificaciones
};
