const pool =
  require('../config/database');


// ============================================================
// CREAR NOTIFICACIONES PARA UNA ALERTA
// HU-036 + HU-052
// ============================================================

async function crearNotificacionesParaAlerta({
  cliente,
  alertaId
}) {

  const db =
    cliente || pool;


  const resultadoAlerta =
    await db.query(
      `
        SELECT
          a.id,
          a.nivel,
          a.dias_restantes,
          a.fecha_vencimiento,
          a.mensaje,

          d.codigo_interno,
          d.numero_documento,

          t.nombre
            AS tienda_nombre,

          td.nombre
            AS tipo_documento_nombre

        FROM alertas a

        INNER JOIN documentos d
          ON d.id = a.documento_id

        INNER JOIN tiendas t
          ON t.id = d.tienda_id

        INNER JOIN tipos_documento td
          ON td.id = d.tipo_documento_id

        WHERE a.id = $1
          AND a.estado = 'PENDIENTE'

        LIMIT 1;
      `,
      [
        Number(alertaId)
      ]
    );


  if (
    resultadoAlerta.rowCount === 0
  ) {
    return {
      creadas: 0
    };
  }


  const alerta =
    resultadoAlerta.rows[0];


  const destinatarios =
    await db.query(
      `
        SELECT
          u.id
            AS usuario_id,

          u.email,

          regla.canal,

          regla.max_reintentos

        FROM alerta_notificacion_reglas regla

        INNER JOIN config_canales_notificacion canal
          ON canal.codigo = regla.canal
         AND canal.activo = TRUE

        INNER JOIN roles rol
          ON rol.id = regla.rol_id
         AND rol.activo = TRUE

        INNER JOIN usuarios u
          ON u.rol_id = rol.id

        WHERE regla.activo = TRUE
          AND regla.nivel = $1
          AND u.activo = TRUE

        ORDER BY
          regla.canal ASC,
          u.id ASC;
      `,
      [
        alerta.nivel
      ]
    );


  let creadas = 0;


  for (
    const destinatario
    of destinatarios.rows
  ) {

    const contenido = {
      titulo:
        `Alerta ${alerta.nivel}`,

      mensaje:
        alerta.mensaje,

      nivel:
        alerta.nivel,

      documento: {
        codigoInterno:
          alerta.codigo_interno,

        numeroDocumento:
          alerta.numero_documento,

        tipo:
          alerta.tipo_documento_nombre
      },

      tienda:
        alerta.tienda_nombre,

      fechaVencimiento:
        alerta.fecha_vencimiento,

      diasRestantes:
        alerta.dias_restantes
    };


    const resultadoInsert =
      await db.query(
        `
          INSERT INTO notificaciones_alerta (
            alerta_id,
            usuario_id,
            nivel,
            canal,
            destinatario,
            estado,
            intentos,
            max_reintentos,
            contenido
          )

          VALUES (
            $1,
            $2,
            $3,
            $4,
            $5,
            'PENDIENTE',
            0,
            $6,
            $7::jsonb
          )

          ON CONFLICT (
            alerta_id,
            usuario_id,
            canal
          )
          DO NOTHING

          RETURNING id;
        `,
        [
          alerta.id,
          destinatario.usuario_id,
          alerta.nivel,
          destinatario.canal,
          destinatario.email || null,
          destinatario.max_reintentos,
          JSON.stringify(contenido)
        ]
      );


    if (
      resultadoInsert.rowCount > 0
    ) {
      creadas += 1;
    }
  }


  return {
    creadas
  };
}


// ============================================================
// PROCESAR COLA
// ============================================================

async function procesarNotificacionesPendientes({
  limite = 100
} = {}) {

  const cliente =
    await pool.connect();


  try {

    await cliente.query('BEGIN');


    const resultado =
      await cliente.query(
        `
          SELECT
            n.id,
            n.canal,
            n.intentos,
            n.max_reintentos

          FROM notificaciones_alerta n

          INNER JOIN config_canales_notificacion c
            ON c.codigo = n.canal
           AND c.activo = TRUE

          WHERE n.estado IN (
            'PENDIENTE',
            'FALLIDA'
          )

          AND n.intentos < n.max_reintentos

          ORDER BY
            n.fecha_programada ASC,
            n.id ASC

          LIMIT $1

          FOR UPDATE OF n
          SKIP LOCKED;
        `,
        [
          Math.max(
            1,
            Math.min(
              Number(limite) || 100,
              500
            )
          )
        ]
      );


    let enviadas = 0;
    let fallidas = 0;


    for (
      const notificacion
      of resultado.rows
    ) {

      const siguienteIntento =
        Number(notificacion.intentos) + 1;


      if (
        notificacion.canal ===
        'SISTEMA'
      ) {

        await cliente.query(
          `
            UPDATE notificaciones_alerta

            SET
              estado = 'ENVIADA',
              intentos = $1,
              fecha_ultimo_intento = NOW(),
              fecha_envio = NOW(),
              ultimo_error = NULL,
              fecha_actualizacion = NOW()

            WHERE id = $2;
          `,
          [
            siguienteIntento,
            notificacion.id
          ]
        );


        enviadas += 1;
        continue;
      }


      await cliente.query(
        `
          UPDATE notificaciones_alerta

          SET
            estado = 'FALLIDA',
            intentos = $1,
            fecha_ultimo_intento = NOW(),
            ultimo_error = $2,
            fecha_actualizacion = NOW()

          WHERE id = $3;
        `,
        [
          siguienteIntento,
          'El canal EMAIL requiere integración con el proveedor SMTP de la organización.',
          notificacion.id
        ]
      );


      fallidas += 1;
    }


    await cliente.query('COMMIT');


    return {
      procesadas:
        resultado.rowCount,
      enviadas,
      fallidas
    };

  } catch (error) {

    try {
      await cliente.query('ROLLBACK');
    } catch {
      // Sin acción adicional.
    }

    throw error;

  } finally {

    cliente.release();
  }
}


// ============================================================
// LISTAR NOTIFICACIONES
// ============================================================

async function listarNotificaciones({
  usuarioId = null,
  estado = '',
  limite = 100
} = {}) {

  const condiciones = [
    '1 = 1'
  ];

  const parametros = [];


  if (usuarioId) {
    parametros.push(Number(usuarioId));
    condiciones.push(
      `n.usuario_id = $${parametros.length}`
    );
  }


  if (estado) {
    parametros.push(
      String(estado).trim().toUpperCase()
    );
    condiciones.push(
      `n.estado = $${parametros.length}`
    );
  }


  parametros.push(
    Math.max(
      1,
      Math.min(
        Number(limite) || 100,
        500
      )
    )
  );


  const posicionLimite =
    parametros.length;


  const resultado =
    await pool.query(
      `
        SELECT
          n.id,
          n.alerta_id,
          n.usuario_id,
          n.nivel,
          n.canal,
          n.destinatario,
          n.estado,
          n.intentos,
          n.max_reintentos,
          n.contenido,
          n.fecha_ultimo_intento,
          n.fecha_envio,
          n.ultimo_error,
          n.fecha_creacion,

          u.nombres,
          u.apellidos,
          u.email

        FROM notificaciones_alerta n

        INNER JOIN usuarios u
          ON u.id = n.usuario_id

        WHERE
          ${condiciones.join('\n AND ')}

        ORDER BY
          n.fecha_creacion DESC,
          n.id DESC

        LIMIT $${posicionLimite};
      `,
      parametros
    );


  return resultado.rows.map(
    (fila) => ({
      id: fila.id,
      alertaId: fila.alerta_id,
      usuario: {
        id: fila.usuario_id,
        nombres: fila.nombres,
        apellidos: fila.apellidos,
        email: fila.email,
        nombreCompleto:
          `${fila.nombres || ''} ${fila.apellidos || ''}`.trim()
      },
      nivel: fila.nivel,
      canal: fila.canal,
      destinatario: fila.destinatario,
      estado: fila.estado,
      intentos: fila.intentos,
      maxReintentos: fila.max_reintentos,
      contenido: fila.contenido,
      fechaUltimoIntento: fila.fecha_ultimo_intento,
      fechaEnvio: fila.fecha_envio,
      ultimoError: fila.ultimo_error,
      fechaCreacion: fila.fecha_creacion
    })
  );
}


module.exports = {
  crearNotificacionesParaAlerta,
  procesarNotificacionesPendientes,
  listarNotificaciones
};
