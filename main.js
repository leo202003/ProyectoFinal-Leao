const page = document.body.dataset.page;

const tabs = document.querySelectorAll('.btn-tab');
const contenidos = document.querySelectorAll('.contenido-tab');

tabs.forEach(btn => {
    btn.addEventListener('click', () => {
        tabs.forEach(b => b.classList.remove('activo'));
        contenidos.forEach(c => c.classList.add('oculto'));
        btn.classList.add('activo');
        const id = btn.dataset.tab;
        document.getElementById(id).classList.remove('oculto');
    });
});

//API RANDOM USER
const URL = 'https://randomuser.me/api/?results=10&nat=uy,ar,mx,cl,co,es,br,pe';
const BASE_URL = 'https://leo202003.github.io/ProyectoJavaScriptCoder/json/';

const URL1 = BASE_URL + 'negocios.json';
const URL2 = BASE_URL + 'conductores.json';
const URL3 = BASE_URL + 'clientes.json';
const URL4 = BASE_URL + 'pedidos.json';


function usuariosRandom(URL) {
    fetch(URL)
    .then((response) => response.json())
    .then((data) => {

        if (localStorage.getItem("usuariosAgregados") === "true") {
            return;
        }
        const usuarios = data.results;

        const clientesAPI = usuarios.slice(0, 5);
        const conductoresAPI = usuarios.slice(5,10);

        const clientesActuales = obtenerClientes();
        const conductoresActuales = obtenerConductores();

        const nuevosClientes = clientesAPI
        .filter(c => !clientesActuales.some(cli => normalizarTexto(cli.nombre) === normalizarTexto(`${c.name.first} ${c.name.last}`)))
        .map(c => new Cliente(
            `${c.name.first} ${c.name.last}`,
            `${c.location.street.name} ${c.location.street.number}, ${c.location.city}`,
            c.phone
        ))

        const nuevosConductores = conductoresAPI
        .filter(c => !conductoresActuales.some(con => normalizarTexto(con.nombre) === normalizarTexto(`${c.name.first} ${c.name.last}`)))
        .map(c => new Conductor(
            `${c.name.first} ${c.name.last}`,
            c.phone
        ))

        guardarClientes([...clientesActuales, ...nuevosClientes]);
        guardarConductores([...conductoresActuales, ...nuevosConductores]);
        localStorage.setItem("usuariosAgregados", "true");
    })
    .catch((error) => {
        console.error('Error al obtener usuarios:', error);
    });
}

usuariosRandom(URL);

fetch(URL1)
    .then((response) => response.json())
    .then((data) => {
        const negociosActuales = obtenerNegocios();
        
        const nuevosNegocios = data
            .filter(n => !negociosActuales.some(neg => normalizarTexto(neg.nombre) === normalizarTexto(n.nombre)))
            .map((n, i) => new Negocio(
                negociosActuales.length + i + 1,
                n.nombre,
                n.descripcion
            ));

        guardarNegocios([...negociosActuales, ...nuevosNegocios]);
    })  
    .catch(error => {
        console.error('Error al cargar negocios:', error);
    });  


fetch(URL2)
    .then((response) => response.json())
    .then((data) => {
        const conductoresActuales = obtenerConductores();

        const nuevosConductores = data
            .filter(c => !conductoresActuales.some(con => normalizarTexto(con.nombre) === normalizarTexto(c.nombre)))
            .map(c => new Conductor(
                c.nombre,
                c.telefono
            ))
        guardarConductores([...conductoresActuales, ...nuevosConductores]);
    })
    .catch(error => {
        console.error('Error al cargar conductores:', error);
    }); 

fetch(URL3)
    .then((response) => response.json())
    .then((data) => {
        const clientesActuales = obtenerClientes();

        const nuevosClientes = data
            .filter(c => !clientesActuales.some(cli => normalizarTexto(cli.nombre) === normalizarTexto(c.nombre)))
            .map(c => new Cliente(
                c.nombre,
                c.direccion,
                c.telefono
            ))
        guardarClientes([...clientesActuales, ...nuevosClientes]);
    })
    .catch(error => {
        console.error('Error al cargar clientes:', error);
    }); 

fetch(URL4)
    .then((response) => response.json())
    .then((data) => {
        const pedidosActuales = obtenerPedidos();

        const nuevosPedidos = data
            .filter(p => !pedidosActuales.some(pe =>
                normalizarTexto(pe.cliente) === normalizarTexto(p.cliente) &&
                normalizarTexto(pe.negocio) === normalizarTexto(p.negocio) &&
                pe.estado === p.estado
            ))
            .map((p, i) => new Pedido(
                pedidosActuales.length + i + 1,
                p.negocio,
                p.cliente,
                p.direccion,
                p.telefono,
                p.estado,
                p.conductor
            ))
            guardarPedidos([...pedidosActuales, ...nuevosPedidos]);
    })
    .catch(error => {
        console.error('Error al cargar pedidos:', error);
    }); 
    

//CLASES
class Cliente {
    constructor(nombre, direccion, telefono) {
        this.nombre = nombre;
        this.direccion = direccion;
        this.telefono = telefono;
    }
}


class Negocio {
    constructor(id, nombre, descripcion) {
        this.id = id;
        this.nombre = nombre;
        this.descripcion = descripcion;
    }
}

let Estado = ["Pendiente", "En tránsito", "Entregado", "Cancelado"];

class Conductor {
    constructor(nombre, telefono) {
        this.nombre = nombre;
        this.telefono = telefono;
    }
}

class Pedido {
    constructor(id, negocio, cliente, direccion, telefono, estado, conductor) {
        this.id = id;
        this.negocio = negocio;
        this.cliente = cliente;
        this.direccion = direccion;
        this.telefono =telefono;
        this.estado = estado;
        this.conductor = conductor;
    }
}

//FUNCION DE COMPRARACION DE STRINGS
function normalizarTexto(texto) {
    return texto
    .toLowerCase()              
    .replace(/\s+/g, '')        
    .normalize('NFD')           
    .replace(/[\u0300-\u036f]/g, ''); 
}

//FUNCIONES PARA COMUNICARSE CON LOCALSTORAGE
function obtenerPedidos() {
    return JSON.parse(localStorage.getItem('pedidos')) || [];
}

function guardarPedidos(pedidos) {
    localStorage.setItem('pedidos', JSON.stringify(pedidos));
}

function obtenerNegocios() {
    return JSON.parse(localStorage.getItem('negocios')) || [];
}

function guardarNegocios(negocios) {
    localStorage.setItem('negocios', JSON.stringify(negocios));
}

function obtenerClientes() {
    return JSON.parse(localStorage.getItem('clientes')) || [];
}

function guardarClientes(clientes) {
    localStorage.setItem('clientes', JSON.stringify(clientes));
}
function obtenerConductores() {
    return JSON.parse(localStorage.getItem('conductores')) || [];
}

function guardarConductores(conductores) {
    localStorage.setItem('conductores', JSON.stringify(conductores));
}

//FUNCIONES AUXILIARES
function generarNuevoId(arreglo) {
    return arreglo.length > 0 ? arreglo[arreglo.length - 1].id + 1 : 1;
}

//INDEX
if (page === 'index') {

    function actualizarContadorPedidosTotales() {
        const pedidos = obtenerPedidos(); 
        const cantPedidos = pedidos.length;

        const spanContador = document.querySelector('.contador-total');
        if (spanContador) {
            spanContador.textContent = cantPedidos;
        }
    }

    function actualizarContadorPendientes() {
        const pedidos = obtenerPedidos(); 
        const pedidosPendientes = pedidos.filter(p => {
            return (normalizarTexto(p.estado) === normalizarTexto("Pendiente"))
        })
        const spanContador = document.querySelector('.contador-pendientes');
        if (spanContador) {
            spanContador.textContent = pedidosPendientes.length;
        }
    }

    function actualizarContadorTransito() {
        const pedidos = obtenerPedidos(); 
        const pedidosTransito = pedidos.filter(p => {
            return (normalizarTexto(p.estado) === normalizarTexto("En tránsito"))
        })
        const spanContador = document.querySelector('.contador-transito');
        if (spanContador) {
            spanContador.textContent = pedidosTransito.length;
        }
    }

    function actualizarContadorEntregado() {
        const pedidos = obtenerPedidos(); 
        const pedidosEntregado = pedidos.filter(p => {
            return (normalizarTexto(p.estado) === normalizarTexto("Entregado"))
        })
        const spanContador = document.querySelector('.contador-entregado');
        if (spanContador) {
            spanContador.textContent = pedidosEntregado.length;
        }
    }
    actualizarContadorEntregado();
    actualizarContadorTransito();
    actualizarContadorPendientes();
    actualizarContadorPedidosTotales();

    function actualizarTablaPedidos() {
        const pedidos = obtenerPedidos();
        const tabla = document.querySelector('.lista-envios tbody');

        pedidos.forEach(p => {
            const fila = document.createElement('tr');
            fila.innerHTML = `
                <td>
                    <label class="checkbox-container">
                    <input type="checkbox" class="checkbox-pedido" data-id="${p.id}" />
                    </label>
                </td>
                <td>${p.id}</td>
                <td>${p.negocio}</td>
                <td>${p.cliente}</td>
                <td>${p.direccion}</td>
                <td>${p.telefono}</td>
                <td>${p.estado}</td>
                <td>${p.conductor || '-'}</td>
            `;
            tabla.appendChild(fila);
        })
    }
    actualizarTablaPedidos();
    
    //ASIGNAR UN CONDUCTOR A PEDIDOS
    document.querySelector('.acciones .btn:nth-child(2)').addEventListener('click', () => {
        
        const checkboxes = document.querySelectorAll('.checkbox-pedido:checked');
        
        if (checkboxes.length === 0) {
            Swal.fire({
                icon: 'warning',
                title: 'Atencion',
                text: 'Selecciona al menos un pedido.',
                confirmButtonText: 'OK',
                confirmButtonColor: '#f5a623' 
            });
            return;
        }
        document.getElementById('modal-conductor').classList.remove('oculto');
        const seleccionados = Array.from(checkboxes).map(cb => parseInt(cb.dataset.id));
        localStorage.setItem('pedidosSeleccionados', JSON.stringify(seleccionados));
    })

    //ASIGNAR EL CONDUCTOR DESDE EL MODAL
    document.querySelector('#btn-asignar').addEventListener('click', () => {
        const conductorSeleccionado = document.getElementById('select-conductor').value;

        if (!conductorSeleccionado) {
            Swal.fire({
                icon: 'warning',
                title: 'Atencion',
                text: 'Selecciona al menos un Conductor.',
                confirmButtonText: 'OK',
                confirmButtonColor: '#f5a623' 
            });
            return;
        }

        const pedidos = obtenerPedidos();
        const seleccionados = JSON.parse(localStorage.getItem('pedidosSeleccionados') || '[]');
        pedidos.forEach (p => {
            if (seleccionados.includes(p.id)) {
                p.conductor = conductorSeleccionado;
                p.estado = Estado[1];
            }  
        })
        guardarPedidos(pedidos);
        localStorage.removeItem('pedidosSeleccionados');
        document.getElementById('modal-conductor').classList.add('oculto');
        sessionStorage.setItem('mostrarNotificacion', 'pedidoAsignado');
        location.reload();
    })

    document.addEventListener('DOMContentLoaded', () => {
        if (sessionStorage.getItem('mostrarNotificacion') === 'pedidoAsignado') {
            Toastify({
            text: "✅ Pedido asignado con éxito.",
            duration: 3000,
            close: true,
            gravity: "bottom",
            position: "right",
            backgroundColor: "#28a745",
            stopOnFocus: true
            }).showToast();

            sessionStorage.removeItem('mostrarNotificacion');

        } else  if (sessionStorage.getItem('mostrarNotificacion') === 'estadoCambiado') {
            Toastify({
            text: "✅ Estado cambiado con éxito.",
            duration: 3000,
            close: true,
            gravity: "bottom",
            position: "right",
            backgroundColor: "#28a745",
            stopOnFocus: true
            }).showToast();

            sessionStorage.removeItem('mostrarNotificacion');
        }
    });

    //CANCELAR LA ASIGNACION DESDE EL MODAL
    document.getElementById('btn-cancelar').addEventListener('click', () => {
        document.getElementById('modal-conductor').classList.add('oculto');
        localStorage.removeItem('pedidosSeleccionados');
    });

    //MUESTRO LOS CONDUCTORES DESDE EL SELECT
    const select = document.getElementById('select-conductor');
    const conductores = obtenerConductores();
    conductores.forEach(c => {
        const option = document.createElement('option');
        option.value = c.nombre;
        option.textContent = c.nombre;
        select.appendChild(option);
    });

    //CAMBIO DE ESTADO DE LOS PEDIDOS
    document.querySelector('.acciones .btn:nth-child(3)').addEventListener('click', () => {
        const checkboxes = document.querySelectorAll('.checkbox-pedido:checked');
        if (checkboxes.length === 0) {
            Swal.fire({
                icon: 'warning',
                title: 'Atencion',
                text: 'Selecciona al menos un pedido.',
                confirmButtonText: 'OK',
                confirmButtonColor: '#f5a623' 
            });
            return;
        }
        document.getElementById('modal-estado').classList.remove('oculto');
        const seleccionados = Array.from(checkboxes).map(cb => parseInt(cb.dataset.id));
        localStorage.setItem('pedidosSeleccionados', JSON.stringify(seleccionados));
    })

    document.querySelector('#btn-confirmar-estado').addEventListener('click', () => {
        const nuevoEstado = document.getElementById('select-estado').value;

        if (!nuevoEstado) {
            Swal.fire({
                toast: true,
                position: 'bottom-end',
                icon: 'success',
                title: 'Seleccione un estado',
                showConfirmButton: false,
                timer: 2500,
                didOpen: (toast) => {
                    toast.addEventListener('mouseenter', Swal.stopTimer)
                    toast.addEventListener('mouseleave', Swal.resumeTimer)
            }
            });
            return;
        }

        const pedidos = obtenerPedidos();
        const seleccionados = JSON.parse(localStorage.getItem('pedidosSeleccionados') || '[]');
        pedidos.forEach(p => {
            if (seleccionados.includes(p.id)) {
                p.estado = nuevoEstado;
                if (nuevoEstado === "Entregado") {
                    if (!p.conductor) {
                        p.conductor = "SistemaEnviosUY";
                    }
                }
                if (nuevoEstado === "Pendiente" || nuevoEstado === "Cancelado") {
                    p.conductor = undefined;
                }
            }
        });
        guardarPedidos(pedidos);
        localStorage.removeItem('pedidosSeleccionados');
        document.getElementById('modal-estado').classList.add('oculto');
        sessionStorage.setItem('mostrarNotificacion', 'estadoCambiado');
        location.reload();
    });

    document.getElementById('btn-cancelar-estado').addEventListener('click', () => {
        document.getElementById('modal-estado').classList.add('oculto');
        localStorage.removeItem('pedidosSeleccionados');
    });

}

//INGRESAR PEDIDOS POR FORMULARIO
if (page === 'ingreso') {
    const formularioPedido = document.getElementById("form-ingreso-pedido");

    formularioPedido.addEventListener('submit', function(evento) {
        evento.preventDefault();
        const pedidos = obtenerPedidos();
        const datos = new FormData(formularioPedido);
        const negocios = obtenerNegocios();
        const clientes = obtenerClientes();
        let existe = negocios.some(n => normalizarTexto(datos.get('Negocio')) == normalizarTexto(n.nombre));
        let existeCliente = clientes.some(c => normalizarTexto(datos.get('Cliente')) == normalizarTexto(c.nombre));
        if (existe) {
            if (!existeCliente) {
                const nuevoCliente = new Cliente(
                    datos.get('Cliente'),
                    datos.get('Direccion'),
                    datos.get('Telefono'),
                )
                clientes.push(nuevoCliente);
                guardarClientes(clientes);
            }
            const nuevoId = generarNuevoId(pedidos);
            const nuevoPedido = new Pedido(
                nuevoId,
                datos.get('Negocio'),
                datos.get('Cliente'),
                datos.get('Direccion'),
                datos.get('Telefono'),
                Estado[0],
                undefined
            )
            pedidos.push(nuevoPedido);
            guardarPedidos(pedidos);
            let timerInterval;
            Swal.fire({
                icon: 'success',
                title: "Pedido Ingresado Correctamente!",
                html: "Redirigiendo en <b></b> millisegundos.",
                timer: 2000,
                timerProgressBar: true,
                didOpen: () => {
                    Swal.showLoading();
                    const timer = Swal.getPopup().querySelector("b");
                    timerInterval = setInterval(() => {
                    timer.textContent = `${Swal.getTimerLeft()}`;
                    }, 100);
                },
                willClose: () => {
                    clearInterval(timerInterval);
                }
                }).then((result) => {
                if (result.dismiss === Swal.DismissReason.timer) {
                    window.location.href = '../index.html';
                }
            });
        } else {
            Swal.fire({
                icon: 'warning',
                title: '⚠️ Negocio no ingresado en el sistema',
                text: '¿Desea ingresarlo?',
                showCancelButton: true,
                confirmButtonText: 'Sí, ingresarlo',
                cancelButtonText: 'Cancelar',
                confirmButtonColor: '#28a745',
                cancelButtonColor: '#d33'
                }).then((result) => {
                if (result.isConfirmed) {
                    document.querySelector('[data-tab="negocios"]').click();
                }
            });
        }
        formularioPedido.reset();
    })

    //INGRESAR NEGOCIOS POR FORMULARIO
    const formularioNegocios = document.getElementById('form-ingreso-negocio');

    formularioNegocios.addEventListener('submit', function(evento) {
        evento.preventDefault();

        const negocios = obtenerNegocios();
        const datos = new FormData(formularioNegocios);
        let existe = negocios.some(n => normalizarTexto(datos.get('nombre')) == normalizarTexto(n.nombre));
        if (!existe) {
            const nuevoId = generarNuevoId(negocios);
            const nuevoNegocio = new Negocio(
                nuevoId,
                datos.get('nombre'),
                datos.get('desc')
            )
            negocios.push(nuevoNegocio);
            guardarNegocios(negocios);
            Swal.fire({
                toast: true,
                position: 'bottom-end',
                icon: 'success',
                title: '✅ Negocio ingresado con éxito.',
                showConfirmButton: false,
                timer: 2500,
                didOpen: (toast) => {
                    toast.addEventListener('mouseenter', Swal.stopTimer)
                    toast.addEventListener('mouseleave', Swal.resumeTimer)
                }
            });
        } else {
            Swal.fire({
                toast: true,
                position: 'bottom-end',
                icon: 'warning',
                title: '⚠️ Negocio ya ingresado en el sistema.',
                showConfirmButton: false,
                timer: 2500,
                didOpen: (toast) => {
                    toast.addEventListener('mouseenter', Swal.stopTimer)
                    toast.addEventListener('mouseleave', Swal.resumeTimer)
                }
            });
        }
        formularioNegocios.reset();
    })

    //INGRESAR CLIENTES POR FORMULARIO
    const formularioClientes = document.getElementById('form-ingreso-cliente');

    formularioClientes.addEventListener('submit', function(e) {
        e.preventDefault();

        const clientes = obtenerClientes();
        const datos = new FormData(formularioClientes);
        let existe = clientes.some(c => normalizarTexto(datos.get('nombreCliente')) == normalizarTexto(c.nombre));
        if(!existe) {
            const nuevoCliente = new Cliente(
                datos.get('nombreCliente'),
                datos.get('Direccion'),
                datos.get('Telefono'),
            )
            clientes.push(nuevoCliente);
            guardarClientes(clientes);
            Swal.fire({
                toast: true,
                position: 'bottom-end',
                icon: 'success',
                title: '✅ Cliente ingresado con éxito.',
                showConfirmButton: false,
                timer: 2500,
                didOpen: (toast) => {
                    toast.addEventListener('mouseenter', Swal.stopTimer)
                    toast.addEventListener('mouseleave', Swal.resumeTimer)
                }
            });
        } else {
            Swal.fire({
                toast: true,
                position: 'bottom-end',
                icon: 'warning',
                title: '⚠️ Cliente ya ingresado en el sistema.',
                showConfirmButton: false,
                timer: 2500,
                didOpen: (toast) => {
                    toast.addEventListener('mouseenter', Swal.stopTimer)
                    toast.addEventListener('mouseleave', Swal.resumeTimer)
                }
            });
        }
        formularioClientes.reset();
    })

    //INGRESAR CONDUCTORES POR FORMULARIO
    const formularioConductores = document.getElementById('form-ingreso-conductores');

    formularioConductores.addEventListener('submit', function(e) {
        e.preventDefault();

        const conductores = obtenerConductores();
        const datos = new FormData(formularioConductores);
        let existe = conductores.some(c => normalizarTexto(datos.get('nombreConductor')) == normalizarTexto(c.nombre));
        if(!existe) {
            const nuevoConductores = new Conductor(
                datos.get('nombreConductor'),
                datos.get('telConductor')
            )
            conductores.push(nuevoConductores);
            guardarConductores(conductores);
            Swal.fire({
                toast: true,
                position: 'bottom-end',
                icon: 'success',
                title: '✅ Conductor ingresado con éxito.',
                showConfirmButton: false,
                timer: 2500,
                showClass: {
                    popup: 'swal2-show' 
                },
                hideClass: {
                    popup: 'swal2-hide' 
                },
                didOpen: (toast) => {
                    toast.addEventListener('mouseenter', Swal.stopTimer)
                    toast.addEventListener('mouseleave', Swal.resumeTimer)
                }
            });
        } else {
            Swal.fire({
                toast: true,
                position: 'bottom-end',
                icon: 'warning',
                title: '⚠️ Conductor ya ingresado en el sistema.',
                showConfirmButton: false,
                timer: 2500,
                showClass: {
                    popup: 'swal2-show' 
                },
                hideClass: {
                    popup: 'swal2-hide' 
                },
                didOpen: (toast) => {
                    toast.addEventListener('mouseenter', Swal.stopTimer)
                    toast.addEventListener('mouseleave', Swal.resumeTimer)
                }
            });
        }
        formularioConductores.reset();
    })

}

if (page === 'listado') {

    //FILTRO DE LISTADO DE PEDIDOS
    const formularioFiltroPedidos = document.getElementById('form-filtro-pedido');

    function actualizarTablaPedidos(pedidosFiltrados) {
        const tabla = document.querySelector('#lista-pedidos tbody');
        tabla.innerHTML = '';
        pedidosFiltrados.forEach(p => {
            const fila = document.createElement('tr');
            fila.innerHTML = `
                <td>${p.id}</td>
                <td>${p.negocio}</td>
                <td>${p.cliente}</td>
                <td>${p.direccion}</td>
                <td>${p.telefono}</td>
                <td>${p.estado}</td>
                <td>${p.conductor || '-'}</td>
            `;
            tabla.appendChild(fila);
        })  
    }

    //FORMULARIO DEL FILTRO DE PEDIDOS
    formularioFiltroPedidos.addEventListener("submit" , function(e) {
        e.preventDefault();
        const datos = new FormData(formularioFiltroPedidos);
        const id = datos.get('id');
        const negocio = datos.get('negocio');
        const cliente = datos.get('cliente');
        const direccion = datos.get('direccion');
        const telefono = datos.get('telefono');
        const conductor = datos.get('conductor');
        const estado = datos.get('estado');
        const filtros = {id, negocio, cliente, direccion, telefono, conductor, estado};
        const pedidos = obtenerPedidos();
        //verifico si existen pedidos que coincidan con id, negocio, etc
        const pedidosFiltrados = pedidos.filter(p => {
            return ((!filtros.id || p.id.toString() === filtros.id.trim()) && //Comparo ids convirtiendo el id del pedido en string para comprar con el dato del formulario y elimino los espacios con .trim()
                    (!filtros.negocio || normalizarTexto(p.negocio).includes(normalizarTexto(filtros.negocio))) &&
                    (!filtros.cliente || normalizarTexto(p.cliente).includes(normalizarTexto(filtros.cliente))) &&
                    (!filtros.direccion || normalizarTexto(p.direccion).includes(normalizarTexto(filtros.direccion))) &&
                    (!filtros.telefono || normalizarTexto(p.telefono).includes(normalizarTexto(filtros.telefono))) &&
                    (!filtros.estado || normalizarTexto(p.estado).includes(normalizarTexto(filtros.estado))) &&
                    (!filtros.conductor || (p.conductor && normalizarTexto(p.conductor).includes(normalizarTexto(filtros.conductor))))) 
        })
        actualizarTablaPedidos(pedidosFiltrados);
    })
    
    actualizarTablaPedidos(obtenerPedidos());

    //FILTRO DE LISTADO DE NEGOCIOS  
    const formularioFiltroNegocios = document.getElementById('form-filtro-negocios');

    function actualizarTablaNegocios(negociosFiltrados) {
        const tabla = document.querySelector('#lista-negocios tbody');
        tabla.innerHTML = '';
        negociosFiltrados.forEach(n => {
                const fila = document.createElement('tr');
                fila.innerHTML = `
                    <td>${n.nombre}</td>
                    <td>${n.descripcion}</td>
                `;
                tabla.appendChild(fila);
            })   
    }

    formularioFiltroNegocios.addEventListener('submit' , function(e) {
        e.preventDefault();
        const datos = new FormData(formularioFiltroNegocios);
        const filtros = {nombre: datos.get('nomnegocio')};
        const negocios = obtenerNegocios();
        const negociosFiltrados = negocios.filter(n => {
            return ((!filtros.nombre || normalizarTexto(n.nombre).includes(normalizarTexto(filtros.nombre))))
        })
        actualizarTablaNegocios(negociosFiltrados);
    })

    actualizarTablaNegocios(obtenerNegocios());

    //FILTRO DE LISTADO DE CLIENTES
    const formularioFiltroClientes = document.getElementById('form-filtro-clientes');

    function actualizarTablaClientes(clientesFiltrados) {
        const tabla = document.querySelector('#lista-clientes tbody');
        tabla.innerHTML = '';
        clientesFiltrados.forEach(c => {
                const fila = document.createElement('tr');
                fila.innerHTML = `
                    <td>${c.nombre}</td>
                    <td>${c.direccion}</td>
                    <td>${c.telefono}</td>
                `;
                tabla.appendChild(fila);
            })   
    }

    formularioFiltroClientes.addEventListener('submit' , function(e) {
        e.preventDefault();
        const datos = new FormData(formularioFiltroClientes);
        const filtros = {nombre: datos.get('nomcliente'), direccion: datos.get('direcliente'), telefono: datos.get('telcliente')};
        const clientes = obtenerClientes();
        const clientesFiltrados = clientes.filter(c => {
            return (
                (!filtros.nombre || normalizarTexto(c.nombre).includes(normalizarTexto(filtros.nombre))) &&
                (!filtros.direccion || normalizarTexto(c.direccion).includes(normalizarTexto(filtros.direccion))) &&
                (!filtros.telefono || normalizarTexto(c.telefono).includes(normalizarTexto(filtros.telefono)))
            )
        })
        actualizarTablaClientes(clientesFiltrados);
    })

    actualizarTablaClientes(obtenerClientes());

    //FILTRO DE LISTADO DE CONDUCTORES
    const formularioFiltroConductores = document.getElementById('form-filtro-conductores');

    function actualizarTablaConductores(conductoresFiltrados) {
        const tabla = document.querySelector('#lista-conductores tbody');
        tabla.innerHTML = '';
        conductoresFiltrados.forEach(c => {
                const fila = document.createElement('tr');
                fila.innerHTML = `
                    <td>${c.nombre}</td>
                    <td>${c.telefono}</td>
                `;
                tabla.appendChild(fila);
            })   
    }

    formularioFiltroConductores.addEventListener('submit', function(e) {
        e.preventDefault();

        const datos = new FormData(formularioFiltroConductores);
        const filtros = {nombre: datos.get('nomconductor'), telefono: datos.get('telconductor')};
        const conductores = obtenerConductores();
        const conductoresFiltrados = conductores.filter(c => {
            return (
                (!filtros.nombre || normalizarTexto(c.nombre).includes(normalizarTexto(filtros.nombre))) &&
                (!filtros.telefono || normalizarTexto(c.telefono).includes(normalizarTexto(filtros.telefono)))
            )
        })
        actualizarTablaConductores(conductoresFiltrados);
    })

    actualizarTablaConductores(obtenerConductores());


}
