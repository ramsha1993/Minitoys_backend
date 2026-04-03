import { TryCatch } from "../middleware/error.js"
import { Address } from "../models/address.js"
import ErrorHandler from "../utils/utilityclass.js"

export const addAddress = TryCatch(async (req, res, next) => {
    const user_id = req.user.id
    const { name, country, city, state, street, building, phone } = req.body
    if (!name || !country || !city || !state || !street || !building || !phone) {
        return next(new ErrorHandler("Please enter all fields", 400))
    }
    const response = await Address.create({
        user_id,
        name,
        country,
        city,
        state,
        street,
        building,
        phone
    })
    return res.status(200).json({
        success: true,
        message: "Address added successfully",
        response
    })


})


export const updateAddress = TryCatch(async (req, res, next) => {
    const user_id = req.user.id;
    const { name, country, city, state, street, building, phone } = req.body;

    // Validation
    if (!name || !country || !city || !state || !street || !building || !phone) {
        return next(new ErrorHandler("Please enter all fields", 400));
    }

    // Find the address for this user (assuming single address)
    const address = await Address.findOne({ where: { user_id } });

    if (!address) {
        return next(new ErrorHandler("Address not found", 404));
    }

    // Update fields
    address.name = name;
    address.country = country;
    address.city = city;
    address.state = state;
    address.street = street;
    address.building = building;
    address.countryCode = countryCode;
    address.phone = phone;

    await address.save();

    return res.status(200).json({
        success: true,
        message: "Address updated successfully",
        address
    });
});

export const getAddress = TryCatch(async (req, res, next) => {
    const user_id = req.user.id
    const response = await Address.findOne({ where: { user_id } })
    return res.status(200).json({
        success: true,
        message: "Address fetched successfully",
        response
    })
})