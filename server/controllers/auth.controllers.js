import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

import prisma from "../lib/prisma.lib.js";
import { trimValues } from "../lib/strings.lib.js";
import { HttpError } from "../models/http-error.models.js";
import { validateUser } from "../validators/user.validators.js";
import { getVerificationCode } from "../lib/verification.lib.js";

export const signUserUp = async (request, response, next) => {
  let { firstName, lastName, email, password } = request.body;

  let errorMsg = validateUser(
    { firstName, lastName, email, password },
    "signup"
  );

  if (errorMsg) {
    return next(new HttpError(errorMsg, 400));
  }

  [firstName, lastName, email, password] = trimValues(
    firstName,
    lastName,
    email,
    password
  );

  // check to see if the email has already been taken
  try {
    const existingUser = await prisma.user.findUnique({ where: { email } });

    if (existingUser) {
      return next(new HttpError("user with this email already exists", 400));
    }

    // hash the password
    const salt = await bcrypt.genSalt(9);
    const hashedPassword = await bcrypt.hash(password, salt);

    // create a new user
    const createdUser = await prisma.user.create({
      data: {
        firstName,
        lastName,
        email,
        password: hashedPassword,
        avatar: `https://avatars.dicebear.com/api/initials/${firstName}${lastName}.svg`,
      },
    });

    // create a verification to verify the new user
    const verification = await prisma.accountVerification.create({
      data: {
        code: getVerificationCode(),
        userId: createdUser.id,
      },
    });

    // create a JSON web token
    const token = generateToken(createdUser.id);

    response.status(201).json({ user: { ...createdUser, token } });
  } catch (error) {
    next(new HttpError());
  }
};

export const signUserIn = async (request, response, next) => {
  const { email, password } = request.body;

  const errorMsg = validateUser({ email, password }, "signin");

  if (errorMsg) {
    return next(new HttpError(errorMsg, 400));
  }

  try {
    // check if the email matches
    const user = await prisma.user.findFirst({
      where: { email },
    });

    if (!user) {
      return next(new HttpError("email or password is invalid", 400));
    }

    // unhash the password
    const pwCorrect = await bcrypt.compare(password, user.password);

    if (!pwCorrect) {
      return next(new HttpError("email or password is invalid", 400));
    }

    const token = generateToken(user.id);

    response.json({ user: { ...user, token } });
  } catch (error) {
    console.log(error);
    next(new HttpError());
  }
};

const generateToken = (id) => {
  const token = jwt.sign({ id }, process.env.JWT_SECRET);

  return token;
};
