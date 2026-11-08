import {

  useEffect,

  useMemo,

  useState

} from 'react';


import {
  useLocation,
  useNavigate
} from 'react-router-dom';

import {

  ArrowLeft,

  Building2,

  CircleCheck,

  FilePlus2,

  FileText,

  Filter,

  Paperclip,

  RefreshCw,

  Search,

  Store,

  X

} from 'lucide-react';

import { api } from '../../services/api.js';

import DocumentoModal from './DocumentoModal.jsx';

import DocumentoArchivoModal from './DocumentoArchivoModal.jsx';

import DocumentoDetalleModal from './DocumentoDetalleModal.jsx';

import DocumentoEditarModal from './DocumentoEditarModal.jsx';

import DocumentoBajaModal from './DocumentoBajaModal.jsx';

import RenovacionIniciarModal from './RenovacionIniciarModal.jsx';

const obtenerDatosRespuesta = (

  respuesta

) => {

  return (

    respuesta?.data ??

    respuesta ??

    {}

  );

};

const obtenerMensajeError = (

  error,

  mensajePredeterminado

) => {

  return (

    error?.response?.data?.mensaje ||

    error?.response?.data?.error ||

    error?.data?.mensaje ||

    error?.data?.error ||

    error?.message ||

    mensajePredeterminado

  );

};

const obtenerCodigoDocumento = (

  documento

) => {

  return (

    documento?.codigoInterno ||

    documento?.codigo_interno ||

    ''

  );

};

const obtenerNumeroDocumento = (

  documento

) => {

  return (

    documento?.numeroDocumento ||

    documento?.numero_documento ||

    ''

  );

};

const obtenerFechaVencimiento = (

  documento

) => {

  return (

    documento?.fechaVencimiento ||

    documento?.fecha_vencimiento ||

    null

  );

};

const obtenerEstadoDocumento = (

  documento

) => {

  return documento?.estado || '';

};

const formatearFecha = (

  valor

) => {

  if (!valor) {

    return 'Sin vencimiento';

  }

  const texto =

    String(valor).slice(

      0,

      10

    );

  const partes =

    texto.split('-');

  if (

    partes.length !== 3

  ) {

    return texto;

  }

  return `${partes[2]}/${partes[1]}/${partes[0]}`;

};

const claseEstado = (

  estado

) => {

  switch (estado) {

    case 'VIGENTE':

      return 'bg-emerald-100 text-emerald-700';

    case 'POR_VENCER':

      return 'bg-amber-100 text-amber-700';

    case 'CRITICO':

      return 'bg-orange-100 text-orange-700';

    case 'VENCIDO':

      return 'bg-red-100 text-red-700';

    case 'EN_RENOVACION':

      return 'bg-blue-100 text-blue-700';

    default:

      return 'bg-slate-100 text-slate-700';

  }

};

const textoEstado = (

  estado

) => {

  switch (estado) {

    case 'POR_VENCER':

      return 'Por vencer';

    case 'CRITICO':

      return 'Crítico';

    case 'EN_RENOVACION':

      return 'En renovación';

    case 'VIGENTE':

      return 'Vigente';

    case 'VENCIDO':

      return 'Vencido';

    default:

      return estado || '—';

  }

};

const DocumentosPage = () => {

  const location =
    useLocation();

  const navigate =
    useNavigate();


  const filtrosInicialesRuta =
    useMemo(
      () => {

        const parametrosRuta =
          new URLSearchParams(
            location.search
          );


        return {

          q:
            parametrosRuta.get('q') || '',

          tipoDocumentoId:
            parametrosRuta.get('tipoDocumentoId') || '',

          categoria:
            parametrosRuta.get('categoria') || '',

          estado:
            parametrosRuta.get('estado') || '',

          tiendaId:
            parametrosRuta.get('tiendaId') || '',

          fechaDesde:
            parametrosRuta.get('fechaDesde') || '',

          fechaHasta:
            parametrosRuta.get('fechaHasta') || ''

        };

      },
      [location.search]
    );


  const documentoIdRuta =
    useMemo(
      () => {

        const parametros =
          new URLSearchParams(
            location.search
          );


        const desdeQuery =
          Number(
            parametros.get(
              'documentoId'
            )
          );


        const desdeState =
          Number(
            location.state
              ?.documentoId
          );


        if (
          location.state
            ?.abrirDetalle === true &&
          Number.isInteger(
            desdeState
          ) &&
          desdeState > 0
        ) {
          return desdeState;
        }


        if (
          Number.isInteger(
            desdeQuery
          ) &&
          desdeQuery > 0
        ) {
          return desdeQuery;
        }


        return null;
      },
      [
        location.search,
        location.state
      ]
    );


  const [

    cargandoCatalogos,

    setCargandoCatalogos

  ] = useState(true);

  const [

    recargando,

    setRecargando

  ] = useState(false);

  const [

    catalogos,

    setCatalogos

  ] = useState({

    tiendas: [],

    tiposDocumento: [],

    entidades: [],

    usuarios: []

  });

  const [

    documentos,

    setDocumentos

  ] = useState([]);

  const [

    cargandoDocumentos,

    setCargandoDocumentos

  ] = useState(true);

  const [

    totalDocumentos,

    setTotalDocumentos

  ] = useState(0);

  const [

    paginaActual,

    setPaginaActual

  ] = useState(1);

  const [

    totalPaginas,

    setTotalPaginas

  ] = useState(0);

  const limitePorPagina = 10;

  const [

    detalleAbierto,

    setDetalleAbierto

  ] = useState(false);

  const [

    documentoDetalle,

    setDocumentoDetalle

  ] = useState(null);

  const [

    cargandoDetalle,

    setCargandoDetalle

  ] = useState(false);

  const [

    errorDetalle,

    setErrorDetalle

  ] = useState('');

  const [

    filtros,

    setFiltros

  ] = useState(

    () => filtrosInicialesRuta

  );

  const [

    guardando,

    setGuardando

  ] = useState(false);

  const [

    modalAbierto,

    setModalAbierto

  ] = useState(false);

  const [

    ultimoDocumento,

    setUltimoDocumento

  ] = useState(null);

  const [

    mensajeExito,

    setMensajeExito

  ] = useState('');

  const [

    archivoModalAbierto,

    setArchivoModalAbierto

  ] = useState(false);

  const [

    adjuntandoArchivo,

    setAdjuntandoArchivo

  ] = useState(false);

  const [

    errorArchivo,

    setErrorArchivo

  ] = useState('');

  const [

    mensajeArchivo,

    setMensajeArchivo

  ] = useState('');

  const [

    archivoAdjuntado,

    setArchivoAdjuntado

  ] = useState(null);

  const [

    error,

    setError

  ] = useState('');

const [

  edicionAbierta,

  setEdicionAbierta

] = useState(false);

const [

  documentoEdicion,

  setDocumentoEdicion

] = useState(null);

const [

  guardandoEdicion,

  setGuardandoEdicion

] = useState(false);

const [

  errorEdicion,

  setErrorEdicion

] = useState('');

const [

  formularioEdicion,

  setFormularioEdicion

] = useState({

  numeroDocumento: '',

  numeroExpediente: '',

  entidadEmisoraId: '',

  fechaEmision: '',

  fechaVencimiento: '',

  responsableUsuarioId: '',

  observaciones: ''

});

  // ==========================================================
  // HU-025 - ARCHIVAR / ANULAR DOCUMENTO
  // ==========================================================

  const [
    bajaAbierta,
    setBajaAbierta
  ] = useState(false);

  const [
    documentoBaja,
    setDocumentoBaja
  ] = useState(null);

  const [
    procesandoBaja,
    setProcesandoBaja
  ] = useState(false);

  const [
    errorBaja,
    setErrorBaja
  ] = useState('');

  const [
    mensajeBaja,
    setMensajeBaja
  ] = useState('');


  // ==========================================================
  // HU-031 - INICIAR RENOVACIÓN
  // ==========================================================

  const [
    renovacionAbierta,
    setRenovacionAbierta
  ] = useState(false);

  const [
    documentoRenovacion,
    setDocumentoRenovacion
  ] = useState(null);

  const [
    guardandoRenovacion,
    setGuardandoRenovacion
  ] = useState(false);

  const [
    errorRenovacion,
    setErrorRenovacion
  ] = useState('');

  const categorias =

    useMemo(

      () => {

        const valores =

          catalogos.tiposDocumento

            .map(

              (tipo) =>

                tipo.categoria ||

                tipo.category ||

                ''

            )

            .filter(Boolean);

        return [

          ...new Set(

            valores

          )

        ].sort(

          (a, b) =>

            a.localeCompare(

              b,

              'es'

            )

        );

      },

      [

        catalogos.tiposDocumento

      ]

    );

  const cargarCatalogos =

    async ({

      mostrarCargaPrincipal = false

    } = {}) => {

      if (

        mostrarCargaPrincipal

      ) {

        setCargandoCatalogos(

          true

        );

      }

      setError('');

      try {

        const respuesta =

          await api.get(

            '/documentos/catalogos'

          );

        const datos =

          obtenerDatosRespuesta(

            respuesta

          );

        setCatalogos({

          tiendas:

            Array.isArray(

              datos.tiendas

            )

              ? datos.tiendas

              : [],

          tiposDocumento:

            Array.isArray(

              datos.tiposDocumento

            )

              ? datos.tiposDocumento

              : [],

          entidades:

            Array.isArray(

              datos.entidades

            )

              ? datos.entidades

              : [],

          usuarios:

            Array.isArray(

              datos.usuarios

            )

              ? datos.usuarios

              : []

        });

      } catch (

        errorPeticion

      ) {

        console.error(

          'Error cargando catálogos de documentos:',

          errorPeticion

        );

        setError(

          obtenerMensajeError(

            errorPeticion,

            'No se pudieron cargar los catálogos.'

          )

        );

      } finally {

        setCargandoCatalogos(

          false

        );

      }

    };

  const cargarDocumentos =

    async (

      filtrosAplicados =

        filtros,

      paginaSolicitada = 1

    ) => {

      setCargandoDocumentos(

        true

      );

      setError('');

      try {

        const parametros =

          new URLSearchParams();

        Object.entries(

          filtrosAplicados

        ).forEach(

          ([

            clave,

            valor

          ]) => {

            if (

              valor !== undefined &&

              valor !== null &&

              String(valor).trim() !== ''

            ) {

              parametros.set(

                clave,

                String(valor).trim()

              );

            }

          }

        );

        parametros.set(

          'pagina',

          String(paginaSolicitada)

        );

        parametros.set(

          'limite',

          String(limitePorPagina)

        );

        const query =

          parametros.toString();

        const endpoint =

          query

            ? `/documentos?${query}`

            : '/documentos';

        const respuesta =

          await api.get(

            endpoint

          );

        const datos =

          obtenerDatosRespuesta(

            respuesta

          );

        const lista =

          Array.isArray(

            datos.documentos

          )

            ? datos.documentos

            : [];

        setDocumentos(

          lista

        );

        setTotalDocumentos(

          Number(

            datos.total ??

            lista.length

          )

        );

        setPaginaActual(

          Number(

            datos.pagina ??

            paginaSolicitada

          )

        );

        setTotalPaginas(

          Number(

            datos.totalPaginas ??

            0

          )

        );

      } catch (

        errorPeticion

      ) {

        console.error(

          'Error cargando documentos:',

          errorPeticion

        );

        setDocumentos(

          []

        );

        setTotalDocumentos(

          0

        );

        setError(

          obtenerMensajeError(

            errorPeticion,

            'No se pudieron consultar los documentos.'

          )

        );

      } finally {

        setCargandoDocumentos(

          false

        );

      }

    };

  useEffect(

    () => {

      let activo = true;


      queueMicrotask(
        () => {

          if (!activo) {
            return;
          }


          setFiltros(
            filtrosInicialesRuta
          );


          cargarCatalogos({

            mostrarCargaPrincipal:

              true

          });

          cargarDocumentos(
            filtrosInicialesRuta,
            1
          );

        }
      );


      return () => {
        activo = false;
      };

    },

    // Se sincroniza únicamente cuando cambia la URL de filtros.
    // Las funciones de carga pertenecen a este componente y no
    // se agregan para evitar recargas por cada render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [filtrosInicialesRuta]

  );



  const cambiarFiltro = (

    campo,

    valor

  ) => {

    setFiltros(

      (actual) => ({

        ...actual,

        [campo]:

          valor

      })

    );

  };

  const aplicarFiltros = (

    evento

  ) => {

    evento.preventDefault();

    cargarDocumentos(

      filtros,

      1

    );

  };

  const limpiarFiltros = () => {

    const filtrosVacios = {

      q: '',

      tipoDocumentoId: '',

      categoria: '',

      estado: '',

      tiendaId: '',

      fechaDesde: '',

      fechaHasta: ''

    };

    setFiltros(

      filtrosVacios

    );

    cargarDocumentos(

      filtrosVacios,

      1

    );

  };

  const actualizarTodo =

    async () => {

      setRecargando(

        true

      );

      try {

        await Promise.all([

          cargarCatalogos(),

          cargarDocumentos(

            filtros,

            paginaActual

          )

        ]);

      } finally {

        setRecargando(

          false

        );

      }

    };

  const registrarDocumento =

    async (

      datosDocumento

    ) => {

      setGuardando(

        true

      );

      setError('');

      setMensajeExito('');

      setMensajeArchivo('');

      setArchivoAdjuntado(

        null

      );

      try {

        const respuesta =

          await api.post(

            '/documentos',

            datosDocumento

          );

        const datos =

          obtenerDatosRespuesta(

            respuesta

          );

        const documento =

          datos.documento ||

          null;

        setUltimoDocumento(

          documento

        );

        setMensajeExito(

          datos.mensaje ||

          'Documento registrado correctamente.'

        );

        setModalAbierto(

          false

        );

        await cargarDocumentos(

          filtros,

          paginaActual

        );

      } catch (

        errorPeticion

      ) {

        console.error(

          'Error registrando documento:',

          errorPeticion

        );

        setError(

          obtenerMensajeError(

            errorPeticion,

            'No se pudo registrar el documento.'

          )

        );

      } finally {

        setGuardando(

          false

        );

      }

    };

  const abrirModalArchivo =

    () => {

      if (

        !ultimoDocumento?.id

      ) {

        return;

      }

      setErrorArchivo('');

      setMensajeArchivo('');

      setArchivoModalAbierto(

        true

      );

    };

  const adjuntarArchivo =

    async (

      archivo

    ) => {

      if (

        !ultimoDocumento?.id

      ) {

        setErrorArchivo(

          'No se ha identificado el documento.'

        );

        return;

      }

      setAdjuntandoArchivo(

        true

      );

      setErrorArchivo('');

      setMensajeArchivo('');

      try {

        const formData =

          new FormData();

        formData.append(

          'archivo',

          archivo

        );

        const respuesta =

          await api.post(

            `/documentos/${ultimoDocumento.id}/archivo`,

            formData

          );

        const datos =

          obtenerDatosRespuesta(

            respuesta

          );

        setArchivoAdjuntado(

          datos.archivo ||

          null

        );

        setMensajeArchivo(

          datos.mensaje ||

          'Archivo adjuntado correctamente.'

        );

        setArchivoModalAbierto(

          false

        );

      } catch (

        errorPeticion

      ) {

        console.error(

          'Error adjuntando archivo:',

          errorPeticion

        );

        setErrorArchivo(

          obtenerMensajeError(

            errorPeticion,

            'No se pudo adjuntar el archivo.'

          )

        );

      } finally {

        setAdjuntandoArchivo(

          false

        );

      }

    };

  const abrirDetalleDocumento =

    async (

      documento

    ) => {

      if (

        !documento?.id

      ) {

        return;

      }

      setDetalleAbierto(

        true

      );

      setDocumentoDetalle(

        null

      );

      setErrorDetalle(

        ''

      );

      setCargandoDetalle(

        true

      );

      try {

        const respuesta =

          await api.get(

            `/documentos/${documento.id}`

          );

        const datos =

          obtenerDatosRespuesta(

            respuesta

          );

        setDocumentoDetalle(

          datos.documento ||

          null

        );

      } catch (

        errorPeticion

      ) {

        console.error(

          'Error obteniendo detalle del documento:',

          errorPeticion

        );

        setErrorDetalle(

          obtenerMensajeError(

            errorPeticion,

            'No se pudo consultar el detalle del documento.'

          )

        );

      } finally {

        setCargandoDetalle(

          false

        );

      }

    };


  // ==========================================================
  // ÉPICA 8 - HU-037
  // DETALLE AL LLEGAR DESDE ALERTAS / CALENDARIO
  // ==========================================================

  useEffect(
    () => {

      if (!documentoIdRuta) {
        return undefined;
      }


      let activo = true;


      async function cargarDetalleDesdeRuta() {

        try {

          const respuesta =
            await api.get(
              `/documentos/${documentoIdRuta}`
            );


          if (!activo) {
            return;
          }


          const datos =
            obtenerDatosRespuesta(
              respuesta
            );


          setDocumentoDetalle(
            datos.documento ||
            null
          );


          setErrorDetalle(
            ''
          );


        } catch (
          errorPeticion
        ) {

          if (!activo) {
            return;
          }


          console.error(
            'Error obteniendo documento desde alerta/calendario:',
            errorPeticion
          );


          setDocumentoDetalle(
            null
          );


          setErrorDetalle(
            obtenerMensajeError(
              errorPeticion,
              'No se pudo consultar el documento seleccionado.'
            )
          );
        }
      }


      cargarDetalleDesdeRuta();


      return () => {

        activo = false;
      };

    },
    [
      documentoIdRuta
    ]
  );


  // ==========================================================
  // ABRIR EDICIÓN
  // ==========================================================

  const abrirEditarDocumento =
    async (
      documento
    ) => {

      if (!documento?.id) {
        return;
      }

      setErrorEdicion('');

      try {

        const respuesta =
          await api.get(
            `/documentos/${documento.id}`
          );

        const datos =
          obtenerDatosRespuesta(
            respuesta
          );

        const detalle =
          datos.documento ||
          datos;

        setDocumentoEdicion(
          datos
        );

        setFormularioEdicion({
          numeroDocumento:
            detalle.numeroDocumento ||
            detalle.numero_documento ||
            '',

          numeroExpediente:
            detalle.numeroExpediente ||
            detalle.numero_expediente ||
            '',

          entidadEmisoraId:
            detalle.entidadEmisora?.id ||
            detalle.entidadEmisoraId ||
            detalle.entidad_emisora_id ||
            '',

          fechaEmision:
            detalle.fechaEmision
              ? String(
                  detalle.fechaEmision
                ).slice(0, 10)
              : detalle.fecha_emision
                ? String(
                    detalle.fecha_emision
                  ).slice(0, 10)
                : '',

          fechaVencimiento:
            detalle.fechaVencimiento
              ? String(
                  detalle.fechaVencimiento
                ).slice(0, 10)
              : detalle.fecha_vencimiento
                ? String(
                    detalle.fecha_vencimiento
                  ).slice(0, 10)
                : '',

          responsableUsuarioId:
            detalle.responsable?.id ||
            detalle.responsableUsuarioId ||
            detalle.responsable_usuario_id ||
            '',

          observaciones:
            detalle.observaciones ||
            ''
        });

        setEdicionAbierta(
          true
        );

      } catch (
        errorPeticion
      ) {

        console.error(
          'Error obteniendo documento para edición:',
          errorPeticion
        );

        setError(
          obtenerMensajeError(
            errorPeticion,
            'No se pudo cargar el documento para editar.'
          )
        );
      }
    };

  // ==========================================================
  // GUARDAR EDICIÓN
  // ==========================================================

  const guardarEdicionDocumento =
    async () => {

      const documento =
        documentoEdicion?.documento ||
        documentoEdicion;

      if (!documento?.id) {
        setErrorEdicion(
          'No se identificó el documento.'
        );

        return;
      }

      setGuardandoEdicion(
        true
      );

      setErrorEdicion('');

      try {

        const payload = {
          numeroDocumento:
            formularioEdicion
              .numeroDocumento
              .trim(),

          numeroExpediente:
            formularioEdicion
              .numeroExpediente
              .trim() || null,

          entidadEmisoraId:
            Number(
              formularioEdicion
                .entidadEmisoraId
            ),

          fechaEmision:
            formularioEdicion
              .fechaEmision,

          fechaVencimiento:
            formularioEdicion
              .fechaVencimiento ||
            null,

          responsableUsuarioId:
            Number(
              formularioEdicion
                .responsableUsuarioId
            ),

          observaciones:
            formularioEdicion
              .observaciones
              .trim() || null
        };

        const respuesta =
          await api.put(
            `/documentos/${documento.id}`,
            payload
          );

        const datos =
          obtenerDatosRespuesta(
            respuesta
          );

        setMensajeExito(
          datos.mensaje ||
          'Documento actualizado correctamente.'
        );

        setEdicionAbierta(
          false
        );

        setDocumentoEdicion(
          null
        );

        await cargarDocumentos(
          filtros,

          paginaActual
        );

      } catch (
        errorPeticion
      ) {

        console.error(
          'Error editando documento:',
          errorPeticion
        );

        setErrorEdicion(
          obtenerMensajeError(
            errorPeticion,
            'No se pudo actualizar el documento.'
          )
        );

      } finally {

        setGuardandoEdicion(
          false
        );
      }
    };

  // ==========================================================
  // HU-025 - ABRIR MODAL DE ARCHIVADO / ANULACIÓN
  // ==========================================================

  const abrirBajaDocumento = (
    documento
  ) => {

    if (!documento?.id) {
      return;
    }

    setDocumentoBaja(
      documento
    );

    setErrorBaja('');
    setMensajeBaja('');
    setMensajeExito('');

    setBajaAbierta(
      true
    );
  };

  // ==========================================================
  // HU-025 - CONFIRMAR ARCHIVADO / ANULACIÓN
  // ==========================================================

  const confirmarBajaDocumento =
    async ({
      accion,
      motivo
    }) => {

      if (!documentoBaja?.id) {

        setErrorBaja(
          'No se identificó el documento.'
        );

        return;
      }

      setProcesandoBaja(
        true
      );

      setErrorBaja('');

      try {

        const respuesta =
          await api.patch(
            `/documentos/${documentoBaja.id}/condicion`,
            {
              accion,
              motivo
            }
          );

        const datos =
          obtenerDatosRespuesta(
            respuesta
          );

        const mensaje =
          datos.mensaje ||
          (
            accion === 'ANULAR'
              ? 'Documento anulado correctamente.'
              : 'Documento archivado correctamente.'
          );

        const documentoProcesadoId =
          documentoBaja.id;

        setBajaAbierta(
          false
        );

        setDocumentoBaja(
          null
        );

        if (
          ultimoDocumento?.id ===
          documentoProcesadoId
        ) {
          setUltimoDocumento(
            null
          );
        }

        setMensajeBaja(
          mensaje
        );

        await cargarDocumentos(
          filtros,

          paginaActual
        );

      } catch (
        errorPeticion
      ) {

        console.error(
          'Error archivando/anulando documento:',
          errorPeticion
        );

        setErrorBaja(
          obtenerMensajeError(
            errorPeticion,
            'No se pudo archivar o anular el documento.'
          )
        );

      } finally {

        setProcesandoBaja(
          false
        );
      }
    };

  // ==========================================================
  // PAGINACIÓN DE DOCUMENTOS
  // ==========================================================

  const cambiarPaginaDocumentos =

    async (nuevaPagina) => {

      if (

        cargandoDocumentos ||

        nuevaPagina < 1 ||

        nuevaPagina > totalPaginas ||

        nuevaPagina === paginaActual

      ) {

        return;

      }

      await cargarDocumentos(

        filtros,

        nuevaPagina

      );

    };

  const puedeRegistrar =

    catalogos.tiendas.length > 0 &&

    catalogos.tiposDocumento.length > 0 &&

    catalogos.entidades.length > 0 &&

    catalogos.usuarios.length > 0;


  // ==========================================================
  // HU-031 - ABRIR INICIO DE RENOVACIÓN
  // ==========================================================

  const abrirRenovacionDocumento = (
    documento
  ) => {

    if (!documento?.id) {
      return;
    }

    if (
      documento?.reglaVigencia
        ?.requiereRenovacion !== true
    ) {

      setError(
        'Este documento no está configurado para renovación.'
      );

      return;
    }

    if (
      documento.estado ===
      'EN_RENOVACION'
    ) {

      setError(
        'Este documento ya se encuentra en renovación.'
      );

      return;
    }

    setDocumentoRenovacion(
      documento
    );

    setErrorRenovacion('');
    setMensajeExito('');
    setError('');

    setRenovacionAbierta(
      true
    );
  };


  // ==========================================================
  // HU-031 - GUARDAR INICIO DE RENOVACIÓN
  // ==========================================================

  const guardarRenovacion =
    async (
      datosRenovacion
    ) => {

      setGuardandoRenovacion(
        true
      );

      setErrorRenovacion('');
      setMensajeExito('');

      try {

        const respuesta =
          await api.post(
            '/renovaciones',
            datosRenovacion
          );

        const datos =
          obtenerDatosRespuesta(
            respuesta
          );

        setRenovacionAbierta(
          false
        );

        setDocumentoRenovacion(
          null
        );

        setMensajeExito(
          datos.mensaje ||
          'Renovación iniciada correctamente.'
        );

        await cargarDocumentos(
          filtros,
          paginaActual
        );

      } catch (
        errorPeticion
      ) {

        console.error(
          'Error iniciando renovación:',
          errorPeticion
        );

        setErrorRenovacion(
          obtenerMensajeError(
            errorPeticion,
            'No se pudo iniciar la renovación.'
          )
        );

      } finally {

        setGuardandoRenovacion(
          false
        );
      }
    };


  return (

    <div className="space-y-6">

      {/* ================================================= */}
      {/* HERO PRINCIPAL */}
      {/* ================================================= */}

      <section
        className="
          relative
          overflow-hidden
          rounded-[28px]
          border
          border-slate-800
          bg-gradient-to-br
          from-slate-950
          via-slate-900
          to-indigo-950
          shadow-xl
          shadow-slate-900/10
        "
      >

        <div
          className="
            absolute
            -right-24
            -top-24
            h-80
            w-80
            rounded-full
            bg-indigo-500/20
            blur-3xl
          "
        />

        <div
          className="
            absolute
            -bottom-28
            left-1/4
            h-72
            w-72
            rounded-full
            bg-violet-500/20
            blur-3xl
          "
        />

        <div
          className="
            absolute
            inset-0
            opacity-[0.05]
          "
          style={{
            backgroundImage:
              'radial-gradient(circle at 1px 1px, white 1px, transparent 0)',
            backgroundSize:
              '26px 26px'
          }}
        />


        <div
          className="
            relative
            grid
            gap-6
            px-6
            py-7
            lg:grid-cols-[1fr_340px]
            lg:px-8
            lg:py-8
          "
        >

          {/* LADO IZQUIERDO */}

          <div
            className="
              flex
              flex-col
              justify-center
            "
          >

            <div
              className="
                mb-4
                flex
                items-center
                gap-3
              "
            >

              <div
                className="
                  flex
                  h-12
                  w-12
                  items-center
                  justify-center
                  rounded-2xl
                  border
                  border-white/10
                  bg-white/10
                  text-indigo-200
                  backdrop-blur
                "
              >
                <FileText size={24} />
              </div>


              <div>

                <p
                  className="
                    text-xs
                    font-bold
                    uppercase
                    tracking-[0.22em]
                    text-indigo-300
                  "
                >
                  Gestión documental
                </p>

                <p
                  className="
                    mt-1
                    text-xs
                    text-slate-400
                  "
                >
                  Control de operatividad CERTIIA
                </p>

              </div>

            </div>


            <h1
              className="
                text-3xl
                font-bold
                tracking-tight
                text-white
                sm:text-4xl
              "
            >
              Documentos de operatividad
            </h1>


            <p
              className="
                mt-3
                max-w-2xl
                text-sm
                leading-6
                text-slate-300
              "
            >
              Registra, consulta y controla la vigencia,
              renovación y trazabilidad de los documentos
              asociados a las tiendas.
            </p>


            <div
              className="
                mt-6
                flex
                flex-wrap
                gap-2
              "
            >

              <EtiquetaHeroDocumentos>
                <FileText size={14} />
                {cargandoDocumentos
                  ? '...'
                  : totalDocumentos}{' '}
                documento(s)
              </EtiquetaHeroDocumentos>

              <EtiquetaHeroDocumentos>
                <Store size={14} />
                {cargandoCatalogos
                  ? '...'
                  : catalogos.tiendas.length}{' '}
                tienda(s)
              </EtiquetaHeroDocumentos>

              <EtiquetaHeroDocumentos>
                <Building2 size={14} />
                {cargandoCatalogos
                  ? '...'
                  : catalogos.entidades.length}{' '}
                entidad(es)
              </EtiquetaHeroDocumentos>

            </div>

          </div>


          {/* PANEL LATERAL */}

          <div
            className="
              rounded-2xl
              border
              border-white/10
              bg-white/[0.07]
              p-5
              backdrop-blur-md
            "
          >

            <div
              className="
                flex
                items-start
                justify-between
                gap-4
              "
            >

              <div>

                <p
                  className="
                    text-xs
                    font-semibold
                    uppercase
                    tracking-wide
                    text-slate-400
                  "
                >
                  Resumen operativo
                </p>

                <p
                  className="
                    mt-1
                    text-lg
                    font-bold
                    text-white
                  "
                >
                  {cargandoDocumentos
                    ? 'Consultando...'
                    : `${totalDocumentos} documento${
                        totalDocumentos === 1
                          ? ''
                          : 's'
                      }`}
                </p>

              </div>


              <div
                className="
                  flex
                  h-11
                  w-11
                  items-center
                  justify-center
                  rounded-2xl
                  bg-indigo-500/15
                  text-indigo-200
                "
              >
                <CircleCheck size={22} />
              </div>

            </div>


            <div
              className="
                mt-5
                space-y-3
              "
            >

              <FilaHeroDocumentos
                etiqueta="Tiendas disponibles"
                valor={
                  cargandoCatalogos
                    ? '...'
                    : catalogos.tiendas.length
                }
              />

              <FilaHeroDocumentos
                etiqueta="Tipos documentales"
                valor={
                  cargandoCatalogos
                    ? '...'
                    : catalogos.tiposDocumento.length
                }
              />

              <FilaHeroDocumentos
                etiqueta="Entidades emisoras"
                valor={
                  cargandoCatalogos
                    ? '...'
                    : catalogos.entidades.length
                }
              />

            </div>


            <div
              className="
                mt-5
                grid
                gap-2
              "
            >

              <button
                type="button"
                onClick={() => {
                  setError('');
                  setMensajeExito('');
                  setModalAbierto(true);
                }}
                disabled={
                  cargandoCatalogos ||
                  !puedeRegistrar
                }
                className="
                  inline-flex
                  h-11
                  w-full
                  items-center
                  justify-center
                  gap-2
                  rounded-xl
                  bg-white
                  px-4
                  text-sm
                  font-bold
                  text-slate-900
                  transition
                  hover:bg-slate-100
                  disabled:cursor-not-allowed
                  disabled:opacity-50
                "
              >
                <FilePlus2 size={17} />
                Nuevo documento
              </button>


              <button
                type="button"
                onClick={actualizarTodo}
                disabled={
                  recargando ||
                  cargandoCatalogos ||
                  cargandoDocumentos
                }
                className="
                  inline-flex
                  h-10
                  w-full
                  items-center
                  justify-center
                  gap-2
                  rounded-xl
                  border
                  border-white/10
                  bg-white/[0.06]
                  px-4
                  text-xs
                  font-bold
                  text-slate-200
                  transition
                  hover:bg-white/10
                  disabled:cursor-not-allowed
                  disabled:opacity-50
                "
              >
                <RefreshCw
                  size={15}
                  className={
                    recargando
                      ? 'animate-spin'
                      : ''
                  }
                />

                {recargando
                  ? 'Actualizando...'
                  : 'Actualizar datos'}
              </button>

            </div>

          </div>

        </div>

      </section>


      {/* ================================================= */}
      {/* KPIs */}
      {/* ================================================= */}

      <section
        className="
          grid
          gap-4
          sm:grid-cols-2
          xl:grid-cols-4
        "
      >

        <TarjetaKpiDocumentos
          titulo="Documentos encontrados"
          valor={
            cargandoDocumentos
              ? '...'
              : totalDocumentos
          }
          descripcion="Según los filtros aplicados"
          icono={FileText}
          tono="indigo"
          etiqueta="Documentos"
        />

        <TarjetaKpiDocumentos
          titulo="Tiendas disponibles"
          valor={
            cargandoCatalogos
              ? '...'
              : catalogos.tiendas.length
          }
          descripcion="Locales activos"
          icono={Store}
          tono="blue"
          etiqueta="Operación"
        />

        <TarjetaKpiDocumentos
          titulo="Tipos documentales"
          valor={
            cargandoCatalogos
              ? '...'
              : catalogos.tiposDocumento.length
          }
          descripcion="Configuraciones disponibles"
          icono={FileText}
          tono="violet"
          etiqueta="Catálogo"
        />

        <TarjetaKpiDocumentos
          titulo="Entidades emisoras"
          valor={
            cargandoCatalogos
              ? '...'
              : catalogos.entidades.length
          }
          descripcion="Organismos registrados"
          icono={Building2}
          tono="amber"
          etiqueta="Emisores"
        />

      </section>

      {/* ================================================= */}
      {/* MENSAJES */}
      {/* ================================================= */}

      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          {error}
        </div>
      )}

      {mensajeBaja && (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
          {mensajeBaja}
        </div>
      )}

      {mensajeExito && !ultimoDocumento && (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
          {mensajeExito}
        </div>
      )}

      {/* ================================================= */}
      {/* RETORNO DESDE DASHBOARD */}
      {/* ================================================= */}

      {location.state?.desdeDashboard && (
        <section className="rounded-2xl border border-indigo-200 bg-indigo-50 p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-bold text-indigo-900">
                Consulta originada desde el Dashboard
              </p>
              <p className="mt-1 text-sm text-indigo-700">
                {location.state?.indicador
                  ? `Indicador seleccionado: ${location.state.indicador}`
                  : 'Se conservaron los filtros utilizados anteriormente.'}
              </p>
            </div>

            <button
              type="button"
              onClick={() =>
                navigate(
                  '/dashboard',
                  {
                    state: {
                      filtrosDashboard:
                        location.state?.filtrosDashboard || {
                          tiendaId: '',
                          tipoDocumentoId: '',
                          categoria: ''
                        }
                    }
                  }
                )
              }
              className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 text-sm font-semibold text-white transition hover:bg-indigo-700"
            >
              <ArrowLeft className="h-4 w-4" />
              Volver al Dashboard
            </button>
          </div>
        </section>
      )}

      {/* ================================================= */}
      {/* FILTROS */}
      {/* ================================================= */}

      <form
        onSubmit={aplicarFiltros}
        className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
      >
        <div className="flex flex-col gap-3 border-b border-slate-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
              <Filter className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">
                Buscar y filtrar
              </h2>
              <p className="text-xs text-slate-500">
                Encuentra documentos por código, tienda, estado, tipo o fecha.
              </p>
            </div>
          </div>

          {Object.values(filtros).filter(
            (valor) => String(valor || '').trim() !== ''
          ).length > 0 && (
            <span className="inline-flex w-fit items-center rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700">
              {Object.values(filtros).filter(
                (valor) => String(valor || '').trim() !== ''
              ).length}{' '}
              filtros seleccionados
            </span>
          )}
        </div>

        <div className="p-5">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">

            <div className="xl:col-span-2">
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                Búsqueda
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={filtros.q}
                  onChange={(evento) =>
                    cambiarFiltro(
                      'q',
                      evento.target.value
                    )
                  }
                  placeholder="Código, número, tienda o entidad emisora..."
                  className="h-11 w-full rounded-xl border border-slate-300 bg-white pl-10 pr-3 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50"
                />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                Tienda
              </label>
              <select
                value={filtros.tiendaId}
                onChange={(evento) =>
                  cambiarFiltro(
                    'tiendaId',
                    evento.target.value
                  )
                }
                className="h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm text-slate-700 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50"
              >
                <option value="">
                  Todas las tiendas
                </option>
                {catalogos.tiendas.map(
                  (tienda) => (
                    <option
                      key={tienda.id}
                      value={tienda.id}
                    >
                      {tienda.nombre}
                    </option>
                  )
                )}
              </select>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                Estado
              </label>
              <select
                value={filtros.estado}
                onChange={(evento) =>
                  cambiarFiltro(
                    'estado',
                    evento.target.value
                  )
                }
                className="h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm text-slate-700 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50"
              >
                <option value="">Todos los estados</option>
                <option value="VIGENTE">Vigente</option>
                <option value="POR_VENCER">Por vencer</option>
                <option value="CRITICO">Crítico</option>
                <option value="VENCIDO">Vencido</option>
                <option value="EN_RENOVACION">En renovación</option>
              </select>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                Tipo documental
              </label>
              <select
                value={filtros.tipoDocumentoId}
                onChange={(evento) =>
                  cambiarFiltro(
                    'tipoDocumentoId',
                    evento.target.value
                  )
                }
                className="h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm text-slate-700 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50"
              >
                <option value="">Todos los tipos</option>
                {catalogos.tiposDocumento.map(
                  (tipo) => (
                    <option
                      key={tipo.id}
                      value={tipo.id}
                    >
                      {tipo.nombre}
                    </option>
                  )
                )}
              </select>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                Categoría
              </label>
              <select
                value={filtros.categoria}
                onChange={(evento) =>
                  cambiarFiltro(
                    'categoria',
                    evento.target.value
                  )
                }
                className="h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm text-slate-700 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50"
              >
                <option value="">Todas las categorías</option>
                {categorias.map(
                  (categoria) => (
                    <option
                      key={categoria}
                      value={categoria}
                    >
                      {categoria}
                    </option>
                  )
                )}
              </select>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                Vencimiento desde
              </label>
              <input
                type="date"
                value={filtros.fechaDesde}
                onChange={(evento) =>
                  cambiarFiltro(
                    'fechaDesde',
                    evento.target.value
                  )
                }
                className="h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm text-slate-700 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                Vencimiento hasta
              </label>
              <input
                type="date"
                value={filtros.fechaHasta}
                onChange={(evento) =>
                  cambiarFiltro(
                    'fechaHasta',
                    evento.target.value
                  )
                }
                className="h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm text-slate-700 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50"
              />
            </div>

          </div>

          <div className="mt-5 flex flex-wrap gap-3">
            <button
              type="submit"
              disabled={cargandoDocumentos}
              className="inline-flex h-10 items-center gap-2 rounded-xl bg-indigo-600 px-4 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:opacity-50"
            >
              <Search className="h-4 w-4" />
              Aplicar filtros
            </button>

            <button
              type="button"
              onClick={limpiarFiltros}
              disabled={cargandoDocumentos}
              className="inline-flex h-10 items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
            >
              <X className="h-4 w-4" />
              Limpiar
            </button>
          </div>
        </div>
      </form>

      {/* ================================================= */}
      {/* ÚLTIMO DOCUMENTO REGISTRADO */}
      {/* ================================================= */}

      {ultimoDocumento && (
        <section className="overflow-hidden rounded-2xl border border-emerald-200 bg-emerald-50">
          <div className="flex flex-col gap-4 p-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-start gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white text-emerald-600 shadow-sm">
                <CircleCheck className="h-6 w-6" />
              </div>

              <div>
                <h2 className="font-bold text-emerald-900">
                  {mensajeExito || 'Documento registrado correctamente.'}
                </h2>

                <div className="mt-3 flex flex-wrap gap-x-6 gap-y-2 text-sm text-slate-600">
                  <p>
                    <span className="font-semibold">Código:</span>{' '}
                    {obtenerCodigoDocumento(ultimoDocumento) || '—'}
                  </p>
                  <p>
                    <span className="font-semibold">Documento:</span>{' '}
                    {obtenerNumeroDocumento(ultimoDocumento) || '—'}
                  </p>
                  <p>
                    <span className="font-semibold">Vencimiento:</span>{' '}
                    {formatearFecha(
                      obtenerFechaVencimiento(
                        ultimoDocumento
                      )
                    )}
                  </p>
                  <span
                    className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${claseEstado(
                      obtenerEstadoDocumento(
                        ultimoDocumento
                      )
                    )}`}
                  >
                    {textoEstado(
                      obtenerEstadoDocumento(
                        ultimoDocumento
                      )
                    )}
                  </span>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={abrirModalArchivo}
              className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-xl bg-emerald-700 px-4 text-sm font-semibold text-white transition hover:bg-emerald-800"
            >
              <Paperclip className="h-4 w-4" />
              Adjuntar PDF
            </button>
          </div>

          {mensajeArchivo && (
            <div className="border-t border-emerald-200 bg-white/70 px-5 py-4">
              <p className="text-sm font-semibold text-emerald-700">
                {mensajeArchivo}
              </p>

              {archivoAdjuntado && (
                <div className="mt-2 space-y-1 text-xs text-slate-500">
                  <p>
                    <span className="font-semibold">Archivo:</span>{' '}
                    {archivoAdjuntado.nombreOriginal}
                  </p>
                  <p className="break-all">
                    <span className="font-semibold">SHA-256:</span>{' '}
                    <span className="font-mono">
                      {archivoAdjuntado.hashSha256}
                    </span>
                  </p>
                </div>
              )}
            </div>
          )}
        </section>
      )}

      {/* ================================================= */}
      {/* LISTADO DE DOCUMENTOS */}
      {/* ================================================= */}

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

        <div className="flex flex-col gap-2 border-b border-slate-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-bold text-slate-900">
              Documentos registrados
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              {totalDocumentos}{' '}
              {totalDocumentos === 1
                ? 'resultado'
                : 'resultados'}
            </p>
          </div>

          {totalPaginas > 0 && (
            <span className="text-xs font-medium text-slate-400">
              Página {paginaActual} de {totalPaginas}
            </span>
          )}
        </div>

        {cargandoDocumentos ? (
          <div className="space-y-3 p-5">
            {[1, 2, 3, 4, 5].map(
              (item) => (
                <div
                  key={item}
                  className="h-16 animate-pulse rounded-xl bg-slate-100"
                />
              )
            )}
          </div>
        ) : documentos.length === 0 ? (
          <div className="flex min-h-72 flex-col items-center justify-center px-6 py-12 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
              <FileText className="h-8 w-8" />
            </div>

            <h3 className="mt-4 font-bold text-slate-800">
              No se encontraron documentos
            </h3>

            <p className="mt-1 max-w-md text-sm leading-6 text-slate-500">
              No existen registros que cumplan los criterios seleccionados.
            </p>

            <button
              type="button"
              onClick={limpiarFiltros}
              className="mt-4 inline-flex h-10 items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
            >
              <X className="h-4 w-4" />
              Limpiar filtros
            </button>
          </div>
        ) : (
          <>
            {/* ========================================= */}
            {/* TABLA ESCRITORIO */}
            {/* ========================================= */}

            <div className="hidden overflow-x-auto md:block">
              <table className="min-w-full divide-y divide-slate-100">
                <thead className="bg-slate-50/80">
                  <tr>
                    {[
                      'Documento',
                      'Tienda',
                      'Tipo',
                      'Entidad',
                      'Vencimiento',
                      'Estado',
                      'Acciones'
                    ].map(
                      (titulo) => (
                        <th
                          key={titulo}
                          className="px-5 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-slate-400"
                        >
                          {titulo}
                        </th>
                      )
                    )}
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100 bg-white">
                  {documentos.map(
                    (documento) => (
                      <tr
                        key={documento.id}
                        className="transition hover:bg-indigo-50/30"
                      >
                        <td className="px-5 py-4">
                          <div className="flex items-start gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                              <FileText className="h-5 w-5" />
                            </div>

                            <div>
                              <p className="text-sm font-bold text-slate-900">
                                {documento.codigoInterno || 'Sin código'}
                              </p>
                              <p className="mt-0.5 text-xs text-slate-500">
                                {documento.numeroDocumento || 'Sin número'}
                              </p>
                              {documento.numeroExpediente && (
                                <p className="mt-0.5 text-xs text-slate-400">
                                  Exp. {documento.numeroExpediente}
                                </p>
                              )}
                            </div>
                          </div>
                        </td>

                        <td className="px-5 py-4 text-sm font-medium text-slate-700">
                          {documento.tienda?.nombre || '—'}
                        </td>

                        <td className="px-5 py-4">
                          <p className="text-sm text-slate-700">
                            {documento.tipoDocumento?.nombre || '—'}
                          </p>
                          {documento.tipoDocumento?.categoria && (
                            <p className="mt-1 text-xs text-slate-400">
                              {documento.tipoDocumento.categoria}
                            </p>
                          )}
                        </td>

                        <td className="px-5 py-4 text-sm text-slate-700">
                          {documento.entidadEmisora?.nombre || '—'}
                        </td>

                        <td className="whitespace-nowrap px-5 py-4 text-sm font-medium text-slate-700">
                          {formatearFecha(
                            documento.fechaVencimiento
                          )}
                        </td>

                        <td className="whitespace-nowrap px-5 py-4">
                          <span
                            className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${claseEstado(
                              documento.estado
                            )}`}
                          >
                            {textoEstado(
                              documento.estado
                            )}
                          </span>
                        </td>

                        <td className="min-w-[320px] px-5 py-4">
                          <div className="flex flex-wrap gap-2">
                            <button
                              type="button"
                              onClick={() =>
                                abrirDetalleDocumento(
                                  documento
                                )
                              }
                              className="rounded-lg border border-indigo-200 bg-indigo-50 px-3 py-1.5 text-xs font-semibold text-indigo-700 transition hover:bg-indigo-100"
                            >
                              Ver
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                abrirEditarDocumento(
                                  documento
                                )
                              }
                              className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
                            >
                              Editar
                            </button>

                            {documento?.reglaVigencia?.requiereRenovacion === true &&
                              documento.estado !== 'EN_RENOVACION' && (
                                <button
                                  type="button"
                                  onClick={() =>
                                    abrirRenovacionDocumento(
                                      documento
                                    )
                                  }
                                  className="rounded-lg border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700 transition hover:bg-blue-100"
                                >
                                  Renovar
                                </button>
                              )}

                            <button
                              type="button"
                              onClick={() =>
                                abrirBajaDocumento(
                                  documento
                                )
                              }
                              className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-700 transition hover:bg-amber-100"
                            >
                              Archivar / anular
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  )}
                </tbody>
              </table>
            </div>

            {/* ========================================= */}
            {/* TARJETAS MÓVIL */}
            {/* ========================================= */}

            <div className="divide-y divide-slate-100 md:hidden">
              {documentos.map(
                (documento) => (
                  <article
                    key={`mobile-${documento.id}`}
                    className="p-5"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex min-w-0 items-start gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                          <FileText className="h-5 w-5" />
                        </div>

                        <div className="min-w-0">
                          <p className="truncate font-bold text-slate-900">
                            {documento.codigoInterno || 'Sin código'}
                          </p>
                          <p className="mt-0.5 truncate text-sm text-slate-500">
                            {documento.numeroDocumento || 'Sin número'}
                          </p>
                        </div>
                      </div>

                      <span
                        className={`inline-flex shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold ${claseEstado(
                          documento.estado
                        )}`}
                      >
                        {textoEstado(
                          documento.estado
                        )}
                      </span>
                    </div>

                    <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <p className="text-xs text-slate-400">Tienda</p>
                        <p className="mt-1 font-medium text-slate-700">
                          {documento.tienda?.nombre || '—'}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs text-slate-400">Vencimiento</p>
                        <p className="mt-1 font-medium text-slate-700">
                          {formatearFecha(
                            documento.fechaVencimiento
                          )}
                        </p>
                      </div>

                      <div className="col-span-2">
                        <p className="text-xs text-slate-400">Tipo documental</p>
                        <p className="mt-1 font-medium text-slate-700">
                          {documento.tipoDocumento?.nombre || '—'}
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 grid gap-2 sm:grid-cols-2">
                      <button
                        type="button"
                        onClick={() =>
                          abrirDetalleDocumento(
                            documento
                          )
                        }
                        className="rounded-xl bg-indigo-600 px-3 py-2 text-sm font-semibold text-white"
                      >
                        Ver detalle
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          abrirEditarDocumento(
                            documento
                          )
                        }
                        className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-600"
                      >
                        Editar
                      </button>

                      {documento?.reglaVigencia?.requiereRenovacion === true &&
                        documento.estado !== 'EN_RENOVACION' && (
                          <button
                            type="button"
                            onClick={() =>
                              abrirRenovacionDocumento(
                                documento
                              )
                            }
                            className="rounded-xl border border-blue-200 bg-blue-50 px-3 py-2 text-sm font-semibold text-blue-700"
                          >
                            Iniciar renovación
                          </button>
                        )}

                      <button
                        type="button"
                        onClick={() =>
                          abrirBajaDocumento(
                            documento
                          )
                        }
                        className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm font-semibold text-amber-700"
                      >
                        Archivar / anular
                      </button>
                    </div>
                  </article>
                )
              )}
            </div>
          </>
        )}

        {/* ================================================= */}
        {/* PAGINACIÓN */}
        {/* ================================================= */}

        {!cargandoDocumentos &&
          totalPaginas > 1 && (
            <div className="flex flex-col gap-3 border-t border-slate-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">
                  Página {paginaActual} de {totalPaginas}
                </p>
                <p className="mt-0.5 text-xs text-slate-400">
                  Hasta {limitePorPagina} documentos por página
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() =>
                    cambiarPaginaDocumentos(
                      paginaActual - 1
                    )
                  }
                  disabled={
                    paginaActual <= 1 ||
                    cargandoDocumentos
                  }
                  className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Anterior
                </button>

                <span className="flex h-10 min-w-10 items-center justify-center rounded-xl bg-indigo-50 px-3 text-sm font-bold text-indigo-700">
                  {paginaActual}
                </span>

                <button
                  type="button"
                  onClick={() =>
                    cambiarPaginaDocumentos(
                      paginaActual + 1
                    )
                  }
                  disabled={
                    paginaActual >= totalPaginas ||
                    cargandoDocumentos
                  }
                  className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Siguiente
                </button>
              </div>
            </div>
          )}

      </section>

      {/* ================================================= */}
      {/* MODAL NUEVO DOCUMENTO */}
      {/* ================================================= */}

      <DocumentoModal
        abierto={modalAbierto}
        tiendas={catalogos.tiendas}
        tiposDocumento={catalogos.tiposDocumento}
        entidades={catalogos.entidades}
        usuarios={catalogos.usuarios}
        cargando={guardando}
        error={error}
        onCerrar={() => {
          if (!guardando) {
            setModalAbierto(false);
            setError('');
          }
        }}
        onGuardar={registrarDocumento}
      />

      {/* ================================================= */}
      {/* MODAL ARCHIVO */}
      {/* ================================================= */}

      <DocumentoArchivoModal
        abierto={archivoModalAbierto}
        documento={{
          ...ultimoDocumento,
          codigoInterno:
            obtenerCodigoDocumento(
              ultimoDocumento
            ),
          numeroDocumento:
            obtenerNumeroDocumento(
              ultimoDocumento
            )
        }}
        cargando={adjuntandoArchivo}
        error={errorArchivo}
        onCerrar={() => {
          if (!adjuntandoArchivo) {
            setArchivoModalAbierto(false);
            setErrorArchivo('');
          }
        }}
        onGuardar={adjuntarArchivo}
      />

      {/* ================================================= */}
      {/* MODAL DETALLE */}
      {/* ================================================= */}

      <DocumentoDetalleModal
        abierto={
          detalleAbierto ||
          Boolean(
            documentoIdRuta
          )
        }
        documento={documentoDetalle}
        cargando={
          cargandoDetalle ||
          (
            Boolean(
              documentoIdRuta
            ) &&
            !documentoDetalle &&
            !errorDetalle
          )
        }
        error={errorDetalle}
        onCerrar={() => {
          setDetalleAbierto(false);
          setDocumentoDetalle(null);
          setErrorDetalle('');

          if (documentoIdRuta) {
            navigate(
              '/documentos',
              {
                replace: true,
                state: null
              }
            );
          }
        }}
      />

      {/* ================================================= */}
      {/* MODAL EDITAR */}
      {/* ================================================= */}

      <DocumentoEditarModal
        abierto={edicionAbierta}
        detalle={documentoEdicion}
        catalogos={catalogos}
        formulario={formularioEdicion}
        setFormulario={setFormularioEdicion}
        guardando={guardandoEdicion}
        error={errorEdicion}
        onCerrar={() => {
          if (guardandoEdicion) {
            return;
          }

          setEdicionAbierta(false);
          setDocumentoEdicion(null);
          setErrorEdicion('');
        }}
        onGuardar={guardarEdicionDocumento}
      />

      {/* ================================================= */}
      {/* MODAL ARCHIVAR / ANULAR */}
      {/* ================================================= */}

      <DocumentoBajaModal
        abierto={bajaAbierta}
        documento={documentoBaja}
        cargando={procesandoBaja}
        error={errorBaja}
        onCerrar={() => {
          if (procesandoBaja) {
            return;
          }

          setBajaAbierta(false);
          setDocumentoBaja(null);
          setErrorBaja('');
        }}
        onConfirmar={confirmarBajaDocumento}
      />

      {/* ================================================= */}
      {/* MODAL INICIAR RENOVACIÓN */}
      {/* ================================================= */}

      <RenovacionIniciarModal
        abierto={renovacionAbierta}
        documento={documentoRenovacion}
        usuarios={catalogos.usuarios}
        cargando={guardandoRenovacion}
        error={errorRenovacion}
        onCerrar={() => {
          if (guardandoRenovacion) {
            return;
          }

          setRenovacionAbierta(false);
          setDocumentoRenovacion(null);
          setErrorRenovacion('');
        }}
        onGuardar={guardarRenovacion}
      />

    </div>

  );


};


// ============================================================
// COMPONENTES VISUALES DEL HERO
// ============================================================

function EtiquetaHeroDocumentos({
  children
}) {

  return (
    <span
      className="
        inline-flex
        items-center
        gap-2
        rounded-full
        border
        border-white/10
        bg-white/[0.08]
        px-3
        py-1.5
        text-xs
        font-semibold
        text-slate-200
        backdrop-blur
      "
    >
      {children}
    </span>
  );

}


function FilaHeroDocumentos({
  etiqueta,
  valor
}) {

  return (
    <div
      className="
        flex
        items-center
        justify-between
        gap-4
        rounded-xl
        border
        border-white/10
        bg-black/10
        px-3
        py-2.5
      "
    >

      <span
        className="
          text-xs
          font-medium
          text-slate-300
        "
      >
        {etiqueta}
      </span>

      <span
        className="
          text-sm
          font-bold
          text-white
        "
      >
        {valor}
      </span>

    </div>
  );

}


function TarjetaKpiDocumentos({
  titulo,
  valor,
  descripcion,
  icono: Icono,
  tono,
  etiqueta
}) {

  const estilos = {
    indigo: {
      icono:
        'bg-indigo-50 text-indigo-600',
      barra:
        'from-indigo-500 to-violet-500',
      etiqueta:
        'bg-indigo-50 text-indigo-600'
    },
    blue: {
      icono:
        'bg-blue-50 text-blue-600',
      barra:
        'from-blue-500 to-cyan-500',
      etiqueta:
        'bg-blue-50 text-blue-600'
    },
    violet: {
      icono:
        'bg-violet-50 text-violet-600',
      barra:
        'from-violet-500 to-fuchsia-500',
      etiqueta:
        'bg-violet-50 text-violet-600'
    },
    amber: {
      icono:
        'bg-amber-50 text-amber-600',
      barra:
        'from-amber-500 to-orange-500',
      etiqueta:
        'bg-amber-50 text-amber-600'
    }
  };

  const estilo =
    estilos[tono] ||
    estilos.indigo;


  return (
    <article
      className="
        group
        relative
        overflow-hidden
        rounded-3xl
        border
        border-slate-200
        bg-white
        p-5
        shadow-sm
        transition
        duration-300
        hover:-translate-y-1
        hover:shadow-lg
        hover:shadow-slate-200/60
      "
    >

      <div
        className="
          absolute
          -right-8
          -top-8
          h-24
          w-24
          rounded-full
          bg-slate-100
          opacity-60
          transition
          group-hover:scale-125
        "
      />


      <div
        className="
          relative
          flex
          items-start
          justify-between
          gap-4
        "
      >

        <div>

          <span
            className={`
              inline-flex
              rounded-full
              px-2.5
              py-1
              text-[10px]
              font-bold
              uppercase
              tracking-wide
              ${estilo.etiqueta}
            `}
          >
            {etiqueta}
          </span>

          <p
            className="
              mt-4
              text-xs
              font-semibold
              uppercase
              tracking-wide
              text-slate-400
            "
          >
            {titulo}
          </p>

          <p
            className="
              mt-1
              text-3xl
              font-bold
              text-slate-950
            "
          >
            {valor}
          </p>

          <p
            className="
              mt-1
              text-xs
              text-slate-500
            "
          >
            {descripcion}
          </p>

        </div>


        <div
          className={`
            flex
            h-12
            w-12
            shrink-0
            items-center
            justify-center
            rounded-2xl
            ${estilo.icono}
          `}
        >
          <Icono size={22} />
        </div>

      </div>


      <div
        className={`
          absolute
          bottom-0
          left-0
          h-1
          w-full
          bg-gradient-to-r
          ${estilo.barra}
        `}
      />

    </article>
  );

}


export default DocumentosPage;