const addListeners = () => {
    const purchaseButton = document.querySelectorAll('.purchase');
    purchaseButton.forEach(button => {
        button.addEventListener('click', purchase);
    });
}

const purchase = async (event) => {
    // Finalizar compra
    try {
        const cartId = localStorage.getItem('cartId');
        const response = await fetch(`/api/carts/${cartId}/purchase`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        const result = await response.json();
        if (result.status === 'success') {
            alert(`La compra se realizo con exito!`);
            location.reload()
        } else {
            alert('Error al finalizar la compra');
        }
    } catch (error) {
        console.error('Error al finalizar la compra:', error);
    }
}

addListeners();