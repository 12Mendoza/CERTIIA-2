const pool = require('../config/database');

const {
  registrarEvento
} = require('../services/auditoria.service');


// ============================================================
// TIPOS PERMITIDOS
// ============================================================
const TIPOS_ENTIDAD = [
  'MUNICIPALIDAD',
  'ENTIDAD_PUBLICA',
  'EMPRESA_PRIVADA',
  'PROFESIONAL'
];


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


function rucValido(ruc) {
  if (
    ruc === null ||
    ruc === undefined ||
    String(ruc).trim() === ''
  ) {
    return true;
  }


  return /^[0-9]{11}$/.test(
    String(ruc).trim()
  );
}


function tipoValido(tipo) {
  return TIPOS_ENTIDAD.includes(
    tipo
  );
}


// ============================================================
// FORMATEAR ENTIDAD
// ============================================================
function formatearEntidad(entidad) {
  return {
    id:
      entidad.id,

    tipo:
      entidad.tipo,

    nombre:
      entidad.nombre,

    ruc:
      entidad.ruc,

    ubicacion:
      entidad.ubicacion,

    datosContacto:
      entidad.datos_contacto,

    activo:
      entidad.activo,

    fechaCreacion:
      entidad.fecha_creacion,

    fechaActualizacion:
      entidad.fecha_actualizacion
  };
}


// ============================================================
// LISTAR ENTIDADES
// ============================================================
async function listarEntidades(
  req,
  res
) {
  try {
    const {
      soloActivas
    } = req.query;


    let filtro = '';

    const valores = [];


    if (
      soloActivas === 'true'
    ) {
      filtro =
        'WHERE activo = TRUE';
    }


    const resultado =
      await pool.query(
        `
        SELECT
          id,
          tipo,
          nombre,
          ruc,
          ubicacion,
          datos_contacto,
          activo,
          fecha_creacion,
          fecha_actualizacion

        FROM entidades_emisoras

        ${filtro}

        ORDER BY
          activo DESC,
          nombre ASC;
        `,
        valores
      );


    const entidades =
      resultado.rows.map(
        formatearEntidad
      );


    return res.status(200).json({
      ok: true,

      total:
        entidades.length,

      entidades
    });

  } catch (error) {
    console.error(
      'Error al listar entidades emisoras:',
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
// OBTENER ENTIDAD
// ============================================================
async function obtenerEntidad(
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
          'El identificador de la entidad no es válido'
      });
    }


    const resultado =
      await pool.query(
        `
        SELECT
          id,
          tipo,
          nombre,
          ruc,
          ubicacion,
          datos_contacto,
          activo,
          fecha_creacion,
          fecha_actualizacion

        FROM entidades_emisoras

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
          'Entidad emisora no encontrada'
      });
    }


    return res.status(200).json({
      ok: true,

      entidad:
        formatearEntidad(
          resultado.rows[0]
        )
    });

  } catch (error) {
    console.error(
      'Error al obtener entidad emisora:',
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
// REGISTRAR ENTIDAD
// ============================================================
async function registrarEntidad(
  req,
  res
) {
  try {
    const usuarioId =
      req.usuario.usuarioId;


    const {
      tipo,
      nombre,
      ruc,
      ubicacion,
      datosContacto
    } = req.body;


    // ========================================================
    // VALIDAR CAMPOS OBLIGATORIOS
    // ========================================================
    if (
      !textoValido(tipo) ||
      !textoValido(nombre) ||
      !textoValido(ubicacion)
    ) {
      return res.status(400).json({
        ok: false,

        mensaje:
          'Tipo, nombre y ubicación son obligatorios'
      });
    }


    // ========================================================
    // NORMALIZAR
    // ========================================================
    const tipoNormalizado =
      tipo
        .trim()
        .toUpperCase();


    const nombreNormalizado =
      nombre.trim();


    const rucNormalizado =
      ruc
        ? String(ruc).trim()
        : null;


    const ubicacionNormalizada =
      ubicacion.trim();


    const contactoNormalizado =
      datosContacto &&
      String(datosContacto).trim()
        ? String(datosContacto).trim()
        : null;


    // ========================================================
    // VALIDAR TIPO
    // ========================================================
    if (
      !tipoValido(
        tipoNormalizado
      )
    ) {
      return res.status(400).json({
        ok: false,

        mensaje:
          'El tipo de entidad no es válido'
      });
    }


    // ========================================================
    // VALIDAR RUC
    // ========================================================
    if (
      !rucValido(
        rucNormalizado
      )
    ) {
      return res.status(400).json({
        ok: false,

        mensaje:
          'El RUC debe contener exactamente 11 dígitos cuando aplique'
      });
    }


    // ========================================================
    // VALIDAR DUPLICADO LÓGICO
    // ========================================================
    const duplicado =
      await pool.query(
        `
        SELECT id

        FROM entidades_emisoras

        WHERE
          UPPER(tipo) =
            UPPER($1)

          AND UPPER(TRIM(nombre)) =
            UPPER(TRIM($2))

        LIMIT 1;
        `,
        [
          tipoNormalizado,
          nombreNormalizado
        ]
      );


    if (
      duplicado.rowCount > 0
    ) {
      return res.status(409).json({
        ok: false,

        mensaje:
          'Ya existe una entidad emisora con el mismo tipo y nombre'
      });
    }


    // ========================================================
    // INSERTAR
    // ========================================================
    const resultado =
      await pool.query(
        `
        INSERT INTO entidades_emisoras (
          tipo,
          nombre,
          ruc,
          ubicacion,
          datos_contacto,
          activo
        )

        VALUES (
          $1,
          $2,
          $3,
          $4,
          $5,
          TRUE
        )

        RETURNING
          id,
          tipo,
          nombre,
          ruc,
          ubicacion,
          datos_contacto,
          activo,
          fecha_creacion,
          fecha_actualizacion;
        `,
        [
          tipoNormalizado,
          nombreNormalizado,
          rucNormalizado,
          ubicacionNormalizada,
          contactoNormalizado
        ]
      );


    const entidad =
      resultado.rows[0];


    // ========================================================
    // AUDITORÍA
    // ========================================================
    await registrarEvento({
      usuarioId,

      evento:
        'ENTIDAD_EMISORA_CREADA',

      modulo:
        'ENTIDADES_EMISORAS',

      descripcion:
        `Se registró la entidad emisora ID ${entidad.id}, tipo ${entidad.tipo}, nombre ${entidad.nombre}`,

      ip:
        req.ip,

      userAgent:
        req.headers['user-agent']
    });


    return res.status(201).json({
      ok: true,

      mensaje:
        'Entidad emisora registrada correctamente',

      entidad:
        formatearEntidad(
          entidad
        )
    });

  } catch (error) {
    console.error(
      'Error al registrar entidad emisora:',
      error.message
    );


    if (
      error.code === '23505'
    ) {
      return res.status(409).json({
        ok: false,

        mensaje:
          'Ya existe una entidad emisora con el mismo tipo y nombre'
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
// EDITAR ENTIDAD
// ============================================================
async function editarEntidad(
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
      tipo,
      nombre,
      ruc,
      ubicacion,
      datosContacto
    } = req.body;


    // ========================================================
    // VALIDAR ID
    // ========================================================
    if (!idValido(id)) {
      return res.status(400).json({
        ok: false,

        mensaje:
          'El identificador de la entidad no es válido'
      });
    }


    // ========================================================
    // VALIDAR CAMPOS
    // ========================================================
    if (
      !textoValido(tipo) ||
      !textoValido(nombre) ||
      !textoValido(ubicacion)
    ) {
      return res.status(400).json({
        ok: false,

        mensaje:
          'Tipo, nombre y ubicación son obligatorios'
      });
    }


    const tipoNormalizado =
      tipo
        .trim()
        .toUpperCase();


    const nombreNormalizado =
      nombre.trim();


    const rucNormalizado =
      ruc
        ? String(ruc).trim()
        : null;


    const ubicacionNormalizada =
      ubicacion.trim();


    const contactoNormalizado =
      datosContacto &&
      String(datosContacto).trim()
        ? String(datosContacto).trim()
        : null;


    // ========================================================
    // VALIDAR TIPO
    // ========================================================
    if (
      !tipoValido(
        tipoNormalizado
      )
    ) {
      return res.status(400).json({
        ok: false,

        mensaje:
          'El tipo de entidad no es válido'
      });
    }


    // ========================================================
    // VALIDAR RUC
    // ========================================================
    if (
      !rucValido(
        rucNormalizado
      )
    ) {
      return res.status(400).json({
        ok: false,

        mensaje:
          'El RUC debe contener exactamente 11 dígitos cuando aplique'
      });
    }


    // ========================================================
    // VERIFICAR EXISTENCIA
    // ========================================================
    const actualResultado =
      await pool.query(
        `
        SELECT
          id,
          tipo,
          nombre,
          ruc,
          ubicacion,
          datos_contacto,
          activo

        FROM entidades_emisoras

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
          'Entidad emisora no encontrada'
      });
    }


    const entidadAnterior =
      actualResultado.rows[0];


    // ========================================================
    // VALIDAR DUPLICADO
    // ========================================================
    const duplicado =
      await pool.query(
        `
        SELECT id

        FROM entidades_emisoras

        WHERE
          UPPER(tipo) =
            UPPER($1)

          AND UPPER(TRIM(nombre)) =
            UPPER(TRIM($2))

          AND id <> $3

        LIMIT 1;
        `,
        [
          tipoNormalizado,
          nombreNormalizado,
          id
        ]
      );


    if (
      duplicado.rowCount > 0
    ) {
      return res.status(409).json({
        ok: false,

        mensaje:
          'Ya existe otra entidad emisora con el mismo tipo y nombre'
      });
    }


    // ========================================================
    // ACTUALIZAR
    // ========================================================
    const resultado =
      await pool.query(
        `
        UPDATE entidades_emisoras

        SET
          tipo = $1,
          nombre = $2,
          ruc = $3,
          ubicacion = $4,
          datos_contacto = $5,
          fecha_actualizacion = NOW()

        WHERE id = $6

        RETURNING
          id,
          tipo,
          nombre,
          ruc,
          ubicacion,
          datos_contacto,
          activo,
          fecha_creacion,
          fecha_actualizacion;
        `,
        [
          tipoNormalizado,
          nombreNormalizado,
          rucNormalizado,
          ubicacionNormalizada,
          contactoNormalizado,
          id
        ]
      );


    const entidad =
      resultado.rows[0];


    // ========================================================
    // AUDITORÍA
    // ========================================================
    await registrarEvento({
      usuarioId,

      evento:
        'ENTIDAD_EMISORA_EDITADA',

      modulo:
        'ENTIDADES_EMISORAS',

      descripcion:
        `Se editó la entidad emisora ID ${entidad.id}. Tipo anterior: ${entidadAnterior.tipo}. Tipo actual: ${entidad.tipo}. Nombre anterior: ${entidadAnterior.nombre}. Nombre actual: ${entidad.nombre}`,

      ip:
        req.ip,

      userAgent:
        req.headers['user-agent']
    });


    return res.status(200).json({
      ok: true,

      mensaje:
        'Entidad emisora actualizada correctamente',

      entidad:
        formatearEntidad(
          entidad
        )
    });

  } catch (error) {
    console.error(
      'Error al editar entidad emisora:',
      error.message
    );


    if (
      error.code === '23505'
    ) {
      return res.status(409).json({
        ok: false,

        mensaje:
          'Ya existe otra entidad emisora con el mismo tipo y nombre'
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
// CAMBIAR ESTADO
// ============================================================
async function cambiarEstadoEntidad(
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
          'El identificador de la entidad no es válido'
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
    // BUSCAR ENTIDAD
    // ========================================================
    const actualResultado =
      await pool.query(
        `
        SELECT
          id,
          tipo,
          nombre,
          activo

        FROM entidades_emisoras

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
          'Entidad emisora no encontrada'
      });
    }


    const entidadAnterior =
      actualResultado.rows[0];


    // ========================================================
    // YA TIENE EL ESTADO SOLICITADO
    // ========================================================
    if (
      entidadAnterior.activo ===
      activo
    ) {
      return res.status(200).json({
        ok: true,

        mensaje:
          activo
            ? 'La entidad emisora ya se encuentra activa'
            : 'La entidad emisora ya se encuentra inactiva'
      });
    }


    // ========================================================
    // ACTUALIZAR
    // ========================================================
    const resultado =
      await pool.query(
        `
        UPDATE entidades_emisoras

        SET
          activo = $1,
          fecha_actualizacion = NOW()

        WHERE id = $2

        RETURNING
          id,
          tipo,
          nombre,
          ruc,
          ubicacion,
          datos_contacto,
          activo,
          fecha_creacion,
          fecha_actualizacion;
        `,
        [
          activo,
          id
        ]
      );


    const entidad =
      resultado.rows[0];


    // ========================================================
    // AUDITORÍA
    // ========================================================
    await registrarEvento({
      usuarioId,

      evento:
        activo
          ? 'ENTIDAD_EMISORA_ACTIVADA'
          : 'ENTIDAD_EMISORA_DESACTIVADA',

      modulo:
        'ENTIDADES_EMISORAS',

      descripcion:
        activo
          ? `Se activó la entidad emisora ID ${entidad.id}, nombre ${entidad.nombre}`
          : `Se desactivó la entidad emisora ID ${entidad.id}, nombre ${entidad.nombre}`,

      ip:
        req.ip,

      userAgent:
        req.headers['user-agent']
    });


    return res.status(200).json({
      ok: true,

      mensaje:
        activo
          ? 'Entidad emisora activada correctamente'
          : 'Entidad emisora desactivada correctamente',

      entidad:
        formatearEntidad(
          entidad
        )
    });

  } catch (error) {
    console.error(
      'Error al cambiar estado de entidad emisora:',
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
  listarEntidades,
  obtenerEntidad,
  registrarEntidad,
  editarEntidad,
  cambiarEstadoEntidad
};