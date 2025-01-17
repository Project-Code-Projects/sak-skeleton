import { Response } from "express";
import { getOrderInfoUsingOrderId, posGetAllOrders, posUpdateOrderChef, posUpdateOrderStatus } from "../utilities/pos.utility";
import { kdsPostIncomingOrder } from "../utilities/kds.utility";
import { JwtReqInterface } from "../interfaces/JwtReqInterface";
import { IOrder } from "../interfaces/NewOrderInterface";
import { preparePlusRestructureOrderDataForInventory, sendDataToInventoryToReduce } from "../utilities/processOrder.utility";
import { marketplaceUpdateOrderStatus } from "../utilities/marketplace.utility";

// Get All Orders from POS and Marketplace
export async function getAllOrders(req: JwtReqInterface, res: Response) {
  try {
    const { user } = req;
    if (!user) return res.status(401).send({ message: 'Unauthorized.' });
    if (user.restaurantId) {
      let result: any[] = []
      const posOrders = await posGetAllOrders(user.token);
      result = [...result, ...posOrders]
      res.status(200).send(result)
    }

  } catch (error) {
    console.error(error);
    res.status(500).send({ message: (error as Error).message });
  }
}


export async function updateOrderStatus(req: JwtReqInterface, res: Response) {
  try {
    const { user } = req;
    if (!user) return res.status(401).send({ message: 'Unauthorized.' });
    const { orderId } = req.params;
    const { status, type } = req.body;
    if (typeof status !== 'string' && typeof type !== 'string') return res.status(400).send({ message: 'Invalid data.' });

    // If the order is a POS Order
    if (type.toLowerCase().includes("in-house")) {
      if (status === 'preparing') {
        const fullOrder: IOrder = await getOrderInfoUsingOrderId(orderId, user.token)
        if (fullOrder.status === 'pending') {
          const restructuredOrderDataForInventory = preparePlusRestructureOrderDataForInventory(fullOrder)
          const inventoryResponse = await sendDataToInventoryToReduce(restructuredOrderDataForInventory, user.token);
        }
      }
      await posUpdateOrderStatus(user.token, orderId, status);
      return res.json({ message: 'Successfully updated' });
    }

    // If the order is a Marketplace Order
    else if (type.toLowerCase().includes("pickup") || type.toLowerCase().includes("delivery")) {
      await marketplaceUpdateOrderStatus(user.token, orderId, status)
      return res.json({ message: 'Successfully updated' })
    }

  } catch (error) {
    console.error(error);
    res.status(500).send({ message: (error as Error).message });
  }
}


export async function updateOrderChef(req: JwtReqInterface, res: Response) {
  try {
    const { user } = req;
    if (!user) return res.status(401).send({ message: 'Unauthorized.' });
    const { orderId } = req.params;
    const { chef } = req.body;
    if (typeof orderId !== 'string') return res.status(400).send({ message: 'Invalid data.' });
    const updatedOrder = await posUpdateOrderChef(user.token, orderId, chef);
    res.send(updatedOrder);
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: (error as Error).message });
  }
}


// Process Incoming new order
export async function incomingOrder(req: JwtReqInterface, res: Response) {
  try {
    const { user } = req;
    if (!user) return res.status(401).send({ message: 'Unauthorized.' });
    const order: IOrder = req.body.order;
    let result;
    if (order.type == "in-house") {
      result = await kdsPostIncomingOrder(user.token, order);
    }
    else if (order.type === "pickup" || order.type === "delivery") {
      result = await kdsPostIncomingOrder(user.token, order);
      const restructuredOrderDataForInventory = preparePlusRestructureOrderDataForInventory(order)
      if (result) {
        const inventoryResult = await sendDataToInventoryToReduce(restructuredOrderDataForInventory, user.token);
        return res.send(inventoryResult)
      }
    }
    res.status(201).send({ message: 'Successfully sent to KDS', data: result });

  } catch (error) {
    console.error(error);
    res.status(500).send({ message: (error as Error).message });
  }
}

