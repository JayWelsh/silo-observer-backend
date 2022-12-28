import { SiloUserModel } from "../models";
import BaseRepository from "./BaseRepository";

class SiloUserRepository extends BaseRepository {
  getModel() {
    return SiloUserModel
  }
}

export default new SiloUserRepository();