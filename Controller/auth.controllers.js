import { getToken } from "../Config/token.js";
import User from "../Models/user.model.js";
import bcrypt from "bcryptjs";

export const signup = async (req, res) => {
  try {
    console.log("request body", req.body);

    // take data from frontend
    const { firstName, lastName, userName, email, password } = req.body;

    // check email in db
    let existEmail = await User.findOne({ email });

    if (existEmail) {
      return res
        .status(400)
        .json({ message: "username & email already exist !" });
    }

    if (password.length < 8) {
      return res.status(400).json({ message: "minimum 8 character required" });
    }

    // check userName in db
    let existUsername = await User.findOne({ userName });

    if (existUsername) {
      return res.status(400).json({ message: "email already exist !" });
    }

    //hass the password using bcrypt
    let hassedPassword = await bcrypt.hash(password, 10);

    // create the user
    const user = await User.create({
      firstName,
      lastName,
      userName,
      email,
      password: hassedPassword,
    });

    // generate toked through _id
    let token = getToken(user._id);

    // generate cookie
    res.cookie("token", token, {
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000,
      sameSite: "strict",
      secure: process.env.NODE_ENVIRONMENT === "production",
    });

    //return status succefull
    return res.status(201).json(user);
  } catch (error) {
    return res.status(500).json({ message: "signup error" });
  }
};

export const login = async (req, res) => {
  try {
    let { email, password } = req.body;

    let existUser = await User.findOne({ email });

    if (!existUser) {
      return res.status(400).json({ message: "User doesn't exist" });
    }

    let match = await bcrypt.compare(password, existUser.password);

    if (!match) {
      return res.status(400).json({ message: "Password incorrect" });
    }

    let token;

    token = await getToken(existUser._id);

    const userWithoutPassword = { ...existUser._doc };
    delete userWithoutPassword.password;
    res.cookie("token", token, {
      httpOnly: true,
      sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    return res
      .status(201)
      .json({ user: userWithoutPassword, message: "login/signup successful" });
  } catch (error) {
    return res.status(500).json({ message: "Login error" });
  }
};

export const logout = async (req, res) => {
  try {
    res.clearCookie("token");
    return res.status(200).json({ message: "logout successfully" });
  } catch (error) {
    return res.status(500).json({ message: "logout error" });
  }
};
