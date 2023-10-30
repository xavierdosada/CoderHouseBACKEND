import ticketDTO from "../dao/dtos/ticket.dto.js";
import uniqid from 'uniqid'

export const ticketProcess = (email, successProducts) => {
    //CODE
    const code = uniqid()

    //TIME
    const date = new Date()

    //AMOUNT
    const totalAmount = successProducts.reduce((total, product) => total + product.amount * product.quantity, 0)  
    
    //formateo el ticket
    const dataTicket = {code, date, totalAmount, email}
    const ticket = new ticketDTO(dataTicket)

    return ticket
}