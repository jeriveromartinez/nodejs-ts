import { IUser, UserAccess } from "../models/user";
import { UserRepository } from "../repositories";

const seed = async () => {
  const urepo = new UserRepository();

  try {
    await urepo.create(<IUser>{
      email: "user@localhost.com",
      password: "localuser",
      fullName: "User",
      access: UserAccess.Admin,
      active: true,
    });
    console.log("User created");
  } catch (error) {
    console.log("User creation " + (error as Error).message);
  }
};

seed()
  .then(() => {
    console.log("seeded");
    process.exit(0);
  })
  .catch((e) => {
    console.log(e.message);
    process.exit(0);
  });
