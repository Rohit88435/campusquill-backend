import Notification from "../Models/notification.model.js";

export const getNotification = async (req, res) => {
  try {
    let notification = await Notification.find({ receiver: req.userId })
      .populate("relatedUser", "firstName lastName headline profileImage")
      .populate("relatedPost", "image description");

    return res.status(200).json(notification);
  } catch (error) {
    return res.status(500).json({ message: `get Notification error ${error}` });
  }
};

export const deleteNotification = async (req, res) => {
  try {
    let { id } = req.params;
    let notification = await Notification.findOneAndDelete({
      _id: id,
      receiver: req.userId,
    });
    return res.status(200).json({ message: "deleted  successfully" });
  } catch (error) {
    return res
      .status(500)
      .json({ message: `delete Notification error ${error}` });
  }
};
export const clearAllNotification = async (req, res) => {
  try {
    let notification = await Notification.deleteMany({
      receiver: req.userId,
    });
    return res.status(200).json({ message: "deleted  successfully" });
  } catch (error) {
    return res
      .status(500)
      .json({ message: `clear all Notification error ${error}` });
  }
};
