import { Code } from "mongodb";
import { ProductManager } from "../dao/mongo/ProductManager.js";
import { ticketManager } from "../dao/mongo/ticketManager.js";
ProductManager
class ticketServices {

    async GetAll() {
        const response = await ticketManager.find();
        return response;
    }
    // 
    async findById(ID) {
        const response = await ticketManager.findByID(ID);
        return response;
    }
    // 
    async Delete(ID) {
        const response = await ticketManager.findByIdAndDelete(ID)
        return response;
    }
    // 
    async CreateTicket(obj) {

        const code = await ticketService.GenerateCode()

        let compraRealizada = { "Productos": [], "PrecioTotal": 0, "purchaser": obj.purchaser, "code": code };

        let pendientes = { "Productos": [] };

        // Iterar sobre los productos y obtener los detalles de cada uno
        for (let i = 0; i < obj.Products.length; i++) {

            let pDetail = await ProductManager.GetById(obj.Products[i].product._id);

            // console.log(obj.Products[i].Cantidad);

            if (obj.Products[i].Cantidad.$numberInt > pDetail.stock) {
                pendientes.Productos.push({
                    "product": obj.Products[i].product,
                    "Cantidad": { "": String(obj.Products[i].Cantidad - pDetail.stock) }
                });
                obj.Products[i].Cantidad = pDetail.stock;
            }
            // Añadir el producto a la compra realizada
            compraRealizada.Productos.push(obj.Products[i]);
            compraRealizada.PrecioTotal += pDetail.price * obj.Products[i].Cantidad;

            pDetail.stock -= obj.Products[i].Cantidad;
            await ProductManager.Update(pDetail);
        }
        const IDCOMPRA = await ticketManager.Add(compraRealizada, Code)

        return {
            "CompraRealizada": compraRealizada,
            "Pendientes": pendientes,
            "ID": IDCOMPRA,
        };

    }

    async GenerateCode() {
        const Tickets = await ticketManager.GetAll()
        let code = Tickets.length ? Tickets[Tickets.length - 1].code + 1 : 1500;
        return code
    }


}
export const ticketService = new ticketServices();