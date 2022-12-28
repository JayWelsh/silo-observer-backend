import { BlockMetadataModel } from "../models";
import BaseRepository from "./BaseRepository";

class BlockMetadataRepository extends BaseRepository {
  getModel() {
    return BlockMetadataModel
  }
}

export default new BlockMetadataRepository();