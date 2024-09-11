let productosSimulados = [];

document.addEventListener('DOMContentLoaded', () => {
    cargarProductos();
    actualizarCarritoFlotante();
});

function cargarProductos() {
    fetch('js/productos.json')
        .then(response => response.json())
        .then(data => {
            productosSimulados = data;
            mostrarProductos(productosSimulados);
        })
        .catch(error => console.error('Error al cargar los productos:', error));
}

function mostrarProductos(productos) {
    const productosContainer = document.getElementById('productos');
    productosContainer.innerHTML = '';
    productos.forEach((producto, index) => {
        const productoDiv = document.createElement('div');
        productoDiv.className = 'producto';
        productoDiv.innerHTML = `
            <img src="${producto.img}" alt="${producto.nombre}">
            <div>
                <h3>${producto.nombre}</h3>
                <p>Precio: $${producto.precio}</p>
                <button onclick="agregarProducto(${index})">Agregar al Carrito</button>
            </div>
        `;
        productosContainer.appendChild(productoDiv);
    });
}

let carrito = JSON.parse(localStorage.getItem('carrito')) || [];

function agregarProducto(indice) {
    const productoSeleccionado = productosSimulados[indice];
    const productoEnCarrito = carrito.find(item => item.nombre === productoSeleccionado.nombre);
    if (productoEnCarrito) {
        productoEnCarrito.cantidad++;
    } else {
        carrito.push({ ...productoSeleccionado, cantidad: 1 });
    }
    mostrarSweetAlert(`Has agregado ${productoSeleccionado.nombre} al carrito.`, 'success');
    actualizarCarrito();
    guardarCarrito();
    actualizarCarritoFlotante();
}

function actualizarCarrito() {
    const carritoContainer = document.getElementById('lista-carrito');
    carritoContainer.innerHTML = '';
    carrito.forEach((producto, index) => {
        const item = document.createElement('li');
        item.innerHTML = `
            ${producto.nombre} - $${producto.precio} x ${producto.cantidad}
            <button onclick="disminuirCantidad(${index})">-</button>
            <button onclick="aumentarCantidad(${index})">+</button>
            <button onclick="eliminarProducto(${index})">Eliminar</button>
        `;
        carritoContainer.appendChild(item);
    });
    document.getElementById('total').innerText = `Total: $${calcularTotal()}`;
}

function aumentarCantidad(index) {
    carrito[index].cantidad++;
    actualizarCarrito();
    guardarCarrito();
    actualizarCarritoFlotante();
}

function disminuirCantidad(index) {
    if (carrito[index].cantidad > 1) {
        carrito[index].cantidad--;
    } else {
        eliminarProducto(index);
    }
    actualizarCarrito();
    guardarCarrito();
    actualizarCarritoFlotante();
}

function eliminarProducto(index) {
    carrito.splice(index, 1);
    actualizarCarrito();
    guardarCarrito();
    actualizarCarritoFlotante();
}

function calcularTotal() {
    return carrito.reduce((total, producto) => total + (producto.precio * producto.cantidad), 0);
}

function guardarCarrito() {
    localStorage.setItem('carrito', JSON.stringify(carrito));
}

function actualizarCarritoFlotante() {
    const cantidadCarrito = carrito.reduce((total, producto) => total + producto.cantidad, 0);
    document.getElementById('cantidad-carrito').innerText = cantidadCarrito;
}

function mostrarCarrito() {
    actualizarCarrito();
    document.getElementById('carrito-modal').style.display = 'block';
}

function cerrarModal(modal) {
    modal.style.display = "none";
}

document.getElementById('finalizar-compra').addEventListener('click', () => {
    if (carrito.length > 0) {
        mostrarSweetAlert(
            `Has comprado:\n${carrito.map(producto => `${producto.nombre} x${producto.cantidad}`).join('\n')}\nTotal a pagar: $${calcularTotal()}.`,
            'success'
        );
        carrito = [];
        actualizarCarrito();
        guardarCarrito();
        actualizarCarritoFlotante();
        cerrarModal(document.getElementById('carrito-modal'));
    } else {
        mostrarSweetAlert('No has seleccionado ningún producto.', 'warning');
    }
});

document.getElementById('seguir-comprando').addEventListener('click', () => {
    cerrarModal(document.getElementById('carrito-modal'));
});

document.querySelectorAll('.close').forEach(button => {
    button.addEventListener('click', () => cerrarModal(button.parentElement.parentElement));
});

window.onclick = function(event) {
    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => {
        if (event.target == modal) {
            modal.style.display = 'none';
        }
    });
}

function mostrarSweetAlert(mensaje, tipo) {
    Swal.fire({
        icon: tipo,
        title: 'Mensaje',
        text: mensaje,
        confirmButtonText: 'OK'
    });
}
