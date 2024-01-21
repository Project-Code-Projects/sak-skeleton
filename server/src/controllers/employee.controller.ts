import { Response } from "express";
import { chefCheckIn, chefCheckOut } from "../utilities/kds.utility";
import { hrActiveChefs, hrActiveWaiters } from "../utilities/hr.utility";
import { JwtReqInterface } from "../interfaces/JwtReqInterface";

export const employeeCheckIn = async (req: JwtReqInterface, res: Response) => {
  try {
    if (!req.user) return res.status(401).send({ message: 'Unauthorized.' });


    // Implement functionality to send checked in user to HR

    // Send checked in user to KDS
    await chefCheckIn(req.user.token);

    res.send({ status: "Success" });
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: (error as Error).message });
  }
};


export const employeeCheckOut = async (req: JwtReqInterface, res: Response) => {
  try {
    if (!req.user) return res.status(401).send({ message: 'Unauthorized.' });


    // Implement functionality to send checked out user to HR

    // Send checked out user to KDS
    await chefCheckOut(req.user.token);

    res.send({ status: "Success" });
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: (error as Error).message });
  }
};


export const getActiveChefs = async (req: JwtReqInterface, res: Response) => {
  try {
    if (!req.user || !req.user.restaurantId) return res.status(401).send({ message: 'Unauthorized.' });
    const response = await hrActiveChefs(req.user.restaurantId, req.user.token);
    res.send(response);
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: (error as Error).message });
  }
};


export const getActiveWaiters = async (req: JwtReqInterface, res: Response) => {
  try {
    if (!req.user || !req.user.restaurantId) return res.status(401).send({ message: 'Unauthorized.' });
    const response = await hrActiveWaiters(req.user.restaurantId, req.user.token);
    res.send(response);
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: (error as Error).message });
  }
};