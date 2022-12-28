import { EventIndexerBlockTrackerModel } from "../models";
import BaseRepository from "./BaseRepository";

class EventIndexerBlockTrackerRepository extends BaseRepository {
  getModel() {
    return EventIndexerBlockTrackerModel
  }
}

export default new EventIndexerBlockTrackerRepository();