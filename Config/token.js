import jwt from "jsonwebtoken";

// generate token through userId
export const getToken = async (userId) => {
  try {
    let token = jwt.sign({ userId }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });
    console.log("Generated token:", token);
    return token;
  } catch (error) {
    console.log(error);
  }
};
