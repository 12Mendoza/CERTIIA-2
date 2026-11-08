const pool = require('../config/database');


const MILISEGUNDOS_POR_DIA =
  24 * 60 * 60 * 1000;


// =====================================================
// CONVERTIR UNA FECHA A DÍA UTC
// =====================================================
function convertirFechaADiaUTC(fecha) {
  if (!fecha) {
    return null;
  }


  if (
    typeof fecha === 'string'
  ) {
    const coincidencia =
      /^(\d{4})-(\d{2})-(\d{2})/.exec(
        fecha
      );

    if (!coincidencia) {
      return null;
    }


    const anio =
      Number(
        coincidencia[1]
      );

    const mes =
      Number(
        coincidencia[2]
      );

    const dia =
      Number(
        coincidencia[3]
      );


    const fechaUTC =
      Date.UTC(
        anio,
        mes - 1,
        dia
      );


    const comprobacion =
      new Date(
        fechaUTC
      );


    if (
      comprobacion.getUTCFullYear() !== anio ||
      comprobacion.getUTCMonth() !== mes - 1 ||
      comprobacion.getUTCDate() !== dia
    ) {
      return null;
    }


    return fechaUTC;
  }


  if (
    fecha instanceof Date
  ) {
    if (
      Number.isNaN(
        fecha.getTime()
      )
    ) {
      return null;
    }


    return Date.UTC(
      fecha.getFullYear(),
      fecha.getMonth(),
      fecha.getDate()
    );
  }


  return null;
}


// =====================================================
// OBTENER DÍA ACTUAL
// =====================================================
function obtenerDiaActualUTC(
  fechaActual = new Date()
) {
  if (
    typeof fechaActual === 'string'
  ) {
    return convertirFechaADiaUTC(
      fechaActual
    );
  }


  if (
    fechaActual instanceof Date &&
    !Number.isNaN(
      fechaActual.getTime()
    )
  ) {
    return Date.UTC(
      fechaActual.getFullYear(),
      fechaActual.getMonth(),
      fechaActual.getDate()
    );
  }


  return null;
}


// =====================================================
// VALIDAR UMBRAL
// =====================================================
function normalizarUmbral(
  valor,
  nombre
) {
  const numero =
    Number(
      valor
    );


  if (
    !Number.isInteger(numero) ||
    numero < 0
  ) {
    throw new Error(
      `La configuración ${nombre} no es válida.`
    );
  }


  return numero;
}


// =====================================================
// CALCULAR ESTADO DE VIGENCIA
// =====================================================
function calcularEstadoVigencia({
  tipoVigencia,
  fechaVencimiento,
  umbralPorVencerDias,
  umbralCriticoDias,
  enRenovacion = false,
  fechaActual = new Date()
}) {

  /*
   * EN_RENOVACION se conserva cuando el
   * backend ya ha determinado que existe
   * un proceso de renovación.
   *
   * Nunca se obtiene desde un estado
   * enviado por el frontend.
   */
  if (
    enRenovacion === true
  ) {
    return {
      estado:
        'EN_RENOVACION',

      diasRestantes:
        null
    };
  }


  const tipo =
    String(
      tipoVigencia || ''
    )
      .trim()
      .toUpperCase();


  // ===================================================
  // VIGENCIA INDETERMINADA
  // ===================================================

  if (
    tipo === 'INDETERMINADA'
  ) {
    return {
      estado:
        'VIGENTE',

      diasRestantes:
        null
    };
  }


  // ===================================================
  // VALIDAR FECHA DE VENCIMIENTO
  // ===================================================

  const diaVencimiento =
    convertirFechaADiaUTC(
      fechaVencimiento
    );


  if (
    diaVencimiento === null
  ) {
    throw new Error(
      'El documento requiere una fecha de vencimiento válida.'
    );
  }


  const diaActual =
    obtenerDiaActualUTC(
      fechaActual
    );


  if (
    diaActual === null
  ) {
    throw new Error(
      'No se pudo determinar la fecha actual.'
    );
  }


  // ===================================================
  // OBTENER UMBRALES
  // ===================================================

  const umbralPorVencer =
    normalizarUmbral(
      umbralPorVencerDias,
      'de Por vencer'
    );


  const umbralCritico =
    normalizarUmbral(
      umbralCriticoDias,
      'Crítico'
    );


  if (
    umbralCritico >
    umbralPorVencer
  ) {
    throw new Error(
      'La configuración de vigencia es inconsistente: el umbral crítico no puede superar al umbral de Por vencer.'
    );
  }


  // ===================================================
  // CALCULAR DÍAS RESTANTES
  // ===================================================

  const diasRestantes =
    Math.round(
      (
        diaVencimiento -
        diaActual
      ) /
      MILISEGUNDOS_POR_DIA
    );


  // ===================================================
  // VENCIDO
  // ===================================================

  if (
    diasRestantes < 0
  ) {
    return {
      estado:
        'VENCIDO',

      diasRestantes
    };
  }


  // ===================================================
  // CRÍTICO
  // ===================================================

  if (
    diasRestantes <=
    umbralCritico
  ) {
    return {
      estado:
        'CRITICO',

      diasRestantes
    };
  }


  // ===================================================
  // POR VENCER
  // ===================================================

  if (
    diasRestantes <=
    umbralPorVencer
  ) {
    return {
      estado:
        'POR_VENCER',

      diasRestantes
    };
  }


  // ===================================================
  // VIGENTE
  // ===================================================

  return {
    estado:
      'VIGENTE',

    diasRestantes
  };
}


// =====================================================
// RECALCULAR DOCUMENTOS EXISTENTES
// =====================================================
async function recalcularEstadosDocumentos({
  fechaActual = new Date()
} = {}) {

  const cliente =
    await pool.connect();


  try {
    await cliente.query(
      'BEGIN'
    );


    /*
     * Se utiliza la regla exacta que quedó
     * asociada al documento cuando fue creado.
     *
     * No se usa automáticamente la regla actual
     * del tipo documental porque eso podría
     * modificar retroactivamente el historial.
     */
    const resultado =
      await cliente.query(
        `
          SELECT
            d.id,
            d.codigo_interno,
            d.estado,
            d.fecha_vencimiento,

            r.tipo_vigencia,
            r.umbral_por_vencer_dias,
            r.umbral_critico_dias

          FROM documentos d

          INNER JOIN
            tipo_documento_reglas_vigencia r
            ON r.id = d.regla_vigencia_id

          ORDER BY d.id ASC;
        `
      );


    let evaluados = 0;
    let actualizados = 0;


    const cambios = [];


    for (
      const documento
      of resultado.rows
    ) {

      /*
       * Cuando posteriormente el módulo de
       * renovaciones coloque el documento en
       * EN_RENOVACION, esta recalculación no
       * debe destruir ese estado.
       */
      const enRenovacion =
        documento.estado ===
        'EN_RENOVACION';


      const calculo =
        calcularEstadoVigencia({
          tipoVigencia:
            documento.tipo_vigencia,

          fechaVencimiento:
            documento.fecha_vencimiento,

          umbralPorVencerDias:
            documento
              .umbral_por_vencer_dias,

          umbralCriticoDias:
            documento
              .umbral_critico_dias,

          enRenovacion,

          fechaActual
        });


      evaluados += 1;


      if (
        documento.estado !==
        calculo.estado
      ) {

        await cliente.query(
          `
            UPDATE documentos

            SET
              estado = $1,
              fecha_actualizacion = NOW()

            WHERE id = $2;
          `,
          [
            calculo.estado,
            documento.id
          ]
        );


        actualizados += 1;


        cambios.push({
          documentoId:
            documento.id,

          codigoInterno:
            documento.codigo_interno,

          estadoAnterior:
            documento.estado,

          estadoNuevo:
            calculo.estado,

          diasRestantes:
            calculo.diasRestantes
        });
      }
    }


    await cliente.query(
      'COMMIT'
    );


    return {
      evaluados,
      actualizados,
      cambios
    };

  } catch (error) {

    try {
      await cliente.query(
        'ROLLBACK'
      );
    } catch {
      // No se realiza ninguna acción adicional.
    }


    throw error;

  } finally {

    cliente.release();

  }
}


// =====================================================
// EXPORTS
// =====================================================

module.exports = {
  calcularEstadoVigencia,
  recalcularEstadosDocumentos
};