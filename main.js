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

//funcion de comparacion de strings
function normalizarTexto(texto) {
    return texto
    .toLowerCase()              
    .replace(/\s+/g, '')        
    .normalize('NFD')           
    .replace(/[\u0300-\u036f]/g, ''); 
}


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
        //guardo los pedidos seleccionados
        const checkboxes = document.querySelectorAll('.checkbox-pedido:checked');
        //si no seleccione ninguno no me deja asignar
        if (checkboxes.length === 0) {
            alert('⚠️ Seleccioná al menos un pedido.');
            return;
        }
        //muestro el modal
        document.getElementById('modal-conductor').classList.remove('oculto');
        //guardo el id de los pedidos seleccionados en un array
        const seleccionados = Array.from(checkboxes).map(cb => parseInt(cb.dataset.id));
        //guardo los pedidos en el local storage
        localStorage.setItem('pedidosSeleccionados', JSON.stringify(seleccionados));
    })

    //ASIGNAR EL CONDUCTOR DESDE EL MODAL
    document.querySelector('#btn-asignar').addEventListener('click', () => {
        //Guardo un conductor seleccionado
        const conductorSeleccionado = document.getElementById('select-conductor').value;
        //Si no selecciono no me deja continuar
        if (!conductorSeleccionado) {
            alert("⚠️ Seleccioná un conductor.");
            return;
        }

        //pedidos generales
        const pedidos = obtenerPedidos();
        //pedidos seleccionados con el checkbox
        const seleccionados = JSON.parse(localStorage.getItem('pedidosSeleccionados') || '[]');
        //asigno el conductorSeleccionado a los pedidos seleccionados
        pedidos.forEach (p => {
            //cambio el estado de los pedidos
            if (seleccionados.includes(p.id)) {
                p.conductor = conductorSeleccionado;
                p.estado = Estado[1];
            }  
        })
        guardarPedidos(pedidos);
        //borro los pedidos seleccionados del localstorage, oculto el modal y recargo la pagina
        localStorage.removeItem('pedidosSeleccionados');
        document.getElementById('modal-conductor').classList.add('oculto');
        location.reload();
    })

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
        //Guardo los pedidos seleccionados
        const checkboxes = document.querySelectorAll('.checkbox-pedido:checked');
        //Si no seleccione ninguno no me deja cambiar el estado
        if (checkboxes.length === 0) {
            alert('⚠️ Seleccioná al menos un pedido.');
            return;
        }
        //Muestro el modal
        document.getElementById('modal-estado').classList.remove('oculto');
        //guardo el id de los pedidos seleccionados en un array
        const seleccionados = Array.from(checkboxes).map(cb => parseInt(cb.dataset.id));
        //guardo los pedidos en el local storage
        localStorage.setItem('pedidosSeleccionados', JSON.stringify(seleccionados));
    })

    document.querySelector('#btn-confirmar-estado').addEventListener('click', () => {
        const nuevoEstado = document.getElementById('select-estado').value;

        if (!nuevoEstado) {
            alert("⚠️ Seleccioná un estado.");
            return;
        }

        const pedidos = obtenerPedidos();
        const seleccionados = JSON.parse(localStorage.getItem('pedidosSeleccionados') || '[]');
        pedidos.forEach(p => {
            if (seleccionados.includes(p.id)) {
                p.estado = nuevoEstado;
                //Si el conductor no finaliza el pedido se marca como entregado desde el sitema
                if (nuevoEstado === "Entregado") {
                    if (!p.conductor) {
                        p.conductor = "SistemaEnviosUY";
                    }
                }
                //Si se cambia el estado a pendiente o cancelado, el conductor queda indefinido
                if (nuevoEstado === "Pendiente" || nuevoEstado === "Cancelado") {
                    p.conductor = undefined;
                }
            }
        });
        guardarPedidos(pedidos);
        localStorage.removeItem('pedidosSeleccionados');
        document.getElementById('modal-estado').classList.add('oculto');
        location.reload();
    });

    document.getElementById('btn-cancelar-estado').addEventListener('click', () => {
        document.getElementById('modal-estado').classList.add('oculto');
        localStorage.removeItem('pedidosSeleccionados');
    });

}

//INGRESAR PEDIDOS POR FORMULARIO

if (page === 'ingreso') {

    //Obtengo el formulario de ingreso del pedido
    const formularioPedido = document.getElementById("form-ingreso-pedido");

    formularioPedido.addEventListener('submit', function(evento) {
        evento.preventDefault();

        const pedidos = obtenerPedidos();
        //Datos ingresados en el formulario
        const datos = new FormData(formularioPedido);
        const negocios = obtenerNegocios();
        const clientes = obtenerClientes();
        //Verifico si existe el negocio y/o el cliente
        let existe = negocios.some(n => normalizarTexto(datos.get('Negocio')) == normalizarTexto(n.nombre));
        let existeCliente = clientes.some(c => normalizarTexto(datos.get('Cliente')) == normalizarTexto(c.nombre));
        //Si existe el negocio continuo con el ingreso del pedido
        if (existe) {
            //Si el cliente no existe, lo ingreso al sistema automaticamente para no tener que ingresarlo de forma manual
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
            //Se redirige al inicio al terminar de ingresar el pedido
            alert("✅ Pedido ingresado con éxito. Redirigiendo...");
            setTimeout(() => {
                    window.location.href = '../index.html';
            }, 500);
        //Si no existe el negocio le doy la opcion de ingresarlo
        } else {
            let ingresar = confirm("⚠️ Negocio no ingresado en sistema\n ¿Desea ingresarlo?");
            if (ingresar) {
                document.querySelector('[data-tab="negocios"]').click();
            }
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
            alert("✅ Negocio ingresado con éxito.");
        } else {
            alert("⚠️ Negocio ya ingresado en el sistema");
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
            alert("✅ Cliente ingresado con éxito.");
        } else {
            alert("⚠️ Cliente ya ingresado en el sistema");
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
            alert("✅ Conductor ingresado con éxito.");
        } else {
            alert("⚠️ Conductor ya ingresado en el sistema");
        }
        formularioConductores.reset();
    })

}

if (page === 'listado') {

    //FILTRO DE LISTADO DE PEDIDOS
    const formularioFiltroPedidos = document.getElementById('form-filtro-pedido');

    //Actualizado el listado de pedidos, dados sus filtros
    function actualizarTablaPedidos(pedidosFiltrados) {
        const tabla = document.querySelector('#lista-pedidos tbody');
        tabla.innerHTML = '';
        //Agrego los pedidos filtrados al listado
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
        //Recibo los datos de ese formulario
        const datos = new FormData(formularioFiltroPedidos);
        const id = datos.get('id');
        const negocio = datos.get('negocio');
        const cliente = datos.get('cliente');
        const direccion = datos.get('direccion');
        const telefono = datos.get('telefono');
        const conductor = datos.get('conductor');
        const filtros = {id, negocio, cliente, direccion, telefono, conductor};
        const pedidos = obtenerPedidos();
        //verifico si existen pedidos que coincidan con id, negocio, etc
        const pedidosFiltrados = pedidos.filter(p => {
            return ((!filtros.id || p.id.toString() === filtros.id.trim()) && //Comparo ids convirtiendo el id del pedido en string para comprar con el dato del formulario y elimino los espacios con .trim()
                    (!filtros.negocio || normalizarTexto(p.negocio).includes(normalizarTexto(filtros.negocio))) &&
                    (!filtros.cliente || normalizarTexto(p.cliente).includes(normalizarTexto(filtros.cliente))) &&
                    (!filtros.direccion || normalizarTexto(p.direccion).includes(normalizarTexto(filtros.direccion))) &&
                    (!filtros.telefono || normalizarTexto(p.telefono).includes(normalizarTexto(filtros.telefono))) &&
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
