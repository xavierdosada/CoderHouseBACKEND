const addListeners = () => {
    const addToCartButtons = document.querySelectorAll('.addToCart');
    addToCartButtons.forEach(button => {
        button.addEventListener('click', addToCart);
    });
    const seeCartButton = document.querySelectorAll('.seeCart');
    seeCartButton.forEach(button => {
        button.addEventListener('click', seeCart);
    });
}

const addToCart = async (event) => {
    const productId = event.target.dataset.id;
    // Obtener cartId de localStorage o crear uno nuevo
    let cartId = localStorage.getItem('cartId');
    if (!cartId) {
        // Si no existe creo un carrito
        try {
            const response = await fetch('/api/carts', {
                method: 'POST'
            });
            const data = await response.json();
            cartId = data.message._id;
            localStorage.setItem('cartId', cartId); // Almacenar cartId en localStorage
        } catch (error) {
            console.error('Error al crear un nuevo carrito:', error);
            return;
        }
    }

    // Agregar producto al carrito
    try {
        cartId = localStorage.getItem('cartId'); // Obtener el cartId nuevamente después de la posible creación
        const response = await fetch(`/api/carts/${cartId}/product/${productId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        const result = await response.json();
        if (result.status === 'success') {
            alert(`El producto se agrego correctamente! id:${cartId}`);
        } else {
            alert('Error al agregar el producto al carrito');
        }
    } catch (error) {
        console.error('Error al agregar el producto al carrito:', error);
    }
}

const seeCart = async (event) => {
    const cartId = event.target.dataset.id;
    window.location.replace(`/myCart/${cartId}`)
}

addListeners();