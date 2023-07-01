
let caja = document.getElementById('sinNumero');
let numero = document.getElementById('numero');

function noNumero(){
        numero.disabled = caja.checked;
}

caja.addEventListener('click', noNumero)


function contarLetras(){

        let valor = document.getElementById('contadorLetras');
        let cantidad = valor.value.length;
        document.getElementById('contador').innerHTML=`${cantidad} /450`
}

let terminos = document.getElementById('termYCondCheck');
let btnPedido = document.getElementById('btnPedido');

function aceptoCondiciones(){
        btnPedido.disabled = !terminos.checked;
}

terminos.addEventListener('change', aceptoCondiciones)

let mensaje = document.getElementById('terYCondLink')

function terminosYCondicionesLink(){
        alert('Terminos y Condiciones');
}

mensaje.addEventListener('click', terminosYCondicionesLink)

let formulario = document.getElementById('formularioCarrito')

function enviarRealizarPedido(){
        if(formulario.checkValidity()){
                formulario.submit();
        } else {
                alert('Completa los campos del formulario señalados con el simbolo (*)')
        }
}

btnPedido.addEventListener('click', enviarRealizarPedido)


document.getElementById('formulario-carrito').addEventListener('submit', function(event) {
        event.preventDefault(); // Evita el envío del formulario por defecto
      
        // Obtén el valor del campo de entrada oculto
        const productoId = document.getElementById('input-producto-id').value;
      
        // Agrega el ID del producto al carrito de compras (aquí puedes realizar la lógica adecuada para tu aplicación)
       
        function agregarAlCarrito(productoId) {
                alert('Producto agregado al carrito: ' + productoId);
                // Aquí puedes realizar la lógica para agregar el producto al carrito de compras en tu aplicación
              }
              agregarAlCarrito(productoId);
      });

      








