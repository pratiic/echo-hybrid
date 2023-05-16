import { prepareImageData } from "../lib/image.lib.js";
import prisma from "../lib/prisma.lib.js";
import { trimValues } from "../lib/strings.lib.js";
import { HttpError } from "../models/http-error.models.js";
import {
  validateBusiness,
  validateStatus,
} from "../validators/business.validators.js";

export const requestRegistration = async (request, response, next) => {
  const user = request.user;
  const businessInfo = request.body;

  const errorMsg = validateBusiness(businessInfo);

  if (errorMsg) {
    return next(new HttpError(errorMsg, 400));
  }

  try {
    const store = await prisma.store.findUnique({
      where: { userId: user.id },
      include: {
        business: {
          select: {
            id: true,
          },
        },
      },
    });

    // can sell only after registering as a seller
    if (!store) {
      return next(new HttpError("you need to register as a seller first", 400));
    }

    // must have a store of type BUS
    if (store.storeType === "IND") {
      return next(
        new HttpError("you are already registered as an individual seller", 400)
      );
    }

    // one account -> only one business
    if (store.business) {
      return next(
        new HttpError(
          "there is already a business registered with this account",
          400
        )
      );
    }

    if (!request.file) {
      return next(
        new HttpError(
          "a business registration cerification image must be provided",
          400
        )
      );
    }

    let { name, ownerName, PAN, phone } = businessInfo;
    [name, ownerName, PAN, phone] = trimValues(name, ownerName, PAN, phone);

    const createdBusiness = await prisma.business.create({
      data: {
        name,
        ownerName,
        PAN,
        phone,
        status: "PENDING",
        storeId: store.id,
      },
    });

    // handle business registration certificate image
    const imageData = prepareImageData(
      "business",
      createdBusiness.id,
      request.file
    );

    const [, updatedBusiness] = await Promise.all([
      prisma.image.create({
        data: imageData,
      }),
      prisma.business.update({
        where: {
          id: createdBusiness.id,
        },
        data: {
          regImage: imageData.src,
        },
      }),
    ]);

    response.json({
      business: updatedBusiness,
    });
  } catch (error) {
    next(new HttpError());
  }
};

// accept or reject a business
export const modifyBusinessStatus = async (request, response, next) => {
  const business = request.business;
  const status = request.query.status;

  const errorMsg = validateStatus(status);

  if (errorMsg) {
    return next(new HttpError(errorMsg, 400));
  }

  try {
    if (business.store.userId !== request.user.id && !request.user.isAdmin) {
      return next(
        new HttpError(
          "only the business owner or an admin is allowed to perform this action",
          401
        )
      );
    }

    // valid transitions
    // for business owner
    // 1. REJECTED -> PENDING
    // for admin
    // 1. PENDING -> ACCEPTED / REJECTED

    const currentStatus = business.status;
    const conditionMap = {
      owner: currentStatus === "REJECTED" && status === "PENDING",
      admin:
        currentStatus === "PENDING" &&
        (status === "ACCEPTED" || status === "REJECTED"),
    };
    const errorMsgMap = {
      admin: "pending -> accepted / rejected",
      owner: "rejected -> pending",
    };
    const role = business.store.userId === request.user.id ? "owner" : "admin";

    if (role === "admin" && !business.address?.id) {
      return next(new HttpError("address must be set first", 400));
    }

    if (conditionMap[role]) {
      const updatedBusiness = await prisma.business.update({
        where: {
          id: business.id,
        },
        data: {
          status,
        },
      });

      response.json({
        business: updatedBusiness,
      });
    } else {
      return next(
        new HttpError(
          `invalid status transition. valid transitions: ${errorMsgMap[role]}`,
          400
        )
      );
    }
  } catch (error) {
    console.log(error.message);
    next(new HttpError());
  }
};

export const updateBusiness = async (request, response, next) => {
  const business = request.business;
  const updateInfo = request.body;

  if (business.status === "ACCEPTED") {
    return next(
      new HttpError("a business cannot be updated after it is accepted", 400)
    );
  }

  const errorMsg = validateBusiness({ ...business, ...updateInfo });

  if (errorMsg) {
    return next(new HttpError(errorMsg, 400));
  }

  try {
    const { name, ownerName, PAN, phone } = updateInfo;

    const updatedBusiness = await prisma.business.update({
      where: {
        id: business.id,
      },
      data: {
        name: name || business.name,
        ownerName: ownerName || business.ownerName,
        PAN: PAN || business.PAN,
        phone: phone || business.phone,
      },
    });

    response.json({ business: updatedBusiness });
  } catch (error) {
    next(new HttpError());
  }
};

export const deleteBusiness = async (request, response, next) => {
  const user = request.user;
  const business = request.business;

  if (business.store.userId !== user.id) {
    return next(
      new HttpError("only the owner is allowed to delete a business", 401)
    );
  }

  try {
    await prisma.business.delete({
      where: {
        id: business.id,
      },
    });

    response.json({
      message: "business has been deleted",
    });
  } catch (error) {
    next(new HttpError());
  }
};
