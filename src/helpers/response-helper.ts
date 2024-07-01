import { Response } from "express";

class ResponseHelper {
  entityNotFound(res: Response) {
    res.status(400).json({ message: "Entity not found" });
  }

  entityNotOwned(res: Response) {
    res.status(403).json({ message: "Entity not owned" });
  }

  entityDeleted(res: Response) {
    res.json({ message: "Entity deleted" });
  }
}

let instance = new ResponseHelper();

module.exports = instance;
