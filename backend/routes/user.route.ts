import e from "express";
import * as userController from "../controllers/user.controller";
import { isAuthenticate } from "../middlewares/isAuthenticate";
import { upload } from "../middlewares/multer";
import { authorizeRoles } from "../middlewares/authorizeRoles";
import { Role } from "../libs/role.enum";

const userRouter = e.Router();

userRouter.post("/register", userController.register);
userRouter.post("/login", userController.login);
userRouter.post("/logout", (req, res) => {
  res.clearCookie("token", { httpOnly: true, sameSite: "strict" });
  res.json({ success: "Déconnexion réussie" });
});
userRouter.get("/me", isAuthenticate, userController.me);
userRouter.put(
  "/profile",
  isAuthenticate,
  upload.fields([
    { name: "avatar", maxCount: 1 },
    { name: "cover", maxCount: 1 },
  ]),
  userController.profileUser
);
userRouter.put("/bio", isAuthenticate, userController.editBio);
userRouter.get("/users", isAuthenticate, userController.getUsers);
userRouter.get("/user/:id", isAuthenticate, userController.getUserById);
userRouter.put(
  "/user/:id",
  isAuthenticate,
  authorizeRoles(Role.Admin),
  userController.updateUser
);
userRouter.delete(
  "/user/:id",
  isAuthenticate,
  authorizeRoles(Role.Admin),
  userController.deleteUser
);

export default userRouter;
