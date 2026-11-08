const pool = require('../config/database');

const {
  registrarEvento
} = require('../services/auditoria.service');


// ============================================================
// UTILIDADES
// ============================================================

function idValido(id) {
  const numero = Number(id);

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


function formatearTipoDocumento(tipo) {
  return {
    id:
      tipo.id,

    nombre:
      tipo.nombre,

    categoria:
      tipo.categoria,

    descripcion:
      tipo.descripcion,

    requiereRenovacion:
      tipo.requiere_renovacion,

    activo:
      tipo.activo,

    fechaCreacion:
      tipo.fecha_creacion,

    fechaActualizacion:
      tipo.fecha_actualizacion
  };
}


// ============================================================
// LISTAR TIPOS DE DOCUMENTO
// ============================================================

async function listarTiposDocumento(
  req,
  res
) {
  try {
    const {
      soloActivos
    } = req.query;


    let filtro = '';


    if (
      soloActivos === 'true'
    ) {
      filtro =
        'WHERE activo = TRUE';
    }


    const resultado =
      await pool.query(
        `
          SELECT
            id,
            nombre,
            categoria,
            descripcion,
            requiere_renovacion,
            activo,
            fecha_creacion,
            fecha_actualizacion

          FROM tipos_documento

          ${filtro}

          ORDER BY
            activo DESC,
            categoria ASC,
            nombre ASC;
        `
      );


    const tiposDocumento =
      resultado.rows.map(
        formatearTipoDocumento
      );


    return res.status(200).json({
      ok: true,

      total:
        tiposDocumento.length,

      tiposDocumento
    });

  } catch (error) {
    console.error(
      'Error al listar tipos de documento:',
      error.message
    );


    return res.status(500).json({
      ok: false,

      mensaje:
        'Error interno del servidor'
    });
  }
}


// ============================================================
// OBTENER TIPO DE DOCUMENTO
// ============================================================

async function obtenerTipoDocumento(
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
          'El identificador del tipo de documento no es válido'
      });
    }


    const resultado =
      await pool.query(
        `
          SELECT
            id,
            nombre,
            categoria,
            descripcion,
            requiere_renovacion,
            activo,
            fecha_creacion,
            fecha_actualizacion

          FROM tipos_documento

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
          'Tipo de documento no encontrado'
      });
    }


    return res.status(200).json({
      ok: true,

      tipoDocumento:
        formatearTipoDocumento(
          resultado.rows[0]
        )
    });

  } catch (error) {
    console.error(
      'Error al obtener tipo de documento:',
      error.message
    );


    return res.status(500).json({
      ok: false,

      mensaje:
        'Error interno del servidor'
    });
  }
}


// ============================================================
// REGISTRAR TIPO DE DOCUMENTO
// ============================================================

async function registrarTipoDocumento(
  req,
  res
) {
  try {
    const usuarioId =
      req.usuario.usuarioId;


    const {
      nombre,
      categoria,
      descripcion,
      requiereRenovacion
    } = req.body;


    // ========================================================
    // CAMPOS OBLIGATORIOS
    // ========================================================

    if (
      !textoValido(nombre) ||
      !textoValido(categoria) ||
      !textoValido(descripcion)
    ) {
      return res.status(400).json({
        ok: false,

        mensaje:
          'Nombre, categoría y descripción son obligatorios'
      });
    }


    if (
      typeof requiereRenovacion !== 'boolean'
    ) {
      return res.status(400).json({
        ok: false,

        mensaje:
          'El campo requiereRenovacion debe ser true o false'
      });
    }


    const nombreNormalizado =
      nombre.trim();


    const categoriaNormalizada =
      categoria.trim();


    const descripcionNormalizada =
      descripcion.trim();


    // ========================================================
    // VALIDAR DUPLICADO LÓGICO
    // ========================================================

    const duplicado =
      await pool.query(
        `
          SELECT id

          FROM tipos_documento

          WHERE
            UPPER(TRIM(nombre)) =
              UPPER(TRIM($1))

            AND UPPER(TRIM(categoria)) =
              UPPER(TRIM($2))

          LIMIT 1;
        `,
        [
          nombreNormalizado,
          categoriaNormalizada
        ]
      );


    if (
      duplicado.rowCount > 0
    ) {
      return res.status(409).json({
        ok: false,

        mensaje:
          'Ya existe un tipo de documento con el mismo nombre y categoría'
      });
    }


    // ========================================================
    // REGISTRAR
    // ========================================================

    const resultado =
      await pool.query(
        `
          INSERT INTO tipos_documento (
            nombre,
            categoria,
            descripcion,
            requiere_renovacion,
            activo
          )

          VALUES (
            $1,
            $2,
            $3,
            $4,
            TRUE
          )

          RETURNING
            id,
            nombre,
            categoria,
            descripcion,
            requiere_renovacion,
            activo,
            fecha_creacion,
            fecha_actualizacion;
        `,
        [
          nombreNormalizado,
          categoriaNormalizada,
          descripcionNormalizada,
          requiereRenovacion
        ]
      );


    const tipoDocumento =
      resultado.rows[0];


    // ========================================================
    // AUDITORÍA
    // ========================================================

    await registrarEvento({
      usuarioId,

      evento:
        'TIPO_DOCUMENTO_CREADO',

      modulo:
        'TIPOS_DOCUMENTO',

      descripcion:
        `Se registró el tipo de documento ID ${tipoDocumento.id}, nombre ${tipoDocumento.nombre}, categoría ${tipoDocumento.categoria}`,

      ip:
        req.ip,

      userAgent:
        req.headers['user-agent']
    });


    return res.status(201).json({
      ok: true,

      mensaje:
        'Tipo de documento registrado correctamente',

      tipoDocumento:
        formatearTipoDocumento(
          tipoDocumento
        )
    });

  } catch (error) {
    console.error(
      'Error al registrar tipo de documento:',
      error.message
    );


    if (
      error.code === '23505'
    ) {
      return res.status(409).json({
        ok: false,

        mensaje:
          'Ya existe un tipo de documento con el mismo nombre y categoría'
      });
    }


    return res.status(500).json({
      ok: false,

      mensaje:
        'Error interno del servidor'
    });
  }
}


// ============================================================
// EDITAR TIPO DE DOCUMENTO
// ============================================================
//
// Para preservar la consistencia histórica:
//
// - NO modifica nombre.
// - NO modifica categoría.
// - NO modifica requiere_renovacion.
//
// La renovación solamente puede modificarse mediante:
// Vigencia y Alertas.
//
// Ese proceso crea una nueva versión en
// tipo_documento_reglas_vigencia.
//
// Desde este endpoint únicamente se permite cambiar
// la descripción.
//
// ============================================================

async function editarTipoDocumento(
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
      descripcion
    } = req.body;


    // ========================================================
    // VALIDAR ID
    // ========================================================

    if (!idValido(id)) {
      return res.status(400).json({
        ok: false,

        mensaje:
          'El identificador del tipo de documento no es válido'
      });
    }


    // ========================================================
    // VALIDAR DESCRIPCIÓN
    // ========================================================

    if (
      !textoValido(descripcion)
    ) {
      return res.status(400).json({
        ok: false,

        mensaje:
          'La descripción es obligatoria'
      });
    }


    // ========================================================
    // BUSCAR REGISTRO ACTUAL
    // ========================================================

    const actualResultado =
      await pool.query(
        `
          SELECT
            id,
            nombre,
            categoria,
            descripcion,
            requiere_renovacion,
            activo

          FROM tipos_documento

          WHERE id = $1

          LIMIT 1;
        `,
        [
          id
        ]
      );


    if (
      actualResultado.rowCount === 0
    ) {
      return res.status(404).json({
        ok: false,

        mensaje:
          'Tipo de documento no encontrado'
      });
    }


    const tipoAnterior =
      actualResultado.rows[0];


    // ========================================================
    // ACTUALIZAR SOLO DESCRIPCIÓN
    // ========================================================

    const resultado =
      await pool.query(
        `
          UPDATE tipos_documento

          SET
            descripcion = $1,
            fecha_actualizacion = NOW()

          WHERE id = $2

          RETURNING
            id,
            nombre,
            categoria,
            descripcion,
            requiere_renovacion,
            activo,
            fecha_creacion,
            fecha_actualizacion;
        `,
        [
          descripcion.trim(),
          id
        ]
      );


    const tipoDocumento =
      resultado.rows[0];


    // ========================================================
    // AUDITORÍA
    // ========================================================

    await registrarEvento({
      usuarioId,

      evento:
        'TIPO_DOCUMENTO_EDITADO',

      modulo:
        'TIPOS_DOCUMENTO',

      descripcion:
        `Se editó la descripción del tipo de documento ID ${tipoDocumento.id}, nombre ${tipoDocumento.nombre}. Descripción anterior: "${tipoAnterior.descripcion}". Nueva descripción: "${tipoDocumento.descripcion}"`,

      ip:
        req.ip,

      userAgent:
        req.headers['user-agent']
    });


    return res.status(200).json({
      ok: true,

      mensaje:
        'Tipo de documento actualizado correctamente',

      tipoDocumento:
        formatearTipoDocumento(
          tipoDocumento
        )
    });

  } catch (error) {
    console.error(
      'Error al editar tipo de documento:',
      error.message
    );


    return res.status(500).json({
      ok: false,

      mensaje:
        'Error interno del servidor'
    });
  }
}


// ============================================================
// ACTIVAR / DESACTIVAR TIPO DE DOCUMENTO
// ============================================================

async function cambiarEstadoTipoDocumento(
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


    if (!idValido(id)) {
      return res.status(400).json({
        ok: false,

        mensaje:
          'El identificador del tipo de documento no es válido'
      });
    }


    if (
      typeof activo !== 'boolean'
    ) {
      return res.status(400).json({
        ok: false,

        mensaje:
          'El campo activo debe ser true o false'
      });
    }


    // ========================================================
    // BUSCAR TIPO DOCUMENTAL
    // ========================================================

    const actualResultado =
      await pool.query(
        `
          SELECT
            id,
            nombre,
            categoria,
            activo

          FROM tipos_documento

          WHERE id = $1

          LIMIT 1;
        `,
        [
          id
        ]
      );


    if (
      actualResultado.rowCount === 0
    ) {
      return res.status(404).json({
        ok: false,

        mensaje:
          'Tipo de documento no encontrado'
      });
    }


    const tipoAnterior =
      actualResultado.rows[0];


    // ========================================================
    // YA TIENE EL ESTADO SOLICITADO
    // ========================================================

    if (
      tipoAnterior.activo ===
      activo
    ) {
      return res.status(200).json({
        ok: true,

        mensaje:
          activo
            ? 'El tipo de documento ya se encuentra activo'
            : 'El tipo de documento ya se encuentra inactivo'
      });
    }


    // ========================================================
    // ACTUALIZAR ESTADO
    // ========================================================

    const resultado =
      await pool.query(
        `
          UPDATE tipos_documento

          SET
            activo = $1,
            fecha_actualizacion = NOW()

          WHERE id = $2

          RETURNING
            id,
            nombre,
            categoria,
            descripcion,
            requiere_renovacion,
            activo,
            fecha_creacion,
            fecha_actualizacion;
        `,
        [
          activo,
          id
        ]
      );


    const tipoDocumento =
      resultado.rows[0];


    // ========================================================
    // AUDITORÍA
    // ========================================================

    await registrarEvento({
      usuarioId,

      evento:
        activo
          ? 'TIPO_DOCUMENTO_ACTIVADO'
          : 'TIPO_DOCUMENTO_DESACTIVADO',

      modulo:
        'TIPOS_DOCUMENTO',

      descripcion:
        activo
          ? `Se activó el tipo de documento ID ${tipoDocumento.id}, nombre ${tipoDocumento.nombre}`
          : `Se desactivó el tipo de documento ID ${tipoDocumento.id}, nombre ${tipoDocumento.nombre}`,

      ip:
        req.ip,

      userAgent:
        req.headers['user-agent']
    });


    return res.status(200).json({
      ok: true,

      mensaje:
        activo
          ? 'Tipo de documento activado correctamente'
          : 'Tipo de documento desactivado correctamente',

      tipoDocumento:
        formatearTipoDocumento(
          tipoDocumento
        )
    });

  } catch (error) {
    console.error(
      'Error al cambiar estado del tipo de documento:',
      error.message
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
  listarTiposDocumento,
  obtenerTipoDocumento,
  registrarTipoDocumento,
  editarTipoDocumento,
  cambiarEstadoTipoDocumento
};