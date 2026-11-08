const pool = require('../config/database');

const {
  registrarEvento
} = require('../services/auditoria.service');


// =====================================================
// UTILIDADES
// =====================================================
function idValido(id) {
  return (
    id &&
    !Number.isNaN(Number(id)) &&
    Number(id) > 0
  );
}


function rucValido(ruc) {
  return (
    typeof ruc === 'string' &&
    /^[0-9]{11}$/.test(
      ruc.trim()
    )
  );
}


function nivelRiesgoValido(
  nivelRiesgo
) {
  return [
    'BAJO',
    'MEDIO',
    'ALTO'
  ].includes(
    nivelRiesgo
  );
}


function textoValido(valor) {
  return (
    typeof valor === 'string' &&
    valor.trim().length > 0
  );
}


// =====================================================
// FORMATEAR TIENDA
// =====================================================
function formatearTienda(tienda) {
  return {
    id:
      tienda.id,

    codigo:
      tienda.codigo,

    nombre:
      tienda.nombre,

    ruc:
      tienda.ruc,

    direccion:
      tienda.direccion,

    departamento:
      tienda.departamento,

    provincia:
      tienda.provincia,

    distrito:
      tienda.distrito,

    nivelRiesgo:
      tienda.nivel_riesgo,

    activo:
      tienda.activo,

    fechaCreacion:
      tienda.fecha_creacion,

    fechaActualizacion:
      tienda.fecha_actualizacion
  };
}


// =====================================================
// LISTAR TIENDAS
// =====================================================
async function listarTiendas(
  req,
  res
) {
  try {
    const resultado =
      await pool.query(
        `
        SELECT
          id,
          codigo,
          nombre,
          ruc,
          direccion,
          departamento,
          provincia,
          distrito,
          nivel_riesgo,
          activo,
          fecha_creacion,
          fecha_actualizacion

        FROM tiendas

        ORDER BY
          activo DESC,
          nombre ASC;
        `
      );


    const tiendas =
      resultado.rows.map(
        formatearTienda
      );


    return res.status(200).json({
      ok: true,
      total:
        tiendas.length,
      tiendas
    });

  } catch (error) {
    console.error(
      'Error al listar tiendas:',
      error.message
    );


    return res.status(500).json({
      ok: false,
      mensaje:
        'Error interno del servidor'
    });
  }
}


// =====================================================
// REGISTRAR TIENDA
// =====================================================
async function registrarTienda(
  req,
  res
) {
  try {
    const usuarioId =
      req.usuario.usuarioId;


    const {
      codigo,
      nombre,
      ruc,
      direccion,
      departamento,
      provincia,
      distrito,
      nivelRiesgo
    } = req.body;


    // =================================================
    // VALIDAR CAMPOS OBLIGATORIOS
    // =================================================
    if (
      !textoValido(codigo) ||
      !textoValido(nombre) ||
      !textoValido(ruc) ||
      !textoValido(direccion) ||
      !textoValido(departamento) ||
      !textoValido(provincia) ||
      !textoValido(distrito) ||
      !textoValido(nivelRiesgo)
    ) {
      return res.status(400).json({
        ok: false,
        mensaje:
          'Código, nombre, RUC, dirección, departamento, provincia, distrito y nivel de riesgo son obligatorios'
      });
    }


    // =================================================
    // NORMALIZAR DATOS
    // =================================================
    const codigoNormalizado =
      codigo
        .trim()
        .toUpperCase();


    const rucNormalizado =
      ruc.trim();


    const riesgoNormalizado =
      nivelRiesgo
        .trim()
        .toUpperCase();


    // =================================================
    // VALIDAR RUC
    // =================================================
    if (
      !rucValido(
        rucNormalizado
      )
    ) {
      return res.status(400).json({
        ok: false,
        mensaje:
          'El RUC debe contener exactamente 11 dígitos'
      });
    }


    // =================================================
    // VALIDAR NIVEL DE RIESGO
    // =================================================
    if (
      !nivelRiesgoValido(
        riesgoNormalizado
      )
    ) {
      return res.status(400).json({
        ok: false,
        mensaje:
          'El nivel de riesgo debe ser BAJO, MEDIO o ALTO'
      });
    }


    // =================================================
    // VALIDAR CÓDIGO ÚNICO
    // =================================================
    const tiendaExistente =
      await pool.query(
        `
        SELECT id

        FROM tiendas

        WHERE UPPER(codigo) =
          UPPER($1)

        LIMIT 1;
        `,
        [
          codigoNormalizado
        ]
      );


    if (
      tiendaExistente.rowCount > 0
    ) {
      return res.status(409).json({
        ok: false,
        mensaje:
          'Ya existe una tienda con ese código'
      });
    }


    // =================================================
    // REGISTRAR
    // =================================================
    const resultado =
      await pool.query(
        `
        INSERT INTO tiendas (
          codigo,
          nombre,
          ruc,
          direccion,
          departamento,
          provincia,
          distrito,
          nivel_riesgo,
          activo
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
          TRUE
        )

        RETURNING
          id,
          codigo,
          nombre,
          ruc,
          direccion,
          departamento,
          provincia,
          distrito,
          nivel_riesgo,
          activo,
          fecha_creacion,
          fecha_actualizacion;
        `,
        [
          codigoNormalizado,
          nombre.trim(),
          rucNormalizado,
          direccion.trim(),
          departamento.trim(),
          provincia.trim(),
          distrito.trim(),
          riesgoNormalizado
        ]
      );


    const tienda =
      resultado.rows[0];


    // =================================================
    // AUDITORÍA
    // =================================================
    await registrarEvento({
      usuarioId,

      evento:
        'TIENDA_CREADA',

      modulo:
        'TIENDAS',

      descripcion:
        `Se registró la tienda ID ${tienda.id}, código ${tienda.codigo}, nombre ${tienda.nombre}`,

      ip:
        req.ip,

      userAgent:
        req.headers['user-agent']
    });


    return res.status(201).json({
      ok: true,

      mensaje:
        'Tienda registrada correctamente',

      tienda:
        formatearTienda(
          tienda
        )
    });

  } catch (error) {
    console.error(
      'Error al registrar tienda:',
      error.message
    );


    if (
      error.code === '23505'
    ) {
      return res.status(409).json({
        ok: false,
        mensaje:
          'El código de tienda ya se encuentra registrado'
      });
    }


    return res.status(500).json({
      ok: false,
      mensaje:
        'Error interno del servidor'
    });
  }
}


// =====================================================
// EDITAR TIENDA
// =====================================================
async function editarTienda(
  req,
  res
) {
  try {
    const usuarioId =
      req.usuario.usuarioId;


    const {
      id
    } = req.params;


    const {
      codigo,
      nombre,
      ruc,
      direccion,
      departamento,
      provincia,
      distrito,
      nivelRiesgo
    } = req.body;


    // =================================================
    // VALIDAR ID
    // =================================================
    if (!idValido(id)) {
      return res.status(400).json({
        ok: false,
        mensaje:
          'El identificador de la tienda no es válido'
      });
    }


    // =================================================
    // VALIDAR CAMPOS
    // =================================================
    if (
      !textoValido(codigo) ||
      !textoValido(nombre) ||
      !textoValido(ruc) ||
      !textoValido(direccion) ||
      !textoValido(departamento) ||
      !textoValido(provincia) ||
      !textoValido(distrito) ||
      !textoValido(nivelRiesgo)
    ) {
      return res.status(400).json({
        ok: false,
        mensaje:
          'Todos los campos de la tienda son obligatorios'
      });
    }


    const codigoNormalizado =
      codigo
        .trim()
        .toUpperCase();


    const rucNormalizado =
      ruc.trim();


    const riesgoNormalizado =
      nivelRiesgo
        .trim()
        .toUpperCase();


    // =================================================
    // VALIDAR RUC
    // =================================================
    if (
      !rucValido(
        rucNormalizado
      )
    ) {
      return res.status(400).json({
        ok: false,
        mensaje:
          'El RUC debe contener exactamente 11 dígitos'
      });
    }


    // =================================================
    // VALIDAR RIESGO
    // =================================================
    if (
      !nivelRiesgoValido(
        riesgoNormalizado
      )
    ) {
      return res.status(400).json({
        ok: false,
        mensaje:
          'El nivel de riesgo debe ser BAJO, MEDIO o ALTO'
      });
    }


    // =================================================
    // BUSCAR TIENDA ACTUAL
    // =================================================
    const tiendaActualResultado =
      await pool.query(
        `
        SELECT
          id,
          codigo,
          nombre,
          ruc,
          direccion,
          departamento,
          provincia,
          distrito,
          nivel_riesgo,
          activo

        FROM tiendas

        WHERE id = $1

        LIMIT 1;
        `,
        [
          id
        ]
      );


    if (
      tiendaActualResultado.rowCount ===
      0
    ) {
      return res.status(404).json({
        ok: false,
        mensaje:
          'Tienda no encontrada'
      });
    }


    const tiendaAnterior =
      tiendaActualResultado.rows[0];


    // =================================================
    // VALIDAR CÓDIGO ÚNICO
    // =================================================
    const codigoExistente =
      await pool.query(
        `
        SELECT id

        FROM tiendas

        WHERE UPPER(codigo) =
          UPPER($1)

          AND id <> $2

        LIMIT 1;
        `,
        [
          codigoNormalizado,
          id
        ]
      );


    if (
      codigoExistente.rowCount > 0
    ) {
      return res.status(409).json({
        ok: false,
        mensaje:
          'Ya existe otra tienda con ese código'
      });
    }


    // =================================================
    // ACTUALIZAR
    // =================================================
    const resultado =
      await pool.query(
        `
        UPDATE tiendas

        SET
          codigo = $1,
          nombre = $2,
          ruc = $3,
          direccion = $4,
          departamento = $5,
          provincia = $6,
          distrito = $7,
          nivel_riesgo = $8,
          fecha_actualizacion = NOW()

        WHERE id = $9

        RETURNING
          id,
          codigo,
          nombre,
          ruc,
          direccion,
          departamento,
          provincia,
          distrito,
          nivel_riesgo,
          activo,
          fecha_creacion,
          fecha_actualizacion;
        `,
        [
          codigoNormalizado,
          nombre.trim(),
          rucNormalizado,
          direccion.trim(),
          departamento.trim(),
          provincia.trim(),
          distrito.trim(),
          riesgoNormalizado,
          id
        ]
      );


    const tiendaActualizada =
      resultado.rows[0];


    // =================================================
    // AUDITORÍA
    // =================================================
    await registrarEvento({
      usuarioId,

      evento:
        'TIENDA_EDITADA',

      modulo:
        'TIENDAS',

      descripcion:
        `Se editó la tienda ID ${tiendaActualizada.id}. Código anterior: ${tiendaAnterior.codigo}. Código actual: ${tiendaActualizada.codigo}. Nombre anterior: ${tiendaAnterior.nombre}. Nombre actual: ${tiendaActualizada.nombre}`,

      ip:
        req.ip,

      userAgent:
        req.headers['user-agent']
    });


    return res.status(200).json({
      ok: true,

      mensaje:
        'Tienda actualizada correctamente',

      tienda:
        formatearTienda(
          tiendaActualizada
        )
    });

  } catch (error) {
    console.error(
      'Error al editar tienda:',
      error.message
    );


    if (
      error.code === '23505'
    ) {
      return res.status(409).json({
        ok: false,
        mensaje:
          'El código de tienda ya se encuentra registrado'
      });
    }


    return res.status(500).json({
      ok: false,
      mensaje:
        'Error interno del servidor'
    });
  }
}


// =====================================================
// ACTIVAR O DESACTIVAR TIENDA
// =====================================================
async function cambiarEstadoTienda(
  req,
  res
) {
  try {
    const usuarioId =
      req.usuario.usuarioId;


    const {
      id
    } = req.params;


    const {
      activo
    } = req.body;


    // =================================================
    // VALIDAR ID
    // =================================================
    if (!idValido(id)) {
      return res.status(400).json({
        ok: false,
        mensaje:
          'El identificador de la tienda no es válido'
      });
    }


    // =================================================
    // VALIDAR ESTADO
    // =================================================
    if (
      typeof activo !==
      'boolean'
    ) {
      return res.status(400).json({
        ok: false,
        mensaje:
          'El campo activo debe ser true o false'
      });
    }


    // =================================================
    // BUSCAR TIENDA
    // =================================================
    const tiendaResultado =
      await pool.query(
        `
        SELECT
          id,
          codigo,
          nombre,
          activo

        FROM tiendas

        WHERE id = $1

        LIMIT 1;
        `,
        [
          id
        ]
      );


    if (
      tiendaResultado.rowCount === 0
    ) {
      return res.status(404).json({
        ok: false,
        mensaje:
          'Tienda no encontrada'
      });
    }


    const tiendaAnterior =
      tiendaResultado.rows[0];


    // =================================================
    // MISMO ESTADO
    // =================================================
    if (
      tiendaAnterior.activo ===
      activo
    ) {
      return res.status(200).json({
        ok: true,

        mensaje:
          activo
            ? 'La tienda ya se encuentra activa'
            : 'La tienda ya se encuentra inactiva'
      });
    }


    // =================================================
    // ACTUALIZAR ESTADO
    // =================================================
    const resultado =
      await pool.query(
        `
        UPDATE tiendas

        SET
          activo = $1,
          fecha_actualizacion = NOW()

        WHERE id = $2

        RETURNING
          id,
          codigo,
          nombre,
          ruc,
          direccion,
          departamento,
          provincia,
          distrito,
          nivel_riesgo,
          activo,
          fecha_creacion,
          fecha_actualizacion;
        `,
        [
          activo,
          id
        ]
      );


    const tienda =
      resultado.rows[0];


    // =================================================
    // AUDITORÍA
    // =================================================
    await registrarEvento({
      usuarioId,

      evento:
        activo
          ? 'TIENDA_ACTIVADA'
          : 'TIENDA_DESACTIVADA',

      modulo:
        'TIENDAS',

      descripcion:
        activo
          ? `Se activó la tienda ID ${tienda.id}, código ${tienda.codigo}`
          : `Se desactivó la tienda ID ${tienda.id}, código ${tienda.codigo}`,

      ip:
        req.ip,

      userAgent:
        req.headers['user-agent']
    });


    return res.status(200).json({
      ok: true,

      mensaje:
        activo
          ? 'Tienda activada correctamente'
          : 'Tienda desactivada correctamente',

      tienda:
        formatearTienda(
          tienda
        )
    });

  } catch (error) {
    console.error(
      'Error al cambiar estado de tienda:',
      error.message
    );


    return res.status(500).json({
      ok: false,
      mensaje:
        'Error interno del servidor'
    });
  }
}


// =====================================================
// CONSULTAR FICHA DE TIENDA
// =====================================================
async function obtenerTienda(
  req,
  res
) {
  try {
    const {
      id
    } = req.params;


    if (!idValido(id)) {
      return res.status(400).json({
        ok: false,
        mensaje:
          'El identificador de la tienda no es válido'
      });
    }


    const resultado =
      await pool.query(
        `
        SELECT
          id,
          codigo,
          nombre,
          ruc,
          direccion,
          departamento,
          provincia,
          distrito,
          nivel_riesgo,
          activo,
          fecha_creacion,
          fecha_actualizacion

        FROM tiendas

        WHERE id = $1

        LIMIT 1;
        `,
        [
          id
        ]
      );


    if (
      resultado.rowCount === 0
    ) {
      return res.status(404).json({
        ok: false,
        mensaje:
          'Tienda no encontrada'
      });
    }


    return res.status(200).json({
      ok: true,

      tienda:
        formatearTienda(
          resultado.rows[0]
        )
    });

  } catch (error) {
    console.error(
      'Error al consultar tienda:',
      error.message
    );


    return res.status(500).json({
      ok: false,
      mensaje:
        'Error interno del servidor'
    });
  }
}


// =====================================================
// EXPORTAR
// =====================================================
module.exports = {
  listarTiendas,
  registrarTienda,
  editarTienda,
  cambiarEstadoTienda,
  obtenerTienda
};