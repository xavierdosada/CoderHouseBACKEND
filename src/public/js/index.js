const socket = io();

let user;
let chatBox = document.getElementById('chatbox');

Swal.fire({
    title: "Identifícate",
    input: "text",
    inputValidator: (value) => {
        return !value && "¡Necesitas escribir un nombre de usuario para comenzar a chatear!"
    },
    allowOutsideClick: false
}).then(result => {
    user = result.value;
    socket.emit('authenticated', user)
})

chatBox.addEventListener('keyup', evt => {
    if (evt.key === "Enter") {
        if (chatBox.value.trim().length > 0) {
            socket.emit('message', { user: user, message: chatBox.value });
            chatBox.value = "";
        }
    }
})

socket.on('messageLogs', data => {
    if (!user) return;
    let log = document.getElementById('messageLogs');
    let messages = "";
    data.forEach(message => {
        messages += `${message.user} dice: ${message.messages}<br/>`
    })
    log.innerHTML = messages;
})

socket.on('newUserConnected', (data) => {
    if (!user) return;
    Swal.fire({
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 3000,
        title: `${data} se acaba de conectar`,
        icon: "success"
    })
})

socket.on('updateproducts', (dataProducts) => {
    let container = document.getElementById('productsContainer')
    container.innerHTML = '';
    let html = dataProducts.map(product => {
        return `
        <h3>${product.title}</h3>
        <li>descripcion: ${product.description}</li>
        <li>precio: ${product.price}</li>
        <li>codigo: ${product.code}</li>
        <li>stock: ${product.stock}</li>
        `;
    })
    container.innerHTML = html.join('')
})