const pool =
  require('../config/database');

const {
  crearNotificacionesParaAlerta,
  procesarNotificacionesPendientes
} = require(
  './notificacionesAlertas.service'
);


// ============================================================
// DETERMINAR NIVEL DE ALERTA
// ============================================================

function determinarNivel({
  diasRestantes,
  umbralPorVencerDias,
  umbralCriticoDias
}) {

  const dias =
    Number(diasRestantes);

  const porVencer =
    Number(umbralPorVencerDias);

  const critico =
    Number(umbralCriticoDias);


  if (
    !Number.isInteger(dias) ||
    !Number.isInteger(porVencer) ||
    !Number.isInteger(critico)
  ) {
    return null;
  }


  if (dias < 0) {
    return 'VENCIDO';
  }


  if (
    dias <= critico
  ) {
    return 'CRITICO';
  }


  if (
    dias <= porVencer
  ) {
    return 'POR_VENCER';
  }


  return null;
}


// ============================================================
// MENSAJE DE ALERTA
// ============================================================

function construirMensaje({
  nivel,
  codigoInterno,
  numeroDocumento,
  tiendaNombre,
  fechaVencimiento,
  diasRestantes
}) {

  if (
    nivel === 'VENCIDO'
  ) {
    return (
      `El documento ${codigoInterno} (${numeroDocumento}) de ${tiendaNombre} venció el ${fechaVencimiento}. Tiene ${Math.abs(Number(diasRestantes))} día(s) de vencimiento.`
    );
  }


  if (
    nivel === 'CRITICO'
  ) {
    return (
      `El documento ${codigoInterno} (${numeroDocumento}) de ${tiendaNombre} se encuentra en nivel crítico y vence el ${fechaVencimiento}. Restan ${diasRestantes} día(s).`
    );
  }


  return (
    `El documento ${codigoInterno} (${numeroDocumento}) de ${tiendaNombre} está por vencer el ${fechaVencimiento}. Restan ${diasRestantes} día(s).`
  );
}


// ============================================================
// RESOLVER ALERTAS PENDIENTES DE UN DOCUMENTO
// ============================================================

async function resolverAlertasPendientes({
  cliente,
  documentoId,
  exceptoNivel = null,
  fechaVencimiento = null
}) {

  const parametros = [
    Number(documentoId)
  ];


  const condiciones = [
    'documento_id = $1',
    `estado = 'PENDIENTE'`
  ];


  if (exceptoNivel) {

    parametros.push(
      exceptoNivel
    );

    condiciones.push(
      `nivel <> $${parametros.length}`
    );
  }


  if (fechaVencimiento) {

    parametros.push(
      fechaVencimiento
    );

    condiciones.push(
      `fecha_vencimiento = $${parametros.length}::date`
    );
  }


  await cliente.query(
    `
      UPDATE alertas

      SET
        estado = 'RESUELTA',
        resuelta_automaticamente = TRUE,
        fecha_resolucion = NOW(),
        fecha_actualizacion = NOW()

      WHERE
        ${condiciones.join(
          '\n AND '
        )};
    `,
    parametros
  );
}


// ============================================================
// HU-034
// GENERAR / ACTUALIZAR ALERTAS DE VENCIMIENTO
// ============================================================

async function generarAlertasVencimiento() {

  const cliente =
    await pool.connect();


  const resumen = {
    evaluados: 0,
    generadas: 0,
    actualizadas: 0,
    resueltas: 0,
    notificacionesCreadas: 0,
    notificacionesEnviadas: 0,
    notificacionesFallidas: 0
  };


  try {

    await cliente.query(
      'BEGIN'
    );


    const resultadoDocumentos =
      await cliente.query(
        `
          SELECT
            d.id,
            d.codigo_interno,
            d.numero_documento,
            d.fecha_vencimiento,
            d.estado,
            d.condicion_registro,

            t.nombre
              AS tienda_nombre,

            r.tipo_vigencia,
            r.umbral_por_vencer_dias,
            r.umbral_critico_dias,

            CASE
              WHEN d.fecha_vencimiento IS NULL
              THEN NULL
              ELSE
                (
                  d.fecha_vencimiento -
                  CURRENT_DATE
                )::int
            END
              AS dias_restantes

          FROM documentos d

          INNER JOIN tiendas t
            ON t.id = d.tienda_id

          INNER JOIN
            tipo_documento_reglas_vigencia r
            ON r.id = d.regla_vigencia_id

          WHERE
            d.condicion_registro = 'ACTIVO'

          ORDER BY d.id ASC;
        `
      );


    for (
      const documento
      of resultadoDocumentos.rows
    ) {

      resumen.evaluados += 1;


      // Vigencia indeterminada, documento en renovación o sin
      // vencimiento: no debe generar alerta de vencimiento.
      if (
        documento.tipo_vigencia ===
          'INDETERMINADA' ||
        documento.estado ===
          'EN_RENOVACION' ||
        !documento.fecha_vencimiento
      ) {

        const resueltas =
          await cliente.query(
            `
              UPDATE alertas

              SET
                estado = 'RESUELTA',
                resuelta_automaticamente = TRUE,
                fecha_resolucion = NOW(),
                fecha_actualizacion = NOW()

              WHERE documento_id = $1
                AND estado = 'PENDIENTE'

              RETURNING id;
            `,
            [
              documento.id
            ]
          );


        resumen.resueltas +=
          resueltas.rowCount;

        continue;
      }


      const nivel =
        determinarNivel({
          diasRestantes:
            documento.dias_restantes,

          umbralPorVencerDias:
            documento
              .umbral_por_vencer_dias,

          umbralCriticoDias:
            documento
              .umbral_critico_dias
        });


      if (!nivel) {

        const resueltas =
          await cliente.query(
            `
              UPDATE alertas

              SET
                estado = 'RESUELTA',
                resuelta_automaticamente = TRUE,
                fecha_resolucion = NOW(),
                fecha_actualizacion = NOW()

              WHERE documento_id = $1
                AND estado = 'PENDIENTE'

              RETURNING id;
            `,
            [
              documento.id
            ]
          );


        resumen.resueltas +=
          resueltas.rowCount;

        continue;
      }


      // Al escalar a otro nivel se resuelve la alerta anterior.
      const resultadoResueltas =
        await cliente.query(
          `
            UPDATE alertas

            SET
              estado = 'RESUELTA',
              resuelta_automaticamente = TRUE,
              fecha_resolucion = NOW(),
              fecha_actualizacion = NOW()

            WHERE documento_id = $1
              AND fecha_vencimiento = $2::date
              AND estado = 'PENDIENTE'
              AND nivel <> $3

            RETURNING id;
          `,
          [
            documento.id,
            documento.fecha_vencimiento,
            nivel
          ]
        );


      resumen.resueltas +=
        resultadoResueltas.rowCount;


      const mensaje =
        construirMensaje({
          nivel,
          codigoInterno:
            documento.codigo_interno,
          numeroDocumento:
            documento.numero_documento,
          tiendaNombre:
            documento.tienda_nombre,
          fechaVencimiento:
            documento.fecha_vencimiento,
          diasRestantes:
            documento.dias_restantes
        });


      const resultadoExistente =
        await cliente.query(
          `
            SELECT
              id,
              estado

            FROM alertas

            WHERE documento_id = $1
              AND tipo = 'VENCIMIENTO'
              AND nivel = $2
              AND fecha_vencimiento = $3::date

            LIMIT 1;
          `,
          [
            documento.id,
            nivel,
            documento.fecha_vencimiento
          ]
        );


      let alertaId;
      let alertaPendiente = false;


      if (
        resultadoExistente.rowCount > 0
      ) {

        alertaId =
          resultadoExistente.rows[0].id;

        alertaPendiente =
          resultadoExistente.rows[0]
            .estado === 'PENDIENTE';


        await cliente.query(
          `
            UPDATE alertas

            SET
              dias_restantes = $1,
              mensaje = $2,
              fecha_ultima_evaluacion = NOW(),
              fecha_actualizacion = NOW()

            WHERE id = $3;
          `,
          [
            documento.dias_restantes,
            mensaje,
            alertaId
          ]
        );


        resumen.actualizadas += 1;

      } else {

        const resultadoInsert =
          await cliente.query(
            `
              INSERT INTO alertas (
                documento_id,
                tipo,
                nivel,
                estado,
                dias_restantes,
                fecha_vencimiento,
                mensaje
              )

              VALUES (
                $1,
                'VENCIMIENTO',
                $2,
                'PENDIENTE',
                $3,
                $4,
                $5
              )

              RETURNING id;
            `,
            [
              documento.id,
              nivel,
              documento.dias_restantes,
              documento.fecha_vencimiento,
              mensaje
            ]
          );


        alertaId =
          resultadoInsert.rows[0].id;

        alertaPendiente = true;

        resumen.generadas += 1;
      }


      if (alertaPendiente) {

        const notificaciones =
          await crearNotificacionesParaAlerta({
            cliente,
            alertaId
          });


        resumen.notificacionesCreadas +=
          notificaciones.creadas;
      }
    }


    await cliente.query(
      'COMMIT'
    );


    // La entrega interna se procesa después del commit.
    const procesamiento =
      await procesarNotificacionesPendientes({
        limite: 500
      });


    resumen.notificacionesEnviadas =
      procesamiento.enviadas;

    resumen.notificacionesFallidas =
      procesamiento.fallidas;


    return resumen;

  } catch (error) {

    try {
      await cliente.query(
        'ROLLBACK'
      );
    } catch {
      // Sin acción adicional.
    }


    throw error;

  } finally {

    cliente.release();
  }
}


module.exports = {
  determinarNivel,
  generarAlertasVencimiento,
  resolverAlertasPendientes
};
