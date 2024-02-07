import { Request, Response } from "express";
import { JwtReqInterface } from "../interfaces/JwtReqInterface";
import { findRestaurantsInRadius, getAllRestaurantInfo, postRestaurantInfo, updateRestaurantRatingUsingId } from "../models/restaurantInfo/restaurantInfo.query";
import RestaurantInfoModel from "../models/restaurantInfo/restaurantInfo.model";
import { IRestaurantRep } from "../interfaces/RestaurantRepInterface";
import { IRestaurantInfoFromFrontend } from "../interfaces/RestaurantInfoInterface";
import { setRestaurantUtilization } from "../models/restaurantUtilization/restaurantUtilization.query";
import { sendOwnerInfoToHR } from "../utilities/hr.utility";
import { getNextSequenceValue } from "../models/incrementalRestaurantId/incrementalRestaurantId.query";
import { saveRestaurantRep } from "../models/restaurantRepInfo/restaurantRepInfo.query";
import RestaurantRepModel from "../models/restaurantRepInfo/restaurantRepInfo.model";
import { validateCoordinates, validateRadius } from "../utilities/location.utility";

export async function allRestaurantsData(req: JwtReqInterface, res: Response) {
    try {
        const data = await getAllRestaurantInfo();
        res.status(200).send(data)

    } catch (error) {
        console.log('😭😭😭😭😭😭😭😭😭😭', error);
        res.status(500).json({ message: (error as Error).message })
    }
}

// for zerin apu to update restaurant ratings
export async function updateRestaurantRating(req: JwtReqInterface, res: Response) {
    try {
        if (!req.user) return res.status(401).json({ message: 'Unauthorized' })

        const restaurantId = Number(req.params.restaurantId)
        const newRating = Number(req.body.rating)
        console.log('id and rating', restaurantId, newRating);
        const updatedRestaurantInfo = await updateRestaurantRatingUsingId(restaurantId, newRating)

        res.status(201).json({ message: 'Rating Updated Successfully', data: updatedRestaurantInfo })

    } catch (error) {
        console.log('😭😭😭😭😭😭😭😭😭😭', error);
        res.status(500).json({ message: (error as Error).message })
    }
}

// Bulk Restaurants
export const createBulkRestaurants = async (req: Request, res: Response) => {
    try {
        const savedBulkRestoInfo = await RestaurantInfoModel.create(req.body)
        if (savedBulkRestoInfo) {
            res.status(201).json({ message: 'All Good', data: savedBulkRestoInfo });
        }
    } catch (error) {
        console.log('😭😭😭😭😭😭😭😭😭😭', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

// Bulk Representatives
export const createBulkReps = async (req: Request, res: Response) => {
    try {
        const savedBulkReps = await RestaurantRepModel.create(req.body)
        if (savedBulkReps) {
            res.status(201).json({ message: "created", data: savedBulkReps })
        }
    } catch (error) {
        console.log('😭😭😭😭😭😭😭😭😭😭', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}


export const getRestaurantsInRadius = async (req: JwtReqInterface, res: Response) => {
    try {
        // if (!req.user) return res.status(401).json({ message: 'Unauthorized' });

        const { lat, lng } = req.query;
        const validatedCoordinates = validateCoordinates({ lat, lng });

        // If valid coordinates are not given, default coordinates will be used. Might change later.
        const coordinates = validatedCoordinates ? validatedCoordinates : { longitude: -0.190696, latitude: 51.501930 };

        // If radius is given in query, use it, otherwise use 5KM as default
        const validatedRadius = validateRadius(req.query.radius);
        const radius = validatedRadius ? validatedRadius : 5000;

        console.log('Coordinates:', coordinates);
        console.log('Radius:', radius);

        const restaurants = await findRestaurantsInRadius(coordinates, radius);
        res.send({ data: restaurants });
    } catch (error) {
        console.log('😭😭😭😭😭😭😭😭😭😭', error);
        res.status(500).json({ error: 'Internal Server Error', message: (error as Error).message });
    }
}